import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { FiMinimize2, FiChevronRight, FiCheck, FiDatabase, FiMessageSquare } from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import WelcomeScreen from './WelcomeScreen';
import { MODEL_GROUPS, getModelById } from '../../constants/models';
import usePageContext from '../../hooks/usePageContext';

// Add TypeScript declaration for the global window property
declare global {
  interface Window {
    openMiniChat?: boolean;
  }
}

// Get all flattened models for searching
// const aiModels = getAllModels(); // Removed unused variable

// Helper function to generate shades of a color
const generateShade = (hexColor: string, magnitude: number): string => {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor.length === 3) {
    hexColor = hexColor.split('').map(char => char + char).join('');
  }
  const decimalColor = parseInt(hexColor, 16);
  let r = (decimalColor >> 16) + magnitude;
  r > 255 && (r = 255);
  r < 0 && (r = 0);
  let g = (decimalColor & 0x0000ff) + magnitude;
  g > 255 && (g = 255);
  g < 0 && (g = 0);
  let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
  b > 255 && (b = 255);
  b < 0 && (b = 0);
  return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
};

const ChatArea: React.FC = () => {
  const { 
    currentThreadId, 
    toggleMinimize, 
    theme, 
    toggleTheme, 
    selectedModelId, 
    setSelectedModelId,
    isGenerating,
    ragEnabled,
    toggleRagEnabled
  } = useStore();
  
  // Get current page context for RAG
  const { pageContext } = usePageContext();
  
  const isDarkTheme = theme === 'dark';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the selected model details
  const selectedModel = getModelById(selectedModelId);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const node = dropdownRef.current as HTMLDivElement | null;
      if (node && !node.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleDropdown = () => {
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

  const selectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setDropdownOpen(false);
  };

  // Handle mouse events for the RAG toggle button
  const handleRagToggleMouseDown = () => {
    const element = document.getElementById('rag-toggle');
    if (element) {
      element.style.transform = 'scale(0.97)';
    }
  };

  const handleRagToggleMouseUp = () => {
    const element = document.getElementById('rag-toggle');
    if (element) {
      element.style.transform = 'scale(1)';
    }
  };

  const handleRagToggleMouseLeave = () => {
    const element = document.getElementById('rag-toggle');
    if (element) {
      element.style.transform = 'scale(1)';
    }
  };

  // Style definitions 
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: isDarkTheme ? '#151515' : '#ffffff',
    color: isDarkTheme ? '#ffffff' : '#151515',
  };

  const headerStyle: CSSProperties = {
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: isDarkTheme ? "#151515" : "#FFFFFF",
    borderBottom: `1px solid ${isDarkTheme ? '#2a2a2a' : '#e5e7eb'}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  const contentAreaStyle: CSSProperties = {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: isDarkTheme ? '#151515' : '#ffffff',
  };

  const inputSectionStyle: CSSProperties = {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0, 
    padding: '1rem',
    borderTop: `1px solid ${isDarkTheme ? '#374151' : '#d1d5db'}`,
    backgroundColor: isDarkTheme ? '#151515' : '#ffffff',
    zIndex: 10,
  };

  // Updated dropdown styles for new hierarchical structure
  const dropdownStyles = {
    container: {
      position: 'relative',
      marginLeft: '16px',
      zIndex: 100,
    } as CSSProperties,
    button: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: isDarkTheme ? '#2a2a2a' : '#f0f0f0',
      border: `1px solid ${isDarkTheme ? '#444' : '#e0e0e0'}`,
      borderRadius: '8px',
      padding: '10px 12px',
      fontSize: '14px',
      color: isDarkTheme ? '#fff' : '#333',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif',
    } as CSSProperties,
    modelDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      marginRight: '8px',
      background: selectedModel.groupColor,
      boxShadow: '0 0 5px rgba(0,0,0,0.2)',
    } as CSSProperties,
    arrow: {
      marginLeft: '8px',
      transition: 'transform 0.3s ease',
      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    } as CSSProperties,
    dropdownMenu: {
      position: 'absolute',
      top: '120%',
      left: '0',
      minWidth: '340px',
      backgroundColor: isDarkTheme ? '#2a2a2a' : '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      opacity: dropdownOpen ? 1 : 0,
      transform: dropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
      pointerEvents: dropdownOpen ? 'auto' : 'none',
      border: isDarkTheme ? '1px solid #444' : '1px solid #e0e0e0',
    } as CSSProperties,
    header: {
      padding: '12px 16px',
      borderBottom: isDarkTheme ? '1px solid #444' : '1px solid #e0e0e0',
      color: isDarkTheme ? '#aaa' : '#777',
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    } as CSSProperties,
    groupContainer: {
      borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #f0f0f0',
    } as CSSProperties,
    groupHeader: (isExpanded: boolean): CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isExpanded 
        ? (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
        : 'transparent',
    }),
    groupIcon: (color: string): CSSProperties => ({
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    }),
    groupName: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: isDarkTheme ? '#fff' : '#333',
      flex: 1,
    } as CSSProperties,
    groupArrow: (isExpanded: boolean): CSSProperties => ({
      transition: 'transform 0.3s ease',
      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
      color: isDarkTheme ? '#aaa' : '#777',
    }),
    modelsContainer: (isExpanded: boolean): CSSProperties => ({
      overflow: 'hidden',
      maxHeight: isExpanded ? '500px' : '0',
      transition: 'max-height 0.3s ease',
      backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
    }),
    option: (modelId: string): CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px 12px 40px', // Indented to show hierarchy
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor:
      modelId === selectedModelId
        ? (isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)')
        : 'transparent',
    }),
    modelIcon: (color: string): CSSProperties => ({
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '12px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      flexShrink: 0,
    }),
    modelInfo: {
      display: 'flex',
      flexDirection: 'column',
    } as CSSProperties,
    modelName: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: isDarkTheme ? '#fff' : '#333',
    } as CSSProperties,
    modelDesc: {
      fontSize: '12px',
      color: isDarkTheme ? '#aaa' : '#777',
      marginTop: '2px',
    } as CSSProperties,
    checkmark: {
      marginLeft: 'auto',
      color: isDarkTheme ? '#aaa' : '#777',
    } as CSSProperties,
  };

  const themeToggleStyle: CSSProperties = {
    padding: '8px',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkTheme ? '#374151' : '#E5E7EB',
    border: '1px solid #999',
    marginLeft: '5px',
    marginRight: '5px',
    cursor: 'pointer',
  };

  const modelButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkTheme ? '#374151' : '#d1d5db'}`,
    backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
    color: isDarkTheme ? '#e5e7eb' : '#1f2937',
    cursor: 'pointer',
    fontSize: '0.875rem',
  };

  const modelIndicatorStyle: React.CSSProperties = {
    width: '0.75rem',
    height: '0.75rem',
    borderRadius: '50%',
    backgroundColor: selectedModel.groupColor,
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flex: 1,
          }}
        >
          {/* Logo and Title Removed - To be placed in Sidebar */}
          
          {/* Enhanced RAG Toggle Switch */}
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              background: isDarkTheme ? '#2a2a2a' : '#f0f0f0',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              border: `1px solid ${isDarkTheme ? '#444' : '#e0e0e0'}`,
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s ease, transform 0.1s ease',
              transform: 'scale(1)',
            }}
            onClick={toggleRagEnabled}
            onMouseDown={handleRagToggleMouseDown}
            onMouseUp={handleRagToggleMouseUp}
            onMouseLeave={handleRagToggleMouseLeave}
            id="rag-toggle"
            title={ragEnabled 
              ? `Database context is enabled - The AI will use your personal data to answer queries${pageContext ? ` (Current context: ${pageContext})` : ''}`
              : "Database context is disabled - The AI will only use its pre-trained knowledge"}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: ragEnabled 
                ? (isDarkTheme ? '#2563eb' : '#3b82f6') 
                : (isDarkTheme ? '#374151' : '#9ca3af'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '10px',
              transition: 'background-color 0.2s ease',
              color: '#ffffff',
            }}>
              {ragEnabled ? <FiDatabase size={14} /> : <FiMessageSquare size={14} />}
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
            }}>
              <span style={{ 
                fontSize: '14px',
                fontWeight: 'bold',
                color: isDarkTheme ? '#D1D5DB' : '#4B5563',
              }}>
                {ragEnabled ? 'Database Mode' : 'Standard Mode'}
              </span>
              
              <span style={{
                fontSize: '11px',
                color: isDarkTheme ? '#9CA3AF' : '#6B7280',
                marginTop: '1px',
              }}>
                {ragEnabled 
                  ? (pageContext 
                    ? `Using context: ${pageContext}` 
                    : 'Using all database data')
                  : 'AI knowledge only'}
              </span>
            </div>
            
            <div style={{
              width: '36px',
              height: '20px',
              backgroundColor: ragEnabled 
                ? (isDarkTheme ? '#3b82f6' : '#2563eb') 
                : (isDarkTheme ? '#4b5563' : '#9ca3af'),
              borderRadius: '10px',
              position: 'relative',
              transition: 'background-color 0.2s',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
              marginLeft: '12px',
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: ragEnabled ? '18px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }} />
            </div>
            {ragEnabled && (
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            )}
          </div>

          <div style={dropdownStyles.container} ref={dropdownRef}>
            <button style={modelButtonStyle} onClick={toggleDropdown}>
              <div style={modelIndicatorStyle}></div>
              <span>{selectedModel.name}</span>
              <svg
                className="ml-2 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                style={{ width: '16px', height: '16px', marginLeft: '8px' }}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div style={dropdownStyles.dropdownMenu}>
              <div style={dropdownStyles.header}>Select AI Model</div>
              
              {MODEL_GROUPS.map((group) => (
                <div key={group.id} style={dropdownStyles.groupContainer}>
                  <div 
                    style={dropdownStyles.groupHeader(expandedGroups.has(group.id))}
                    onClick={(e) => toggleGroupExpansion(group.id, e)}
                  >
                    <div style={dropdownStyles.groupIcon(group.color)}>
                      {group.id === "deepseek" && <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>}
                      {group.id === "qwen" && <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-2-9.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>}
                      {group.id === "gemini" && <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z"/></svg>}
                      {group.id === "claude" && <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-8h2v4h-2v-4zm0-4h2v2h-2V8z"/></svg>}
                    </div>
                    <span style={dropdownStyles.groupName}>{group.name}</span>
                    <FiChevronRight style={dropdownStyles.groupArrow(expandedGroups.has(group.id))} />
                  </div>
                  
                  <div style={dropdownStyles.modelsContainer(expandedGroups.has(group.id))}>
                    {group.models.map((model, index) => {
                      const magnitude = (index + 1) * (isDarkTheme ? 15 : -15);
                      const modelColor = generateShade(group.color, magnitude);
                      
                      return (
                        <div
                          key={model.id}
                          style={dropdownStyles.option(model.id)}
                          onClick={() => selectModel(model.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              model.id === selectedModelId
                                ? (isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')
                                : (isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              model.id === selectedModelId
                                ? (isDarkTheme ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)')
                                : 'transparent';
                          }}
                        >
                          <div style={dropdownStyles.modelIcon(modelColor)}>
                            {model.id === "deepseek" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 1c-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11-4.9-11-11-11zm0 2c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" /></svg>}
                            {model.id === "qwen" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3"/></svg>}
                            {model.id === "qwen14b" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2.5"/><line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2.5"/></svg>}
                            {model.id.startsWith("claude-") && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>}
                            {model.id === "gemini-flash" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z"/></svg>}
                            {model.id === "gemini-pro" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.54 4.92.42-3.73 3.23L16.23 18z"/></svg>}
                            {model.id === "gemini-preview" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>}
                            {model.id === "gemini-2.5-pro-exp-03-25" && <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>}
                          </div>
                          <div style={dropdownStyles.modelInfo}>
                            <span style={dropdownStyles.modelName}>{model.name}</span>
                            <span style={dropdownStyles.modelDesc}>{model.description}</span>
                          </div>
                          {model.id === selectedModelId && (
                            <div style={dropdownStyles.checkmark}>
                              <FiCheck size={16} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={() => {
              // Set minimized to true in the store, which closes the full chat
              toggleMinimize();
              
              // Set a global flag to indicate mini chat should be opened
              window.openMiniChat = true;
              
              // Force open the mini chat by directly clicking the button
              setTimeout(() => {
                const miniChatButton = document.querySelector('button[title="Open Chat"]');
                if (miniChatButton) {
                  (miniChatButton as HTMLButtonElement).click();
                }
                // Clear the flag after a short delay
                setTimeout(() => {
                  window.openMiniChat = undefined;
                }, 500);
              }, 100);
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDarkTheme ? '#D1D5DB' : '#4B5563',
            }}
            title="Minimize to mini chat"
          >
            <FiMinimize2 size={20} />
          </button>
          
          <button
            onClick={toggleTheme}
            style={themeToggleStyle}
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
        </div>
      </header>

      <div style={contentAreaStyle}>
        {currentThreadId ? <MessageList /> : <WelcomeScreen />}
      </div>

      {(currentThreadId || isGenerating) && (
        <div style={inputSectionStyle}>
          <MessageInput pageContext={pageContext} />
        </div>
      )}
    </div>
  );
};

export default ChatArea;