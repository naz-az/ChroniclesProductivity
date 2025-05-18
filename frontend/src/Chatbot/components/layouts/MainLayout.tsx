import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatArea from '../chat/ChatArea';
import MiniChat from '../mini-chat/MiniChat';
import { useStore } from '../../store/useStore';

const MainLayout: React.FC = () => {
  const { isMinimized, theme } = useStore();
  const isDarkTheme = theme === 'dark';

  if (isMinimized) {
    return <MiniChat />;
  }

  // Main container styles that takes up the full viewport
  const mainContainerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh', // Using viewport height to ensure full height
    width: '100vw',
    overflow: 'hidden', // Prevent any scrolling at the window level
    backgroundColor: isDarkTheme ? '#151515' : '#ffffff',
    color: isDarkTheme ? '#ffffff' : '#151515',
  };

  return (
    <div style={mainContainerStyle}>
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default MainLayout; 