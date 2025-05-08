import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SoftwareEngineering from './pages/SoftwareEngineering';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';
import BusinessProjects from './pages/BusinessProjects';
import ProjectDetails from './pages/ProjectDetails';
import Finance from './pages/Finance';
import Fitness from './pages/Fitness';
import Investments from './pages/Investments';
import Settings from './pages/Settings';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // If mobile, close sidebar when route changes
  const handleRouteChange = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, var(--dark-bg) 0%, #1a2a3a 100%)',
        color: 'white'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            background: 'linear-gradient(90deg, #fff, #ccc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Chronicles
          </h1>
          <p style={{ textAlign: 'center', opacity: 0.7 }}>Productivity</p>
        </div>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          border: '3px solid transparent',
          borderTopColor: 'var(--primary-color)',
          borderRightColor: 'var(--primary-color)',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          `}
        </style>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <Router>
        <div style={{ 
          display: 'flex', 
          height: '100vh',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          background: 'var(--light-bg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background gradient pattern */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '70%',
            height: '200%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(58, 134, 255, 0.05) 0%, rgba(58, 134, 255, 0) 70%)',
            zIndex: 0
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '50%',
            height: '150%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 0, 110, 0.03) 0%, rgba(255, 0, 110, 0) 70%)',
            zIndex: 0
          }} />
          
          <Sidebar 
            collapsed={sidebarCollapsed} 
            toggleSidebar={toggleSidebar}
            onNavigate={handleRouteChange}
          />
          <main style={{ 
            flex: 1, 
            padding: '30px',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'rgb(18, 18, 18)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.05)'
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/software-engineering" element={<SoftwareEngineering />} />
              <Route path="/business-projects" element={<BusinessProjects />} />
              <Route path="/business-projects/:id" element={<ProjectDetails />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/fitness" element={<Fitness />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
