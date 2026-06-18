import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import ProviderDirectory from './components/Providers/ProviderDirectory';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import AlertSettingsPage from './pages/AlertSettingsPage';
import './App.css';

function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
        opacity: 'var(--grain, 0)', mixBlendMode: 'overlay',
        width: '100vw', height: '100vh',
      }}
    >
      <filter id="nc-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#nc-grain)" />
    </svg>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))' }}
      >
        <GrainOverlay />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p style={{ color: 'rgba(255,255,255,0.80)' }} className="font-medium">Loading NexaCred...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'providers':      return <ProviderDirectory />;
      case 'alerts':         return <AlertsPage onNavigateToProvider={() => setCurrentPage('providers')} />;
      case 'alert-settings': return <AlertSettingsPage />;
      case 'reports':        return <ReportsPage />;
      case 'settings':       return <SettingsPage />;
      default:               return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen" style={{ background: 'var(--page-bg)' }}>
      <GrainOverlay />
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
