import { ElevenLabsClient } from 'elevenlabs';

// --- IMPORTANT ---
// Access environment variable using import.meta.env for Vite
const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || ""; 
// Default ElevenLabs voice ID (can be overridden)
const defaultVoiceId = import.meta.env.VITE_ELEVENLABS_DEFAULT_VOICE_ID || "";
// --- IMPORTANT ---

// Store the current audio element and its controller globally within this module
let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;
let currentSpeechSynthesis: SpeechSynthesisUtterance | null = null;

// Add state for preferred voice
let preferredVoiceURI: string | null = null;

// Check if Web Speech API is available
const isSpeechSynthesisAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Check if the API key placeholder is still present
if (!elevenLabsApiKey && !isSpeechSynthesisAvailable) {
  console.warn(
    "No speech synthesis options available. Web Speech API is not supported and ElevenLabs API Key is not set."
  );
}

// Initialize ElevenLabs client only if API key is available
const client = elevenLabsApiKey ? new ElevenLabsClient({
  apiKey: elevenLabsApiKey,
}) : null;

// Flag to prevent recursive calls
let isLoggingVoices = false;

// Function to get available voices from the Web Speech API
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisAvailable) return [];
  return window.speechSynthesis.getVoices();
};

// Add debug function to log available voices
export const logAvailableVoices = (): void => {
  if (!isSpeechSynthesisAvailable || isLoggingVoices) {
    return;
  }
  
  isLoggingVoices = true;
  
  try {
    const voices = window.speechSynthesis.getVoices();
    console.log(`[ttsService] Available voices (${voices.length}):`);
    voices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}`);
    });
    
    // Specifically look for Malay or Indonesian voices
    const malayVoices = voices.filter(v => 
      v.lang.startsWith('ms') || 
      v.lang.startsWith('id') || 
      v.name.toLowerCase().includes('malay') || 
      v.name.toLowerCase().includes('melayu') ||
      v.name.toLowerCase().includes('indonesia')
    );
    
    console.log(`[ttsService] Found ${malayVoices.length} potential Malay/Indonesian voices:`);
    malayVoices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}`);
    });
  } finally {
    isLoggingVoices = false;
  }
};

// Function to set preferred voice by URI
export const setPreferredVoice = (voiceURI: string | null): void => {
  preferredVoiceURI = voiceURI;
  console.log(`[ttsService] Preferred voice set to: ${voiceURI || 'default'}`);
};

// Function to get the currently set preferred voice
export const getPreferredVoiceURI = (): string | null => {
  return preferredVoiceURI;
};

// Function to get a voice by URI
export const getVoiceByURI = (voiceURI: string): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisAvailable) return null;
  const voices = getAvailableVoices();
  return voices.find(voice => voice.voiceURI === voiceURI) || null;
};

// Enhance the function to get a voice by language code to support Malay better
export const getVoiceByLanguage = (languageCode: string): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisAvailable) return null;
  
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;
  
  // Special case for Malay - try different variations
  if (languageCode.startsWith('ms')) {
    // Try exact match for Malay first
    const exactMalayVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith('ms') ||
      voice.name.toLowerCase().includes('malay') ||
      voice.name.toLowerCase().includes('melayu')
    );
    if (exactMalayVoice) return exactMalayVoice;
    
    // Try Indonesian as fallback for Malay
    const indonesianVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith('id') || 
      voice.name.toLowerCase().includes('indonesia')
    );
    if (indonesianVoice) return indonesianVoice;
  }
  
  // Regular matching for other languages
  // First try exact match
  const exactMatch = voices.find(voice => voice.lang.toLowerCase() === languageCode.toLowerCase());
  if (exactMatch) return exactMatch;
  
  // Then try partial match (e.g., 'en-US' should match 'en')
  const partialMatch = voices.find(voice => 
    voice.lang.toLowerCase().startsWith(languageCode.split('-')[0].toLowerCase())
  );
  
  return partialMatch || null;
};

// Function to get the best voice based on quality and language
export const getBestVoice = (preferredLanguage: string = 'en-US'): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisAvailable) return null;
  
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;
  
  // First check if we have a preferred voice set
  if (preferredVoiceURI) {
    const preferredVoice = voices.find(voice => voice.voiceURI === preferredVoiceURI);
    if (preferredVoice) return preferredVoice;
  }
  
  // Special handling for Malay
  if (preferredLanguage.startsWith('ms')) {
    const malayVoice = getVoiceByLanguage('ms');
    if (malayVoice) return malayVoice;
  }
  
  // Priority 1: Find a voice that matches preferred language and is not default
  const bestQualityMatch = voices.find(voice => 
    voice.lang.includes(preferredLanguage.split('-')[0]) && 
    voice.localService === false // Remote/cloud voices are typically better quality
  );
  
  if (bestQualityMatch) return bestQualityMatch;
  
  // Priority 2: Any voice that matches language
  const languageMatch = voices.find(voice => 
    voice.lang.includes(preferredLanguage.split('-')[0])
  );
  
  if (languageMatch) return languageMatch;
  
  // Fallback: First English voice or any voice if no English
  const englishVoice = voices.find(voice => voice.lang.includes('en'));
  return englishVoice || voices[0];
};

