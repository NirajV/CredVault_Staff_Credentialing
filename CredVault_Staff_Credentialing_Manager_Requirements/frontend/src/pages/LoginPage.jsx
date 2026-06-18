import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin',       email: 'admin@credvault.com',       password: 'Admin@1234',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { role: 'Coordinator', email: 'coordinator@credvault.com', password: 'Coord@1234',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { role: 'Director',    email: 'director@credvault.com',    password: 'Director@1234', color: 'bg-green-100 text-green-700 border-green-200' },
  { role: 'HR',          email: 'hr@credvault.com',          password: 'HR@Admin1234',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { role: 'Auditor',     email: 'auditor@credvault.com',     password: 'Audit@1234',    color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      await login(account.email, account.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))' }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl mb-4 backdrop-blur-sm border border-white/20">
            <svg width="44" height="44" viewBox="0 0 34 34" fill="none">
              <path d="M17 2L31 9.5V24.5L17 32L3 24.5V9.5L17 2Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
              <path d="M17 7L26 11.5V19C26 23.4 22 27 17 28C12 27 8 23.4 8 19V11.5L17 7Z" fill="rgba(255,255,255,0.95)" />
              <path d="M12.5 19L15.5 22L21.5 15" stroke="var(--sidebar-to)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1
            className="text-4xl text-white"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            NexaCred
          </h1>
          <p className="mt-1.5 text-sm font-medium tracking-wide" style={{ color: 'var(--sidebar-muted)' }}>Healthcare Credentialing Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@credvault.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-7 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Demo Accounts — click to sign in</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition hover:shadow-sm disabled:opacity-50 ${acc.color}`}
                >
                  <span className="font-semibold">{acc.role}</span>
                  <span className="opacity-75 font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--sidebar-muted)' }}>
          NexaCred © {new Date().getFullYear()} · Secure Healthcare Credentialing Platform
        </p>
      </div>
    </div>
  );
}
