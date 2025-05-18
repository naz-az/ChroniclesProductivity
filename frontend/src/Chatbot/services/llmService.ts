import type { Message } from '../types/index';
import { MODEL_GROUPS } from '../constants/models';
import Anthropic from '@anthropic-ai/sdk'; // <-- Add Anthropic SDK import

interface StreamingOptions {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// Ollama /api/chat stream response format
interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
}

// Build model maps from the centralized model groups
const buildModelMaps = () => {
  const ollamaMap: { [key: string]: string } = {};
  const geminiModels: { [key: string]: string } = {};
  const anthropicModels: { [key: string]: string } = {}; // <-- Add map for Anthropic
  
  MODEL_GROUPS.forEach(group => {
    group.models.forEach(model => {
      // Determine which map to use based on ID prefix
      if (model.id.startsWith('gemini-')) {
        // Map to standardized Gemini model names
        if (model.id === 'gemini-flash') {
          geminiModels[model.id] = 'gemini-1.5-flash-latest';
        } else if (model.id === 'gemini-pro') {
          geminiModels[model.id] = 'gemini-1.5-pro-latest';
        } else if (model.id === 'gemini-preview') {
          geminiModels[model.id] = 'gemini-2.5-flash-preview-04-17';
        } else if (model.id === 'gemini-2.5-pro-exp-03-25') {
          geminiModels[model.id] = 'gemini-2.5-pro-exp-03-25';
        } else {
          geminiModels[model.id] = model.id;
        }
      } else if (group.id === 'deepseek') {
        ollamaMap[model.id] = 'deepseek-r1:8b';
      } else if (group.id === 'qwen') {
        if (model.id === 'qwen') {
          ollamaMap[model.id] = 'qwen3:8b'; 
        } else if (model.id === 'qwen14b') {
          ollamaMap[model.id] = 'qwen3:14b';
        } else {
          ollamaMap[model.id] = model.id;
        }
      } else if (group.id === 'claude') { // <-- Handle Claude models
        anthropicModels[model.id] = model.id; // Map Anthropic model IDs directly
      } else {
        // For any other model, use ID directly
        ollamaMap[model.id] = model.id;
      }
    });
  });
  
  return { ollamaMap, geminiModels, anthropicModels }; // <-- Return anthropicModels
};

const { ollamaMap: modelMap, geminiModels, anthropicModels } = buildModelMaps();

// Check if a model is a Gemini model
const isGeminiModel = (modelId: string): boolean => {
  return modelId.startsWith('gemini-');
};

// Check if a model is an Anthropic model
const isAnthropicModel = (modelId: string): boolean => {
  return modelId.startsWith('claude-');
};

// Use environment variables
const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
// Placeholder for Anthropic API Key
const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || ""; // Using environment variable

export const sendMessageToLLM = async (
  messages: Message[],
  modelId: string, // Add modelId parameter
  signal: AbortSignal, // Add signal parameter
  options: StreamingOptions,
  useRAG: boolean = true, // New parameter to control RAG inclusion
  pageContext?: string // New parameter for page context
): Promise<void> => {
  try {
    // Log whether RAG is enabled
    console.log(`[llmService] RAG system is ${useRAG ? 'ENABLED' : 'DISABLED'}`);
    
    // If page context is provided, log it
    if (pageContext) {
      console.log(`[llmService] Using page context: ${pageContext}`);
    }
    
    // If RAG is enabled, add the database content to the first message
    let processedMessages = [...messages];
    
    if (useRAG) {
      try {
        // Get the latest user message to use for context retrieval
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        const userQuery = lastUserMessage ? lastUserMessage.content : '';
        
        // Import RAG service dynamically to avoid circular dependencies
        const ragService = (await import('./ragService')).default;
        
        // Get database content from RAG service with the query context
        console.log('[llmService] Fetching relevant database content for RAG...');
        const databaseContent = await ragService.getDatabaseContentForLLM(userQuery, pageContext);
        console.log('[llmService] Database content fetched successfully');
        
        // If there are messages, extend the first message with database content
        if (processedMessages.length > 0) {
          // Add the database content to the last user message
          for (let i = processedMessages.length - 1; i >= 0; i--) {
            if (processedMessages[i].role === 'user') {
              // Add database context to the most recent user message
              processedMessages[i] = {
                ...processedMessages[i],
                content: `${processedMessages[i].content}\n\n### DATABASE CONTEXT (Use this data to inform your responses):\n${databaseContent}`
              };
              console.log('[llmService] Added contextual database information to user message');
              break; // Only add to the most recent user message
            }
          }
        }
      } catch (error) {
        console.error('[llmService] Error adding RAG context to message:', error);
        // Continue without RAG context if there's an error
      }
    } else {
      console.log('[llmService] Skipping RAG content - using only model knowledge');
    }
    
    // Handle Gemini models differently
    if (isGeminiModel(modelId)) {
      await sendToGemini(processedMessages, modelId, signal, options);
    } else if (isAnthropicModel(modelId)) { // <-- Add check for Anthropic
      await sendToAnthropic(processedMessages, modelId, signal, options);
    } else {
      await sendToOllama(processedMessages, modelId, signal, options);
    }
  } catch (error) {
    // Check if the error is an AbortError before calling onError
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('LLM request aborted.');
      // Do not call options.onError for aborts, it's handled in useChat
    } else {
      console.error("LLM Service Error:", error);
      options.onError(error instanceof Error ? error : new Error('Unknown error communicating with model'));
    }
  }
};

