import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
  // Get settings from context
  const { 
    userSettings, 
    dashboardSettings, 
    loading, 
    error, 
    updateUserSettings, 
    updateDashboardSettings 
  } = useSettings();

  // Local state for form values
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'dark',
    language: 'en',
  });

  const [displaySettings, setDisplaySettings] = useState({
    default_view: 'table',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    start_day_of_week: 'sunday',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    notification_enabled: true,
  });

  const [dashboardConfig, setDashboardConfig] = useState({
    show_tasks: true,
    show_finance: true,
    show_investments: true,
    show_fitness: true,
    show_projects: true,
    widget_order: '["tasks", "projects", "finance", "investments", "fitness"]',
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setGeneralSettings({
        theme: userSettings.theme,
        language: userSettings.language,
      });
      
      setDisplaySettings({
        default_view: userSettings.default_view,
        date_format: userSettings.date_format,
        time_format: userSettings.time_format,
        start_day_of_week: userSettings.start_day_of_week,
      });
      
      setNotificationSettings({
        notification_enabled: userSettings.notification_enabled,
      });
    }
    
    if (dashboardSettings) {
      setDashboardConfig({
        show_tasks: dashboardSettings.show_tasks,
        show_finance: dashboardSettings.show_finance,
        show_investments: dashboardSettings.show_investments,
        show_fitness: dashboardSettings.show_fitness,
        show_projects: dashboardSettings.show_projects,
        widget_order: dashboardSettings.widget_order,
      });
    }
  }, [userSettings, dashboardSettings]);

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Handle form submissions
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserSettings(generalSettings);
      setStatusMessage({
        type: 'success',
        message: 'General settings updated successfully!',
      });
      setTimeout(() => setStatusMessage({ type: null, message: '' }), 3000);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to update general settings.',
      });
    }
  };

  const handleDisplaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserSettings(displaySettings);
      setStatusMessage({
        type: 'success',
        message: 'Display settings updated successfully!',
      });
      setTimeout(() => setStatusMessage({ type: null, message: '' }), 3000);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to update display settings.',
      });
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserSettings(notificationSettings);
      setStatusMessage({
        type: 'success',
        message: 'Notification settings updated successfully!',
      });
      setTimeout(() => setStatusMessage({ type: null, message: '' }), 3000);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to update notification settings.',
      });
    }
  };

  const handleDashboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDashboardSettings(dashboardConfig);
      setStatusMessage({
        type: 'success',
        message: 'Dashboard settings updated successfully!',
      });
      setTimeout(() => setStatusMessage({ type: null, message: '' }), 3000);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: 'Failed to update dashboard settings.',
      });
    }
  };

  // Handle input changes
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setDisplaySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDashboardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setDashboardConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Reorder dashboard widgets
  const handleWidgetDragEnd = (result: any) => {
    if (!result.destination) return;
    
    // Get current widget order
    const widgetOrder = JSON.parse(dashboardConfig.widget_order);
    
    // Reorder array based on drag result
    const [reorderedItem] = widgetOrder.splice(result.source.index, 1);
    widgetOrder.splice(result.destination.index, 0, reorderedItem);
    
    // Update state
    setDashboardConfig(prev => ({
      ...prev,
      widget_order: JSON.stringify(widgetOrder),
    }));
  };

  // Theme and styles
  const theme = {
    bg: '#121212',
    bgLight: '#1E1E1E',
    cardBg: 'rgba(30, 30, 30, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    glassShine: 'rgba(255, 255, 255, 0.05)',
    primary: '#BB86FC',
    primaryVariant: '#3700B3',
    secondary: '#03DAC6',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    textHighlight: '#FFFFFF',
    errorText: '#CF6679',
    success: '#66BB6A',
    warning: '#FFA726',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    borderRadius: '16px',
    borderRadiusSm: '10px',
    shadow: '0 8px 24px rgba(0,0,0,0.5)',
    shadowSm: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };

  const pageStyle: CSSProperties = {
    fontFamily: theme.fontFamily,
    background: theme.bg,
    color: theme.text,
    padding: '30px 40px',
    minHeight: '100vh',
  };

  const headerContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.cardBorder}`,
  };

  const mainTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: 700,
    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const tabsContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  };

  const tabButtonStyle = (isActive: boolean): CSSProperties => ({
    background: isActive ? theme.primary : 'transparent',
    color: isActive ? theme.textHighlight : theme.textSecondary,
    fontWeight: isActive ? 600 : 500,
    border: `1px solid ${isActive ? theme.primary : theme.cardBorder}`,
    padding: '10px 20px',
    borderRadius: theme.borderRadiusSm,
    cursor: 'pointer',
    transition: theme.transition,
    outline: 'none',
  });

  const sectionStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    marginBottom: '30px',
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const formGroupStyle: CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: theme.textSecondary,
  };

  const inputStyle: CSSProperties = {
    fontFamily: theme.fontFamily,
    border: `1px solid ${theme.cardBorder}`,
    borderRadius: theme.borderRadiusSm,
    padding: '10px 14px',
    fontSize: '14px',
    transition: theme.transition,
    backgroundColor: theme.bgLight,
    color: theme.text,
    width: '100%',
    boxSizing: 'border-box',
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23E0E0E0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px top 50%',
    backgroundSize: '12px auto',
    paddingRight: '30px',
  };

  const switchContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  };

  const switchLabelStyle: CSSProperties = {
    marginLeft: '10px',
    color: theme.text,
    userSelect: 'none',
  };

  const buttonStyle: CSSProperties = {
    fontFamily: theme.fontFamily,
    fontWeight: 500,
    transition: theme.transition,
    border: 'none',
    cursor: 'pointer',
    boxShadow: theme.shadowSm,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 18px',
    borderRadius: theme.borderRadiusSm,
    outline: 'none',
    letterSpacing: '0.5px',
    background: theme.primary,
    color: theme.textHighlight,
    gap: '8px',
  };

  const statusStyle = (type: 'success' | 'error' | null): CSSProperties => ({
    padding: '12px 18px',
    borderRadius: theme.borderRadiusSm,
    marginBottom: '20px',
    marginTop: '15px',
    display: type ? 'block' : 'none',
    backgroundColor: type === 'success' ? `${theme.success}25` : `${theme.errorText}25`,
    color: type === 'success' ? theme.success : theme.errorText,
    border: `1px solid ${type === 'success' ? theme.success : theme.errorText}`,
    animation: 'fadeIn 0.3s ease',
    fontWeight: 500,
  });

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '20px',
    color: theme.textHighlight,
    borderBottom: `1px solid ${theme.cardBorder}`,
    paddingBottom: '15px',
  };

  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={headerContainerStyle}>
          <h1 style={mainTitleStyle}>Settings</h1>
        </div>
        <div style={sectionStyle}>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={headerContainerStyle}>
          <h1 style={mainTitleStyle}>Settings</h1>
        </div>
        <div style={{
          ...sectionStyle,
          backgroundColor: `${theme.errorText}15`,
          borderColor: `${theme.errorText}40`,
        }}>
          <p style={{ color: theme.errorText }}>{error}</p>
          <button 
            style={buttonStyle}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="animate-fadeInPage">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeInPage { 
          animation: fadeIn 0.5s ease forwards; 
        }
        
        /* Custom Switch Styles */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: ${theme.bgLight};
          transition: ${theme.transition};
          border-radius: 24px;
          border: 1px solid ${theme.cardBorder};
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 2px;
          background-color: ${theme.textSecondary};
          transition: ${theme.transition};
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: ${theme.primary};
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(22px);
          background-color: white;
        }
        
        /* Draggable widget styles */
        .widget-item {
          padding: 12px 16px;
          background-color: ${theme.bgLight};
          border-radius: ${theme.borderRadiusSm};
          margin-bottom: 10px;
          cursor: move;
          border: 1px solid ${theme.cardBorder};
          position: relative;
          display: flex;
          align-items: center;
          user-select: none;
        }
        
        .widget-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .widget-item::before {
          content: "≡";
          margin-right: 10px;
          color: ${theme.textSecondary};
          font-size: 18px;
        }
        
        .widget-list {
          padding-left: 0;
          list-style: none;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${theme.bgLight}50;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme.primary}70;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.primary};
        }
        `}
      </style>

      <div style={headerContainerStyle}>
        <h1 style={mainTitleStyle}>Settings</h1>
      </div>

      <div style={tabsContainerStyle}>
        <button
          style={tabButtonStyle(activeTab === 'general')}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          style={tabButtonStyle(activeTab === 'display')}
          onClick={() => setActiveTab('display')}
        >
          Display
        </button>
        <button
          style={tabButtonStyle(activeTab === 'notifications')}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          style={tabButtonStyle(activeTab === 'dashboard')}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>General Settings</h2>
          <form onSubmit={handleGeneralSubmit}>
            <div style={formGroupStyle}>
              <label htmlFor="theme" style={labelStyle}>Theme</label>
              <select
                id="theme"
                name="theme"
                value={generalSettings.theme}
                onChange={handleGeneralChange}
                style={selectStyle}
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="language" style={labelStyle}>Language</label>
              <select
                id="language"
                name="language"
                value={generalSettings.language}
                onChange={handleGeneralChange}
                style={selectStyle}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <button type="submit" style={buttonStyle}>
              Save General Settings
            </button>

            {statusMessage.type && activeTab === 'general' && (
              <div style={statusStyle(statusMessage.type)}>
                {statusMessage.message}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Display Settings */}
      {activeTab === 'display' && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Display Settings</h2>
          <form onSubmit={handleDisplaySubmit}>
            <div style={formGroupStyle}>
              <label htmlFor="default_view" style={labelStyle}>Default View</label>
              <select
                id="default_view"
                name="default_view"
                value={displaySettings.default_view}
                onChange={handleDisplayChange}
                style={selectStyle}
              >
                <option value="table">Table</option>
                <option value="card">Card</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="date_format" style={labelStyle}>Date Format</label>
              <select
                id="date_format"
                name="date_format"
                value={displaySettings.date_format}
                onChange={handleDisplayChange}
                style={selectStyle}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="time_format" style={labelStyle}>Time Format</label>
              <select
                id="time_format"
                name="time_format"
                value={displaySettings.time_format}
                onChange={handleDisplayChange}
                style={selectStyle}
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="start_day_of_week" style={labelStyle}>Start Day of Week</label>
              <select
                id="start_day_of_week"
                name="start_day_of_week"
                value={displaySettings.start_day_of_week}
                onChange={handleDisplayChange}
                style={selectStyle}
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </div>

            <button type="submit" style={buttonStyle}>
              Save Display Settings
            </button>

            {statusMessage.type && activeTab === 'display' && (
              <div style={statusStyle(statusMessage.type)}>
                {statusMessage.message}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Notification Settings</h2>
          <form onSubmit={handleNotificationSubmit}>
            <div style={switchContainerStyle}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.notification_enabled}
                  onChange={handleNotificationChange}
                  name="notification_enabled"
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={switchLabelStyle}>Enable Notifications</span>
            </div>

            <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
              Receive notifications for task deadlines, important updates, and system alerts.
            </p>

            <button type="submit" style={buttonStyle}>
              Save Notification Settings
            </button>

            {statusMessage.type && activeTab === 'notifications' && (
              <div style={statusStyle(statusMessage.type)}>
                {statusMessage.message}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Dashboard Settings */}
      {activeTab === 'dashboard' && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Dashboard Settings</h2>
          <form onSubmit={handleDashboardSubmit}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: theme.primary, marginBottom: '15px' }}>
              Visible Widgets
            </h3>

            <div style={switchContainerStyle}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dashboardConfig.show_tasks}
                  onChange={handleDashboardChange}
                  name="show_tasks"
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={switchLabelStyle}>Show Tasks Widget</span>
            </div>

            <div style={switchContainerStyle}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dashboardConfig.show_projects}
                  onChange={handleDashboardChange}
                  name="show_projects"
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={switchLabelStyle}>Show Projects Widget</span>
            </div>

            <div style={switchContainerStyle}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dashboardConfig.show_finance}
                  onChange={handleDashboardChange}
                  name="show_finance"
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={switchLabelStyle}>Show Finance Widget</span>
            </div>

            <div style={switchContainerStyle}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dashboardConfig.show_investments}
                  onChange={handleDashboardChange}
                  name="show_investments"
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={switchLabelStyle}>Show Investments Widget</span>
            </div>

            <div style={switchContainerStyle}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={dashboardConfig.show_fitness}
                  onChange={handleDashboardChange}
                  name="show_fitness"
                />
                <span className="toggle-slider"></span>
              </label>
              <span style={switchLabelStyle}>Show Fitness Widget</span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: theme.primary, margin: '25px 0 15px' }}>
              Widget Order
            </h3>
            <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
              Drag and drop to reorder widgets on your dashboard.
            </p>

            <div className="widget-list">
              {JSON.parse(dashboardConfig.widget_order).map((widget: string, index: number) => (
                <div key={index} className="widget-item">
                  {widget.charAt(0).toUpperCase() + widget.slice(1)}
                </div>
              ))}
            </div>

            <button type="submit" style={{...buttonStyle, marginTop: '20px'}}>
              Save Dashboard Settings
            </button>

            {statusMessage.type && activeTab === 'dashboard' && (
              <div style={statusStyle(statusMessage.type)}>
                {statusMessage.message}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings; 