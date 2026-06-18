import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Navy',
    description: 'Deep ocean blue — focused & professional',
    swatch: '#1e3a8a',
    vars: {
      '--sidebar-from':    '#0c1445',
      '--sidebar-to':      '#1e3a8a',
      '--sidebar-text':    'rgba(255,255,255,0.85)',
      '--sidebar-muted':   'rgba(147,197,253,0.7)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.08)',
      '--sidebar-border':  'rgba(59,130,246,0.3)',
      '--primary':         '#1d4ed8',
      '--primary-hover':   '#1e40af',
      '--primary-light':   '#dbeafe',
      '--accent':          '#3b82f6',
      '--accent-light':    '#eff6ff',
      '--page-bg':         '#f1f5f9',
      '--surface':         '#ffffff',
      '--surface-raised':  '#f8fafc',
      '--border':          '#e2e8f0',
      '--border-strong':   '#cbd5e1',
      '--text':            '#0f172a',
      '--text-muted':      '#64748b',
      '--text-faint':      '#94a3b8',
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    description: 'Healing green — calm & trustworthy',
    swatch: '#065f46',
    vars: {
      '--sidebar-from':    '#022c22',
      '--sidebar-to':      '#065f46',
      '--sidebar-text':    'rgba(255,255,255,0.90)',
      '--sidebar-muted':   'rgba(167,243,208,0.75)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.08)',
      '--sidebar-border':  'rgba(16,185,129,0.35)',
      '--primary':         '#059669',
      '--primary-hover':   '#047857',
      '--primary-light':   '#d1fae5',
      '--accent':          '#10b981',
      '--accent-light':    '#ecfdf5',
      '--page-bg':         '#e8faf0',
      '--surface':         '#f7fdf9',
      '--surface-raised':  '#e8faf2',
      '--border':          '#a7f3d0',
      '--border-strong':   '#6ee7b7',
      '--text':            '#064e3b',
      '--text-muted':      '#047857',
      '--text-faint':      '#34d399',
    }
  },
  violet: {
    id: 'violet',
    name: 'Royal Amethyst',
    description: 'Regal purple — premium & elegant',
    swatch: '#4c1d95',
    vars: {
      '--sidebar-from':    '#1e0a45',
      '--sidebar-to':      '#4c1d95',
      '--sidebar-text':    'rgba(255,255,255,0.90)',
      '--sidebar-muted':   'rgba(216,180,254,0.75)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.08)',
      '--sidebar-border':  'rgba(139,92,246,0.35)',
      '--primary':         '#7c3aed',
      '--primary-hover':   '#6d28d9',
      '--primary-light':   '#ede9fe',
      '--accent':          '#8b5cf6',
      '--accent-light':    '#f5f3ff',
      '--page-bg':         '#ede9ff',
      '--surface':         '#f5f0ff',
      '--surface-raised':  '#ede9ff',
      '--border':          '#ddd6fe',
      '--border-strong':   '#c4b5fd',
      '--text':            '#2e1065',
      '--text-muted':      '#6d28d9',
      '--text-faint':      '#a78bfa',
    }
  },
  rose: {
    id: 'rose',
    name: 'Crimson Elite',
    description: 'Bold red — decisive & powerful',
    swatch: '#9f1239',
    vars: {
      '--sidebar-from':    '#4c0519',
      '--sidebar-to':      '#9f1239',
      '--sidebar-text':    'rgba(255,255,255,0.90)',
      '--sidebar-muted':   'rgba(253,164,175,0.75)',
      '--sidebar-active':  'rgba(255,255,255,0.15)',
      '--sidebar-hover':   'rgba(255,255,255,0.08)',
      '--sidebar-border':  'rgba(244,63,94,0.35)',
      '--primary':         '#e11d48',
      '--primary-hover':   '#be123c',
      '--primary-light':   '#ffe4e6',
      '--accent':          '#f43f5e',
      '--accent-light':    '#fff1f2',
      '--page-bg':         '#fde4e7',
      '--surface':         '#fef2f3',
      '--surface-raised':  '#fde4e7',
      '--border':          '#fda4af',
      '--border-strong':   '#fb7185',
      '--text':            '#4c0519',
      '--text-muted':      '#be123c',
      '--text-faint':      '#fb7185',
    }
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('cv_theme') || 'midnight');

  const applyTheme = (id) => {
    const t = themes[id] || themes.midnight;
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
