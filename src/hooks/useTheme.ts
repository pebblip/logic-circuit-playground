import { useState, useCallback, useEffect } from 'react';

type Theme = 'modern' | 'neon' | 'minimal';

interface UseThemeReturn {
  selectedTheme: Theme;
  setSelectedTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const themes: Theme[] = ['modern', 'neon', 'minimal'];

export function useTheme(): UseThemeReturn {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('modern');

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') as Theme;
    if (savedTheme && themes.includes(savedTheme)) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const updateTheme = useCallback((theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('selectedTheme', theme);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = themes.indexOf(selectedTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateTheme(themes[nextIndex]);
  }, [selectedTheme, updateTheme]);

  return {
    selectedTheme,
    setSelectedTheme: updateTheme,
    cycleTheme
  };
}