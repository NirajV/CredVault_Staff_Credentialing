import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  sage: {
    id: 'sage',
    name: 'Sage Clinic',
    description: 'Natural forest green — calm & healing',
    swatch: '#2D6A4F',
    vars: {
      '--sidebar-from':    '#112b1e',
      '--sidebar-to':      '#1B4332',
      '--sidebar-text':    'rgba(216,243,220,0.92)',
      '--sidebar-muted':   'rgba(149,213,178,0.72)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.09)',
      '--sidebar-border':  'rgba(45,106,79,0.40)',
      '--primary':         '#2D6A4F',
      '--primary-hover':   '#1e5c3e',
      '--primary-light':   '#D8F3DC',
      '--primary-text':    '#ffffff',
      '--accent':          '#52B788',
      '--accent-light':    '#F1FAEE',
      '--page-bg':         '#C5E8CD',
      '--surface':         '#F1FAEE',
      '--surface-raised':  '#D8F3DC',
      '--border':          '#95D5B2',
      '--border-strong':   '#52B788',
      '--text':            '#1B4332',
      '--text-muted':      '#40916C',
      '--text-faint':      '#74C69D',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Deep ocean blue — fresh & open',
    swatch: '#0077B6',
    vars: {
      '--sidebar-from':    '#012d5e',
      '--sidebar-to':      '#023E8A',
      '--sidebar-text':    'rgba(202,240,248,0.92)',
      '--sidebar-muted':   'rgba(173,232,244,0.72)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.09)',
      '--sidebar-border':  'rgba(0,119,182,0.38)',
      '--primary':         '#0077B6',
      '--primary-hover':   '#005f92',
      '--primary-light':   '#E0F4FF',
      '--primary-text':    '#ffffff',
      '--accent':          '#00B4D8',
      '--accent-light':    '#F0F9FF',
      '--page-bg':         '#CAF0F8',
      '--surface':         '#F0F9FF',
      '--surface-raised':  '#E0F4FF',
      '--border':          '#ADE8F4',
      '--border-strong':   '#90E0EF',
      '--text':            '#03045E',
      '--text-muted':      '#4A7FA5',
      '--text-faint':      '#90CAE4',
    }
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon',
    description: 'Dark charcoal + electric yellow — modern & bold',
    swatch: '#EAB308',
    vars: {
      '--sidebar-from':    '#000000',
      '--sidebar-to':      '#09090B',
      '--sidebar-text':    'rgba(250,204,21,0.95)',
      '--sidebar-muted':   'rgba(161,161,170,0.72)',
      '--sidebar-active':  'rgba(234,179,8,0.22)',
      '--sidebar-hover':   'rgba(255,255,255,0.06)',
      '--sidebar-border':  'rgba(63,63,70,0.80)',
      '--primary':         '#EAB308',
      '--primary-hover':   '#CA8A04',
      '--primary-light':   '#1c1800',
      '--primary-text':    '#09090B',
      '--accent':          '#FACC15',
      '--accent-light':    '#181400',
      '--page-bg':         '#09090B',
      '--surface':         '#18181B',
      '--surface-raised':  '#27272A',
      '--border':          '#3F3F46',
      '--border-strong':   '#52525B',
      '--text':            '#FAFAFA',
      '--text-muted':      '#A1A1AA',
      '--text-faint':      '#52525B',
    }
  },
  clinical: {
    id: 'clinical',
    name: 'Clinical Blue',
    description: 'Slate pro — trusted, precise & professional',
    swatch: '#334155',
    vars: {
      '--sidebar-from':    '#090e1a',
      '--sidebar-to':      '#0F172A',
      '--sidebar-text':    'rgba(203,213,225,0.92)',
      '--sidebar-muted':   'rgba(148,163,184,0.72)',
      '--sidebar-active':  'rgba(56,189,248,0.18)',
      '--sidebar-hover':   'rgba(255,255,255,0.07)',
      '--sidebar-border':  'rgba(51,65,85,0.55)',
      '--primary':         '#334155',
      '--primary-hover':   '#1e293b',
      '--primary-light':   '#F1F5F9',
      '--primary-text':    '#ffffff',
      '--accent':          '#38BDF8',
      '--accent-light':    '#E0F2FE',
      '--page-bg':         '#E2E8F0',
      '--surface':         '#F8FAFC',
      '--surface-raised':  '#F1F5F9',
      '--border':          '#CBD5E1',
      '--border-strong':   '#94A3B8',
      '--text':            '#0F172A',
      '--text-muted':      '#64748B',
      '--text-faint':      '#94A3B8',
    }
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem('cv_theme');
    return (saved && themes[saved]) ? saved : 'clinical';
  });

  const applyTheme = (id) => {
    const t = themes[id] || themes.clinical;
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', id);
  };

  useEffect(() => { applyTheme(themeId); }, [themeId]);

  const setTheme = (id) => {
    setThemeId(id);
    localStorage.setItem('cv_theme', id);
  };

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, themes, current: themes[themeId] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
