import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiSquare, FiMic, FiMicOff } from 'react-icons/fi';
import { useChat } from '../../hooks/useChat';
import { useStore } from '../../store/useStore';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

interface MessageInputProps {
  pageContext?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ pageContext }) => {
  const [message, setMessage] = useState('');
  const { sendMessage, error, stopGeneration } = useChat();
  const { theme, isGenerating, ragEnabled } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDarkTheme = theme === 'dark';
  const [inputFocused, setInputFocused] = useState(false);

  // Add speech recognition
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
      
      // Auto-resize textarea when transcript changes
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
      }
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

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setMessage(''); // Clear any existing message
      resetTranscript();
      startListening();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isGenerating) {
      // Pass the page context to the sendMessage function
      sendMessage(message, pageContext);
      setMessage('');
      resetTranscript();
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Form container styles
  const formStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%'
  };

  // Error message styles
  const errorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-1.5rem',
    left: 0,
    right: 0,
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    zIndex: 10
  };

  // Input container styles
  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: isDarkTheme ? '#1f1f1f' : '#f8fafc',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isDarkTheme ? '#333' : '#e2e8f0',
    position: 'relative',
  };

  // Database context indicator
  const dbContextIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-34px',
    right: '12px',
    backgroundColor: isDarkTheme ? 'rgba(5, 150, 105, 0.2)' : 'rgba(209, 250, 229, 0.9)',
    color: isDarkTheme ? '#D1FAE5' : '#065F46',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    opacity: ragEnabled ? 1 : 0,
    transform: ragEnabled ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    pointerEvents: 'none',
  };

  // Microphone button styles
  const micButtonStyle: React.CSSProperties = {
    background: isListening ? '#EF4444' : 'transparent',
    color: isListening ? '#FFFFFF' : isDarkTheme ? '#94A3B8' : '#64748B',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isListening ? '#EF4444' : isDarkTheme ? '#475569' : '#CBD5E1',
    cursor: hasRecognitionSupport ? 'pointer' : 'not-allowed',
    transition: 'all 200ms',
    padding: 0,
    flexShrink: 0,
    opacity: hasRecognitionSupport ? 1 : 0.6,
  };

  // Attachment button styles
  const attachButtonStyle: React.CSSProperties = {
    padding: '8px',
    backgroundColor: 'transparent',
    color: isDarkTheme ? '#94A3B8' : '#64748B',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    flexShrink: 0
  };

  // Input wrapper styles
  const inputWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    backgroundColor: isDarkTheme ? '#2a2a2a' : '#F8FAFC',
    borderRadius: '20px',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '2px 8px 2px 14px',
    minHeight: '44px',
    borderColor: inputFocused 
      ? (isDarkTheme ? '#555' : '#A0AEC0')
      : (isDarkTheme ? '#444' : '#CBD5E1'),
    boxShadow: inputFocused
      ? `0 0 0 1px ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.15)'}`
      : 'none'
  };

  // Textarea styles
  const textareaStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px 0',
    resize: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: isDarkTheme ? '#F1F5F9' : '#151515',
    border: 'none',
    minHeight: '24px',
    maxHeight: '150px',
    fontSize: '15px',
    lineHeight: '1.5',
    fontFamily: 'inherit',
    alignSelf: 'center',
  };

  // Send button styles
  const sendButtonStyle: React.CSSProperties = {
    padding: '8px',
    color: (!isGenerating && !message.trim()) 
      ? (isDarkTheme ? '#666' : '#a1a1aa') 
      : '#FFFFFF',
    borderRadius: '50%',
    cursor: (!isGenerating && !message.trim()) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    marginLeft: '8px',
    flexShrink: 0
  };

  // Speech recognition listening indicator styles
  const listeningIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: isDarkTheme ? 'rgba(5, 150, 105, 0.2)' : 'rgba(209, 250, 229, 0.9)',
    color: isDarkTheme ? '#D1FAE5' : '#065F46',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    display: isListening ? 'block' : 'none',
    animationName: 'pulse',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    whiteSpace: 'nowrap',
    maxWidth: '90%',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {speechError && (
        <div style={{
          ...errorStyle,
          backgroundColor: isDarkTheme ? '#450A0A' : '#FEE2E2',
          color: isDarkTheme ? '#FECACA' : '#991B1B',
        }}>
          {speechError}
        </div>
      )}
      
      <div style={listeningIndicatorStyle}>
        Listening... {transcript ? `"${transcript.substring(0, 30)}${transcript.length > 30 ? '...' : ''}"` : ''}
      </div>
      
      {pageContext && ragEnabled && (
        <div style={dbContextIndicatorStyle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19L12 9 2 19"></path>
            <path d="M12 3v6"></path>
          </svg>
          Current context: {pageContext}
        </div>
      )}
      
      <div style={inputContainerStyle}>
        {/* Microphone Button */}
        <button
          type="button"
          style={micButtonStyle}
          title={hasRecognitionSupport 
            ? (isListening ? "Stop listening" : "Use voice input") 
            : "Voice recognition not supported in your browser"}
          onClick={toggleListening}
          disabled={!hasRecognitionSupport}
          onMouseOver={(e) => {
            if (hasRecognitionSupport && !isListening) {
              Object.assign(e.currentTarget.style, {
                background: isDarkTheme ? 'linear-gradient(135deg, #334155, #475569)' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                borderColor: isDarkTheme ? '#555' : '#94A3B8',
                color: isDarkTheme ? '#FFFFFF' : '#151515',
                transform: 'scale(1.1)'
              });
            }
          }}
          onMouseOut={(e) => {
            if (!isListening) {
              Object.assign(e.currentTarget.style, {
                background: 'transparent',
                color: isDarkTheme ? '#94A3B8' : '#64748B',
                borderColor: isDarkTheme ? '#475569' : '#CBD5E1',
                transform: 'scale(1)'
              });
            }
          }}
        >
          {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
        </button>
        
        {/* Attachment Button */}
        <button
          type="button"
          style={attachButtonStyle}
          title="Attach file (not implemented)"
          onMouseOver={(e) => {
            Object.assign(e.currentTarget.style, {
              color: isDarkTheme ? '#F1F5F9' : '#151515',
              backgroundColor: isDarkTheme ? '#334155' : '#E2E8F0',
              transform: 'scale(1.1)',
            });
          }}
          onMouseOut={(e) => {
            Object.assign(e.currentTarget.style, {
              backgroundColor: 'transparent',
              color: isDarkTheme ? '#94A3B8' : '#64748B',
              transform: 'scale(1)',
            });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        
        {/* Input Field Wrapper */}
        <div style={inputWrapperStyle}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            style={textareaStyle}
            disabled={isGenerating || isListening}
            rows={1}
          />
        </div>
        
        {/* Send/Stop Button */}
        <button
          type={isGenerating ? "button" : "submit"}
          onClick={isGenerating ? () => {
            stopGeneration();
          } : undefined}
          disabled={!isGenerating && !message.trim()}
          style={{
            ...sendButtonStyle,
            background: (!isGenerating && !message.trim()) 
              ? (isDarkTheme ? '#333' : '#e5e7eb') 
              : (isGenerating 
                ? (isDarkTheme ? 'linear-gradient(135deg, #B91C1C, #8B0000)' : 'linear-gradient(135deg, #DC2626, #B91C1C)') // Dark red gradient
                : (isDarkTheme ? '#5865F2' : '#4F46E5')) // Blue for send button
          }}
          title={isGenerating ? "Stop generating" : "Send message"}
          onMouseOver={(e) => {
            if (!(!isGenerating && !message.trim())) {
              Object.assign(e.currentTarget.style, {
                background: isGenerating
                  ? (isDarkTheme ? 'linear-gradient(135deg, #8B0000, #6B0000)' : 'linear-gradient(135deg, #B91C1C, #991B1B)') // Darker red gradient for stop hover
                  : (isDarkTheme ? '#475569' : '#4338CA'), // Darker blue for send hover
                transform: 'scale(1.1)'
              });
            }
          }}
          onMouseOut={(e) => {
            if (!(!isGenerating && !message.trim())) {
              Object.assign(e.currentTarget.style, {
                background: isGenerating
                  ? (isDarkTheme ? 'linear-gradient(135deg, #B91C1C, #8B0000)' : 'linear-gradient(135deg, #DC2626, #B91C1C)') // Back to dark red gradient
                  : (isDarkTheme ? '#5865F2' : '#4F46E5'), // Back to blue for send
                transform: 'scale(1)'
              });
            }
          }}
        >
          {isGenerating ? 
            <FiSquare size={18} /> : 
            <FiSend size={18} />
          }
        </button>
      </div>

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

export default MessageInput; 