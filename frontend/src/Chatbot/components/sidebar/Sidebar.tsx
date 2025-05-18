import React, { useState } from 'react';
import { FiPlusCircle, FiMoon, FiSun, FiChevronLeft } from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import ThreadList from './ThreadList';
import { CSSProperties } from 'react';
import logo from './SOLTWINAI-red.png';


// Add keyframes for pulsing animation
const keyframes = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.7;
    }
  }
`;

// Inject keyframes into the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = keyframes;
  document.head.appendChild(styleSheet);
}

const Sidebar: React.FC = () => {
  const { setCurrentThread, theme, toggleTheme } = useStore();
  const isDarkTheme = theme === 'dark';
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);


  const handleNewChat = () => {
    setCurrentThread(null);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarStyle: CSSProperties = {
    backgroundColor: isDarkTheme ? '#151515' : '#F8FAFC',
    borderRight: `1px solid ${isDarkTheme ? '#2a2a2a' : '#E2E8F0'}`,
    borderRadius: '20px 0 0 20px',
    margin: '10px 0 10px 10px',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    width: isCollapsed ? '80px' : '300px',
    height: 'calc(100vh - 20px)', // Full viewport height minus margin
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  };

  const headerStyle: CSSProperties = {
    padding: isCollapsed ? '12px' : '0px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${isDarkTheme ? '#2a2a2a' : '#E2E8F0'}`,
    flexShrink: 0,
    height: '60px', // Fixed height for the header
  };

  const logoContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 200ms ease, max-width 300ms ease',
    maxWidth: isCollapsed ? '0' : '200px',
    overflow: 'hidden',
  };

  const logoImageStyle: CSSProperties = {
    height: '28px',
    objectFit: 'contain',
  };

  const logoTextStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: isDarkTheme ? '#E0E0E0' : '#333333',
    whiteSpace: 'nowrap',
  };

  const themeToggleButtonStyle: CSSProperties = {
    padding: '10px',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isDarkTheme ? '#64748B' : '#64748B',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    marginLeft: isCollapsed ? '0' : 'auto',
    marginBottom: isCollapsed ? '8px' : '0',
  };

  const newChatButtonContainerStyle: CSSProperties = {
    padding: isCollapsed ? '16px 10px' : '16px 20px',
    flexShrink: 0,
  };

  const newChatButtonStyle: CSSProperties = {
    background: isDarkTheme 
      ? 'linear-gradient(to right, rgba(43, 48, 54, 0.5), rgba(88, 88, 88, 0.5))'
      : 'linear-gradient(-135deg, rgb(254, 254, 254), rgb(245, 245, 245), rgb(235, 235, 235))',
    color: isDarkTheme ? 'white' : 'black',
    padding: '12px',
    borderRadius: '12px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'center',
    gap: isCollapsed ? '0' : '10px',
    fontSize: '15px',
    fontWeight: 500,
    boxShadow: isDarkTheme 
      ? '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
      : '0 1px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(75, 66, 66, 0.05)',
    border: 'none',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    outline: 'none',
  };

  const newChatButtonTextStyle: CSSProperties = {
    opacity: isCollapsed ? 0 : 1,
    width: isCollapsed ? 0 : 'auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'opacity 200ms ease, width 300ms ease',
  };

  const chatHistoryContainerStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    marginTop: '10px',
    position: 'relative',
    scrollBehavior: 'smooth',
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 300ms ease',
    visibility: isCollapsed ? 'hidden' : 'visible',
  };

  const footerStyle: CSSProperties = {
    padding: '12px 16px',
    marginTop: 'auto',
    borderTop: `1px solid ${isDarkTheme ? '#2a2a2a' : '#E2E8F0'}`,
    flexShrink: 0,
    backgroundColor: isDarkTheme ? '#151515' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    flexDirection: isCollapsed ? 'column-reverse' : 'row',
    justifyContent: isCollapsed ? 'center' : 'normal',
  };

  const profileContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: isCollapsed ? '0' : '10px',
    flexGrow: isCollapsed ? 0 : 1,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    width: isCollapsed ? '100%' : 'auto',
    position: 'relative',
  };

  const profileIconStyle: CSSProperties = {
    backgroundColor: '#B95710',
    width: '38px',
    height: '38px',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 500,
    fontSize: '16px',
    flexShrink: 0,
    position: 'relative',
  };

  const onlineIndicatorStyle: CSSProperties = {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: '-3px',
    right: '-3px',
    border: `2px solid ${isDarkTheme ? '#151515' : '#ffffff'}`,
    animation: 'pulse 2s infinite cubic-bezier(0.66, 0, 0, 1)',
    opacity: isCollapsed ? 0 : 1,
    transition: 'opacity 300ms ease',
  };

  const profileDetailsStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    opacity: isCollapsed ? 0 : 1,
    maxWidth: isCollapsed ? 0 : '150px',
    transition: 'opacity 200ms ease, max-width 300ms ease',
  };

  const profileNameStyle: CSSProperties = {
    color: isDarkTheme ? '#F1F5F9' : '#334155',
    fontSize: '14px',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const planContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
  };

  const planTextStyle: CSSProperties = {
    color: isDarkTheme ? '#94A3B8' : '#64748B',
    fontSize: '12px',
    fontWeight: 400,
    whiteSpace: 'nowrap',
  };

  const planCheckmarkStyle: CSSProperties = {
    color: '#10B981',
    width: '12px',
    height: '12px',
  };

  const collapseButtonStyle: CSSProperties = {
    padding: '10px',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: isDarkTheme ? '#64748B' : '#64748B',
    cursor: 'pointer',
    transition: 'transform 300ms ease, color 200ms ease',
    flexShrink: 0,
    transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
    marginLeft: isCollapsed ? '0' : '60px',
  };

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <img
            src="./cb-logo.png"
            alt="Chronicles AI Logo"
            style={logoImageStyle}
          />
          <span style={logoTextStyle}>Chronicles AI</span>
        </div>

        <button
          onClick={handleNewChat}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginLeft: isCollapsed ? 'auto' : '0', // Center when collapsed
            marginRight: isCollapsed ? 'auto' : '10px', // Add some space between logo and collapse button
          }}
          aria-label="New Chat / Home"
        >
          {/* <img
            src={logo}
            alt="Chronicles AI Logo"
            style={{
              height: '40px',
              // Removed marginLeft here, handled by button style now
              marginLeft: isCollapsed ? '0' : '15px',
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 200ms ease',
              maxWidth: isCollapsed ? '0' : '200px',
              objectFit: 'contain',
            }}
          /> */}
        </button>

        <button
          onClick={toggleCollapse}
          style={collapseButtonStyle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiChevronLeft size={20} />
        </button>
      </div>
      
      <div style={newChatButtonContainerStyle}>
        <button
          onClick={handleNewChat}
          style={newChatButtonStyle} 
          aria-label="New Chat"
        >
          <FiPlusCircle />
          <span style={newChatButtonTextStyle}>New Chat</span>
        </button>
      </div>
      
      <div style={chatHistoryContainerStyle}>
        <ThreadList />
      </div>

      <div style={footerStyle}>
        <div style={profileContainerStyle}>
          <div style={profileIconStyle}>
            {'U'}
            <div style={onlineIndicatorStyle}></div>
          </div>
          <div style={profileDetailsStyle}>
            <span style={profileNameStyle}>
              {'User'}
            </span>
            <div style={planContainerStyle}>
              <svg
                style={planCheckmarkStyle}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                 <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span style={planTextStyle}>Pro Plan</span>
            </div>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          style={themeToggleButtonStyle}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 