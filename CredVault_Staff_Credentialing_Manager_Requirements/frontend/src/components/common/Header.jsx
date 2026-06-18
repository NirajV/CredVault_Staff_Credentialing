import { Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleColors = {
  admin:       'bg-purple-100 text-purple-700',
  coordinator: 'bg-blue-100 text-blue-700',
  director:    'bg-green-100 text-green-700',
  hr:          'bg-amber-100 text-amber-700',
  auditor:     'bg-gray-100 text-gray-700',
};

function Header({ currentPage }) {
  const { user, logout } = useAuth();

  const pageTitle = {
    dashboard: 'Dashboard',
    providers:  'Provider Directory',
    alerts:     'Alerts',
    reports:    'Reports',
    settings:   'Settings',
  }[currentPage] || 'Dashboard';

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '??';

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <Bell size={20} />
          </button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                  {user.role}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition text-gray-400"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
