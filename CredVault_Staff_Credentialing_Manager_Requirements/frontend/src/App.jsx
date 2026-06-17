import { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import ProviderDirectory from './components/Providers/ProviderDirectory';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check backend health
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Backend health check failed:', err);
        setApiStatus({ status: 'error', message: 'Cannot connect to backend' });
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-accent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white">CredVault</h1>
          <p className="text-gray-200 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (apiStatus?.status !== 'healthy') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-900 text-lg font-semibold mb-2">Backend Connection Error</h2>
          <p className="text-red-700">
            Unable to connect to the backend API. Please ensure the server is running on port 3220.
          </p>
          <pre className="mt-4 bg-red-100 p-4 rounded text-sm text-red-800 overflow-auto">
            {JSON.stringify(apiStatus, null, 2)}
          </pre>
        </div>
      );
    }

    switch (currentPage) {
      case 'providers':
        return <ProviderDirectory />;
      case 'alerts':
        return <AlertsPage onNavigateToProvider={(id) => setCurrentPage('providers')} />;
      case 'reports':
        return <ReportsPage />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
