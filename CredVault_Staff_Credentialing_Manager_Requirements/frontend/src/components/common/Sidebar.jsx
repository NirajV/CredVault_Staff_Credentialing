import { LayoutDashboard, Users, AlertCircle, FileText, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: Users,           label: 'Providers',  page: 'providers'  },
  { icon: AlertCircle,     label: 'Alerts',     page: 'alerts'     },
  { icon: FileText,        label: 'Reports',    page: 'reports'    },
  { icon: Settings,        label: 'Settings',   page: 'settings'   },
];

function Sidebar({ onNavigate, currentPage }) {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-blue-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">CredVault</h2>
          <p className="text-blue-300 text-xs">Credentialing Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 mt-1">
        {menuItems.map(({ icon: Icon, label, page }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              ].join(' ')}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User strip at bottom */}
      {user && (
        <div className="px-4 py-4 border-t border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-blue-300 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