// Function to send messages to Ollama models
const sendToOllama = async (
  messages: Message[],
  modelId: string,
  signal: AbortSignal,
  options: StreamingOptions
): Promise<void> => {
  // Format messages for the /api/chat endpoint
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // If the model is not found in ollamaMap, default to 'deepseek' which should be in ollamaMap
  const ollamaModelName = modelMap[modelId] || modelMap['deepseek']; // Fallback to deepseek for Ollama
  console.log(`[llmService] Using Ollama model: ${ollamaModelName}`); // Log the active model

  // Make API request to local Ollama server using /api/chat
  const response = await fetch('http://localhost:11434/api/chat', { // Changed endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ollamaModelName, // Use the selected model
      messages: formattedMessages, // Send the history
      stream: true,
    }),
    signal: signal, // Pass the abort signal
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim() === '') continue; // Skip empty lines
        try {
          const jsonData: OllamaChatResponse = JSON.parse(line);
          // Extract content from the message object
          if (jsonData.message && jsonData.message.content) {
             options.onChunk(jsonData.message.content);
          }
          if (jsonData.done) {
            // Final message received
          }
        } catch (e) {
          console.error('Failed to parse JSON chunk:', line, e);
        }
      }
    }
  }

  options.onComplete();
};

// Define type for Gemini response parts
interface GeminiPart {
  text?: string;
}

// Function to send messages to Google's Gemini models
const sendToGemini = async (
  messages: Message[],
  modelId: string,
  signal: AbortSignal,
  options: StreamingOptions
): Promise<void> => {
  const geminiModelName = geminiModels[modelId];
  if (!geminiModelName) {
    throw new Error(`Unknown Gemini model ID: ${modelId}`);
  }
  
  console.log(`[llmService] Using Gemini model: ${geminiModelName}`);
  
  const apiKey = googleApiKey;
  if (!apiKey) { 
     console.warn("Google API Key is missing. Please add it to llmService.ts for Gemini models to work.");
     throw new Error('Google API key is missing.');
  }

  const geminiPrompt = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Modify the endpoint for streaming (Server-Sent Events)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiPrompt,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ],
        // Remove stream: true from the body
      }),
      signal: signal,
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.text();
    throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        if (line.startsWith('data: ')) {
          try {
            const jsonString = line.substring(6);
            const jsonData = JSON.parse(jsonString);
            
            if (jsonData.candidates && jsonData.candidates[0]?.content?.parts) {
              const content = jsonData.candidates[0].content.parts
                .filter((part: GeminiPart) => part.text)
                .map((part: GeminiPart) => part.text)
                .join('');
              
              if (content) {
                fullResponse += content;
                options.onChunk(content);
              }
            }
          } catch (e) {
            console.error('Failed to parse Gemini response chunk:', line, e);
          }
        }
      }
    }
  }

  if (!fullResponse && buffer) {
    try {
      const jsonData = JSON.parse(buffer);
      if (jsonData.candidates && jsonData.candidates[0]?.content?.parts) {
        const content = jsonData.candidates[0].content.parts
          .filter((part: GeminiPart) => part.text)
          .map((part: GeminiPart) => part.text)
          .join('');
        
        if (content) {
          options.onChunk(content);
        }
      }
    } catch (e) {
      console.error('Failed to parse Gemini non-streaming response:', buffer, e);
    }
  }

  options.onComplete();
};

// --- Add function to send messages to Anthropic's Claude models ---
const sendToAnthropic = async (
  messages: Message[],
  modelId: string,
  signal: AbortSignal,
  options: StreamingOptions
): Promise<void> => {
  const anthropicModelName = anthropicModels[modelId];
  if (!anthropicModelName) {
    throw new Error(`Unknown Anthropic model ID: ${modelId}`);
  }

  console.log(`[llmService] Using Anthropic model: ${anthropicModelName}`);

  if (!anthropicApiKey) {
     console.warn("Anthropic API Key is missing. Please add it to llmService.ts for Claude models to work.");
     throw new Error('Anthropic API key is missing.');
  }

  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
    dangerouslyAllowBrowser: true, // <-- Allow running in browser
  });

  // Format messages for Anthropic API
  // Anthropic requires alternating user/assistant roles, starting with user.
  // Filter out system messages if any, and ensure the first message is from the user.
  const formattedMessages = messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({ role: msg.role, content: msg.content }));

  // Ensure the first message is 'user'
  if (formattedMessages.length > 0 && formattedMessages[0].role !== 'user') {
    // This scenario might require prepending a dummy user message or handling differently based on context
    console.warn("[llmService] Anthropic conversation doesn't start with a user message. API might reject.");
    // As a fallback, let's prepend a generic user message if the first isn't 'user'
    // However, this might alter the conversation context significantly.
    // A better approach might be to ensure conversation history always starts correctly.
    if (formattedMessages[0].role === 'assistant') {
        formattedMessages.unshift({ role: 'user', content: '(Previous context)' });
    }
  }

  try {
    const stream = await anthropic.messages.create({
      model: anthropicModelName,
      max_tokens: 1024, // You might want to make this configurable
      messages: formattedMessages,
      stream: true,
    });

    // Handle AbortSignal externally
    const abortHandler = () => {
      stream.controller.abort();
      console.log('[llmService] Anthropic stream aborted.');
    };
    signal.addEventListener('abort', abortHandler);

    // Use for await...of loop for browser streams
    for await (const event of stream) {
      if (signal.aborted) {
        break; // Exit loop if aborted
      }

      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        options.onChunk(event.delta.text);
      } else if (event.type === 'message_stop') {
        // Message finished streaming
        break; // Exit loop once message is stopped
      }
    }

    signal.removeEventListener('abort', abortHandler);
    if (!signal.aborted) {
      options.onComplete();
    }

  } catch (error) {
    if (signal.aborted) {
      console.log('[llmService] Anthropic request caught abort.');
      // Don't call onError for aborts
      return; 
    }
    // Re-throw other errors to be caught by the main handler
    throw error;
  }
};
// --- End Anthropic function --- 