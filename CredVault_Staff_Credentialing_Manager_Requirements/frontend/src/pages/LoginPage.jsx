import { useState } from 'react';
import {
  Eye, EyeOff, AlertCircle, Mail, Lock, User,
  Stethoscope, Building2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin',       email: 'admin@credvault.com',       password: 'Admin@1234',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { role: 'Coordinator', email: 'coordinator@credvault.com', password: 'Coord@1234',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { role: 'Director',    email: 'director@credvault.com',    password: 'Director@1234', color: 'bg-green-100 text-green-700 border-green-200' },
  { role: 'HR',          email: 'hr@credvault.com',          password: 'HR@Admin1234',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { role: 'Auditor',     email: 'auditor@credvault.com',     password: 'Audit@1234',    color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

/* ── Shared atoms ─────────────────────────────────────────────── */

function IconInput({ icon: Icon, type = 'text', value, onChange, placeholder, autoComplete, disabled, suffix }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Icon size={16} />
      </div>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={autoComplete} disabled={disabled}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-gray-50 disabled:text-gray-500"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

function PwInput({ label, value, onChange, placeholder = '••••••••', autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <IconInput
        icon={Lock} type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
        suffix={
          <button type="button" onClick={() => setShow(s => !s)} className="text-gray-400 hover:text-gray-600">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
      />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ErrBanner({ msg }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
      <AlertCircle size={16} className="flex-shrink-0" /> {msg}
    </div>
  );
}

function NexaLogo() {
  return (
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 backdrop-blur-sm border border-white/20"
      style={{ background: 'rgba(255,255,255,0.10)' }}>
      <svg width="44" height="44" viewBox="0 0 34 34" fill="none">
        <path d="M17 2L31 9.5V24.5L17 32L3 24.5V9.5L17 2Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <path d="M17 7L26 11.5V19C26 23.4 22 27 17 28C12 27 8 23.4 8 19V11.5L17 7Z" fill="rgba(255,255,255,0.95)" />
        <path d="M12.5 19L15.5 22L21.5 15" stroke="var(--sidebar-to)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ── Login view ───────────────────────────────────────────────── */
function LoginView({ onGoRegister, onGoReset }) {
  const { login } = useAuth();
  const [email,    setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]  = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');

  const doLogin = async (em, pw) => {
    setError(''); setLoading(true);
    try { await login(em, pw); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }
    doLogin(email.trim(), password);
  };

  const quickLogin = (acc) => {
    setEmail(acc.email); setPassword(acc.password);
    doLogin(acc.email, acc.password);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <NexaLogo />
        <h1 className="text-4xl text-white" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, letterSpacing: '-0.01em' }}>NexaCred</h1>
        <p className="mt-1.5 text-sm font-medium tracking-wide" style={{ color: 'var(--sidebar-muted)' }}>Healthcare Credentialing Platform</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

        {error && <ErrBanner msg={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <IconInput icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@credvault.com" autoComplete="email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <IconInput
              icon={Lock} type={showPw ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              suffix={
                <button type="button" onClick={() => setShowPw(s => !s)} className="text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
            {loading ? <><Spinner /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 space-y-1 text-center text-sm text-gray-500">
          <p>Don't have an account?{' '}
            <button onClick={onGoRegister} className="font-semibold text-blue-600 hover:underline">Register</button>
          </p>
          <p>Forgot your password?{' '}
            <button onClick={onGoReset} className="font-semibold text-blue-600 hover:underline">Reset it here</button>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Demo Accounts — click to sign in</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.role} onClick={() => quickLogin(acc)} disabled={loading}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition hover:shadow-sm disabled:opacity-50 ${acc.color}`}>
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
  );
}

/* ── Register view ────────────────────────────────────────────── */
function RegisterView({ onGoLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', specialty: '', organization: '', email: '', password: '', confirmPassword: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [showCp,  setShowCp]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) { setError('Full name, email, and password are required'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    const [firstName, ...rest] = form.fullName.trim().split(' ');
    const lastName = rest.join(' ') || '';
    setError(''); setLoading(true);
    try {
      await register({ firstName, lastName, email: form.email, password: form.password, department: form.specialty || form.organization, role: 'coordinator' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, fieldKey, type = 'text', icon: Icon, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <IconInput icon={Icon} type={type} value={form[fieldKey]} onChange={set(fieldKey)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-3xl text-white" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}>NexaCred</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sidebar-muted)' }}>Healthcare Credentialing Platform</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-0.5">Create account</h2>
        <p className="text-gray-500 text-sm mb-6">Register as a healthcare professional</p>

        {error && <ErrBanner msg={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name"     fieldKey="fullName"     icon={User}        placeholder="Dr. John Smith" />
          <Field label="Specialty"     fieldKey="specialty"    icon={Stethoscope} placeholder="Oncology" />
          <Field label="Organization"  fieldKey="organization" icon={Building2}    placeholder="City Hospital" />
          <Field label="Email"         fieldKey="email"        icon={Mail}         placeholder="organizer@hospital.com" type="email" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <IconInput icon={Lock} type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="••••••••"
              suffix={<button type="button" onClick={() => setShowPw(s => !s)} className="text-gray-400 hover:text-gray-600">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <IconInput icon={Lock} type={showCp ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
              placeholder="Re-enter your password"
              suffix={<button type="button" onClick={() => setShowCp(s => !s)} className="text-gray-400 hover:text-gray-600">{showCp ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
            <p className="text-xs text-gray-400 mt-1.5">Must be at least 8 characters and match the password above.</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
            {loading ? <><Spinner /> Creating...</> : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={onGoLogin} className="font-semibold text-blue-600 hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
}

/* ── Reset Password view (split-screen) ──────────────────────── */
function ResetView({ onGoLogin }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email address is required'); return; }
    setError(''); setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1100));
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left dark panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12"
        style={{ background: 'linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))' }}
      >
        <h1 className="text-4xl text-white mb-6 leading-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}>
          Reset your<br />password
        </h1>
        <p className="text-white/65 text-base leading-relaxed mb-8 max-w-sm">
          Forgot your password? No problem. Enter the email tied to your account and we'll send you a temporary password so you can get back into NexaCred.
        </p>
        <div className="flex items-start gap-3 text-white/55 text-sm max-w-sm">
          <Lock size={15} className="mt-0.5 flex-shrink-0" />
          <p>
            For your security, please sign in with the temporary password and change it right away from{' '}
            <em>Settings → Change Password</em>.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'var(--surface-raised)' }}>
        <div className="w-full max-w-md">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a new password.</p>
            </div>
            <button onClick={onGoLogin}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mt-1">
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-7 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={22} className="text-green-600" />
              </div>
              <h3 className="font-bold text-green-900 mb-1">Check your inbox</h3>
              <p className="text-green-700 text-sm">
                If <strong>{email}</strong> is registered, you'll receive a temporary password within a few minutes.
              </p>
              <button onClick={onGoLogin} className="mt-4 text-sm font-semibold text-green-700 hover:underline">
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              {error && <ErrBanner msg={error} />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <IconInput icon={Mail} type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@hospital.com" autoComplete="email" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2">
                  {loading ? <><Spinner /> Sending...</> : 'Reset Password'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-500">
                Remember your password?{' '}
                <button onClick={onGoLogin} className="font-semibold text-blue-600 hover:underline">Sign in here</button>
              </p>

              <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <AlertCircle size={11} />
                For security reasons, we don't disclose whether an email exists in our system.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function LoginPage() {
  const [view, setView] = useState('login');

  if (view === 'reset') return <ResetView onGoLogin={() => setView('login')} />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, var(--sidebar-from), var(--sidebar-to))' }}
    >
      {view === 'login'    && <LoginView    onGoRegister={() => setView('register')} onGoReset={() => setView('reset')} />}
      {view === 'register' && <RegisterView onGoLogin={() => setView('login')} />}
    </div>
  );
}
