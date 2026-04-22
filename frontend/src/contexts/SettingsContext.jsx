import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/languageData';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings');
    return saved ? JSON.parse(saved) : {
      darkMode: true,
      glassmorphism: true,
      themeColor: 'Purple',
      language: 'English',
      timeZone: 'CAT (GMT+2)',
      dateFormat: 'DD/MM/YYYY'
    };
  });

  const t = translations[settings.language] || translations['English'];

  useEffect(() => {
    localStorage.setItem('system_settings', JSON.stringify(settings));
    
    // Apply Theme Colors to CSS Variables
    const colors = {
      Purple: { primary: '#8B5CF6', secondary: '#EC4899', glow: 'rgba(139,92,246,0.5)' },
      Emerald: { primary: '#10B981', secondary: '#3B82F6', glow: 'rgba(16,185,129,0.5)' },
      Ocean: { primary: '#3B82F6', secondary: '#2DD4BF', glow: 'rgba(59,130,246,0.5)' }
    };
    
    const root = document.documentElement;
    const activeColor = colors[settings.themeColor] || colors.Purple;
    
    root.style.setProperty('--primary-color', activeColor.primary);
    root.style.setProperty('--secondary-color', activeColor.secondary);
    root.style.setProperty('--glow-color', activeColor.glow);
    
    // Apply Dark Mode Class
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
