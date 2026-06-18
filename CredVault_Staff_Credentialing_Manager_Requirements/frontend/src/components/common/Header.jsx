import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleColors = {
  admin:       'bg-purple-100 text-purple-700',
  coordinator: 'bg-blue-100 text-blue-700',
  director:    'bg-green-100 text-green-700',
  hr:          'bg-amber-100 text-amber-700',
  auditor:     'bg-gray-100 text-gray-700',
};

const pageTitles = {
  dashboard:       'Dashboard',
  providers:       'Provider Directory',
  alerts:          'Alerts',
  'alert-settings':'Alert Settings',
  reports:         'Reports',
  settings:        'Settings',
};

function Header({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();

  const pageTitle = pageTitles[currentPage] || 'Dashboard';

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <header
      className="flex-shrink-0"
      style={{
        background:   'var(--surface)',
        borderBottom: '1px solid var(--border)',
        boxShadow:    '0 1px 3px 0 rgba(0,0,0,0.06)',
      }}
    >
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Page title with accent underline */}
        <div>
          <h1
            className="text-base font-bold"
            style={{ color: 'var(--text)' }}
          >
            {pageTitle}
          </h1>
          <div
            className="h-0.5 rounded-full mt-0.5 w-8"
            style={{ background: 'var(--primary)' }}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Alert bell */}
          <button
            onClick={() => onNavigate?.('alerts')}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="View Alerts"
          >
            <Bell size={19} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
                  {user.firstName} {user.lastName}
                </p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                  {user.role}
                </span>
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              >
                {initials}
              </div>

              {/* Sign out */}
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; }}
              >
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
