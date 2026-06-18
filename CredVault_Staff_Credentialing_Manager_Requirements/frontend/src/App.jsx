import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import ProviderDirectory from './components/Providers/ProviderDirectory';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import './App.css';

function AppShell() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-950 to-blue-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p className="text-white font-medium">Loading CredVault...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'providers': return <ProviderDirectory />;
      case 'alerts':    return <AlertsPage onNavigateToProvider={() => setCurrentPage('providers')} />;
      case 'reports':   return <ReportsPage />;
      case 'settings':  return <SettingsPlaceholder />;
      default:          return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsPlaceholder() {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <p className="text-2xl font-bold text-gray-900 mb-2">Settings</p>
      <p className="text-gray-500 text-sm mb-4">Logged in as <strong>{user?.email}</strong></p>
      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">{user?.role}</span>
      <p className="text-gray-400 text-xs mt-6">Settings panel coming soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
