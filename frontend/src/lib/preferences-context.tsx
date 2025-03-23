import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Keys for localStorage
const PREFERENCES_KEY = 'user-preferences';

// Preference types - Simplified to just dark and light
type Theme = 'light' | 'dark';

interface Preferences {
  sidebarOpen: boolean;
  theme: Theme;
}

// Default preferences
const DEFAULT_PREFERENCES: Preferences = {
  sidebarOpen: true,
  theme: 'dark',
};

type PreferencesContextType = {
  preferences: Preferences;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  // Sidebar specific helpers (for compatibility)
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  // Theme specific helpers
  theme: Theme;
  isDark: boolean;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or use defaults
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const storedValue = localStorage.getItem(PREFERENCES_KEY);
      return storedValue !== null 
        ? { ...DEFAULT_PREFERENCES, ...JSON.parse(storedValue) } 
        : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error reading preferences from localStorage:', error);
      return DEFAULT_PREFERENCES;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  }, [preferences]);

  // Apply theme to document with improved CSS variable handling
  useEffect(() => {
    const isDark = preferences.theme === 'dark';
    
    // This is the key fix - we need to explicitly toggle the class
    document.documentElement.classList.toggle('dark', isDark);
    
    // Force a style update to ensure CSS variables take effect
    const body = document.body;
    body.style.backgroundColor = 'transparent';
    void body.offsetHeight; // Trigger reflow
    body.style.backgroundColor = '';
    
  }, [preferences.theme]);

  // Preference updaters
  const setSidebarOpen = (isOpen: boolean) => {
    setPreferences(prev => ({ ...prev, sidebarOpen: isOpen }));
  };

  const toggleSidebar = () => {
    setPreferences(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const setTheme = (theme: Theme) => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setPreferences(prev => {
      const newTheme = prev.theme === 'dark' ? 'light' : 'dark';
      
      // Apply the class immediately for faster visual response
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      // Force CSS variable update
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      
      return { ...prev, theme: newTheme };
    });
  };

  // Sidebar compatibility helpers
  const isOpen = preferences.sidebarOpen;
  const toggle = toggleSidebar;
  const open = () => setSidebarOpen(true);
  const close = () => setSidebarOpen(false);
  
  // Theme helper
  const isDark = preferences.theme === 'dark';

  return (
    <PreferencesContext.Provider 
      value={{ 
        preferences, 
        setSidebarOpen, 
        toggleSidebar, 
        setTheme,
        toggleTheme,
        // Sidebar compatibility
        isOpen,
        toggle,
        open,
        close,
        // Theme helpers
        theme: preferences.theme,
        isDark,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

// Main hook to access all preferences
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

// Specialized hooks for specific preferences
export function useSidebar() {
  const { isOpen, toggle, open, close } = usePreferences();
  return { isOpen, toggle, open, close };
}

// Enhanced useTheme hook
export function useTheme() {
  const { theme, setTheme, toggleTheme, isDark } = usePreferences();
  
  return { 
    theme,
    setTheme,
    toggleTheme,
    isDark,
    // Additional helpers
    text: isDark ? 'Light Mode' : 'Dark Mode',
    icon: isDark ? 'sun' : 'moon',
    label: `Switch to ${isDark ? 'light' : 'dark'} mode`,
  };
}