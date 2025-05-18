import React, { useState, useEffect } from 'react';
import { FiX, FiChevronRight } from 'react-icons/fi';
import { BsChatDots } from 'react-icons/bs';
import { useStore } from '../../store/useStore';
import { useChat } from '../../hooks/useChat';
import MiniChatMessages from './MiniChatMessages';
import MiniChatInput from './MiniChatInput';
import { MODEL_GROUPS, getModelById } from '../../constants/models';

// Add TypeScript declaration for the global window property
declare global {
  interface Window {
    openMiniChat?: boolean;
  }
}

const MiniChat: React.FC = () => {
  const { toggleMinimize, currentThreadId, theme, toggleTheme: storeToggleTheme, createThread, selectedModelId, setSelectedModelId, isMinimized } = useStore();
  const { currentThread } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const isDarkTheme = theme === 'dark';
  
  useEffect(() => {
    console.log("MiniChat mounted with isOpen:", isOpen);
  }, []);
  
  const selectedModel = getModelById(selectedModelId);

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof storeToggleTheme === 'function') {
      storeToggleTheme();
    } else {
      console.warn("toggleTheme function not found in useStore. Cannot toggle theme.");
    }
  };

  const handleEnsureThread = () => {
    if (!currentThreadId) {
      createThread();
    }
  };

  const toggleChat = () => {
    // Check if this was triggered by the minimize button in ChatArea
    const wasTriggeredByMinimize = window.openMiniChat;
    
    // Only log for manual toggles
    if (!wasTriggeredByMinimize) {
      console.log("Toggling chat from", isOpen, "to", !isOpen);
    } else {
      console.log("Opening mini chat due to minimize action in main chat");
    }
    
    // If this was triggered by the minimize button and chat is already open, don't close it
    if (wasTriggeredByMinimize && isOpen) {
      return;
    }
    
    setIsOpen(!isOpen);
    if (!isOpen && !currentThreadId) {
      handleEnsureThread();
    }
  };
  
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };
  
  const toggleGroupExpansion = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };
  
  const selectModel = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedModelId(modelId);
    setDropdownOpen(false);
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 'calc(1.5rem + 4rem + 1rem)',
    right: '1.5rem',
    width: '400px',
    height: '650px',
    borderRadius: '16px',
    backgroundColor: isDarkTheme ? '#1E293B' : '#FFFFFF',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    border: `1px solid ${isDarkTheme ? '#334155' : '#E2E8F0'}`,
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, visibility 0.3s ease-in-out',
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0)' : 'translateY(10px)',
    visibility: isOpen ? 'visible' : 'hidden',
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: isDarkTheme ? 'linear-gradient(to bottom, #1e1e1e, #151515)' : '#F8FAFC',
    borderBottom: `1px solid ${isDarkTheme ? '#2f2f2f' : '#E2E8F0'}`,
    cursor: 'pointer',
    position: 'relative',
  };

  const headerTitleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    color: isDarkTheme ? '#F1F5F9' : '#151515',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    pointerEvents: 'none',
  };

  const headerActionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px'
  };

  const iconButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: isDarkTheme ? '#94A3B8' : '#64748B',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 200ms'
  };

  const modelSelectorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    position: 'relative',
    marginRight: '8px',
  };
  
  const modelDotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: selectedModel.groupColor,
    marginRight: '6px',
  };
  
  const modelNameStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isDarkTheme ? '#E2E8F0' : '#1F2937',
    marginRight: '4px',
  };

  const dropdownMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '280px',
    backgroundColor: isDarkTheme ? '#1a1a1a' : '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 51,
    padding: '8px 0',
    marginTop: '8px',
    border: isDarkTheme ? '1px solid #333' : '1px solid #e0e0e0',
    display: dropdownOpen ? 'block' : 'none',
    maxHeight: '400px',
    overflowY: 'auto',
  };
  
  const dropdownHeaderStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: isDarkTheme ? '#94A3B8' : '#64748B',
    borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #f0f0f0',
    textTransform: 'uppercase',
  };
  
  const groupHeaderStyle = (isExpanded: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: isExpanded 
      ? (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
      : 'transparent',
  });
  
  const groupIconStyle = (color: string): React.CSSProperties => ({
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    backgroundColor: color,
    marginRight: '8px',
  });
  
  const groupNameStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: isDarkTheme ? '#E2E8F0' : '#1F2937',
    flex: 1,
  };
  
  const modelsContainerStyle = (isExpanded: boolean): React.CSSProperties => ({
    maxHeight: isExpanded ? '200px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
    backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
  });
  
  const modelOptionStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '6px 12px 6px 32px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: isSelected 
      ? (isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)')
      : 'transparent',
    color: isDarkTheme ? '#E2E8F0' : '#1F2937',
  });

  const subHeaderStyle: React.CSSProperties = {
    padding: '8px 16px',
    background: isDarkTheme
      ? 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)'
      : 'linear-gradient(to bottom, #ffffff, #f0f0f0)',
    borderBottom: `1px solid ${isDarkTheme ? '#4A5568' : '#D1D5DB'}`,
    textAlign: 'center',
    transition: 'background 0.3s ease, border-color 0.3s ease',
  };

  const subHeaderTitleStyle: React.CSSProperties = {
    fontWeight: 500,
    color: isDarkTheme ? '#E2E8F0' : '#1F2937',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    maxWidth: '100%',
    cursor: 'default',
    transition: 'color 0.3s ease',
    letterSpacing: '0.02em',
  };

  const chatIconBaseStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    width: '4.25rem',
    height: '4.25rem',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #FF8C00, #B22222)', // DarkOrange to Firebrick
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 15px rgba(178, 34, 34, 0.25), 0 4px 6px rgba(0, 0, 0, 0.1)', // Firebrick shadow
    border: '2px solid rgba(255, 255, 255, 0.25)', // Pale warm off-white border
    cursor: 'pointer',
    zIndex: 60,
    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.25s ease, box-shadow 0.25s ease',
    outline: 'none',
  };

  const chatIconHoverStyle: React.CSSProperties = {
    transform: 'scale(1.12)',
    background: 'linear-gradient(135deg, #FFA500, #DC143C)', // Orange to Crimson (brighter)
    boxShadow: '0 12px 20px rgba(220, 20, 60, 0.35), 0 6px 8px rgba(0, 0, 0, 0.15)', // Brighter red shadow
  };
  
  const chatIconOpenStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, #D2691E, #8B0000)', // Chocolate to DarkRed (subdued)
    boxShadow: '0 6px 12px rgba(139, 0, 0, 0.3), 0 3px 5px rgba(0, 0, 0, 0.1)',
  };

  const chatIconActiveStyle: React.CSSProperties = {
    transform: 'scale(0.96)',
    background: 'linear-gradient(145deg, #FF4500, #A52A2A)', // OrangeRed to Brown (pressed)
    boxShadow: 'inset 0 3px 5px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(165, 42, 42, 0.25)',
  };
  
  const [isIconHovered, setIsIconHovered] = useState(false);
  const [isIconActive, setIsIconActive] = useState(false);

  const iconWrapperBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s ease',
    color: '#ffffff',
  };

  const iconWrapperHoverStyle: React.CSSProperties = {
     color: '#FFF8E1', // Very pale warm yellow/off-white icon color on button hover
  };

  return (
    <>
      <button
        onClick={toggleChat}
        style={{
          ...chatIconBaseStyle,
          ...(isOpen && !isIconHovered && !isIconActive ? chatIconOpenStyle : {}),
          ...(isIconHovered ? chatIconHoverStyle : {}),
          ...(isIconActive ? chatIconActiveStyle : {}),
        }}
        title={isOpen ? "Close Chat" : "Open Chat"}
        onMouseEnter={() => setIsIconHovered(true)}
        onMouseLeave={() => {
          setIsIconHovered(false);
          setIsIconActive(false);
        }}
        onMouseDown={() => setIsIconActive(true)}
        onMouseUp={() => setIsIconActive(false)}
        onFocus={() => setIsIconHovered(true)}
        onBlur={() => setIsIconHovered(false)}
      >
        <div 
          style={{
            ...iconWrapperBaseStyle,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-90deg)',
            ...(isIconHovered ? iconWrapperHoverStyle : {}),
          }}
        >
          <FiX size={30} />
        </div>
        <div 
          style={{
            ...iconWrapperBaseStyle,
            opacity: !isOpen ? 1 : 0,
            transform: !isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(90deg)',
            ...(isIconHovered ? iconWrapperHoverStyle : {}),
          }}
        >
          <BsChatDots size={28} />
        </div>
      </button>

      {isOpen && (
        <div style={containerStyle}>
          <div style={headerStyle} onClick={toggleChat} title={isOpen ? "Collapse Chat" : "Expand Chat"}>
            <div style={headerTitleStyle}>
              <img
                src="/cb-logo.png"
                alt="SOLTWIN Logo"
                style={{ width: '20px', height: '20px' }}
              />
              <span>Chronicles AI</span>
            </div>
            <div style={headerActionsStyle}>
              {/* Model Selector Button */}
              <div style={modelSelectorStyle} onClick={toggleDropdown}>
                <div style={modelDotStyle}></div>
                <span style={modelNameStyle}>{selectedModel.name.split(' ')[0]}</span>
                <FiChevronRight 
                  size={12} 
                  style={{
                    transform: dropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
                
                {/* Dropdown Menu */}
                <div style={dropdownMenuStyle} onClick={e => e.stopPropagation()}>
                  <div style={dropdownHeaderStyle}>Select AI Model</div>
                  {MODEL_GROUPS.map(group => (
                    <div key={group.id}>
                      <div 
                        style={groupHeaderStyle(expandedGroups.has(group.id))} 
                        onClick={(e) => toggleGroupExpansion(group.id, e)}
                      >
                        <div style={groupIconStyle(group.color)}>
                          {group.id === "claude" && <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-8h2v4h-2v-4zm0-4h2v2h-2V8z"/></svg>}
                        </div>
                        <span style={groupNameStyle}>{group.name}</span>
                        <FiChevronRight
                          size={12}
                          style={{
                            transform: expandedGroups.has(group.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </div>
                      <div style={modelsContainerStyle(expandedGroups.has(group.id))}>
                        {group.models.map(model => (
                          <div 
                            key={model.id}
                            style={modelOptionStyle(model.id === selectedModelId)}
                            onClick={(e) => selectModel(model.id, e)}
                          >
                            {model.name}
                            {model.id === selectedModelId && (
                              <span style={{float: 'right', color: isDarkTheme ? '#10B981' : '#10B981'}}>✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            
              <button
                style={{...iconButtonStyle, transform: 'scale(0.9)'}}
                onClick={toggleTheme}
                title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDarkTheme ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FCD34D" strokeWidth="2">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4B5563" strokeWidth="2">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                style={{...iconButtonStyle, transform: 'scale(0.9)'}}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize();
                }}
                title="Maximize"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>

              <button
                style={iconButtonStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChat();
                }}
                title="Close"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div style={subHeaderStyle}>
            <span style={subHeaderTitleStyle} title={currentThread?.title || "New Conversation"}>
              {currentThread?.title || "New Conversation"}
            </span>
          </div>

          <div style={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <MiniChatMessages />
          </div>

          <MiniChatInput />
        </div>
      )}

      <style>{`
        @keyframes float-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes message-appear {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes typing-animation {
          0%, 80%, 100% {
            transform: scale(0.7);
            opacity: 0.6;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkTheme ? '#1E293B' : '#F1F5F9'};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkTheme ? '#475569' : '#CBD5E1'};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkTheme ? '#64748B' : '#94A3B8'};
        }

        .mini-chat-icon-enter {
          opacity: 0;
          transform: scale(0.5) rotate(-180deg);
        }
        .mini-chat-icon-enter-active {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          transition: opacity 300ms ease-out, transform 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .mini-chat-icon-exit {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        .mini-chat-icon-exit-active {
          opacity: 0;
          transform: scale(0.5) rotate(180deg);
          transition: opacity 300ms ease-in, transform 300ms cubic-bezier(0.6, -0.28, 0.735, 0.045);
        }
      `}</style>
    </>
  );
};

export default MiniChat; 