import React, { useRef, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiVolume2, FiSquare, FiLoader, FiSettings, FiCheck } from 'react-icons/fi';
import { useChat } from '../../hooks/useChat';
import { useStore } from '../../store/useStore';
import ReactMarkdown from 'react-markdown';
import { getModelById } from '../../constants/models';
import { playTextToSpeech, stopCurrentAudio, getAvailableVoices, setPreferredVoice, getPreferredVoiceURI } from '../../services/ttsService';

const MiniChatMessages: React.FC = () => {
  const { currentThread, isLoading, streamingMessageId } = useChat();
  const { 
    theme, 
    selectedModelId,
    isAudioPlaying,
    playingMessageId,
    setAudioPlaying,
    setTtsAbortController,
    setTtsError,
    ttsError,
    ragEnabled,
  } = useStore();
  const isDarkTheme = theme === 'dark';
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the selected model details
  const selectedModel = getModelById(selectedModelId);
  
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
    const container = messagesContainerRef.current;
    if (container && currentThread && !isAudioPlaying) {
      const scrollThreshold = 100;
      const isScrolledNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < scrollThreshold;

      const latestMessage = currentThread.messages[currentThread.messages.length - 1];
      const shouldScroll = latestMessage?.role === 'user' || isScrolledNearBottom || (isLoading && !streamingMessageId);

      if (shouldScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentThread?.messages, isLoading, isAudioPlaying, streamingMessageId]);

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
           console.log("[MiniChatMessages] TTS request aborted.");
        } else {
           console.error("[MiniChatMessages] Error initiating TTS:", error);
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
    
    // Limit to a reasonable number for mini chat
    return popularVoices.slice(0, 5);
  };

  const messagesContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: isDarkTheme ? 'linear-gradient(to top, rgb(30, 30, 30), rgb(21, 21, 21))' : '#F8FAFC',
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: isDarkTheme ? '#9CA3AF' : '#6B7280',
    background: isDarkTheme ? 'linear-gradient(to top, rgb(30, 30, 30), rgb(21, 21, 21))' : '#F8FAFC',

    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '0 20px',
  };

  const messageRowStyle = (isUser: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: '8px',
    transition: 'all 0.3s ease'
  });

  const messageStyle = (isUser: boolean): React.CSSProperties => {
    let messageBackground: string;
    if (isUser) {
      messageBackground = '#2563eb';
    } else {
      messageBackground = isDarkTheme ? 'linear-gradient(135deg, rgb(80, 75, 70), rgb(51 51 51))' : '#E2E8F0';
    }

    let messageColor: string;
    if (isUser) {
      messageColor = 'white';
    } else {
      messageColor = isDarkTheme ? '#F1F5F9' : '#151515';
    }

    const baseShadowOpacity = isUser && !isDarkTheme ? '0.08' : (isDarkTheme ? '0.1' : '0.1');

    return {
      padding: '12px 14px',
      borderRadius: isUser ? '14px 14px 0 14px' : '14px 14px 14px 0',
      backgroundColor: messageBackground,
      background: messageBackground,
      color: messageColor,
      fontSize: '13px',
      lineHeight: '1.5',
      letterSpacing: '0.01em',
      boxShadow: `0 1px 2px rgba(0, 0, 0, ${baseShadowOpacity})`,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      transition: 'all 0.3s ease',
      position: 'relative',
    };
  };

  const messageFooterStyle = (isUser: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    opacity: 0.8,
    width: '100%',
  });

  const timestampStyle = (isUser: boolean): React.CSSProperties => ({
    fontSize: '10px',
    color: isUser ? 'rgba(255, 255, 255, 0.7)' : (isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'),
    marginRight: isUser ? '0' : 'auto',
    marginLeft: isUser ? 'auto' : '0',
  });

  const buttonBaseStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
    position: 'relative',
    width: '24px',
    height: '24px',
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
    marginRight: '6px',
    width: '24px',
    height: '24px',
  });

  // Voice selector popup
  const voiceSelectorStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '28px',
    right: '0px',
    backgroundColor: isDarkTheme ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)' as any,
    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: '10px',
    padding: '12px',
    boxShadow: isDarkTheme 
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)' 
      : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    zIndex: 100,
    minWidth: '200px',
    animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: 'translateZ(0)',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: isDarkTheme ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)',
    color: isDarkTheme ? '#fff' : '#000',
    border: `1px solid ${isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '12px',
    marginTop: '8px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${isDarkTheme ? 'white' : 'black'}' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
    boxShadow: `0 1px 2px ${isDarkTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: isDarkTheme ? '#e5e7eb' : '#4b5563',
    display: 'block',
    marginBottom: '6px',
    position: 'relative',
    paddingLeft: '18px',
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
    gap: '6px',
  };

  const voiceOptionStyle = (isSelected: boolean): React.CSSProperties => ({
    backgroundColor: isSelected 
      ? (isDarkTheme ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.15)')
      : (isDarkTheme ? 'rgba(45, 55, 72, 0.5)' : 'rgba(240, 240, 240, 0.8)'),
    color: isDarkTheme ? '#e5e7eb' : '#4b5563',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    border: `1px solid ${isSelected 
      ? (isDarkTheme ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.3)') 
      : 'transparent'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontWeight: isSelected ? 600 : 400,
    boxShadow: isSelected 
      ? `0 2px 8px ${isDarkTheme ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.15)'}` 
      : 'none',
    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '60px',
  });

  if (!currentThread || currentThread.messages.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <p>No messages yet</p>
        <p style={{ fontSize: '0.8rem', maxWidth: '80%' }}>
          Start a conversation by sending a message below
        </p>
      </div>
    );
  }

  return (
    <div ref={messagesContainerRef} style={messagesContainerStyle}>
      {currentThread.messages.map((message) => (
        <div key={message.id} style={messageRowStyle(message.role === 'user')}>
          <div style={messageStyle(message.role === 'user')}>
            <div className="markdown-content">
              <ReactMarkdown>{message.content.replace(/<small.*?<\/small>/gs, '')}</ReactMarkdown>
              {message.role === 'assistant' && message.content.includes('<small') && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '10px',
                  color: message.content.includes('without database context') ? '#9CA3AF' : '#10B981',
                  opacity: 0.9
                }}>
                  {message.content.includes('without database context') 
                    ? 'Response generated without database context' 
                    : 'Response generated with database context'}
                </div>
              )}
            </div>
            
            {message.role === 'assistant' && (
              <div style={messageFooterStyle(false)}>
                <div style={{display: 'flex', alignItems: 'center'}}>
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
                    <FiSettings size={12} />
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
                      (isAudioPlaying ? <FiSquare size={12} /> : <FiLoader size={12} className="animate-spin" />) 
                      : <FiVolume2 size={12} />
                    }
                  </button>
                </div>
                
                <div style={timestampStyle(false)}>
                  {format(message.timestamp, 'h:mm a')}
                </div>
                
                {/* Voice selector popup */}
                {activeSelectorMessageId === message.id && (
                  <div className="voice-selector" style={voiceSelectorStyle}>
                    <label style={labelStyle}>
                      <FiVolume2 style={voiceIconStyle} size={12} />
                      Select Voice
                    </label>
                    
                    {/* Quick voice options */}
                    <div style={optionGroupStyle}>
                      <div 
                        style={voiceOptionStyle(selectedVoiceURI === null)}
                        onClick={() => setSelectedVoiceURI(null)}
                      >
                        Default
                        {selectedVoiceURI === null && <FiCheck size={10} />}
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
                        MS
                        {(selectedVoiceURI === 'ms-MY' || 
                          (selectedVoiceURI && 
                           (voices.find(v => v.voiceURI === selectedVoiceURI)?.lang.startsWith('ms') || 
                            voices.find(v => v.voiceURI === selectedVoiceURI)?.lang.startsWith('id')))) && 
                          <FiCheck size={10} />
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
                            {selectedVoiceURI === voice.voiceURI && <FiCheck size={10} />}
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
            )}
            
            {message.role === 'user' && (
              <div style={timestampStyle(true)}>
                {format(message.timestamp, 'h:mm a')}
              </div>
            )}
          </div>
        </div>
      ))}

      {(isLoading && !streamingMessageId) && (
        <div style={messageRowStyle(false)}>
          <div
            style={{
              ...messageStyle(false),
              display: 'flex',
              gap: '6px',
              padding: '12px 16px',
              alignItems: 'center',
              width: 'auto',
            }}
          >
            <div className="loading-dot" style={{ animationDelay: '0s' }} />
            <div className="loading-dot" style={{ animationDelay: '0.2s' }} />
            <div className="loading-dot" style={{ animationDelay: '0.4s' }} />
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
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '80%',
        }}>
          TTS Error: {ttsError}
        </div>
      )}

      <style>
        {`
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
            font-size: 11px;
            background-color: ${isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'};
            color: inherit;
          }
          .loading-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'};
            animation: bounce 1s infinite;
          }
          
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
          }
          
          @keyframes spin {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
          }
          
          .animate-spin {
             animation: spin 1s linear infinite;
          }
          
          @keyframes fadeIn {
             from { opacity: 0; transform: translateY(10px) scale(0.95); }
             to { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          .voice-settings-btn:active, button:active {
            transform: scale(0.95) !important;
          }
          
          select:focus {
            border-color: ${isDarkTheme ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.5)'};
            box-shadow: 0 0 0 2px ${isDarkTheme ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.2)'};
          }
          
          /* Make code blocks look better */
          .markdown-content pre {
            border-radius: 6px;
            padding: 10px;
            overflow-x: auto;
            margin: 8px 0;
            background-color: ${isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'};
            font-size: 0.85em;
          }
          .markdown-content pre code {
            padding: 0;
            background-color: transparent;
            font-size: 11px;
            line-height: 1.4;
          }
        `}
      </style>
    </div>
  );
};

export default MiniChatMessages; 