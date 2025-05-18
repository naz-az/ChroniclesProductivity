import React, { useState, useEffect } from 'react';
// import { FiSend } from 'react-icons/fi'; // Replaced with SVG
import { useChat } from '../../hooks/useChat';
import { useStore } from '../../store/useStore';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

// Define interfaces for styles if needed (optional)
// interface InputStyles { ... }

const MiniChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, stopGeneration } = useChat();
  const { theme, isGenerating, currentThreadId, createThread } = useStore();
  const isDarkTheme = theme === 'dark';

  // Speech recognition setup
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition();

  // Sync transcript to message when speech recognition is active
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Auto-send message when speech recognition stops
  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      // Small delay to allow for final transcript updates
      const timer = setTimeout(() => {
        handleSubmit(new Event('submit') as any);
        resetTranscript();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript]);

  // Hover states for buttons
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isThinkingHovered, setIsThinkingHovered] = useState(false);

  // Mock state for thinking toggle appearance (no actual functionality)
  const [showThinking, setShowThinking] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isGenerating) {
      // Create a new thread if there's no active thread
      if (!currentThreadId) {
        createThread();
      }
      
      // console.log("[MiniChatInput] Sending message:", message);
      sendMessage(message);
      setMessage('');
      resetTranscript();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setMessage(''); // Clear any existing message
      resetTranscript();
      startListening();
    }
  };

  // --- Styles adapted from MiniChatbox ---

  const silverGradientLight = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
  const silverGradientLightHover = 'linear-gradient(135deg, #cbd5e1, #94a3b8)';
  const gradientHoverDark = 'linear-gradient(135deg, rgb(52, 52, 52), rgb(69, 69, 69), rgb(86, 86, 86))';

  const inputContainerStyle: React.CSSProperties = {
    padding: '12px', // Updated
    borderTop: `1px solid ${isDarkTheme ? '#2f2f2f' : '#E2E8F0'}`, // Updated
    background: isDarkTheme ? 'linear-gradient(to top, #1e1e1e, #151515)' : '#FFFFFF', // Updated
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Updated
    position: 'relative',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 14px', // Updated
    borderRadius: '20px', // Updated
    border: `1px solid ${isDarkTheme ? '#333' : '#CBD5E1'}`, // Updated
    backgroundColor: isDarkTheme ? '#2a2a2a' : '#F8FAFC', // Updated
    color: isDarkTheme ? '#F1F5F9' : '#151515', // Updated
    fontSize: '14px', // Updated
    outline: 'none',
    // Removed original border style
  };

  const micButtonStyle: React.CSSProperties = {
    background: isListening ? '#EF4444' : 'transparent',
    color: isListening ? '#FFFFFF' : (isDarkTheme ? '#94A3B8' : '#64748B'),
    padding: 0,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isListening ? 'none' : `1px solid ${isDarkTheme ? '#475569' : '#CBD5E1'}`,
    cursor: hasRecognitionSupport ? 'pointer' : 'not-allowed',
    opacity: hasRecognitionSupport ? 1 : 0.6,
    // marginRight: '8px', // Removed, gap handles spacing
    transition: 'all 200ms',
    ...(isMicHovered && !isListening && hasRecognitionSupport && { // Apply hover styles
      background: isDarkTheme ? gradientHoverDark : silverGradientLightHover,
      borderColor: isDarkTheme ? '#555' : '#94A3B8',
      color: isDarkTheme ? '#FFFFFF' : '#151515',
      transform: 'scale(1.1)'
    })
  };

   const thinkingToggleInputStyle: React.CSSProperties = {
     background: isDarkTheme
       ? (showThinking ? 'linear-gradient(135deg, rgb(42, 42, 42), rgb(59, 59, 59), rgb(76, 76, 76))' : 'transparent')
       : (showThinking ? silverGradientLight : 'transparent'),
     color: showThinking
       ? (isDarkTheme ? '#ccc' : '#151515') // Adjusted dark mode active color slightly
       : (isDarkTheme ? '#94A3B8' : '#64748B'),
     width: '36px',
     height: '36px',
     borderRadius: '50%',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     border: showThinking
       ? 'none'
       : `1px solid ${isDarkTheme ? '#475569' : '#CBD5E1'}`,
     cursor: 'pointer',
     transition: 'all 200ms',
     padding: 0,
     ...(isThinkingHovered && { // Apply hover styles
        background: isDarkTheme ? gradientHoverDark : silverGradientLightHover,
        borderColor: isDarkTheme ? '#555' : '#94A3B8',
        color: isDarkTheme ? '#FFFFFF' : '#151515',
        transform: 'scale(1.1)'
     })
   };

  const sendButtonStyle: React.CSSProperties = {
    background: isDarkTheme
      ? (isGenerating 
         ? 'linear-gradient(135deg, #B91C1C, #8B0000)'  // New dark red gradient for stop
         : 'linear-gradient(135deg, rgb(42, 42, 42), rgb(59, 59, 59), rgb(76, 76, 76))')    // Default gradient for send
      : (isGenerating
         ? 'linear-gradient(135deg, #DC2626, #B91C1C)'  // New dark red gradient for stop (light theme)
         : silverGradientLight),                                 // Silver gradient for send
    color: isDarkTheme ? '#FFFFFF' : '#151515',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    padding: 0,

    cursor: !message.trim() && !isGenerating ? 'not-allowed' : 'pointer',
    boxShadow: isDarkTheme ? '0 2px 4px rgba(0, 0, 0, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 200ms',
    opacity: !message.trim() && !isGenerating ? 0.6 : 1,
    ...(isSendHovered && (message.trim() || isGenerating) && {
        background: isDarkTheme
          ? (isGenerating 
             ? 'linear-gradient(135deg, #8B0000, #6B0000)'  // New darker red gradient for stop hover
             : gradientHoverDark)                                                             // Dark gradient for send hover
          : (isGenerating
             ? 'linear-gradient(135deg, #B91C1C, #991B1B)'  // New darker red gradient for stop hover (light)
             : silverGradientLightHover),                           // Darker silver for send hover
        color: isDarkTheme ? '#FFFFFF' : '#151515',
        transform: 'scale(1.1) rotate(10deg)',
        boxShadow: isDarkTheme ? '0 4px 8px rgba(0, 0, 0, 0.5)' : '0 4px 8px rgba(0, 0, 0, 0.2)'
    })
  };

  const speechErrorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-40px',
    left: '0',
    right: '0',
    backgroundColor: isDarkTheme ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 202, 202, 0.8)',
    color: isDarkTheme ? '#FECACA' : '#991B1B',
    padding: '8px 12px',
    fontSize: '12px',
    textAlign: 'center',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    zIndex: 100,
  };

  const isRecognizingSpeechStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: isDarkTheme ? 'rgba(5, 150, 105, 0.2)' : 'rgba(209, 250, 229, 0.8)',
    color: isDarkTheme ? '#D1FAE5' : '#065F46',
    padding: '6px 12px',
    fontSize: '12px',
    textAlign: 'center',
    borderRadius: '16px',
    zIndex: 100,
    display: isListening ? 'block' : 'none',
    animationName: 'pulse',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
  };

  // --- End Styles ---

  return (
    <form onSubmit={handleSubmit} style={inputContainerStyle}>
      {speechError && <div style={speechErrorStyle}>{speechError}</div>}
      
      <div style={isRecognizingSpeechStyle}>
        Listening... {transcript ? `"${transcript.substring(0, 20)}${transcript.length > 20 ? '...' : ''}"` : ''}
      </div>
      
      {/* Mic Button (Now Functional) */}
      <button
        type="button" // Prevent form submission
        style={micButtonStyle}
        onClick={toggleListening}
        onMouseOver={() => setIsMicHovered(true)}
        onMouseOut={() => setIsMicHovered(false)}
        title={hasRecognitionSupport 
          ? (isListening ? "Stop listening" : "Use voice input") 
          : "Voice recognition not supported in your browser"}
        disabled={!hasRecognitionSupport}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={isListening ? "Listening..." : "Type a message..."}
        style={inputStyle} // Apply updated style
        disabled={isGenerating || isListening}
      />

      {/* Thinking Toggle Button (Visual Only) */}
      <button
        type="button" // Prevent form submission
        style={thinkingToggleInputStyle}
        onClick={() => setShowThinking(!showThinking)} // Mock toggle
        onMouseOver={() => setIsThinkingHovered(true)}
        onMouseOut={() => setIsThinkingHovered(false)}
        title={showThinking ? "Hide thinking process (visual only)" : "Show thinking process (visual only)"}
      >
        {showThinking ? (
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="currentColor"> {/* Use currentColor */}
             <path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2c0 0 0 0 0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4c0 0 0 0 0 0c19.8 27.1 39.7 54.4 49.2 86.2l160 0zM192 512c44.2 0 80-35.8 80-80l0-16-160 0 0 16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/>
           </svg>
         ) : (
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
             <path d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7c0 0 0 0 0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5L109 384c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8c0 0 0 0 0 0s0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4c0 0 0 0 0 0s0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5l-48.6 0c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8c0 0 0 0 0 0s0 0 0 0s0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80l0-16 160 0 0 16c0 44.2 35.8 80-80 80z"/>
           </svg>
         )}
      </button>


      <button
        type={isGenerating ? "button" : "submit"}
        onClick={isGenerating ? () => {
          // console.log("[MiniChatInput] Stop button clicked, isGenerating:", isGenerating);
          // console.log("[MiniChatInput] Calling stopGeneration()");
          stopGeneration();
          // console.log("[MiniChatInput] stopGeneration() called");
        } : undefined}
        disabled={!isGenerating && !message.trim()}
        style={sendButtonStyle}
        onMouseOver={() => setIsSendHovered(true)}
        onMouseOut={() => setIsSendHovered(false)}
        title={isGenerating ? "Stop generating" : "Send message"}
      >
        {/* Use appropriate icon based on loading state */}
        {isGenerating ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
      </button>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </form>
  );
};

export default MiniChatInput; 