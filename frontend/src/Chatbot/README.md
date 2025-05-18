# Chatbot Configuration

## Environment Variables

The Chatbot component uses several API keys and environment variables that need to be set up for proper functionality.

### Required Environment Variables

Create a `.env` file in the root of the frontend directory with the following variables:

```
# API Keys
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_DEFAULT_VOICE_ID=your_elevenlabs_voice_id_here

# API Endpoints
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Key Information

1. **Google API Key** (`VITE_GOOGLE_API_KEY`): Required for using Gemini models.
   - Used in: `services/llmService.ts`
   - Get key from: [Google AI Studio](https://makersuite.google.com/)

2. **Anthropic API Key** (`VITE_ANTHROPIC_API_KEY`): Required for using Claude models.
   - Used in: `services/llmService.ts`
   - Get key from: [Anthropic Console](https://console.anthropic.com/)

3. **ElevenLabs API Key** (`VITE_ELEVENLABS_API_KEY`): Optional, used for text-to-speech.
   - Used in: `services/ttsService.ts`
   - Get key from: [ElevenLabs](https://elevenlabs.io/)

4. **ElevenLabs Voice ID** (`VITE_ELEVENLABS_DEFAULT_VOICE_ID`): Optional, specifies the default voice for ElevenLabs TTS.
   - Used in: `services/ttsService.ts`
   - Get voice IDs from: [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) or your ElevenLabs account

## Fallbacks

The application includes fallbacks for missing environment variables:

- If Google API Key is missing, Gemini models will not function
- If Anthropic API Key is missing, Claude models will not function
- If ElevenLabs API Key is missing, the app will fall back to browser's native Web Speech API
- If ElevenLabs Voice ID is missing, a default voice will be assigned by the ElevenLabs API

## Note on Security

Never commit your `.env` file to version control. It's already added to `.gitignore` but ensure this remains the case. 