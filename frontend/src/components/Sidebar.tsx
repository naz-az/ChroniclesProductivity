import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

// Define proper types for the component props
interface SidebarProps {
  collapsed?: boolean;
  toggleSidebar: () => void;
  onNavigate: () => void;
}

// Sidebar Component
const Sidebar = ({ collapsed = false, toggleSidebar, onNavigate }: SidebarProps) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(!collapsed);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null); // For link hover effects

  // --- Professional Icon Components ---
  const DashboardIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
    </svg>
  );

  const SoftwareEngineeringIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  );

  const GeneralTasksIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  );

  const BusinessProjectsIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" ry="2"></rect>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
      <line x1="3" y1="12" x2="21" y2="12"></line>
    </svg>
  );

  const FinanceIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );

  const InvestmentsIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  );

  const FitnessIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <path d="M6 12h12"></path>
      <path d="M12 6v12"></path>
    </svg>
  );

  const SettingsIcon = ({ color = 'currentColor', size = '22px' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );

  const ChevronLeftIcon = ({ size = "20px", color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );

  const ChevronRightIcon = ({ size = "20px", color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );

  // --- Color Palette & Theme Variables ---
  // These would typically be CSS variables, but for strict inline CSS:
  const colors = {
    primary: '#4A90E2', // A vibrant, professional blue
    secondary: '#50E3C2', // A complementary teal/aqua
    bgPrimary: '#121212', // Deep, dark blue-gray for main background
    bgSecondary: '#1a1a1a ', // Slightly lighter for depth
    textPrimary: '#EAEAFE', // Soft white/lavender for text
    textMuted: '#A0AEC0', // Muted gray for secondary text
    activeAccent: '#4A90E2', // Blue for active items
    hoverAccent: 'rgba(74, 144, 226, 0.2)', // Light blue for hover
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  };

  const transitions = {
    speed: '0.3s',
    timing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  // --- Sidebar Navigation Items ---
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/software-engineering', label: 'Software Engineering', icon: <SoftwareEngineeringIcon /> },
    { path: '/general-tasks', label: 'General Tasks', icon: <GeneralTasksIcon /> },
    { path: '/business-projects', label: 'Business Projects', icon: <BusinessProjectsIcon /> },
    { path: '/finance', label: 'Personal Finance', icon: <FinanceIcon /> },
    { path: '/investments', label: 'Investments', icon: <InvestmentsIcon /> },
    { path: '/fitness', label: 'Health & Fitness', icon: <FitnessIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> }
  ];

  // --- Style Objects (for better readability) ---
  const sidebarStyle = {
    width: expanded ? '280px' : '80px',
    background: `linear-gradient(160deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 100%)`,
    color: colors.textPrimary,
    padding: '20px 0',
    height: '100%',
    boxShadow: `3px 0px 25px ${colors.shadowColor}`,
    transition: `width ${transitions.speed} ${transitions.timing}, padding ${transitions.speed} ${transitions.timing}`,
    overflow: 'hidden',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: expanded ? 'space-between' : 'center',
    padding: expanded ? '0 20px 25px' : '0 0 25px',
    borderBottom: `1px solid ${colors.borderColor}`,
    marginBottom: '20px',
    minHeight: '60px', // Ensure consistent height
  };

  const logoTextStyle = {
    margin: 0,
    fontSize: '26px',
    fontWeight: 'bold',
    background: `linear-gradient(90deg, ${colors.textPrimary}, ${colors.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0 0 10px rgba(80, 227, 194, 0.3)`,
    animation: expanded ? 'fadeIn 0.5s ease forwards' : 'none', // Ensure animation only when expanded
    opacity: expanded ? 1 : 0, // Control opacity with expansion for smoother text appearance/disappearance
    transition: `opacity ${transitions.speed} ${transitions.timing}`,
  };
  
  const subtitleStyle = {
    margin: '2px 0 0',
    opacity: expanded ? 0.7 : 0,
    fontSize: '13px',
    color: colors.textMuted,
    animation: expanded ? 'fadeIn 0.5s ease 0.2s forwards' : 'none',
    transition: `opacity ${transitions.speed} ${transitions.timing} 0.2s`,
  };

  const toggleButtonStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${colors.borderColor}`,
    color: colors.textMuted,
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '8px',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background ${transitions.speed} ${transitions.timing}, color ${transitions.speed} ${transitions.timing}, transform ${transitions.speed} ${transitions.timing}`,
    outline: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };

  const getLinkStyle = (_itemPath: string, isActive: boolean, isHovered: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: expanded ? '15px 20px' : '15px 0',
    color: isActive ? colors.primary : colors.textPrimary,
    textDecoration: 'none',
    margin: '4px 10px', // Add some margin around links
    borderRadius: '8px', // Rounded corners for links
    background: isActive 
        ? `linear-gradient(90deg, ${colors.hoverAccent} 0%, rgba(74, 144, 226, 0.05) 100%)`
        : (isHovered ? 'rgba(255, 255, 255, 0.07)' : 'transparent'),
    borderLeft: expanded ? (isActive ? `4px solid ${colors.activeAccent}` : '4px solid transparent') : 'none',
    borderTop: !expanded ? (isActive ? `4px solid ${colors.activeAccent}` : '4px solid transparent') : 'none', // Active indication when collapsed
    transition: `all ${transitions.speed} ${transitions.timing}`,
    justifyContent: expanded ? 'flex-start' : 'center',
    position: 'relative' as const,
    overflow: 'hidden',
    transform: isHovered ? 'translateX(3px)' : 'none', // Subtle hover effect
    boxShadow: isActive ? `0 4px 10px rgba(74, 144, 226, 0.2)` : (isHovered ? '0 4px 8px rgba(0,0,0,0.15)' : 'none'),
  });

  const iconContainerStyle = {
    fontSize: '22px',
    marginRight: expanded ? '15px' : '0',
    minWidth: '24px', // Keep icon space consistent
    textAlign: 'center' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `margin-right ${transitions.speed} ${transitions.timing}`,
  };

  const labelStyle = {
    whiteSpace: 'nowrap',
    opacity: expanded ? 1 : 0,
    transition: `opacity ${transitions.speed} ${transitions.timing} ${expanded ? '0.1s' : '0s'}`, // Delay appearance slightly
    animation: expanded ? 'fadeIn 0.4s ease forwards' : 'none',
    fontWeight: 500, // Slightly bolder labels
  };
  
  const footerStyle = {
    marginTop: 'auto', // Pushes footer to the bottom
    padding: expanded ? '20px 20px 15px' : '20px 0 15px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${colors.borderColor}`,
  };

  const footerTextStyle = {
    fontSize: expanded ? '13px' : '10px',
    color: colors.textMuted,
    opacity: expanded ? 0.8 : 0.6,
    transition: `all ${transitions.speed} ${transitions.timing}`,
    animation: expanded ? 'fadeIn 0.5s ease forwards' : 'none',
  };

  // Handle toggling the sidebar expanded state
  const handleToggle = () => {
    setExpanded(!expanded);
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  // Handle navigation clicks
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div style={sidebarStyle} className="animate-slideIn"> {/* Assuming animate-slideIn is defined globally */}
      <div style={headerStyle}>
        {expanded && (
          <div style={{ animation: 'fadeIn 0.5s ease forwards' }}> {/* Keep fadeIn if defined */}
            <h2 style={logoTextStyle}>Chronicles</h2>
            <p style={subtitleStyle}>Productivity Suite</p>
          </div>
        )}
        <button
          onClick={handleToggle}
          style={{
            ...toggleButtonStyle,
            transform: hoveredPath === 'toggleButton' ? 'scale(1.1)' : 'scale(1)',
          }}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          onMouseEnter={() => setHoveredPath('toggleButton')}
          onMouseLeave={() => setHoveredPath(null)}
        >
          {expanded ? <ChevronLeftIcon color={colors.textPrimary} /> : <ChevronRightIcon color={colors.textPrimary} />}
        </button>
      </div>
      
      <nav style={{ flexGrow: 1, overflowY: 'auto' }}> {/* Allow nav to scroll if items overflow */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredPath === item.path;
          
          return (
            <Link 
              key={item.path}
              to={item.path} 
              style={getLinkStyle(item.path, isActive, isHovered)}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              className="hover-lift" // Kept as original, assuming global CSS might use this
              onClick={handleNavigate}
            >
              <div style={{...iconContainerStyle, color: isActive ? colors.activeAccent : (isHovered ? colors.primary : colors.textPrimary) }}>
                {item.icon}
              </div>
              
              {expanded && (
                <span style={labelStyle}>
                  {item.label}
                </span>
              )}
              
              {/* Active item indicator (alternative to border, could be a dot or different shape) */}
              {isActive && expanded && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '8px',
                  width: '8px',
                  background: colors.secondary,
                  borderRadius: '50%',
                  animation: 'pulseIndicator 2s ease infinite',
                }} />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div style={footerStyle}>
        <p style={footerTextStyle}>
          &copy; {new Date().getFullYear()} Chronicles
        </p>
      </div>
      
      {/* Keyframes for animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulseIndicator {
            0% { transform: translateY(-50%) scale(1); opacity: 1; }
            50% { transform: translateY(-50%) scale(1.3); opacity: 0.7; }
            100% { transform: translateY(-50%) scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;

// Add this to your global CSS if you don't have `fadeIn` and `animate-slideIn` keyframes:
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes animate-slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.hover-lift:hover { // Example for the className if you want to use it globally
  // transform: translateY(-2px); // This might conflict with inline transform for hover
  // box-shadow: 0 6px 12px rgba(0,0,0,0.2); // This might conflict with inline boxShadow
}
*/