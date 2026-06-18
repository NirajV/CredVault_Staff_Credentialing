import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  sage: {
    id: 'sage',
    name: 'Sage Clinic',
    description: 'Natural sage green — calm & healing',
    swatch: '#3d7a52',
    vars: {
      '--sidebar-from':    '#1a3324',
      '--sidebar-to':      '#3d7a52',
      '--sidebar-text':    'rgba(255,255,255,0.92)',
      '--sidebar-muted':   'rgba(167,224,187,0.78)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.09)',
      '--sidebar-border':  'rgba(90,158,111,0.38)',
      '--primary':         '#3d7a52',
      '--primary-hover':   '#2e6340',
      '--primary-light':   '#d4edd9',
      '--accent':          '#5a9e6f',
      '--accent-light':    '#ebf7ee',
      '--page-bg':         '#e8f5ea',
      '--surface':         '#f4fbf5',
      '--surface-raised':  '#e8f4ea',
      '--border':          '#b8d8bc',
      '--border-strong':   '#8aba90',
      '--text':            '#1a3520',
      '--text-muted':      '#3d6b4d',
      '--text-faint':      '#7aab8a',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Teal ocean — fresh & open',
    swatch: '#0d7490',
    vars: {
      '--sidebar-from':    '#062b3d',
      '--sidebar-to':      '#0d7490',
      '--sidebar-text':    'rgba(255,255,255,0.92)',
      '--sidebar-muted':   'rgba(165,234,242,0.78)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.09)',
      '--sidebar-border':  'rgba(6,182,212,0.38)',
      '--primary':         '#0891b2',
      '--primary-hover':   '#0e7490',
      '--primary-light':   '#cffafe',
      '--accent':          '#06b6d4',
      '--accent-light':    '#ecfeff',
      '--page-bg':         '#ddf8fc',
      '--surface':         '#f0fdff',
      '--surface-raised':  '#ddf8fd',
      '--border':          '#a5f3fc',
      '--border-strong':   '#67e8f9',
      '--text':            '#083344',
      '--text-muted':      '#0e7490',
      '--text-faint':      '#67b8d4',
    }
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon',
    description: 'Dark charcoal — modern & focused',
    swatch: '#1e2330',
    vars: {
      '--sidebar-from':    '#07090e',
      '--sidebar-to':      '#131520',
      '--sidebar-text':    'rgba(255,255,255,0.92)',
      '--sidebar-muted':   'rgba(148,163,184,0.72)',
      '--sidebar-active':  'rgba(56,189,248,0.18)',
      '--sidebar-hover':   'rgba(255,255,255,0.06)',
      '--sidebar-border':  'rgba(71,85,105,0.65)',
      '--primary':         '#38bdf8',
      '--primary-hover':   '#0ea5e9',
      '--primary-light':   '#0c2d42',
      '--accent':          '#7dd3fc',
      '--accent-light':    '#082035',
      '--page-bg':         '#0d0f14',
      '--surface':         '#181b24',
      '--surface-raised':  '#1e2330',
      '--border':          '#2d3748',
      '--border-strong':   '#4a5568',
      '--text':            '#e2e8f0',
      '--text-muted':      '#94a3b8',
      '--text-faint':      '#64748b',
    }
  },
  clinical: {
    id: 'clinical',
    name: 'Clinical Blue',
    description: 'Crisp medical blue — trusted & precise',
    swatch: '#1251a3',
    vars: {
      '--sidebar-from':    '#071835',
      '--sidebar-to':      '#1251a3',
      '--sidebar-text':    'rgba(255,255,255,0.93)',
      '--sidebar-muted':   'rgba(186,219,255,0.78)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.09)',
      '--sidebar-border':  'rgba(66,133,244,0.38)',
      '--primary':         '#1251a3',
      '--primary-hover':   '#0d3d80',
      '--primary-light':   '#dce9ff',
      '--accent':          '#2e7ae0',
      '--accent-light':    '#eef4ff',
      '--page-bg':         '#e5efff',
      '--surface':         '#f5f9ff',
      '--surface-raised':  '#e8f0ff',
      '--border':          '#c0d7f5',
      '--border-strong':   '#90b8ee',
      '--text':            '#071835',
      '--text-muted':      '#1a4080',
      '--text-faint':      '#5082bf',
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
