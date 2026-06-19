import { useState, useRef, useEffect } from 'react';
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

const DISCLAIMER_POINTS = [
  {
    bold: 'Authorized Access Only:',
    text: 'You are an authorized credentialing staff member. Unauthorized access is strictly prohibited and all sessions are audited.',
  },
  {
    bold: 'PHI & Data Privacy:',
    text: 'Do not share provider credentials, identifiers, or Protected Health Information (PHI) outside this system. All access is monitored for HIPAA compliance.',
  },
  {
    bold: 'Verify All Credentials:',
    text: 'Always confirm license status, DEA registrations, certifications, and malpractice coverage with the issuing authority before making credentialing decisions.',
  },
  {
    bold: 'Keep Credentials Confidential:',
    text: 'Maintain the confidentiality of your login credentials and sign out when finished on a shared or public device.',
  },
];

/* ── Disclaimer modal ─────────────────────────────────────────── */
function DisclaimerModal({ user, onAccept }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: 'var(--page-bg)' }}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl shadow-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}
      >
        {/* ── Header ── */}
        <div className="px-8 pt-7 pb-6">
          {/* Brand row */}
          <div className="flex items-center gap-2.5 mb-5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))' }}
            >
              <svg width="17" height="17" viewBox="0 0 34 34" fill="none">
                <path
                  d="M17 7L26 11.5V19C26 23.4 22 27 17 28C12 27 8 23.4 8 19V11.5L17 7Z"
                  fill="rgba(255,255,255,0.92)"
                />
                <path
                  d="M12.5 19L15.5 22L21.5 15"
                  stroke="var(--sidebar-to)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                color: 'var(--primary)',
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600,
                fontSize: '0.9rem',
                letterSpacing: '0.01em',
              }}
            >
              NexaCred
            </span>
          </div>

          <h2
            className="text-xl font-bold mb-1.5 leading-snug"
            style={{ color: 'var(--text)' }}
          >
            Important — Please read before continuing
          </h2>
          {user && (
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
              Welcome back, {user.firstName}.
            </p>
          )}
        </div>

        <div style={{ height: '1px', background: 'var(--border)' }} />

        {/* ── Body ── */}
        <div className="px-8 py-6 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            <strong>NexaCred</strong> is a{' '}
            <strong>credentialing and license management platform</strong> for healthcare
            organizations. It assists authorized credentialing staff with provider
            verification, compliance tracking, and document management, and is{' '}
            <strong>not a substitute for official verification with issuing authorities</strong>.
          </p>

          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            By continuing, you confirm that:
          </p>

          <ul className="space-y-3">
            {DISCLAIMER_POINTS.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
                  •
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{item.bold}</strong>{' '}
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            This acknowledgement is recorded for this session. You can re-read this notice
            anytime from <em>Settings → My Profile</em>.
          </p>
        </div>

        <div style={{ height: '1px', background: 'var(--border)' }} />

        {/* ── Footer ── */}
        <div
          className="px-8 py-4 flex justify-end items-center"
          style={{ background: 'var(--primary-light)' }}
        >
          <button
            onClick={onAccept}
            className="px-7 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-90"
            style={{
              background: 'var(--sidebar-from)',
              color: '#ffffff',
              letterSpacing: '0.01em',
            }}
          >
            I understand &amp; accept
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Grain texture overlay ────────────────────────────────────── */
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

/* ── App shell ────────────────────────────────────────────────── */
function AppShell() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [targetProviderId, setTargetProviderId] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    () => sessionStorage.getItem('cv_disclaimer') === '1'
  );

  // Reset disclaimer whenever the user transitions from null → logged-in
  // (a fresh login), but NOT on page refresh with an existing session.
  const prevUserRef = useRef(undefined);
  useEffect(() => {
    if (prevUserRef.current === undefined) {
      prevUserRef.current = user;
      return;
    }
    if (prevUserRef.current === null && user !== null) {
      // Fresh login: force disclaimer regardless of sessionStorage
      setDisclaimerAccepted(false);
    }
    prevUserRef.current = user;
  }, [user]);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('cv_disclaimer', '1');
    setDisclaimerAccepted(true);
  };

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

  const navigateToProvider = (providerId) => {
    setTargetProviderId(providerId || null);
    setCurrentPage('providers');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'providers':
        return (
          <ProviderDirectory
            targetProviderId={targetProviderId}
            onClearTarget={() => setTargetProviderId(null)}
          />
        );
      case 'alerts':
        return <AlertsPage onNavigateToProvider={navigateToProvider} />;
      case 'alert-settings': return <AlertSettingsPage />;
      case 'reports':        return <ReportsPage />;
      case 'settings':       return <SettingsPage />;
      default:               return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen" style={{ background: 'var(--page-bg)' }}>
      <GrainOverlay />
      {!disclaimerAccepted && (
        <DisclaimerModal user={user} onAccept={handleAcceptDisclaimer} />
      )}
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
