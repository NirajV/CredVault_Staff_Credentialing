import { BarChart3, Users, AlertCircle, FileText, Home, Settings } from 'lucide-react';

function Sidebar({ onNavigate, currentPage }) {
  const menuItems = [
    { icon: Home, label: 'Dashboard', page: 'dashboard' },
    { icon: Users, label: 'Providers', page: 'providers' },
    { icon: AlertCircle, label: 'Alerts', page: 'alerts' },
    { icon: FileText, label: 'Reports', page: 'reports' },
    { icon: Settings, label: 'Settings', page: 'settings' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-primary to-secondary text-white flex flex-col">
      <div className="p-6 border-b border-blue-900">
        <h2 className="text-2xl font-bold">CredVault</h2>
        <p className="text-sm text-blue-200">Provider Credentialing</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
              currentPage === item.page
                ? 'bg-blue-600 text-white'
                : 'hover:bg-blue-700 text-white'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-900 text-sm text-blue-100">
        <p>Connected to API</p>
        <p className="text-xs mt-1">Status: Active</p>
      </div>
    </aside>
  );
}

export default Sidebar;
