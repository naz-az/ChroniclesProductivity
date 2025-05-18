import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { FiZap, FiSave, FiPaperclip, FiMic, FiMicOff } from 'react-icons/fi';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { getModelById } from '../../constants/models';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';


// Added from SoltwinAi.tsx: App ideas for the input
const appIdeas = [
  "Use natural language to control equipment simulation",
  "Monitor and analyze real-time system parameters",
  "Answer questions about equipment specifications",
  "Locate components and parts of the equipment",
  "Simulate various equipment failure and faulty scenarios",
  "Guide users through troubleshooting processes",
  "Answer questions about theoretical knowledge",
];

// Added from SoltwinAi.tsx: Animation variants
const slideFadeVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};
const transition = { duration: 0.3, ease: "easeInOut" };

const WelcomeScreen: React.FC = () => {
  const { theme, threads, setCurrentThread, setGenerating, selectedModelId } = useStore();
  const { sendMessage: sendChatMessage } = useChat();
  const isDarkTheme = theme === 'dark';
  
  // Get the selected model details for display
  const selectedModel = getModelById(selectedModelId);

  // --- Added State & Refs from SoltwinAi ---
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Speech recognition
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition();
  // --- End Added State ---


  
  // --- Added Effects from SoltwinAi ---
  useEffect(() => {
    if (appIdeas.length <= 1 || isTyping) return () => {};

    const interval = setInterval(() => {
      setCurrentIdeaIndex(prevIndex => (prevIndex + 1) % appIdeas.length);
    }, 2400); // Same interval as SoltwinAi

    return () => clearInterval(interval);
  }, [appIdeas.length, isTyping]);

  // Sync transcript to input field when speech recognition is active
  useEffect(() => {
    if (transcript) {
      setUserInput(transcript);
      setIsTyping(true);
    }
  }, [transcript]);

  // Auto-send message when speech recognition stops if there's content
  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      // Small delay to allow for final transcript updates
      const timer = setTimeout(() => {
        if (transcript.trim() !== '') {
          // Set global generating state to true BEFORE sending the message
          setGenerating(true);
          
          // Small delay to ensure state propagates before sending
          setTimeout(() => {
            sendChatMessage(transcript.trim());
            setUserInput('');
            setIsTyping(false);
            resetTranscript();
          }, 50);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setIsTyping(true);
      resetTranscript();
      startListening();
      // Focus the input element after starting listening
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // --- Added Functions from SoltwinAi (adapted) ---
  const handleIdeaClick = () => {
    setIsTyping(true);
    setUserInput(appIdeas[currentIdeaIndex]);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleInputBlur = () => {
    if (userInput.trim() === '') {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.trim() !== '') {
      e.preventDefault();
      const trimmedInput = userInput.trim();
      // console.log("[WelcomeScreen] Sending message:", trimmedInput);
      
      // Set global generating state to true BEFORE sending the message
      // console.log("[WelcomeScreen] Setting isGenerating to TRUE");
      setGenerating(true);
      
      // Small delay to ensure state propagates before sending
      setTimeout(() => {
        // Rely on useChat to handle thread creation and message addition
        // console.log("[WelcomeScreen] Calling sendChatMessage");
        sendChatMessage(trimmedInput);
        
        // console.log("[WelcomeScreen] Message sent, clearing input");
        setUserInput('');
        setIsTyping(false);
      }, 50);
    }
  };
  
  // Function to handle clicking on a recent thread pill
  const handleThreadSelect = (threadId: string) => {
    setCurrentThread(threadId); // Use the function from useStore
  };
  // --- End Added Functions ---

  // Adapted styles from SoltwinAi.tsx for the "Homepage" view
  const styles: { [key: string]: CSSProperties } = {
    main: {
      flex: 1, // Takes up available space
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 24px',
      paddingTop: '48px', // Adjusted padding
      overflowY: 'auto',
      backgroundColor: isDarkTheme ? '#151515' : '#ffffff', // Use the existing theme logic
      color: isDarkTheme ? '#ffffff' : '#151515', // Use the existing theme logic
    },
    contentContainer: {
      width: '100%',
      maxWidth: '64rem', // Adjusted from 64rem in Soltwin to better fit content
      margin: '0 auto', // Center content
    },
    greeting: {
      marginBottom: '48px', // Adjusted from 64px
      // marginTop: '10px', // Adjusted from 64px
      textAlign: 'center',
      width: '30%', // User-defined width
      marginLeft: 'auto', // Added to center the block
      marginRight: 'auto', // Added to center the block
    },
    gradientText: {
      background: 'linear-gradient(130deg, #ffc400 0%, #ff9100 33%, #ff530f 66%, #e62c6d 87%, #b25aff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontSize: '2.8rem', // Adjusted from 3rem
      fontWeight: 'bold',
      marginBottom: '0px', // Added spacing
      marginTop: '15px', // Added spacing
      fontFamily: 'Lato, Segoe UI, Helvetica, Arial, sans-serif',
        },
    subtitle: {
      color: isDarkTheme ? '#9CA3AF' : '#6B7280',
      fontSize: '1.3rem', // Adjusted from 1.4rem
      fontWeight: 300,
      fontFamily: '"Raleway", sans-serif',
      marginBottom: '80px', // Increased spacing before input
      textAlign: 'center',
      fontStyle: 'italic',
    },
    section: { // Generic section wrapper
      marginBottom: '48px',
      width: '100%', // Ensure section takes full width
    },
    sectionTitle: {
      color: isDarkTheme ? '#9CA3AF' : '#6B7280',
      marginBottom: '12px',
      fontSize: '14px',
      textAlign: 'left', // Center the title
    },
    card: {
      backgroundColor: isDarkTheme ? '#1f1f1f' : '#F3F4F6',
      border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '10px 24px 15px 24px',
      transition: 'background-color 300ms, border 300ms, box-shadow 0.3s ease',
      boxShadow: isDarkTheme ? '0 0 0 1px rgba(0, 0, 0, 0.3)' : 'none',
    },
    cardContent: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '75px',
      minHeight: '3rem',
      overflow: 'hidden',
    },
    ideaTextContainer: {
      flex: 1,
      marginRight: '16px',
      position: 'relative',
      minHeight: '1.5rem', // Ensure container has height
      cursor: 'text', // Indicate it's clickable
    },
    ideaText: { // Style for the animated text
      color: isDarkTheme ? '#999' : '#999',
      fontSize: '1rem',
      lineHeight: '1.5rem',
      width: '100%',
      fontStyle: 'italic',
      position: 'absolute', // Position absolute for animation overlap
      top: 0,
      left: 0,
    },
    inputContainer: { // Container for the actual input element
      width: '100%',
      minHeight: '1.5rem',
      display: 'flex',
      alignItems: 'center',
    },
    inputField: { // Style for the <input>
      width: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: isDarkTheme ? '#E5E7EB' : '#374151',
      fontSize: '1rem',
      lineHeight: '1.5rem',
      caretColor: isDarkTheme ? '#fff' : '#000',
    },
    chipTab: {
      backgroundColor: isDarkTheme ? '#374151' : '#D1D5DB',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      marginLeft: '8px',
      color: isDarkTheme ? '#E0E0E0' : '#333333', // Ensure text is visible
      flexShrink: 0, // Prevent shrinking
    },
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '15px', // Reduced margin from 70px
    },
    attachIcon: {
      color: isDarkTheme ? '#9CA3AF' : '#6B7280',
    },
    attachButton: { // Style for the attach button
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      display: 'flex',
      alignItems: 'center',
    },
    pillsContainer: {
      flex: 1,
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      overflow: 'hidden', // Prevent overflow issues
      maxHeight: '50px', // Limit height if too many pills
    },
    pill: {
      backgroundColor: isDarkTheme ? '#333333' : '#E5E7EB',
      color: isDarkTheme ? '#D1D5DB' : '#4B5563',
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'opacity 300ms',
      whiteSpace: 'nowrap', // Prevent wrapping inside pill
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px', // Limit pill width
    },
    pillHover: {
      opacity: 0.8,
    },
    featuresSection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginTop: '48px', // Ensure enough space after input section
      width: '100%', // Ensure section takes full width
    },
    featureCard: {
      backgroundColor: isDarkTheme ? '#1f1f1f' : '#ffffff',
      border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      transition: 'background-color 300ms, border 300ms, transform 0.2s ease-out',
      boxShadow: isDarkTheme ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
    },
    featureIcon: {
      margin: '0 auto 1rem auto',
      display: 'block',
    },
    featureTitle: {
      fontWeight: 600,
      marginBottom: '8px',
      fontSize: '1rem',
      color: isDarkTheme ? '#F1F5F9' : '#151515',
    },
    featureDescription: {
      fontSize: '0.875rem',
      color: isDarkTheme ? '#9CA3AF' : '#6B7280',
      lineHeight: 1.5,
    },
    // --- Styles for Start Coding Section (from SoltwinAi) ---
    codingCard: {
      backgroundColor: isDarkTheme ? '#1f1f1f' : '#F3F4F6',
      border: isDarkTheme ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '12px 16px 12px 16px',
      transition: 'background-color 300ms, border 300ms, box-shadow 0.3s ease',
      boxShadow: isDarkTheme ? '0 0 0 1px rgba(0, 0, 0, 0.3)' : 'none',
      marginTop: '12px', // Added margin top
    },
    codingActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      overflowX: 'auto',
      padding: '8px 0',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: isDarkTheme ? '#FFFFFF' : '#333333',
      backgroundImage: isDarkTheme 
        ? 'linear-gradient(135deg, #2a2a2a, #3b3b3b, #4c4c4c)' 
        : 'linear-gradient(-135deg, #fefefe, #f5f5f5, #ebebeb)',
      border: `1px solid ${isDarkTheme ? '#FFFFFF55' : '#33333355'}`,
      borderRadius: '6px',
      padding: '12px 12px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      position: 'relative',
      overflow: 'hidden',
      marginLeft: '6px',
      textDecoration: 'none', // Ensure link button doesn't have underline
    } as CSSProperties,
    actionButtonHover: { // Define hover styles for reference in event handlers
      transform: 'translateY(-2px) scale(1.03)',
      boxShadow: isDarkTheme 
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 5px 10px -5px rgba(255, 255, 255, 0.1)' 
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)',
      backgroundImage: isDarkTheme 
        ? 'linear-gradient(135deg, #3a3a3a, #4b4b4b, #5c5c5c)' 
        : 'linear-gradient(-135deg, #ffffff, #f9f9f9, #f0f0f0)',
      borderColor: isDarkTheme ? '#FFFFFFAA' : '#333333AA',
    },
    actionButtonActive: { // Define active styles for reference
      transform: 'translateY(1px) scale(0.98)',
      boxShadow: isDarkTheme 
        ? '0 5px 15px -3px rgba(0, 0, 0, 0.3), 0 3px 6px -2px rgba(255, 255, 255, 0.05)' 
        : '0 5px 15px -3px rgba(0, 0, 0, 0.05), 0 3px 6px -2px rgba(0, 0, 0, 0.03)',
    },
    techIcons: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginLeft: '20px',
      flexShrink: 0, // Prevent shrinking on smaller screens
    },
    techIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowIcon: {
      color: isDarkTheme ? '#9CA3AF' : '#6B7280',
      marginLeft: '8px',
    },
    // --- End Styles for Start Coding ---

    // --- Footer Styles (copied from SoltwinAi.tsx) ---
    footer: {
      padding: '16px 0 24px 0', // Adjusted padding for this context
      marginTop: '48px', // Add some margin above the footer
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: isDarkTheme ? '#6B7280' : '#6B7280', // Consistent color
      width: '100%', // Ensure footer takes full width
      borderTop: `1px solid ${isDarkTheme ? '#2a2a2a' : '#e5e7eb'}`, // Add a top border
    },
    footerSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    footerLink: {
      color: isDarkTheme ? '#9CA3AF' : '#6B7280', // Adjusted link color slightly
      textDecoration: 'none',
      transition: 'color 300ms',
    },
    footerLinkHover: {
      color: isDarkTheme ? '#FFFFFF' : '#333333',
    },
    divider: {
      color: isDarkTheme ? '#4B5563' : '#9CA3AF', // Adjusted divider color
    },
    // --- End Footer Styles ---
  };

  // Get the 4 most recent threads for the pills
  const recentThreads = Object.values(threads)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) // Sort descending by creation time
    .slice(0, 4);

  // New model display style
  const modelDisplayStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '16px',
    padding: '4px 12px',
    fontSize: '14px',
    backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)',
    border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    margin: '0 0 30px 0',
    boxShadow: isDarkTheme ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.05)',
  };
  
  const modelDotStyle: CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: selectedModel.groupColor,
    marginRight: '8px',
  };

  // Add microphone button style
  const micButtonStyle: React.CSSProperties = {
    background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
    color: isListening ? '#ef4444' : isDarkTheme ? '#9CA3AF' : '#6B7280',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: hasRecognitionSupport ? 'pointer' : 'not-allowed',
    transition: 'all 200ms',
    padding: 0,
    opacity: hasRecognitionSupport ? 1 : 0.6,
    marginRight: '8px',
  };

  return (
    <div style={styles.main}>
      <div style={styles.contentContainer}>
        <div style={styles.greeting}>
          <h1 style={styles.gradientText}>Hello, User</h1>
          {/* <div style={modelDisplayStyle}>
            <div style={modelDotStyle}></div>
            <span>Using {selectedModel.name}</span>
          </div> */}
          <p style={styles.subtitle}>
            How can I assist you today?
          </p>
        </div>

        <div style={styles.section}>
          <p style={styles.sectionTitle}>Interact with SOLTWIN models using AI</p>
           <div
              style={styles.card}
              onMouseOver={(e) => {
                (e.currentTarget).style.boxShadow = isDarkTheme
                  ? '0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 0 4px rgba(255, 165, 0, 0.1)'
                  : '0 0 0 1px rgba(0, 0, 0, 0.08), 0 0 0 4px rgba(255, 165, 0, 0.05)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget).style.boxShadow = isDarkTheme ? '0 0 0 1px rgba(0, 0, 0, 0.3)' : 'none';
              }}
              onClick={(e) => {
                if (!isTyping && document.activeElement !== inputRef.current) {
                   handleIdeaClick();
                }
                (e.currentTarget).style.boxShadow = isDarkTheme
                    ? '0 0 0 2px rgba(255, 255, 255, 0.25), 0 0 0 4px rgba(255, 165, 0, 0.15)'
                    : '0 0 0 2px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(255, 165, 0, 0.1)';
              }}
            >
              <div style={styles.cardContent}>
                <div
                  style={styles.ideaTextContainer}
                  onClick={handleIdeaClick}
                >
                  {!isTyping && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentIdeaIndex}
                        variants={slideFadeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                        style={styles.ideaText}
                      >
                        {appIdeas[currentIdeaIndex]}
                      </motion.div>
                    </AnimatePresence>
                  )}
                  <div style={styles.inputContainer}>
                    {isTyping && (
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyPress}
                        style={styles.inputField}
                        placeholder="Type your message here..."
                      />
                    )}
                  </div>
                </div>
                <span style={styles.chipTab}>TAB</span>
              </div>
              <div style={styles.cardFooter}>
                {/* Add microphone button */}
                {hasRecognitionSupport && (
                  <button 
                    style={micButtonStyle}
                    onClick={toggleListening}
                    title={isListening ? "Stop recording" : "Start recording"}
                  >
                    {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
                  </button>
                )}
                <button style={styles.attachButton} title="Attach a file">
                  <FiPaperclip size={18} style={styles.attachIcon} />
                </button>
                 <div style={styles.pillsContainer}>
                    {recentThreads.map((thread) => (
                      <span
                        key={thread.id}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleThreadSelect(thread.id);
                        }}
                        style={styles.pill}
                        title={thread.title || `Chat from ${new Date(thread.createdAt || 0).toLocaleDateString()}`}
                        onMouseOver={(e) => {
                          (e.target as HTMLElement).style.opacity = styles.pillHover.opacity as string;
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLElement).style.opacity = "1";
                        }}
                      >
                        {thread.title || `Chat ${thread.id.substring(0, 4)}...`}
                      </span>
                    ))}
                  </div>
              </div>
            </div>
        </div>



        {/* --- Added Start Simulation Section --- */}
        <div style={styles.section}> 
          <p style={styles.sectionTitle}>Start simulation with SOLTWIN</p>
          <div 
            style={styles.codingCard}
             onMouseOver={(e) => {
                (e.currentTarget).style.boxShadow = isDarkTheme
                  ? '0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 0 4px rgba(255, 165, 0, 0.1)'
                  : '0 0 0 1px rgba(0, 0, 0, 0.08), 0 0 0 4px rgba(255, 165, 0, 0.05)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget).style.boxShadow = isDarkTheme ? '0 0 0 1px rgba(0, 0, 0, 0.3)' : 'none';
              }}
              onClick={(e) => {
                (e.currentTarget).style.boxShadow = isDarkTheme
                  ? '0 0 0 2px rgba(255, 255, 255, 0.25), 0 0 0 4px rgba(255, 165, 0, 0.15)'
                  : '0 0 0 2px rgba(0, 0, 0, 0.1), 0 0 0 4px rgba(255, 165, 0, 0.1)';
              }}
          >
            <div style={styles.codingActions}>
              <a 
                href="/soltwin" // Link preserved from SoltwinAi
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.actionButton} // Apply base styles directly to the link
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  Object.assign(target.style, styles.actionButtonHover);
                  
                  const svg = target.querySelector('svg');
                  if (svg) {
                    svg.style.transform = 'rotate(5deg) scale(1.1)';
                    svg.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                  }
                  const span = target.querySelector('span');
                  if (span) {
                    span.style.textShadow = isDarkTheme 
                      ? '0 0 8px rgba(255, 255, 255, 0.5)' 
                      : '0 0 8px rgba(0, 0, 0, 0.2)';
                    span.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  // Reset to base styles defined in styles.actionButton
                  Object.assign(target.style, styles.actionButton); 
                  // Important: Re-apply theme-dependent parts explicitly if not fully covered by base style object
                  target.style.color = isDarkTheme ? '#FFFFFF' : '#333333';
                  target.style.backgroundImage = isDarkTheme 
                    ? 'linear-gradient(135deg, #2a2a2a, #3b3b3b, #4c4c4c)' 
                    : 'linear-gradient(-135deg, #fefefe, #f5f5f5, #ebebeb)';
                  target.style.border = `1px solid ${isDarkTheme ? '#FFFFFF55' : '#33333355'}`;
                  target.style.boxShadow = 'none'; // Explicitly remove shadow
                  target.style.transform = 'translateY(0) scale(1)'; // Explicitly reset transform

                  const svg = target.querySelector('svg');
                  if (svg) {
                    svg.style.transform = 'rotate(0) scale(1)';
                  }
                  const span = target.querySelector('span');
                  if (span) {
                    span.style.textShadow = 'none';
                  }
                }}
                 onMouseDown={(e) => {
                    const target = e.currentTarget;
                    Object.assign(target.style, styles.actionButtonActive);
                 }}
                 onMouseUp={(e) => {
                    const target = e.currentTarget;
                     // Revert to hover style after click release
                    Object.assign(target.style, styles.actionButtonHover);
                 }}
              >
                 <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ 
                    marginRight: '4px',
                    marginLeft: '2px',
                    transition: 'transform 0.3s ease', // Keep transition for SVG
                  }}
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                </svg>
                <span>Explore SOLTWIN</span>
              </a>
              
              {/* Technology Icons */}
              <div style={styles.techIcons}>
                 {/* Replicated icons from SoltwinAi */}
                <div style={{ ...styles.techIcon, background: "#1E88E5" }}></div>
                <div style={{ ...styles.techIcon, background: "#4285F4" }}></div>
                <div style={{ ...styles.techIcon, background: "#F9AB00" }}></div>
                <div style={{ ...styles.techIcon, background: "#673AB7" }}></div>
                <div style={{ ...styles.techIcon, background: "#26A69A" }}></div>
                <div style={{ ...styles.techIcon, background: "#4FC3F7" }}></div>
                <div style={{ ...styles.techIcon, background: "#EA4335" }}></div>
                <div style={{ ...styles.techIcon, background: "#444444" }}></div>
                <div style={{ ...styles.techIcon, background: "#34A853" }}></div>
                <div style={{ ...styles.techIcon, background: "#42A5F5" }}></div>
                <div style={{ ...styles.techIcon, background: "#FB8C00" }}></div>
                <div style={{ ...styles.techIcon, background: "#00ACC1" }}></div>

                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    marginLeft: "8px",
                    display: 'flex', // Ensure button itself is flex for alignment
                    alignItems: 'center'
                  }}
                  title="More technologies (Not implemented)" // Indicate button is static
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke={isDarkTheme ? "#9CA3AF" : "#6B7280"}
                    strokeWidth="2"
                    style={styles.arrowIcon}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* --- End Start Simulation Section --- */}

        <div style={styles.featuresSection}>
          <div style={styles.featureCard}>
            <FiZap style={{ ...styles.featureIcon, color: '#f59e0b' }} size={32} />
            <h3 style={styles.featureTitle}>Real-time Digital Twin Interaction</h3>
            <p style={styles.featureDescription}>
              Engage directly with the Chronicles AI for immediate insights and live simulation feedback.
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <FiSave style={{ ...styles.featureIcon, color: '#10b981' }} size={32} />
            <h3 style={styles.featureTitle}>Persistent Session History</h3>
            <p style={styles.featureDescription}>
              All interactions with the Chronicles AI are saved locally, allowing you to revisit and analyze past sessions.
            </p>
          </div>
        </div>
        
      </div>

      {/* Footer (Moved outside contentContainer for full width) */}
      <footer style={styles.footer}>
        <div style={styles.footerSection}>
          <a
            href="#" // Placeholder link
            style={styles.footerLink}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLinkHover.color as string;
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLink.color as string;
            }}
          >
            Discussion Forum
          </a>
          <span style={styles.divider}>—</span>
          <a
            href="#" // Placeholder link
            style={styles.footerLink}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLinkHover.color as string;
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLink.color as string;
            }}
          >
            Feature Requests
          </a>
        </div>
        <div style={styles.footerSection}>
          <a
            href="#" // Placeholder link
            style={styles.footerLink}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLinkHover.color as string;
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLink.color as string;
            }}
          >
            About Chronicles AI
          </a>
          <span style={styles.divider}>—</span>
          <a
            href="#" // Placeholder link
            style={styles.footerLink}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLinkHover.color as string;
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLink.color as string;
            }}
          >
            Terms
          </a>
          <span style={styles.divider}>—</span>
          <a
            href="#" // Placeholder link
            style={styles.footerLink}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLinkHover.color as string;
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.color = styles.footerLink.color as string;
            }}
          >
            Privacy
          </a>
        </div>
      </footer>

    </div>
  );
};

export default WelcomeScreen; 