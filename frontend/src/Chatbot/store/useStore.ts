import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Message, Thread } from '../types';

// Extend AppState in types.ts if not already done
// export interface AppState {
//   ...
//   isAudioPlaying: boolean;
//   playingMessageId: string | null;
//   ttsAbortController: AbortController | null;
//   ttsError: string | null;
// }

const initialState: AppState = {
  threads: [],
  currentThreadId: null,
  isMinimized: true,
  theme: 'light',
  selectedModelId: 'gemini-2.5-pro-exp-03-25', // Default model
  isGenerating: false, // Add global generation state
  streamingMessageId: null, // Track which message is currently streaming
  abortController: null, // Initialize global abort controller
  // --- TTS State ---
  isAudioPlaying: false,
  playingMessageId: null,
  ttsAbortController: null,
  ttsError: null,
  // --- End TTS State ---
  // --- RAG State ---
  ragEnabled: false, // Default RAG to disabled
  // --- End RAG State ---
};

type StoreActions = {
  createThread: () => string;
  setCurrentThread: (threadId: string | null) => void;
  addMessage: (threadId: string, content: string, role: 'user' | 'assistant') => void;
  deleteThread: (threadId: string) => void;
  renameThread: (threadId: string, title: string) => void;
  toggleMinimize: () => void;
  toggleTheme: () => void;
  generateThreadTitle: (threadId: string) => void;
  setSelectedModelId: (modelId: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setStreamingMessageId: (id: string | null) => void;
  setAbortController: (controller: AbortController | null) => void;
  setAudioPlaying: (isPlaying: boolean, messageId: string | null) => void;
  setTtsAbortController: (controller: AbortController | null) => void;
  setTtsError: (error: string | null) => void;
  toggleRagEnabled: () => void;
}

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      createThread: () => {
        const threadId = uuidv4();
        const newThread: Thread = {
          id: threadId,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        // console.log('[useStore] createThread: Creating new thread', { id: threadId, title: newThread.title });

        set((state) => ({
          threads: [newThread, ...state.threads],
          currentThreadId: threadId,
        }));
        
        return threadId;
      },

      setCurrentThread: (threadId) => {
        set({ currentThreadId: threadId });
      },

      addMessage: (threadId, content, role) => {
        const newMessage: Message = {
          id: uuidv4(),
          role,
          content,
          timestamp: Date.now(),
        };

        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              return {
                ...thread,
                messages: [...thread.messages, newMessage],
                updatedAt: Date.now(),
              };
            }
            return thread;
          }),
        }));

        if (role === 'user' && get().threads.find(t => t.id === threadId)?.messages.length === 1) {
          // console.log(`[useStore] addMessage: First user message in thread ${threadId}. Triggering title generation.`);
          // Generate title after first user message
          get().generateThreadTitle(threadId);
        }
      },

      deleteThread: (threadId) => {
        set((state) => {
          const newThreads = state.threads.filter((thread) => thread.id !== threadId);
          let newCurrentThreadId = state.currentThreadId;
          
          if (state.currentThreadId === threadId) {
            newCurrentThreadId = newThreads.length > 0 ? newThreads[0].id : null;
          }
          
          return {
            threads: newThreads,
            currentThreadId: newCurrentThreadId,
          };
        });
      },

      renameThread: (threadId, title) => {
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              return { ...thread, title };
            }
            return thread;
          }),
        }));
      },

      toggleMinimize: () => {
        const currentState = get();
        
        // If minimizing from welcome screen (no current thread), create a new empty thread
        if (!currentState.currentThreadId && !currentState.isMinimized) {
          const threadId = get().createThread();
          set((state) => ({ 
            isMinimized: !state.isMinimized,
            currentThreadId: threadId
          }));
        } else {
          set((state) => ({ isMinimized: !state.isMinimized }));
        }
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
      },

      setSelectedModelId: (modelId) => {
        // console.log(`[useStore] AI Model changed to: ${modelId}`);
        set({ selectedModelId: modelId });
      },

      // New methods for generation state
      setGenerating: (isGenerating) => {
        // console.log(`[useStore] Setting isGenerating to: ${isGenerating}`);
        set({ isGenerating });
      },

      setStreamingMessageId: (streamingMessageId) => {
        // console.log(`[useStore] Setting streamingMessageId to: ${streamingMessageId}`);
        set({ streamingMessageId });
      },

      setAbortController: (controller) => {
        // console.log(`[useStore] Setting abortController:`, controller ? 'Controller Set' : 'Controller Cleared');
        set({ abortController: controller });
      },

      // --- TTS Actions Implementation ---
      setAudioPlaying: (isPlaying, messageId) => {
        // console.log(`[useStore] Setting Audio Playing: ${isPlaying}, Message ID: ${messageId}`);
        set({ isAudioPlaying: isPlaying, playingMessageId: isPlaying ? messageId : null });
      },

      setTtsAbortController: (controller) => {
        // console.log(`[useStore] Setting TTS AbortController:`, controller ? 'Controller Set' : 'Controller Cleared');
        set({ ttsAbortController: controller });
      },

      setTtsError: (error) => {
        // console.log(`[useStore] Setting TTS Error: ${error}`);
        set({ ttsError: error });
      },
      // --- End TTS Actions Implementation ---
      
      // --- RAG Actions Implementation ---
      toggleRagEnabled: () => {
        // console.log('[useStore] Toggling RAG enabled state');
        set((state) => ({ ragEnabled: !state.ragEnabled }));
      },
      // --- End RAG Actions Implementation ---

      generateThreadTitle: async (threadId) => {
        const thread = get().threads.find(t => t.id === threadId);
        if (!thread || thread.messages.length === 0) return;
        
        const firstUserMessage = thread.messages.find(m => m.role === 'user');
        if (!firstUserMessage) return;
        
        // console.log(`[useStore] generateThreadTitle: Attempting to generate title for thread ${threadId} based on message: "${firstUserMessage.content.substring(0, 50)}..."`);
        
        // Generate a title based on the first user message
        // For simplicity, just taking the first 30 characters
        const newTitle = firstUserMessage.content.length > 30 
          ? `${firstUserMessage.content.substring(0, 30)}...`
          : firstUserMessage.content;
        
        // console.log(`[useStore] generateThreadTitle: Setting new title for thread ${threadId}: "${newTitle}"`);

        set((state) => ({
          threads: state.threads.map((t) => {
            if (t.id === threadId) {
              return { ...t, title: newTitle };
            }
            return t;
          }),
        }));
      }
    }),
    {
      name: 'chatbot-storage',
      // Note: AbortControllers are not serializable and won't be persisted.
      // They will reset on page load, which is expected behavior.
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['abortController', 'ttsAbortController'].includes(key))
      ),
    }
  )
); 