/**
 * Cleans text from markdown formatting characters so they don't get read out loud
 */
const cleanMarkdownFormatting = (text: string): string => {
  // First remove any database context messages
  let cleanedText = text
    // Remove "Response generated without database context" and "Response generated with database context"
    .replace(/Response generated (with|without) database context/g, '')
    // Also remove any texts wrapped in <small> tags which contain these context messages
    .replace(/<small.*?<\/small>/gs, '');
  
  // Then remove Markdown formatting characters
  return cleanedText
    // Remove bold/italic markers
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold: **text** -> text
    .replace(/\*(.*?)\*/g, '$1')      // Italic: *text* -> text
    .replace(/__(.*?)__/g, '$1')      // Bold: __text__ -> text
    .replace(/_(.*?)_/g, '$1')        // Italic: _text_ -> text
    
    // Remove code formatting
    .replace(/`([^`]+)`/g, '$1')      // Inline code: `text` -> text
    
    // Remove headers
    .replace(/^#{1,6}\s+(.+)$/gm, '$1') // Headers: # Header -> Header
    
    // Remove blockquotes
    .replace(/^>\s+(.+)$/gm, '$1')    // Blockquotes: > text -> text
    
    // Remove list markers
    .replace(/^[\*\-+]\s+(.+)$/gm, '$1') // Unordered lists: * item -> item
    .replace(/^\d+\.\s+(.+)$/gm, '$1')   // Ordered lists: 1. item -> item
    
    // Remove links - keep only link text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link text](url) -> link text
    
    // Remove any remaining HTML tags
    .replace(/<[^>]*>?/gm, '')
    
    // Trim extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Converts text to speech using Web Speech API or ElevenLabs and plays it.
 * 
 * @param text The text to convert to speech.
 * @param voiceId Optional voice ID (only for ElevenLabs).
 * @param onEnded Callback function to execute when audio playback finishes.
 * @param onError Callback function to execute on error.
 * @returns An AbortController to allow stopping the audio.
 */
export const playTextToSpeech = async (
  text: string,
  voiceId: string = defaultVoiceId, // Using environment variable instead of hardcoded ID
  onEnded: () => void,
  onError: (error: Error) => void
): Promise<AbortController> => {
  // Stop any existing audio playback and abort previous requests
  stopCurrentAudio();

  const newAbortController = new AbortController();
  currentAbortController = newAbortController;
  const signal = newAbortController.signal;

  try {
    // Try Web Speech API first if available
    if (isSpeechSynthesisAvailable) {
      return await playWebSpeechAPI(text, onEnded, onError, newAbortController);
    } 
    // Fall back to ElevenLabs if available
    else if (client && elevenLabsApiKey) {
      return await playElevenLabs(text, voiceId, onEnded, onError, newAbortController);
    } 
    // No speech synthesis options available
    else {
      throw new Error("No speech synthesis options available on this browser.");
    }
  } catch (error) {
    console.error("[ttsService] Error during TTS:", error);
    
    // If Web Speech API failed but ElevenLabs is available, try that as fallback
    if (error instanceof Error && 
        error.message.includes("Web Speech API") && 
        client && 
        elevenLabsApiKey) {
      console.log("[ttsService] Falling back to ElevenLabs after Web Speech API failure");
      return await playElevenLabs(text, voiceId, onEnded, onError, newAbortController);
    }
    
    // Handle abort errors differently
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("[ttsService] TTS request aborted.");
      throw error; // Re-throw abort errors
    }
    
    onError(error instanceof Error ? error : new Error('Unknown TTS error'));
    return newAbortController;
  }
};

/**
 * Play audio using Web Speech API
 */
const playWebSpeechAPI = async (
  text: string,
  onEnded: () => void,
  onError: (error: Error) => void,
  abortController: AbortController
): Promise<AbortController> => {
  return new Promise((resolve, reject) => {
    try {
      if (!isSpeechSynthesisAvailable) {
        throw new Error("Web Speech API is not supported in this browser.");
      }
      
      // Clean and strip the text of any markdown and HTML
      const cleanedText = cleanMarkdownFormatting(text);
      
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      currentSpeechSynthesis = utterance;
      
      // Set the voice based on preference
      let voice = null;
      
      // Special handling for explicitly selected Malay voice
      if (preferredVoiceURI === 'ms-MY') {
        // Try to find Malay voice first
        const malayVoice = getAvailableVoices().find(v => 
          v.lang.startsWith('ms') || 
          v.name.toLowerCase().includes('malay') || 
          v.name.toLowerCase().includes('melayu')
        );
        
        if (malayVoice) {
          voice = malayVoice;
          console.log(`[ttsService] Found Malay voice: ${voice.name} (${voice.lang})`);
        } else {
          // Try Indonesian as fallback
          const indonesianVoice = getAvailableVoices().find(v => 
            v.lang.startsWith('id') || 
            v.name.toLowerCase().includes('indonesia')
          );
          
          if (indonesianVoice) {
            voice = indonesianVoice;
            console.log(`[ttsService] Using Indonesian voice as fallback for Malay: ${voice.name} (${voice.lang})`);
          } else {
            console.log('[ttsService] No Malay or Indonesian voice found, will use default');
          }
        }
      } 
      // Regular voice selection by URI
      else if (preferredVoiceURI) {
        voice = getVoiceByURI(preferredVoiceURI);
      }
      
      // If no preferred voice or it wasn't found, get best available voice
      if (!voice) {
        voice = getBestVoice();
      }
      
      if (voice) {
        console.log(`[ttsService] Using voice: ${voice.name} (${voice.lang})`);
        utterance.voice = voice;
      } else {
        console.log("[ttsService] No suitable voice found, using default");
      }
      
      // Improve speech quality
      utterance.rate = 1.0;  // Normal speaking rate
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Handle events
      utterance.onend = () => {
        console.log("[ttsService] Web Speech API finished speaking");
        currentSpeechSynthesis = null;
        onEnded();
      };
      
      utterance.onerror = (event) => {
        console.error("[ttsService] Web Speech API error:", event);
        currentSpeechSynthesis = null;
        onError(new Error(`Web Speech API error: ${event.error}`));
      };
      
      // Add a listener to abort if needed
      abortController.signal.addEventListener('abort', () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          currentSpeechSynthesis = null;
        }
      });
      
      // Start speaking
      console.log("[ttsService] Starting Web Speech API playback");
      window.speechSynthesis.speak(utterance);
      resolve(abortController);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Play audio using ElevenLabs
 */
const playElevenLabs = async (
  text: string,
  voiceId: string,
  onEnded: () => void,
  onError: (error: Error) => void,
  abortController: AbortController
): Promise<AbortController> => {
  const signal = abortController.signal;

  if (!client || !elevenLabsApiKey) {
    throw new Error("ElevenLabs API key is missing or invalid.");
  }
  
  console.log(`[ttsService] Requesting ElevenLabs TTS for text: "${text.substring(0, 30)}..."`);
  
  // Use the non-streaming convert method
  const audioResponse = await client.textToSpeech.convert(voiceId, {
    text: text,
    model_id: 'eleven_multilingual_v2',
  });

  // Check if the request was aborted
  if (signal.aborted) {
     console.log("[ttsService] TTS request aborted before collecting chunks.");
     throw new Error("Audio generation aborted.");
  }

  const chunks: Buffer[] = [];
  for await (const chunk of audioResponse) {
     if (signal.aborted) {
       console.log("[ttsService] TTS request aborted during chunk collection.");
       throw new Error("Audio generation aborted.");
     }
     chunks.push(chunk);
  }

  if (signal.aborted) {
     console.log("[ttsService] TTS request aborted after chunk collection.");
     throw new Error("Audio generation aborted.");
  }

  const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(audioUrl);

  console.log("[ttsService] Playing ElevenLabs audio...");
  
  currentAudio.play().catch(err => {
    console.error("[ttsService] Error playing audio:", err);
    onError(err instanceof Error ? err : new Error('Failed to play audio'));
    cleanupAudio();
  });

  currentAudio.onended = () => {
    console.log("[ttsService] Audio finished playing.");
    cleanupAudio();
    onEnded();
  };

  currentAudio.onerror = (err) => {
    console.error("[ttsService] Audio playback error:", err);
    const errorMessage = typeof err === 'string' ? err : 'Media playback error';
    onError(new Error(errorMessage));
    cleanupAudio();
  };

  return abortController;
};

/**
 * Stops the currently playing audio and aborts any ongoing TTS request.
 */
export const stopCurrentAudio = () => {
  if (currentAbortController) {
    console.log("[ttsService] Aborting previous TTS request/playback.");
    currentAbortController.abort();
    currentAbortController = null;
  }
  
  // Stop Web Speech API if active
  if (isSpeechSynthesisAvailable && window.speechSynthesis.speaking) {
    console.log("[ttsService] Stopping Web Speech API playback.");
    window.speechSynthesis.cancel();
    currentSpeechSynthesis = null;
  }
  
  // Stop HTML Audio if active
  if (currentAudio) {
    console.log("[ttsService] Stopping current audio playback.");
    currentAudio.pause();
    currentAudio.onended = null;
    currentAudio.onerror = null;
    URL.revokeObjectURL(currentAudio.src);
    currentAudio = null;
  }
};

/**
 * Helper function to clean up audio resources.
 */
const cleanupAudio = () => {
   if (currentAudio) {
      URL.revokeObjectURL(currentAudio.src);
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio = null;
   }
   currentAbortController = null;
};

// Initialize speech synthesis to load available voices
if (isSpeechSynthesisAvailable) {
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = getAvailableVoices;
  }
  // Force load voices
  getAvailableVoices();
}

// Ensure audio stops when the page is closed or refreshed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopCurrentAudio();
  });
}

// Fix TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
  }
} 