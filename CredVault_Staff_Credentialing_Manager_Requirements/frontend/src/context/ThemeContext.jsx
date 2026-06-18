import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  verdigris: {
    id: 'verdigris',
    name: 'Verdigris Day',
    description: 'Copper patina · oxidized metal · light',
    swatch: '#1E7A66',
    vars: {
      '--grain':          '0.035',
      '--sidebar-from':   '#0D2018',
      '--sidebar-to':     '#1B4332',
      '--sidebar-text':   'rgba(244,247,241,0.92)',
      '--sidebar-muted':  'rgba(140,190,168,0.72)',
      '--sidebar-active': 'rgba(30,122,102,0.22)',
      '--sidebar-hover':  'rgba(255,255,255,0.09)',
      '--sidebar-border': 'rgba(17,48,42,0.30)',
      '--primary':        '#1E7A66',
      '--primary-hover':  '#165c4e',
      '--primary-light':  '#B7E4C7',
      '--primary-text':   '#F4F7F1',
      '--accent':         '#A9772A',
      '--accent-light':   '#FBF7EE',
      '--page-bg':        '#E4E8E0',
      '--surface':        '#FBFCF8',
      '--surface-raised': '#E4E8E0',
      '--border':         'rgba(17,48,42,0.14)',
      '--border-strong':  'rgba(17,48,42,0.28)',
      '--text':           '#11302A',
      '--text-muted':     '#405F55',
      '--text-faint':     '#5C6F67',
    }
  },

  'verdigris-dark': {
    id: 'verdigris-dark',
    name: 'Verdigris Nocturne',
    description: 'Copper patina · oxidized metal · dark',
    swatch: '#4FB8A0',
    vars: {
      '--grain':          '0.05',
      '--sidebar-from':   '#060F0D',
      '--sidebar-to':     '#0E201D',
      '--sidebar-text':   'rgba(236,231,214,0.90)',
      '--sidebar-muted':  'rgba(143,165,155,0.70)',
      '--sidebar-active': 'rgba(79,184,160,0.22)',
      '--sidebar-hover':  'rgba(255,255,255,0.07)',
      '--sidebar-border': 'rgba(236,231,214,0.12)',
      '--primary':        '#4FB8A0',
      '--primary-hover':  '#3aa08a',
      '--primary-light':  '#16302B',
      '--primary-text':   '#072019',
      '--accent':         '#E0A458',
      '--accent-light':   '#2A2010',
      '--page-bg':        '#0E201D',
      '--surface':        '#1A3A33',
      '--surface-raised': '#16302B',
      '--border':         'rgba(236,231,214,0.12)',
      '--border-strong':  'rgba(236,231,214,0.25)',
      '--text':           '#ECE7D6',
      '--text-muted':     '#DDDBCB',
      '--text-faint':     '#8FA59B',
    }
  },

  temper: {
    id: 'temper',
    name: 'Temper Day',
    description: 'Steel heat-oxide · iridescent · light',
    swatch: '#5145A6',
    vars: {
      '--grain':          '0.035',
      '--sidebar-from':   '#100F1C',
      '--sidebar-to':     '#2B284D',
      '--sidebar-text':   'rgba(245,243,252,0.92)',
      '--sidebar-muted':  'rgba(178,172,220,0.72)',
      '--sidebar-active': 'rgba(81,69,166,0.22)',
      '--sidebar-hover':  'rgba(255,255,255,0.08)',
      '--sidebar-border': 'rgba(28,26,51,0.35)',
      '--primary':        '#5145A6',
      '--primary-hover':  '#3d3582',
      '--primary-light':  '#E0D9FF',
      '--primary-text':   '#F5F3FC',
      '--accent':         '#9C6A28',
      '--accent-light':   '#FBF6EE',
      '--page-bg':        '#E1E0EC',
      '--surface':        '#FBFAFE',
      '--surface-raised': '#E1E0EC',
      '--border':         'rgba(28,26,51,0.14)',
      '--border-strong':  'rgba(28,26,51,0.28)',
      '--text':           '#1C1A33',
      '--text-muted':     '#3E3A5F',
      '--text-faint':     '#5F5C78',
    }
  },

  'temper-dark': {
    id: 'temper-dark',
    name: 'Temper Nocturne',
    description: 'Steel heat-oxide · iridescent · dark',
    swatch: '#9B8CF5',
    vars: {
      '--grain':          '0.05',
      '--sidebar-from':   '#080716',
      '--sidebar-to':     '#13121F',
      '--sidebar-text':   'rgba(231,228,241,0.90)',
      '--sidebar-muted':  'rgba(148,143,176,0.70)',
      '--sidebar-active': 'rgba(155,140,245,0.22)',
      '--sidebar-hover':  'rgba(255,255,255,0.07)',
      '--sidebar-border': 'rgba(231,228,241,0.12)',
      '--primary':        '#9B8CF5',
      '--primary-hover':  '#7b6ae0',
      '--primary-light':  '#1E1C30',
      '--primary-text':   '#0C0820',
      '--accent':         '#E5946A',
      '--accent-light':   '#2A1508',
      '--page-bg':        '#13121F',
      '--surface':        '#242240',
      '--surface-raised': '#1E1C30',
      '--border':         'rgba(231,228,241,0.12)',
      '--border-strong':  'rgba(231,228,241,0.25)',
      '--text':           '#E7E4F1',
      '--text-muted':     '#D8D5E6',
      '--text-faint':     '#948FB0',
    }
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem('cv_theme');
    return (saved && themes[saved]) ? saved : 'verdigris';
  });

  const applyTheme = (id) => {
    const t = themes[id] || themes.verdigris;
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
