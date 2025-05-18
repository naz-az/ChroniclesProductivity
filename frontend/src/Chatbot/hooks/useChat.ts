import { useState } from 'react';
import { useStore } from '../store/useStore';
import { sendMessageToLLM } from '../services/llmService';
import { v4 as uuidv4 } from 'uuid';
import type { Message, Thread, AppState } from '../types/index';

export const useChat = () => {
  // Get state directly, access methods via useStore.getState() or setState()
  const { 
    threads, 
    currentThreadId, 
    selectedModelId,
    isGenerating,
    streamingMessageId,
  } = useStore();
  
  const [error, setError] = useState<string | null>(null);

  const currentThread = currentThreadId 
    ? threads.find(thread => thread.id === currentThreadId) 
    : null;

  const addOrUpdateMessage = (threadId: string, message: Message) => {
    let newCurrentThreadId: string | null = null;
    useStore.setState((state) => {
      const threadIndex = state.threads.findIndex(t => t.id === threadId);
      if (threadIndex === -1) {
        return {};
      }

      const thread = state.threads[threadIndex];
      const messageIndex = thread.messages.findIndex(m => m.id === message.id);
      
      let updatedMessages;
      if (messageIndex !== -1) {
        updatedMessages = [...thread.messages];
        updatedMessages[messageIndex] = message;
      } else {
        updatedMessages = [...thread.messages, message];
      }

      const updatedThreads = [...state.threads];
      updatedThreads[threadIndex] = {
        ...thread,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };
      
      const updatedState: Partial<AppState> = { threads: updatedThreads };
      if (updatedMessages.length === 1 && message.role === 'user' && state.currentThreadId !== threadId) {
        updatedState.currentThreadId = threadId;
        newCurrentThreadId = threadId;
      }

      return updatedState;
    });

    if (newCurrentThreadId) {
      const updatedThread = useStore.getState().threads.find(t => t.id === newCurrentThreadId);
      if (updatedThread && updatedThread.messages.length === 1 && updatedThread.messages[0].role === 'user') {
        useStore.getState().generateThreadTitle(newCurrentThreadId);
      }
    }

    return message.id;
  };

  const stopGeneration = () => {
    const { abortController, setAbortController, setGenerating, setStreamingMessageId } = useStore.getState();
    if (abortController && typeof abortController.abort === 'function') {
      abortController.abort();
      setAbortController(null);
      setGenerating(false);
      
      const currentId = useStore.getState().currentThreadId;
      const streamId = useStore.getState().streamingMessageId;
      
      if (streamId && currentId) {
        const thread = useStore.getState().threads.find(t => t.id === currentId);
        if (thread) {
          const message = thread.messages.find(m => m.id === streamId);
          if (message) {
            const updatedMessage = {
              ...message,
              content: message.content + "\n\n*Response stopped.*",
              timestamp: Date.now(),
            };
            addOrUpdateMessage(currentId, updatedMessage);
          }
        }
      }
      
      setStreamingMessageId(null);
    } else {
      if (useStore.getState().isGenerating) {
         useStore.getState().setGenerating(false);
         useStore.getState().setStreamingMessageId(null);
         useStore.getState().setAbortController(null);
      }
    }
  };

  const sendMessage = async (content: string, pageContext?: string) => {
    const { setGenerating, setAbortController, setStreamingMessageId } = useStore.getState();
    
    if (!content.trim()) {
      return;
    }
    
    setError(null);
    
    const currentController = useStore.getState().abortController;
    if (useStore.getState().isGenerating && currentController && typeof currentController.abort === 'function') {
      currentController.abort();
      setAbortController(null); 
    }
    
    let threadIdToUse = useStore.getState().currentThreadId;
    let messagesForApi: Message[] = [];

    if (!threadIdToUse) {
      const newThreadId = uuidv4();
      const newThread: Thread = {
          id: newThreadId,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
      };
      useStore.setState((state) => ({
         threads: [newThread, ...state.threads],
      }));
      threadIdToUse = newThreadId;
    } else {
      const existingThread = useStore.getState().threads.find(t => t.id === threadIdToUse);
      if (existingThread) {
         messagesForApi = [...existingThread.messages];
      } else {
         setError("Internal error: Current thread not found.");
         return;
      }
    }
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    
    addOrUpdateMessage(threadIdToUse, userMessage);
    messagesForApi.push(userMessage);

    await new Promise(requestAnimationFrame);

    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    let assistantContent = '';
    let assistantMessageId: string | null = null;
    
    try {
      // Get current RAG setting
      const currentRagEnabled = useStore.getState().ragEnabled;
      
      // Initialize RAG service if needed and RAG is enabled
      if (currentRagEnabled) {
        // Log RAG usage and page context
        console.log(`[useChat] RAG is enabled, using database context for LLM${pageContext ? ` with page context: ${pageContext}` : ''}`);
        
        // Import RAG service
        const ragService = (await import('../services/ragService')).default;
        
        // Prepare RAG service
        await ragService.getDatabaseData();
      }
      
      await sendMessageToLLM(
        messagesForApi,
        selectedModelId,
        newAbortController.signal,
        {
           onChunk: (chunk) => {
              if (newAbortController.signal.aborted) return;
              
              assistantContent += chunk;
              
              if (!assistantMessageId) {
                // First chunk received, create message and hide loader
                const assistantMessage: Message = {
                  id: uuidv4(),
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: Date.now(),
                };
                
                assistantMessageId = assistantMessage.id;
                setStreamingMessageId(assistantMessageId);
                addOrUpdateMessage(threadIdToUse, assistantMessage);
              } else {
                // Subsequent chunks, update existing message
                const existingMessage = useStore.getState().threads
                  .find(t => t.id === threadIdToUse)?.messages
                  .find(m => m.id === assistantMessageId);
                  
                if (existingMessage) {
                  const updatedMessage = {
                    ...existingMessage,
                    content: assistantContent,
                    timestamp: Date.now(),
                  };
                  addOrUpdateMessage(threadIdToUse, updatedMessage);
                }
              }
            },
            
            onComplete: () => {
              // Add a note about whether RAG was used
              if (assistantMessageId) {
                const existingMessage = useStore.getState().threads
                  .find(t => t.id === threadIdToUse)?.messages
                  .find(m => m.id === assistantMessageId);
                  
                if (existingMessage) {
                  // Add a small note at the end of the message about RAG usage
                  const ragNote = currentRagEnabled 
                    ? `\n\n<small style='color: #10B981; font-size: 0.7rem;'>Response generated with database context${pageContext ? ` (${pageContext})` : ''}</small>` 
                    : "\n\n<small style='color: #9CA3AF; font-size: 0.7rem;'>Response generated without database context</small>";
                  
                  const updatedMessage = {
                    ...existingMessage,
                    content: existingMessage.content + ragNote,
                  };
                  addOrUpdateMessage(threadIdToUse, updatedMessage);
                }
              }
              
              setAbortController(null);
              setGenerating(false);
              setStreamingMessageId(null);
            },
            
            onError: (error) => {
              if (error.name === 'AbortError') {
                if (useStore.getState().isGenerating || useStore.getState().abortController) {
                   setAbortController(null);
                   setGenerating(false);
                   setStreamingMessageId(null);
                }
              } else {
                setError(error.message);
                const errorMessage: Message = {
                  id: uuidv4(),
                  role: 'assistant',
                  content: `Error: ${error.message}`,
                  timestamp: Date.now(),
                };
                addOrUpdateMessage(threadIdToUse, errorMessage);
                setAbortController(null);
                setGenerating(false);
                setStreamingMessageId(null);
              }
            }
        },
        currentRagEnabled, // Pass RAG enabled state 
        pageContext // Pass page context for smarter retrieval
      );
    } catch (err) {
       if (!(err instanceof Error && err.name === 'AbortError')) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to communicate with model: ${errorMsg}`);
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: Date.now(),
        };
        addOrUpdateMessage(threadIdToUse, errorMessage);
        setGenerating(false);
        setStreamingMessageId(null);
        setAbortController(null);
      } else {
         if (useStore.getState().isGenerating || useStore.getState().abortController) {
             setAbortController(null);
             setGenerating(false);
             setStreamingMessageId(null);
          }
      }
    }
  };

  return {
    currentThread,
    sendMessage,
    isLoading: isGenerating,
    error,
    streamingMessageId,
    stopGeneration
  };
}; 