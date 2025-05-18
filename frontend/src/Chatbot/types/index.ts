export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type AppState = {
  threads: Thread[];
  currentThreadId: string | null;
  isMinimized: boolean;
  theme: 'light' | 'dark';
  selectedModelId: string;
  isGenerating: boolean;
  streamingMessageId: string | null;
  abortController: AbortController | null;
  isAudioPlaying: boolean;
  playingMessageId: string | null;
  ttsAbortController: AbortController | null;
  ttsError: string | null;
  ragEnabled: boolean;
}

export type LLMResponse = {
  content: string;
} 