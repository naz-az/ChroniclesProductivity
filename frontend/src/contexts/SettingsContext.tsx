import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Types from backend
interface UserSettings {
  id: number;
  theme: string;
  language: string;
  notification_enabled: boolean;
  default_view: string;
  date_format: string;
  time_format: string;
  start_day_of_week: string;
  created_at: string;
  updated_at: string;
}

interface DashboardSettings {
  id: number;
  user_id: number;
  show_tasks: boolean;
  show_finance: boolean;
  show_investments: boolean;
  show_fitness: boolean;
  show_projects: boolean;
  widget_order: string;
  created_at: string;
  updated_at: string;
}

// Context type
interface SettingsContextType {
  userSettings: UserSettings | null;
  dashboardSettings: DashboardSettings | null;
  loading: boolean;
  error: string | null;
  updateUserSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateDashboardSettings: (newSettings: Partial<DashboardSettings>) => Promise<void>;
  applyTheme: (theme: string) => void;
}

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  userSettings: null,
  dashboardSettings: null,
  loading: true,
  error: null,
  updateUserSettings: async () => {},
  updateDashboardSettings: async () => {},
  applyTheme: () => {},
});

// Hook to use the settings context
export const useSettings = () => useContext(SettingsContext);

// Settings provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user settings
        const userResponse = await axios.get('http://localhost:5000/api/settings/user');
        setUserSettings(userResponse.data);

        // Fetch dashboard settings
        const dashboardResponse = await axios.get('http://localhost:5000/api/settings/dashboard');
        setDashboardSettings(dashboardResponse.data);

        // Apply current theme from settings
        if (userResponse.data && userResponse.data.theme) {
          applyTheme(userResponse.data.theme);
        }
      } catch (err) {
        setError('Failed to load settings. Please try again later.');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update user settings
  const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setLoading(true);
      const response = await axios.put('http://localhost:5000/api/settings/user', newSettings);
      setUserSettings(response.data);
      
      // Apply theme if it was updated
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
    } catch (err) {
      setError('Failed to update user settings.');
      console.error('Error updating user settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update dashboard settings
  const updateDashboardSettings = async (newSettings: Partial<DashboardSettings>) => {
    try {
      setLoading(true);
      const response = await axios.put('http://localhost:5000/api/settings/dashboard', newSettings);
      setDashboardSettings(response.data);
    } catch (err) {
      setError('Failed to update dashboard settings.');
      console.error('Error updating dashboard settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to document
  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        userSettings,
        dashboardSettings,
        loading,
        error,
        updateUserSettings,
        updateDashboardSettings,
        applyTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}; 