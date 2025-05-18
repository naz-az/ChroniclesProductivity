import React, { useState } from 'react';
import { formatDistanceToNow, isToday, isYesterday, isWithinInterval, subDays } from 'date-fns';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import type { CSSProperties } from 'react';
import type { Thread } from '../../types/index';

// Helper function to categorize threads by date
const groupThreadsByDate = (threads: Thread[]) => {
  const groups: { [key: string]: Thread[] } = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOfYesterday = subDays(startOfToday, 1);
  const startOf7DaysAgo = subDays(startOfToday, 7);
  const startOf30DaysAgo = subDays(startOfToday, 30);

  threads.forEach((thread) => {
    const threadDate = new Date(thread.updatedAt || thread.createdAt || 0);

    if (isToday(threadDate)) {
      groups.Today.push(thread);
    } else if (isYesterday(threadDate)) {
      groups.Yesterday.push(thread);
    } else if (isWithinInterval(threadDate, { start: startOf7DaysAgo, end: startOfYesterday })) {
      groups["Previous 7 Days"].push(thread);
    } else if (isWithinInterval(threadDate, { start: startOf30DaysAgo, end: startOf7DaysAgo })) {
      groups["Previous 30 Days"].push(thread);
    } else {
      groups.Older.push(thread);
    }
  });

  // Sort threads within each group (most recent first)
  for (const key in groups) {
     groups[key].sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  }

  return groups;
};

const ThreadList: React.FC = () => {
  const { threads, currentThreadId, setCurrentThread, deleteThread, renameThread, theme } = useStore();
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const isDarkTheme = theme === 'dark';

  const handleThreadClick = (threadId: string) => {
    setCurrentThread(threadId);
  };

  const handleEditClick = (threadId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingThreadId(threadId);
    setEditValue(title);
  };

  const handleDeleteClick = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThread(threadId);
  };

  const handleRenameSubmit = (threadId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim()) {
      renameThread(threadId, editValue);
    }
    setEditingThreadId(null);
  };

  const handleRenameCancel = () => {
    setEditingThreadId(null);
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    height: '100%',
    overflowY: 'auto',
  };

  // No conversations message styles
  const noConversationsStyle: React.CSSProperties = {
    padding: '1rem',
    textAlign: 'center',
    color: isDarkTheme ? '#64748B' : '#64748B',
    fontSize: '14px',
  };

  // Chat list container styles
  const chatListContainerStyle: React.CSSProperties = {
    paddingBottom: '20px',
  };

  // Chat list styles
  const chatListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingLeft: '20px',
    paddingRight: '20px',
    margin: 0,
    listStyleType: 'none',
  };

  // Chat item styles
  const chatItemStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '10px',
  };

  // Base chat link styles
  const chatLinkBaseStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '10px',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'lightgrey',
    textDecoration: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  };

  // Active chat link styles
  const chatLinkActiveStyle: React.CSSProperties = {
    backgroundImage: isDarkTheme ? 'linear-gradient(to right, rgb(0 11 23), rgb(9 34 73))' : 'none',
    backgroundColor: isDarkTheme ? 'transparent' : '#EFF6FF',
    borderColor: isDarkTheme ? '#4480d6' : '#BFDBFE',
  };

  // Chat left section styles
  const chatLeftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  };

  // Chat info styles
  const chatInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  };

  // Base chat title styles
  const chatTitleBaseStyle: React.CSSProperties = {
    color: isDarkTheme ? '#F1F5F9' : '#0F172A',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'all 300ms ease',
  };

  // Active chat title styles
  const chatTitleActiveStyle: React.CSSProperties = {
    color: isDarkTheme ? '#FFFFFF' : '#2563EB',
    fontWeight: 600,
  };

  // Chat date styles
  const chatDateStyle: React.CSSProperties = {
    color: isDarkTheme ? '#94A3B8' : '#64748B',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  };

  // Action buttons container styles
  const actionButtonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: '8px',
    flexShrink: 0,
  };

  // Action button styles
  const actionButtonStyle: React.CSSProperties = {
    padding: '4px',
    borderRadius: '4px',
    lineHeight: 1,
    color: isDarkTheme ? '#94A3B8' : '#64748B',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  // Edit input form styles
  const editInputFormStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    minWidth: 0,
  };

  // Edit input styles
  const editInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    fontSize: '14px',
    color: isDarkTheme ? '#F1F5F9' : '#0F172A',
    backgroundColor: isDarkTheme ? '#2a2a2a' : '#FFFFFF',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isDarkTheme ? '#334155' : '#CBD5E1',
    borderRadius: '6px',
    outline: 'none',
  };

  // Edit confirm button styles
  const editConfirmButtonStyle: React.CSSProperties = {
    padding: '4px',
    color: '#10B981',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  };

  // Edit cancel button styles
  const editCancelButtonStyle: React.CSSProperties = {
    padding: '4px',
    color: '#EF4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  };

  // Date group header styles
  const dateGroupHeaderStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: isDarkTheme ? '#64748B' : '#94A3B8',
    textTransform: 'uppercase',
    padding: '10px 20px 4px 20px',
    marginTop: '10px',
  };

  if (threads.length === 0) {
    return (
      <div style={noConversationsStyle}>
        No conversations yet
      </div>
    );
  }

  const groupedThreads = groupThreadsByDate(threads);

  return (
    <div style={containerStyle}>
      {Object.entries(groupedThreads).map(([groupName, groupThreads]) => {
        if (groupThreads.length === 0) {
          return null;
        }
        return (
          <div key={groupName}>
            <h3 style={dateGroupHeaderStyle}>{groupName}</h3>
            <ul style={chatListStyle}>
              {groupThreads.map((thread) => {
                const isActive = currentThreadId === thread.id;
                return (
                  <li key={thread.id} style={chatItemStyle}>
                    <div
                      style={{
                        ...chatLinkBaseStyle,
                        ...(isActive ? chatLinkActiveStyle : {}),
                      }}
                      onClick={() => handleThreadClick(thread.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                    >
                      {editingThreadId === thread.id ? (
                        <form onSubmit={(e) => handleRenameSubmit(thread.id, e)} style={editInputFormStyle}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={editInputStyle}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <button type="submit" style={editConfirmButtonStyle} onClick={(e) => e.stopPropagation()}>
                            <FiCheck size={18} />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleRenameCancel(); }} style={editCancelButtonStyle}>
                            <FiX size={18} />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div style={chatLeftSectionStyle}>
                            <FiMessageSquare 
                              size={18} 
                              style={{
                                color: isDarkTheme ? (isActive ? '#BFDBFE' : '#64748B') : (isActive ? '#2563EB' : '#94A3B8'),
                                flexShrink: 0, 
                                transition: 'color 300ms ease'
                              }}
                            />
                            <div style={chatInfoStyle}>
                              <span style={{
                                ...chatTitleBaseStyle,
                                ...(isActive ? chatTitleActiveStyle : {}),
                              }}>
                                {thread.title}
                              </span>
                              <p style={chatDateStyle}>
                                {formatDistanceToNow(thread.updatedAt, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div style={actionButtonsContainerStyle}>
                            <button
                              onClick={(e) => handleEditClick(thread.id, thread.title, e)}
                              style={actionButtonStyle}
                              aria-label="Rename conversation"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(thread.id, e)}
                              style={actionButtonStyle}
                              aria-label="Delete conversation"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default ThreadList; 