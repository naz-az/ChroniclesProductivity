import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiVolume2, FiSquare, FiLoader, FiSettings, FiCheck } from 'react-icons/fi';
import { useChat } from '../../hooks/useChat';
import { useStore } from '../../store/useStore';
import { playTextToSpeech, stopCurrentAudio, getAvailableVoices, setPreferredVoice, getPreferredVoiceURI } from '../../services/ttsService';
import ReactMarkdown from 'react-markdown';

const MessageList: React.FC = () => {
  const { currentThread, isLoading, streamingMessageId } = useChat();
  const { 
    theme, 
    isAudioPlaying,
    playingMessageId,
    setAudioPlaying,
    setTtsAbortController,
    setTtsError,
    ttsError,
  } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDarkTheme = theme === 'dark';
  
  // Voice selector state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [activeSelectorMessageId, setActiveSelectorMessageId] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  // Get available voices and set default selection
  useEffect(() => {
    // Speech synthesis voices may load asynchronously
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      setVoices(availableVoices);
      
      // Set the initial selected voice from the service state or use the first voice
      const currentVoiceURI = getPreferredVoiceURI();
      setSelectedVoiceURI(currentVoiceURI);
    };
    
    loadVoices();
    
    // In Chrome, the voices are loaded asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);
  
  // Update the service when the selected voice changes
  useEffect(() => {
    if (selectedVoiceURI !== null) {
      setPreferredVoice(selectedVoiceURI);
    }
  }, [selectedVoiceURI]);
  
  useEffect(() => {
    if (!isAudioPlaying) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentThread?.messages, isLoading, isAudioPlaying]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      setAudioPlaying(false, null);
      setTtsAbortController(null);
    };
  }, [currentThread?.id, setAudioPlaying, setTtsAbortController]);

  // Close voice selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeSelectorMessageId && 
          !(event.target as Element).closest('.voice-selector') && 
          !(event.target as Element).closest('.voice-settings-btn')) {
        setActiveSelectorMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeSelectorMessageId]);

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      stopCurrentAudio();
      setAudioPlaying(false, null);
      setTtsAbortController(null);
    } else {
      stopCurrentAudio();
      setAudioPlaying(true, messageId);
      setTtsError(null);
      try {
        // Pass the raw text content - cleaning will be done in the TTS service
        const controller = await playTextToSpeech(
          text,
          undefined,
          () => {
            setAudioPlaying(false, null);
            setTtsAbortController(null);
          },
          (error) => {
            console.error("TTS Error:", error);
            setTtsError(error.message || 'Failed to play audio');
            setAudioPlaying(false, null);
            setTtsAbortController(null);
          }
        );
        setTtsAbortController(controller);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log("[MessageList] TTS request aborted.");
        } else {
          console.error("[MessageList] Error initiating TTS:", error);
          setTtsError(error instanceof Error ? error.message : 'Unknown TTS error');
        }
        setAudioPlaying(false, null);
        setTtsAbortController(null);
      }
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceURI = e.target.value;
    setSelectedVoiceURI(voiceURI);
  };

  const toggleVoiceSelector = (messageId: string) => {
    setActiveSelectorMessageId(prevId => prevId === messageId ? null : messageId);
  };

  // Convert nullable expressions to boolean
  const toBool = (value: any): boolean => Boolean(value);

  if (!currentThread) {
    return null;
  }

  const containerStyle: React.CSSProperties = {
    height: '100%',
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: '1 1 auto',
    backgroundColor: isDarkTheme ? '#151515' : '#ffffff',
  };

  const userMessageContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end'
  };

  const aiMessageContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start'
  };

  const messageBubbleBaseStyle: React.CSSProperties = {
    maxWidth: '75%',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    wordBreak: 'break-word',
  };

  const userMessageBubbleStyle: React.CSSProperties = {
    ...messageBubbleBaseStyle,
    backgroundColor: '#2563eb',
    color: 'white',
  };

  const aiMessageBubbleStyle: React.CSSProperties = {
    ...messageBubbleBaseStyle,
    backgroundColor: isDarkTheme ? '#374151' : '#e5e7eb',
    color: isDarkTheme ? 'white' : 'inherit',
    position: 'relative',
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    textAlign: 'right',
    marginTop: '0.25rem',
    opacity: 0.7,
  };

  const messageFooterStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.25rem',
    width: '100%',
    minHeight: '20px',
  };

  const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '0.5rem',
  };

  const loadingBubbleStyle: React.CSSProperties = {
    ...messageBubbleBaseStyle,
    backgroundColor: isDarkTheme ? '#374151' : '#e5e7eb',
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
  };

  const loadingDotStyle = (delay: string): React.CSSProperties => ({
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '9999px',
    backgroundColor: '#9ca3af',
    animation: 'bounce 1s infinite',
    animationDelay: delay,
  });

  const buttonBaseStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    borderRadius: '50%',
    position: 'relative',
  };

  const ttsButtonStyle = (isActive: boolean, messageId: string): React.CSSProperties => ({
    ...buttonBaseStyle,
    color: hoveredButton === `tts-${messageId}` 
      ? (isDarkTheme ? '#fff' : '#000') 
      : (isActive ? '#2563eb' : (isDarkTheme ? '#9CA3AF' : '#6B7280')),
    backgroundColor: hoveredButton === `tts-${messageId}` 
      ? (isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)') 
      : (isActive ? (isDarkTheme ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)') : 'transparent'),
    boxShadow: hoveredButton === `tts-${messageId}` 
      ? `0 0 0 1px ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}` 
      : (isActive ? `0 0 0 1px ${isDarkTheme ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)'}` : 'none'),
    transform: hoveredButton === `tts-${messageId}` ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
  });

  const settingsButtonStyle = (isActive: boolean, messageId: string): React.CSSProperties => ({
    ...buttonBaseStyle,
    color: hoveredButton === `settings-${messageId}` || isActive
      ? (isDarkTheme ? '#fff' : '#000') 
      : (isDarkTheme ? '#9CA3AF' : '#6B7280'),
    backgroundColor: isActive
      ? (isDarkTheme ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)')
      : (hoveredButton === `settings-${messageId}` 
        ? (isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)') 
        : 'transparent'),
    boxShadow: isActive || hoveredButton === `settings-${messageId}`
      ? `0 0 0 1px ${isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}` 
      : 'none',
    transform: hoveredButton === `settings-${messageId}` ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'absolute',
    bottom: '-5px',
    right: '25px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
  });

  // Voice selector popup
  const voiceSelectorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '25px',
    right: '10px',
    backgroundColor: isDarkTheme ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)' as any,
    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: '12px',
    padding: '14px',
    boxShadow: isDarkTheme 
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
      : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    zIndex: 100,
    minWidth: '240px',
    animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: 'translateZ(0)',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: isDarkTheme ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)',
    color: isDarkTheme ? '#fff' : '#000',
    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    marginTop: '10px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${isDarkTheme ? 'white' : 'black'}' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: isDarkTheme ? '#e5e7eb' : '#4b5563',
    display: 'block',
    marginBottom: '6px',
    position: 'relative',
    paddingLeft: '22px',
  };

  const voiceIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0',
    top: '2px',
    color: isDarkTheme ? '#8b5cf6' : '#6366f1',
  };

  // Voice option group styles
  const optionGroupStyle: React.CSSProperties = {
    marginTop: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  };

  const voiceOptionStyle = (isSelected: boolean): React.CSSProperties => ({
    backgroundColor: isSelected 
      ? (isDarkTheme ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.15)')
      : (isDarkTheme ? 'rgba(45, 55, 72, 0.5)' : 'rgba(240, 240, 240, 0.8)'),
    color: isDarkTheme ? '#e5e7eb' : '#4b5563',
    fontSize: '12px',
    padding: '6px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: `1px solid ${isSelected 
      ? (isDarkTheme ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.3)') 
      : 'transparent'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: isSelected ? 600 : 400,
    boxShadow: isSelected 
      ? `0 2px 8px ${isDarkTheme ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.15)'}` 
      : 'none',
  });

  // Get popular common voices to display as quick options
  const getQuickVoiceOptions = () => {
    // Filter for popular voices or language options
    const popularLanguages = ['en-US', 'en-GB', 'en-AU', 'es-ES', 'fr-FR', 'de-DE', 'ms-MY'];
    
    // Find available voices matching these language codes
    const popularVoices = voices.filter(voice => 
      popularLanguages.some(lang => voice.lang.includes(lang.split('-')[0]))
    );
    
    // Check if we have any Malay or Indonesian voices
    const hasExplicitMalayVoice = popularVoices.some(voice => 
      voice.lang.startsWith('ms') || 
      voice.name.toLowerCase().includes('malay') || 
      voice.name.toLowerCase().includes('melayu')
    );
    
    // If no Malay voice but we have Indonesian, add it as a fallback
    if (!hasExplicitMalayVoice) {
      const indonesianVoice = voices.find(voice => 
        voice.lang.startsWith('id') || 
        voice.name.toLowerCase().includes('indonesia')
      );
      
      if (indonesianVoice && !popularVoices.includes(indonesianVoice)) {
        popularVoices.push(indonesianVoice);
      }
    }
    
    // Limit to a reasonable number
    return popularVoices.slice(0, 7); // Increased limit to accommodate more options
  };

  return (
    <div style={containerStyle}>
      {currentThread.messages.map((message) => (
        <div
          key={message.id}
          style={message.role === 'user' ? userMessageContainerStyle : aiMessageContainerStyle}
        >
          <div
            style={message.role === 'user' ? userMessageBubbleStyle : aiMessageBubbleStyle}
          >
            <div className="markdown-content">
              <ReactMarkdown>{message.content.replace(/<small.*?<\/small>/gs, '')}</ReactMarkdown>
              {message.role === 'assistant' && message.content.includes('<small') && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '11px',
                  color: message.content.includes('without database context') ? '#9CA3AF' : '#10B981',
                  opacity: 0.9
                }}>
                  {message.content.includes('without database context') 
                    ? 'Response generated without database context' 
                    : 'Response generated with database context'}
                </div>
              )}
            </div>
            {message.role === 'assistant' ? (
              <div style={messageFooterStyle}>
                <div style={timestampStyle}>
                  {format(message.timestamp, 'h:mm a')}
                </div>
                
                {/* Voice settings button */}
                <button 
                  className="voice-settings-btn"
                  style={settingsButtonStyle(activeSelectorMessageId === message.id, message.id)}
                  onClick={() => toggleVoiceSelector(message.id)}
                  onMouseEnter={() => setHoveredButton(`settings-${message.id}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                  aria-label="Voice settings"
                  title="Voice settings"
                >
                  <FiSettings size={14} />
                </button>
                
                {/* TTS Button */}
                <button 
                  style={ttsButtonStyle(playingMessageId === message.id, message.id)}
                  onClick={() => handlePlayAudio(message.id, message.content)}
                  onMouseEnter={() => setHoveredButton(`tts-${message.id}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                  aria-label={playingMessageId === message.id ? "Stop audio" : "Play audio"}
                  title={playingMessageId === message.id ? "Stop audio" : "Play audio"}
                >
                  {playingMessageId === message.id ? 
                    (isAudioPlaying ? <FiSquare size={14} /> : <FiLoader size={14} className="animate-spin" />) 
                    : <FiVolume2 size={14} />
                  }
                </button>
                
                {/* Voice selector popup */}
                {activeSelectorMessageId === message.id && (
                  <div className="voice-selector" style={voiceSelectorStyle}>
                    <label style={labelStyle}>
                      <FiVolume2 style={voiceIconStyle} size={14} />
                      Select Voice
                    </label>
                    
                    {/* Quick voice options */}
                    <div style={optionGroupStyle}>
                      <div 
                        style={voiceOptionStyle(selectedVoiceURI === null)}
                        onClick={() => setSelectedVoiceURI(null)}
                      >
                        Default
                        {selectedVoiceURI === null && <FiCheck size={12} />}
                      </div>
                      
                      {/* Always show a Malay option */}
                      <div 
                        style={{
                          ...voiceOptionStyle(toBool(
                            selectedVoiceURI === 'ms-MY' || 
                            (selectedVoiceURI && selectedVoiceURI.startsWith('ms'))
                          )),
                          backgroundColor: isDarkTheme ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.15)', // Highlight with unique color
                          border: `1px solid ${isDarkTheme ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.3)'}`,
                        }}
                        onClick={() => {
                          const malayVoice = voices.find(v => 
                            v.lang.startsWith('ms') || 
                            v.name.toLowerCase().includes('malay') || 
                            v.name.toLowerCase().includes('melayu')
                          );
                          
                          // Fallback to Indonesian if no Malay
                          const indonesianVoice = voices.find(v => 
                            v.lang.startsWith('id') || 
                            v.name.toLowerCase().includes('indonesia')
                          );
                          
                          // Set the voice URI if found, or a special value to indicate Malay preference
                          setSelectedVoiceURI(
                            malayVoice?.voiceURI || 
                            indonesianVoice?.voiceURI || 
                            'ms-MY' // Special value that will be handled by the voice service
                          );
                        }}
                        title="Bahasa Melayu"
                      >
                        MS-MY
                        {(selectedVoiceURI === 'ms-MY' || 
                          (selectedVoiceURI && 
                           (voices.find(v => v.voiceURI === selectedVoiceURI)?.lang.startsWith('ms') || 
                            voices.find(v => v.voiceURI === selectedVoiceURI)?.lang.startsWith('id')))) && 
                          <FiCheck size={12} />
                        }
                      </div>
                      
                      {getQuickVoiceOptions()
                        .filter(voice => !(voice.lang.startsWith('ms') || voice.lang.startsWith('id')))
                        .map((voice) => (
                          <div 
                            key={voice.voiceURI}
                            style={voiceOptionStyle(selectedVoiceURI === voice.voiceURI)}
                            onClick={() => setSelectedVoiceURI(voice.voiceURI)}
                            title={`${voice.name} (${voice.lang})`}
                          >
                            {voice.lang.split('-')[0].toUpperCase()}
                            {selectedVoiceURI === voice.voiceURI && <FiCheck size={12} />}
                          </div>
                      ))}
                    </div>
                    
                    {/* All voices dropdown */}
                    <select
                      value={selectedVoiceURI || ''}
                      onChange={handleVoiceChange}
                      style={selectStyle}
                    >
                      <option value="">Default Voice</option>
                      {voices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div style={timestampStyle}>
                {format(message.timestamp, 'h:mm a')}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {(isLoading && !streamingMessageId) && (
        <div style={loadingContainerStyle}>
          <div style={loadingBubbleStyle}>
            <div style={loadingDotStyle('0s')} />
            <div style={loadingDotStyle('0.2s')} />
            <div style={loadingDotStyle('0.4s')} />
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />

      {ttsError && (
        <div style={{
            position: 'fixed',
            bottom: '6rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: isDarkTheme ? '#4B0000' : '#FECACA',
            color: isDarkTheme ? '#FEE2E2' : '#991B1B',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            zIndex: 100,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
           TTS Error: {ttsError}
        </div>
      )}

      <style>{`
        .markdown-content p {
          margin-top: 0;
          margin-bottom: 0.5rem; 
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content code {
           font-family: 'Consolas', 'Monaco', monospace;
           padding: 2px 4px;
           border-radius: 4px;
           font-size: 12px;
           background-color: ${isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'};
           color: inherit;
        }
        .user-message .markdown-content code {
           color: #eee;
           background-color: rgba(255,255,255,0.2);
        }
        .markdown-content pre {
          border-radius: 6px;
          padding: 10px;
          overflow-x: auto;
          margin: 10px 0;
          background-color: ${isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'};
        }
        .user-message .markdown-content pre {
           background-color: rgba(255,255,255,0.15);
        }
        .markdown-content pre code {
          padding: 0;
          background-color: transparent;
          font-size: 12px;
          line-height: 1.4;
        }
         .user-message .markdown-content pre code {
            color: #eee;
        }
        .markdown-content ul, .markdown-content ol {
          padding-left: 20px;
          margin: 8px 0;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
          margin-top: 16px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.3em; }
        .markdown-content h3 { font-size: 1.15em; }
        
        @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
        }
        .animate-spin {
           animation: spin 1s linear infinite;
        }
        
        @keyframes fadeIn {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MessageList; 