import { LayoutDashboard, Users, AlertCircle, FileText, Settings, BellRing, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',      page: 'dashboard'       },
  { icon: Users,           label: 'Providers',      page: 'providers'       },
  { icon: AlertCircle,     label: 'Alerts',         page: 'alerts'          },
  { icon: BellRing,        label: 'Alert Settings', page: 'alert-settings'  },
  { icon: FileText,        label: 'Reports',        page: 'reports'         },
  { icon: Settings,        label: 'Settings',       page: 'settings'        },
];

function NexaCredLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="logo-icon flex-shrink-0">
      {/* Outer hexagon */}
      <path
        d="M17 2L31 9.5V24.5L17 32L3 24.5V9.5L17 2Z"
        fill="rgba(255,255,255,0.15)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      {/* Inner shield */}
      <path
        d="M17 7L26 11.5V19C26 23.4 22 27 17 28C12 27 8 23.4 8 19V11.5L17 7Z"
        fill="rgba(255,255,255,0.9)"
      />
      {/* Checkmark */}
      <path
        d="M12.5 19L15.5 22L21.5 15"
        stroke="var(--sidebar-to)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeSwitcher() {
  const { themeId, setTheme, themes } = useTheme();

  return (
    <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--sidebar-muted)' }}>
        Theme
      </p>
      <div className="flex items-center gap-2">
        {Object.values(themes).map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            className={`theme-swatch ${themeId === t.id ? 'active' : ''}`}
            style={{ background: t.swatch }}
          />
        ))}
      </div>
      <p className="text-xs mt-2 truncate" style={{ color: 'var(--sidebar-muted)', opacity: 0.75 }}>
        {themes[themeId]?.name}
      </p>
    </div>
  );
}

function Sidebar({ onNavigate, currentPage }) {
  const { user } = useAuth();

  return (
    <aside className="w-64 sidebar-gradient flex flex-col" style={{ minHeight: '100vh' }}>

      {/* ── Brand ── */}
      <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <NexaCredLogo />
        <div className="min-w-0">
          <h2
            className="text-lg leading-tight"
            style={{
              color: 'var(--sidebar-text)',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
          >
            NexaCred
          </h2>
          <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--sidebar-muted)' }}>
            Credentialing Platform
          </p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {menuItems.map(({ icon: Icon, label, page }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                color:      active ? '#ffffff' : 'var(--sidebar-text)',
                background: active ? 'var(--sidebar-active)' : 'transparent',
                opacity:    active ? 1 : 0.85,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon
                size={17}
                style={{ color: active ? '#ffffff' : 'var(--sidebar-muted)' }}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Theme Switcher ── */}
      <ThemeSwitcher />

      {/* ── User strip ── */}
      {user && (
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--sidebar-text)' }}
            >
              {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--sidebar-text)' }}>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs capitalize truncate" style={{ color: 'var(--sidebar-muted)' }}>
                {user.role}
              </p>
            </div>
            <CheckCircle size={14} style={{ color: 'var(--sidebar-muted)', flexShrink: 0 }} />
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
