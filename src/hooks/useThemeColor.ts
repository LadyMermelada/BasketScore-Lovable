import { useState, useEffect } from 'react';

export interface ThemePreset {
  id: string;
  label: string;
  emoji: string;
  primary: string;        // HSL values
  ring: string;
  courtZone: string;
  courtZoneHover: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cyan',
    label: 'Neón Cian',
    emoji: '🧊',
    primary: '185 80% 55%',
    ring: '185 80% 55%',
    courtZone: '185 80% 55%',
    courtZoneHover: '185 90% 65%',
  },
  {
    id: 'orange',
    label: 'Naranja Basket',
    emoji: '🏀',
    primary: '25 95% 55%',
    ring: '25 95% 55%',
    courtZone: '25 95% 55%',
    courtZoneHover: '25 100% 65%',
  },
  {
    id: 'violet',
    label: 'Rosa Violeta',
    emoji: '🔮',
    primary: '280 70% 60%',
    ring: '280 70% 60%',
    courtZone: '280 70% 60%',
    courtZoneHover: '280 80% 70%',
  },
  {
    id: 'green',
    label: 'Verde Cancha',
    emoji: '🌿',
    primary: '150 70% 45%',
    ring: '150 70% 45%',
    courtZone: '150 70% 45%',
    courtZoneHover: '150 80% 55%',
  },
  {
    id: 'gold',
    label: 'Oro MVP',
    emoji: '🏆',
    primary: '42 90% 55%',
    ring: '42 90% 55%',
    courtZone: '42 90% 55%',
    courtZoneHover: '42 100% 65%',
  },
];

const STORAGE_KEY = 'basketscore_theme';

export function useThemeColor() {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'cyan';
  });

  const currentTheme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[0];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--ring', currentTheme.ring);
    root.style.setProperty('--court-zone', currentTheme.courtZone);
    root.style.setProperty('--court-zone-hover', currentTheme.courtZoneHover);
    root.style.setProperty('--sidebar-primary', currentTheme.primary);
    root.style.setProperty('--sidebar-ring', currentTheme.ring);
    root.style.setProperty('--glow-primary', `0 0 20px hsl(${currentTheme.primary} / 0.3)`);
    localStorage.setItem(STORAGE_KEY, currentTheme.id);
  }, [currentTheme]);

  return { themeId, setThemeId, currentTheme, presets: THEME_PRESETS };
}
