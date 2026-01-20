'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api';
type Theme = 'light' | 'dark';
type PrimaryColor = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal' | 'pink' | 'yellow' | 'indigo' | 'cyan';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, fallback to 'dark' if not found
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(() => {
    // Check localStorage first, fallback to 'blue' if not found
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('primaryColor') as PrimaryColor) || 'blue';
    }
    return 'blue';
  });

  // Apply theme class to document body only
  // This now only affects content areas, not header/sidebar/footer
  const applyTheme = (newTheme: Theme) => {
    console.log('Applying theme:', newTheme);
    
    // Remove existing theme classes
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Add new theme classes
    document.documentElement.classList.add(newTheme);
    document.body.classList.add(`${newTheme}-theme`);
  };

  // Apply primary color
  const applyPrimaryColor = (color: PrimaryColor) => {
    console.log('Applying primary color:', color);
    
    // Remove all existing primary color classes
    const classList = document.body.classList;
    for (let i = 0; i < classList.length; i++) {
      const className = classList[i];
      if (className.startsWith('primary-')) {
        document.body.classList.remove(className);
        // Decrement i since we're modifying the live classList
        i--;
      }
    }
    
    // Add new color class
    document.body.classList.add(`primary-${color}`);
    
    // Update CSS variables
    const colorValues = {
      blue: '#205ab2',
      purple: '#7e22ce',
      green: '#16a34a',
      red: '#dc2626',
      orange: '#ea580c',
      teal: '#0d9488',
      pink: '#ec4899',
      yellow: '#eab308',
      indigo: '#4f46e5',
      cyan: '#06b6d4'
    };
    
    document.documentElement.style.setProperty('--ui-accent', colorValues[color]);
  };

  // Load theme from profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const profileTheme = data?.theme;
          if (profileTheme === 'light' || profileTheme === 'dark') {
            console.log('Loading theme from profile:', profileTheme);
            setThemeState(profileTheme as Theme);
            applyTheme(profileTheme as Theme);
          } else {
            console.log('Invalid theme in profile, using default dark theme');
            setThemeState('dark');
            applyTheme('dark');
          }
          
          // Load primary color if available
          const profilePrimaryColor = data?.primaryColor;
          if (profilePrimaryColor) {
            console.log('Loading primary color from profile:', profilePrimaryColor);
            setPrimaryColorState(profilePrimaryColor as PrimaryColor);
            applyPrimaryColor(profilePrimaryColor as PrimaryColor);
          } else {
            // Use default or localStorage
            const savedColor = localStorage.getItem('primaryColor') as PrimaryColor || 'blue';
            setPrimaryColorState(savedColor);
            applyPrimaryColor(savedColor);
          }
        })
        .catch(() => {
          console.log('Failed to load theme, using default dark theme');
          setThemeState('dark');
          applyTheme('dark');
          
          // Use default primary color
          const savedColor = localStorage.getItem('primaryColor') as PrimaryColor || 'blue';
          setPrimaryColorState(savedColor);
          applyPrimaryColor(savedColor);
        });
    } else {
      setThemeState('dark');
      applyTheme('dark');
      
      // Use default primary color
      const savedColor = localStorage.getItem('primaryColor') as PrimaryColor || 'blue';
      setPrimaryColorState(savedColor);
      applyPrimaryColor(savedColor);
    }
  }, []);

  // Apply primary color on initial load
  useEffect(() => {
    applyPrimaryColor(primaryColor);
  }, [primaryColor]);

  // Updated setTheme function to handle theme changes
  const setTheme = (newTheme: Theme) => {
    console.log('Setting new theme:', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Store in localStorage
    localStorage.setItem('theme', newTheme);
    
    // If user is authenticated, save theme preference to API
    const token = localStorage.getItem('token');
    if (token) {
      // First get the user profile to get the ID
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.id) {
            // Update the user's theme preference
            const apiUrl = getApiUrl();
            fetch(`${apiUrl}/api/v1/users/${data.id}/preferences`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                emailNotify: data.emailNotify,
                theme: newTheme,
                primaryColor: primaryColor
              })
            })
              .then(response => {
                if (!response.ok) {
                  console.error('Failed to update theme preference in API');
                }
              })
              .catch(error => {
                console.error('Error updating theme preference:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error getting user profile:', error);
        });
    }
  };

  // Function to set primary color
  const setPrimaryColor = (newColor: PrimaryColor) => {
    console.log('Setting new primary color:', newColor);
    setPrimaryColorState(newColor);
    applyPrimaryColor(newColor);
    
    // Store in localStorage
    localStorage.setItem('primaryColor', newColor);
    
    // If user is authenticated, save color preference to API
    const token = localStorage.getItem('token');
    if (token) {
      // First get the user profile to get the ID
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.id) {
            // Update the user's preferences
            const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/${data.id}/preferences`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                emailNotify: data.emailNotify,
                theme: theme,
                primaryColor: newColor
              })
            })
              .then(response => {
                if (!response.ok) {
                  console.error('Failed to update color preference in API');
                }
              })
              .catch(error => {
                console.error('Error updating color preference:', error);
              });
          }
        })
        .catch(error => {
          console.error('Error getting user profile:', error);
        });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 