import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BiomeTheme, getRandomBiomeTheme, defaultTheme, getBiomeThemeById, biomeThemes } from '@/lib/biomeThemes';

// Context interface
interface BiomeThemeContextType {
  currentTheme: BiomeTheme;
  setTheme: (theme: BiomeTheme | string) => void;
  randomizeTheme: () => void;
  availableThemes: BiomeTheme[];
}

// Create context with default values
const BiomeThemeContext = createContext<BiomeThemeContextType>({
  currentTheme: defaultTheme,
  setTheme: () => {},
  randomizeTheme: () => {},
  availableThemes: biomeThemes,
});

// Provider props
interface BiomeThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
}

// Local storage key for saving theme preferences
const THEME_STORAGE_KEY = 'minecraft_modding_theme';

export function BiomeThemeProvider({ 
  children, 
  initialThemeId 
}: BiomeThemeProviderProps) {
  // Try to get saved theme from local storage, or use initial theme, or default to random
  const getInitialTheme = (): BiomeTheme => {
    try {
      // Check local storage first
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const savedTheme = getBiomeThemeById(savedThemeId);
        if (savedTheme) return savedTheme;
      }
      
      // Check for provided initial theme
      if (initialThemeId) {
        const initialTheme = getBiomeThemeById(initialThemeId);
        if (initialTheme) return initialTheme;
      }
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
    }
    
    // Default to random theme
    return getRandomBiomeTheme();
  };

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<BiomeTheme>(getInitialTheme());
  
  // Update theme in localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme.id);
    } catch (error) {
      console.warn("Error writing to localStorage:", error);
    }
    
    // Apply theme to document body
    document.body.style.background = currentTheme.colors.backgroundGradient;
    document.body.style.color = currentTheme.colors.text;
    
    // Add a CSS variable for each theme color for easy access in components
    document.documentElement.style.setProperty('--theme-primary', currentTheme.colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    document.documentElement.style.setProperty('--theme-accent', currentTheme.colors.accent);
    document.documentElement.style.setProperty('--theme-background', currentTheme.colors.background);
    
    // Add theme class to body for additional CSS targeting
    document.body.className = `theme-${currentTheme.id}`;
    
  }, [currentTheme]);
  
  // Set theme function that handles both BiomeTheme objects and theme IDs
  const setTheme = (theme: BiomeTheme | string) => {
    if (typeof theme === 'string') {
      const themeById = getBiomeThemeById(theme);
      if (themeById) {
        setCurrentTheme(themeById);
      } else {
        console.warn(`Theme with ID "${theme}" not found, using default`);
        setCurrentTheme(defaultTheme);
      }
    } else {
      setCurrentTheme(theme);
    }
  };
  
  // Helper function to randomize the theme
  const randomizeTheme = () => {
    // Get random theme that's different from current
    let newTheme: BiomeTheme;
    do {
      newTheme = getRandomBiomeTheme();
    } while (newTheme.id === currentTheme.id);
    
    setCurrentTheme(newTheme);
  };
  
  return (
    <BiomeThemeContext.Provider 
      value={{ 
        currentTheme, 
        setTheme, 
        randomizeTheme,
        availableThemes: biomeThemes,
      }}
    >
      {children}
    </BiomeThemeContext.Provider>
  );
}

// Custom hook for using the theme context
export function useBiomeTheme() {
  const context = useContext(BiomeThemeContext);
  if (context === undefined) {
    throw new Error('useBiomeTheme must be used within a BiomeThemeProvider');
  }
  return context;
}