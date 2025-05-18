/// <reference types="vite/client" />

/**
 * Environment Variables Configuration
 * 
 * Create a .env file in the root of the frontend directory with the following variables:
 * 
 * # API Keys
 * VITE_GOOGLE_API_KEY=your_google_api_key_here
 * VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here  
 * VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
 * VITE_ELEVENLABS_DEFAULT_VOICE_ID=your_elevenlabs_voice_id_here
 * 
 * # API Endpoints
 * VITE_API_BASE_URL=http://localhost:5000/api
 */

interface ImportMetaEnv {
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
  readonly VITE_ELEVENLABS_DEFAULT_VOICE_ID: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
