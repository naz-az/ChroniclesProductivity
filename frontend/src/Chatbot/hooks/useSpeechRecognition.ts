import { useState, useEffect, useCallback } from 'react';

// TypeScript interface for our hook return type
interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  resetTranscript: () => void;
  error: string | null;
}

const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState<boolean>(false);

  // Check browser support for speech recognition
  useEffect(() => {
    // Initialize recognition API based on browser support
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
      setHasRecognitionSupport(true);
    } else if ('SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      setRecognition(recognitionInstance);
      setHasRecognitionSupport(true);
    } else {
      setHasRecognitionSupport(false);
      setError('Speech recognition is not supported in your browser');
    }
  }, []);

  // Set up event handlers for speech recognition
  useEffect(() => {
    if (!recognition) return;

    const handleResult = (event: any) => {
      const transcriptArray = Array.from(event.results)
        .map((result: any) => result[0].transcript);
      
      const finalTranscript = transcriptArray.join(' ');
      setTranscript(finalTranscript);

      // Check if results are final
      const isFinal = event.results[event.results.length - 1].isFinal;
      
      // If user stops speaking for more than 1.5 seconds and we have a final result, stop listening
      if (isFinal) {
        const timer = setTimeout(() => {
          stopListening();
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    const handleError = (event: any) => {
      setError(`Error occurred in recognition: ${event.error}`);
      setIsListening(false);
    };

    // Register event handlers
    recognition.onresult = handleResult;
    recognition.onend = handleEnd;
    recognition.onerror = handleError;

    return () => {
      // Clean up event handlers when component unmounts
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
      }
    };
  }, [recognition]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition is not available');
      return;
    }

    setError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      // Handle the case where recognition is already started
      console.error('Recognition error:', err);
      setError('Could not start speech recognition');
    }
  }, [recognition]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
  }, [recognition]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    resetTranscript,
    error
  };
};

export default useSpeechRecognition;

// Add TypeScript declarations for the Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 