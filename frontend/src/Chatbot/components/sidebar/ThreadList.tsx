import React, { useState } from 'react';
import { formatDistanceToNow, isToday, isYesterday, isWithinInterval, subDays } from 'date-fns';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useStore } from '../../store/useStore';
import type { CSSProperties } from 'react';
import type { Thread } from '../../types/index';

// Inject custom styles for SweetAlert2
const swalStyles = `
  .modern-swal-popup {
    font-family: inherit; /* Use the application's font */
    border-radius: 12px !important; /* Slightly rounder corners */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05) !important;
    animation: swal-modern-show 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother animation */
  }
  .modern-swal-popup .swal2-icon {
    width: 60px !important; 
    height: 60px !important;
    margin: 2.5em auto 1.2em !important; /* Adjust margin */
    border-width: 3px !important; /* Adjust border if needed */
  }
  .modern-swal-popup .swal2-icon.swal2-warning .swal2-icon-content {
    font-size: 3em !important;
  }
  .modern-swal-popup .swal2-icon.swal2-success .swal2-success-circular-line-left,
  .modern-swal-popup .swal2-icon.swal2-success .swal2-success-circular-line-right,
  .modern-swal-popup .swal2-icon.swal2-success .swal2-success-fix {
    /* SweetAlert might calculate these dynamically, reducing base size helps */
  }
  .modern-swal-popup .swal2-icon.swal2-success .swal2-success-line-tip,
  .modern-swal-popup .swal2-icon.swal2-success .swal2-success-line-long {
    stroke-dasharray: 30, 60 !important; /* Adjust animation timing if needed */
  }
  .modern-swal-title {
    font-size: 1.3em !important;
    font-weight: 600 !important;
  }
  .modern-swal-confirm-button, .modern-swal-cancel-button {
    border-radius: 8px !important;
    padding: 0.6em 1.2em !important;
    font-weight: 500 !important;
    transition: background-color 0.2s ease, box-shadow 0.2s ease !important;
  }
  .modern-swal-confirm-button:hover {
    box-shadow: 0 4px 15px rgba(48, 133, 214, 0.4); /* Subtle shadow on hover */
  }
   .modern-swal-cancel-button:hover {
    box-shadow: 0 4px 15px rgba(211, 51, 51, 0.4); /* Subtle shadow on hover */
  }

  @keyframes swal-modern-show {
    0% {
      transform: scale(0.9);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = swalStyles;
  document.head.appendChild(styleSheet);
}

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
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkTheme ? '#1e1e1e' : '#fff',
      color: isDarkTheme ? '#fff' : '#333',
      customClass: {
        popup: 'modern-swal-popup',
        title: 'modern-swal-title',
        confirmButton: 'modern-swal-confirm-button',
        cancelButton: 'modern-swal-cancel-button',
      },
      showClass: {
        popup: ' '
      },
      hideClass: {
        popup: ' '
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteThread(threadId);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your chat history has been deleted.',
          icon: 'success',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false,
          showClass: { popup: ' ' },
          hideClass: { popup: ' ' }
        })
      }
    });
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

  const styles: { [key: string]: CSSProperties } = {
    noConversations: {
        padding: '1rem',
        textAlign: 'center',
        color: isDarkTheme ? '#64748B' : '#64748B',
        fontSize: '14px',
    },
    chatListContainer: {
      //padding: '10px 0 20px 0',
    },
    chatList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      paddingLeft: '20px',
      paddingRight: '20px',
    },
    chatItem: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '10px',
    },
    chatLinkBase: {
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
    },
    chatLinkActive: {
      backgroundImage: isDarkTheme ? 'linear-gradient(to right, rgb(0 11 23), rgb(9 34 73))' : 'none',
      backgroundColor: isDarkTheme ? 'transparent' : '#EFF6FF',
      borderColor: isDarkTheme ? '#4480d6' : '#BFDBFE',
    },
    chatLeftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flex: 1,
      minWidth: 0,
    },
    chatInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: 0,
    },
    chatTitleBase: {
      color: isDarkTheme ? '#F1F5F9' : '#0F172A',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: 500,
      fontSize: '14px',
      transition: 'all 300ms ease',
    },
    chatTitleActive: {
      color: isDarkTheme ? '#FFFFFF' : '#2563EB',
      fontWeight: 600,
    },
    chatDate: {
      color: isDarkTheme ? '#94A3B8' : '#64748B',
      fontSize: '12px',
      whiteSpace: 'nowrap',
    },
    actionButtonsContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginLeft: '8px',
        flexShrink: 0,
    },
    actionButton: {
        padding: '4px',
        borderRadius: '4px',
        lineHeight: 1,
        color: isDarkTheme ? '#94A3B8' : '#64748B',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    editInputForm: {
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        flex: 1, 
        minWidth: 0,
    },
    editInput: {
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
    },
    editConfirmButton: {
        padding: '4px', 
        color: '#10B981',
        background: 'none', 
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
    },
    editCancelButton: {
        padding: '4px', 
        color: '#EF4444',
        background: 'none', 
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
    },
    dateGroupHeader: {
        fontSize: '11px',
        fontWeight: 600,
        color: isDarkTheme ? '#64748B' : '#94A3B8',
        textTransform: 'uppercase',
        padding: '10px 20px 4px 20px',
        marginTop: '10px',
    }
  };

  if (threads.length === 0) {
    return (
      <div style={styles.noConversations}>
        No conversations yet
      </div>
    );
  }

  const groupedThreads = groupThreadsByDate(threads);

  return (
    <div style={styles.chatListContainer}>
      {Object.entries(groupedThreads).map(([groupName, groupThreads]) => {
        if (groupThreads.length === 0) {
          return null;
        }
        return (
          <div key={groupName}>
            <h3 style={styles.dateGroupHeader}>{groupName}</h3>
            <ul style={styles.chatList}>
              {groupThreads.map((thread) => {
                const isActive = currentThreadId === thread.id;
                return (
                  <li key={thread.id} style={styles.chatItem}>
                    <div
                      style={{
                        ...styles.chatLinkBase,
                        ...(isActive ? styles.chatLinkActive : {}),
                      }}
                      onClick={() => handleThreadClick(thread.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                    >
                      {editingThreadId === thread.id ? (
                        <form onSubmit={(e) => handleRenameSubmit(thread.id, e)} style={styles.editInputForm}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={styles.editInput}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <button type="submit" style={styles.editConfirmButton} onClick={(e) => e.stopPropagation()}>
                            <FiCheck size={18} />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleRenameCancel(); }} style={styles.editCancelButton}>
                            <FiX size={18} />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div style={styles.chatLeftSection}>
                            <FiMessageSquare 
                              size={18} 
                              style={{
                                color: isDarkTheme ? (isActive ? '#BFDBFE' : '#64748B') : (isActive ? '#2563EB' : '#94A3B8'),
                                flexShrink: 0, 
                                transition: 'color 300ms ease'
                              }}
                            />
                            <div style={styles.chatInfo}>
                              <span style={{
                                ...styles.chatTitleBase,
                                ...(isActive ? styles.chatTitleActive : {}),
                              }}>
                                {thread.title}
                              </span>
                              <p style={styles.chatDate}>
                                {formatDistanceToNow(thread.updatedAt, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div style={styles.actionButtonsContainer}>
                            <button
                              onClick={(e) => handleEditClick(thread.id, thread.title, e)}
                              style={styles.actionButton}
                              aria-label="Rename conversation"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(thread.id, e)}
                              style={styles.actionButton}
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