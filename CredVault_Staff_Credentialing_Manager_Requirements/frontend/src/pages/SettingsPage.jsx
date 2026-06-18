import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Edit2, Save, X, Power, ShieldCheck, Mail, Phone,
  Building2, AlertCircle, CheckCircle2, Key, Eye, EyeOff,
  Globe, Calendar, Send, User, Lock, RefreshCw
} from 'lucide-react';
import { authFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Constants ─────────────────────────────────────────────────── */

const ROLES = ['admin', 'coordinator', 'director', 'hr', 'auditor'];

const roleStyles = {
  admin:       'bg-purple-100 text-purple-700 border-purple-200',
  coordinator: 'bg-blue-100 text-blue-700 border-blue-200',
  director:    'bg-green-100 text-green-700 border-green-200',
  hr:          'bg-amber-100 text-amber-700 border-amber-200',
  auditor:     'bg-gray-100 text-gray-600 border-gray-200',
};

const roleDesc = {
  admin:       'Full system access, user management',
  coordinator: 'Manage providers and credentials',
  director:    'Approve credentials, view reports',
  hr:          'Manage provider employment status',
  auditor:     'Read-only access for compliance audits',
};

const FEEDBACK_TYPES = ['Feature Request', 'Bug Report', 'General Feedback', 'Enhancement', 'Other'];

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'IN', label: 'India' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'SG', label: 'Singapore' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'OTHER', label: 'Other' },
];

const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (EST/EDT) — America/New_York' },
  { value: 'America/Chicago',     label: 'Central Time (CST/CDT) — America/Chicago' },
  { value: 'America/Denver',      label: 'Mountain Time (MST/MDT) — America/Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT) — America/Los_Angeles' },
  { value: 'America/Anchorage',   label: 'Alaska Time — America/Anchorage' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HST) — Pacific/Honolulu' },
  { value: 'Europe/London',       label: 'London (GMT/BST) — Europe/London' },
  { value: 'Europe/Paris',        label: 'Central European (CET/CEST) — Europe/Paris' },
  { value: 'Europe/Berlin',       label: 'Berlin (CET/CEST) — Europe/Berlin' },
  { value: 'Asia/Kolkata',        label: 'India Standard Time (IST) — Asia/Kolkata' },
  { value: 'Asia/Dubai',          label: 'Gulf Standard Time (GST) — Asia/Dubai' },
  { value: 'Asia/Singapore',      label: 'Singapore Time (SGT) — Asia/Singapore' },
  { value: 'Asia/Tokyo',          label: 'Japan Standard Time (JST) — Asia/Tokyo' },
  { value: 'Australia/Sydney',    label: 'Australian Eastern Time — Australia/Sydney' },
  { value: 'UTC',                 label: 'UTC — Coordinated Universal Time' },
];

const COUNTRY_HOLIDAYS = {
  US: ['New Year\'s Day', 'Martin Luther King Jr. Day', 'Presidents\' Day', 'Memorial Day', 'Juneteenth National Independence Day', 'Independence Day', 'Labor Day', 'Columbus Day', 'Veterans Day', 'Thanksgiving Day', 'Christmas Day'],
  IN: ['Republic Day', 'Holi', 'Good Friday', 'Ram Navami', 'May Day', 'Eid al-Adha (Bakrid)', 'Independence Day', 'Gandhi Jayanti', 'Dussehra', 'Diwali', 'Guru Nanak Jayanti', 'Christmas Day'],
  GB: ['New Year\'s Day', 'Good Friday', 'Easter Monday', 'Early May Bank Holiday', 'Spring Bank Holiday', 'Summer Bank Holiday', 'Christmas Day', 'Boxing Day'],
};

function getDefaultHolidays(country) { return COUNTRY_HOLIDAYS[country] || COUNTRY_HOLIDAYS.US; }

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('cv_settings') || '{}'); } catch { return {}; }
}

/* ── Shared sub-components ─────────────────────────────────────── */

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>;
}

function InputField({ label, value, onChange, placeholder, disabled, type = 'text' }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition" />
    </div>
  );
}

function PwField({ label, value, onChange, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, accentColor = 'text-blue-600', children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {title && (
        <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-2.5`}>
          {Icon && <Icon size={16} className={accentColor} />}
          <div>
            <p className={`text-sm font-bold ${accentColor}`}>{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Tab: Profile Information ──────────────────────────────────── */
function ProfileInfoTab({ notify }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName:    user?.firstName    || '',
    lastName:     user?.lastName     || '',
    email:        user?.email        || '',
    organization: user?.department   || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName) { setError('First and last name are required'); return; }
    setLoading(true);
    try {
      const res = await authFetch(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, department: form.organization })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to save');
      updateUser({ firstName: form.firstName, lastName: form.lastName, email: form.email });
      notify('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Profile Information" subtitle="Update your personal details. Your username cannot be changed." icon={User} accentColor="text-blue-600">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="Jane" />
          <InputField label="Last Name"  value={form.lastName}  onChange={set('lastName')}  placeholder="Doe" />
        </div>

        <InputField label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="organizer@hospital.com" />
        <InputField label="Organization" value={form.organization} onChange={set('organization')} placeholder="Hospital / Clinic name" />

        <div>
          <FieldLabel>Username</FieldLabel>
          <input value={user?.email || ''} disabled
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400" />
          <p className="text-xs text-blue-500 mt-1">Username cannot be changed.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ── Tab: Change Password ──────────────────────────────────────── */
function ChangePasswordTab({ notify }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.current) { setError('Current password is required'); return; }
    if (!form.newPw || form.newPw.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (form.newPw !== form.confirm) { setError('New passwords do not match'); return; }
    if (form.current === form.newPw) { setError('New password must differ from current password'); return; }

    setLoading(true);
    try {
      const res = await authFetch(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ password: form.newPw })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to update password');
      setForm({ current: '', newPw: '', confirm: '' });
      notify('Password updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Change Password" subtitle="Choose a strong password (minimum 8 characters)." icon={Key} accentColor="text-teal-600">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <PwField label="Current Password"     value={form.current} onChange={set('current')} />
        <PwField label="New Password"         value={form.newPw}   onChange={set('newPw')} />
        <PwField label="Confirm New Password" value={form.confirm}  onChange={set('confirm')} />

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition">
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Key size={15} />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ── Tab: Settings (Regional + Holidays) ──────────────────────── */
function RegionalSettingsTab({ notify }) {
  const saved = loadSettings();

  const [language,    setLanguage]    = useState(saved.language    || 'en-US');
  const [country,     setCountry]     = useState(saved.country     || 'US');
  const [timezone,    setTimezone]    = useState(saved.timezone    || 'America/New_York');
  const [enforcement, setEnforcement] = useState(saved.enforcement !== false);
  const [selected,    setSelected]    = useState(saved.selectedHolidays || []);
  const [customList,  setCustomList]  = useState(saved.customHolidays   || []);
  const [newHol,      setNewHol]      = useState({ name: '', date: '', repeat: false });

  const holidays = getDefaultHolidays(country);
  const countryCode = COUNTRIES.find(c => c.value === country)?.value || 'US';

  const toggleHoliday = (h) =>
    setSelected(s => s.includes(h) ? s.filter(x => x !== h) : [...s, h]);

  const handleCountryChange = (val) => {
    setCountry(val);
    setSelected([]);
  };

  const addCustom = () => {
    if (!newHol.name || !newHol.date) return;
    setCustomList(l => [...l, { ...newHol }]);
    setNewHol({ name: '', date: '', repeat: false });
  };

  const removeCustom = (i) => setCustomList(l => l.filter((_, idx) => idx !== i));

  const saveSettings = () => {
    const s = { language, country, timezone, enforcement, selectedHolidays: selected, customHolidays: customList };
    localStorage.setItem('cv_settings', JSON.stringify(s));
    notify('Regional settings saved');
  };

  const saveHolidays = () => {
    const s = { ...loadSettings(), enforcement, selectedHolidays: selected, customHolidays: customList };
    localStorage.setItem('cv_settings', JSON.stringify(s));
    notify('Holiday preferences saved');
  };

  return (
    <div className="space-y-5">
      {/* Regional Settings */}
      <SectionCard title="Regional Settings" subtitle="Your timezone is used to format credential expiry dates and alert times." icon={Globe} accentColor="text-amber-600">
        <div className="space-y-4 max-w-xl">
          <div>
            <FieldLabel>Language</FieldLabel>
            <select value={language} onChange={e => setLanguage(e.target.value)} disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 text-gray-500">
              <option value="en-US">English (United States) — en-US</option>
            </select>
          </div>

          <div>
            <FieldLabel>Country</FieldLabel>
            <select value={country} onChange={e => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <FieldLabel>Timezone</FieldLabel>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {TIMEZONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1.5">Times shown in alerts and reports will use this timezone.</p>
          </div>

          <div className="flex justify-end pt-1">
            <button onClick={saveSettings}
              className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600 transition">
              <Save size={15} /> Save Settings
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Holidays */}
      <SectionCard icon={Calendar} accentColor="text-amber-600"
        title="Holidays"
        subtitle={`Block scheduling on holidays you observe. Uses your country setting (${countryCode}) and custom dates.`}>
        {/* Enforcement toggle */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium text-gray-700">Enforcement on</span>
          <button
            onClick={() => setEnforcement(s => !s)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enforcement ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enforcement ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Default holidays checkboxes */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Default Holidays ({countryCode})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {holidays.map(h => (
            <label key={h} className="flex items-center gap-2.5 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input type="checkbox" checked={selected.includes(h)} onChange={() => toggleHoliday(h)}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
              <span className="text-sm text-gray-700">{h}</span>
            </label>
          ))}
        </div>

        {/* Custom holidays */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Custom Holiday</p>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input value={newHol.name} onChange={e => setNewHol(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g., Hospital Foundation Day"
            className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input type="date" value={newHol.date} onChange={e => setNewHol(p => ({ ...p, date: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={newHol.repeat} onChange={e => setNewHol(p => ({ ...p, repeat: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-amber-500" />
            Repeat yearly
          </label>
          <button onClick={addCustom}
            className="flex items-center gap-1.5 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition whitespace-nowrap">
            <Plus size={14} /> Add
          </button>
        </div>

        {customList.length > 0 && (
          <div className="space-y-2 mb-4">
            {customList.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-sm">
                <span className="font-medium text-amber-900">{h.name}</span>
                <div className="flex items-center gap-3 text-gray-500">
                  <span>{h.date}</span>
                  {h.repeat && <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Yearly</span>}
                  <button onClick={() => removeCustom(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={saveHolidays}
            className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition">
            <Save size={15} /> Save Holiday Preferences
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

/* ── Tab: Feedback ─────────────────────────────────────────────── */
function FeedbackTab({ notify }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ type: 'Feature Request', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
    notify('Feedback submitted — thank you!');
  };

  if (sent) {
    return (
      <SectionCard title="Send Feedback" subtitle="Found a bug? Have an idea? Tell us — we read every message." icon={Send} accentColor="text-purple-600">
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} className="text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Feedback received</h3>
          <p className="text-gray-500 text-sm mb-4">Thank you for helping improve NexaCred. We'll review your message shortly.</p>
          <button onClick={() => { setSent(false); setForm({ type: 'Feature Request', subject: '', message: '' }); }}
            className="text-sm font-semibold text-purple-600 hover:underline">Send another</button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Send Feedback" subtitle="Found a bug? Have an idea? Tell us — we read every message." icon={Send} accentColor="text-purple-600">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <div>
          <FieldLabel>Type</FieldLabel>
          <select value={form.type} onChange={set('type')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
            {FEEDBACK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Subject</FieldLabel>
          <input value={form.subject} onChange={set('subject')} placeholder="Short summary"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        </div>

        <div>
          <FieldLabel>Message</FieldLabel>
          <textarea value={form.message} onChange={set('message')} rows={5}
            placeholder="Describe what you'd like to share..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading || !form.subject || !form.message}
            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition">
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            {loading ? 'Sending...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ── Tab: User Management (admin) ──────────────────────────────── */
function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function UserForm({ initial, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState(initial || { firstName: '', lastName: '', email: '', password: '', role: 'coordinator', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email) { setError('First name, last name and email are required'); return; }
    if (!isEdit && (!form.password || form.password.length < 8)) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try { await onSave(form); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const SmInput = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm"><AlertCircle size={14} /> {error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <SmInput label="First Name *" field="firstName" placeholder="Jane" />
        <SmInput label="Last Name *"  field="lastName"  placeholder="Doe" />
      </div>
      <SmInput label="Email *" field="email" type="email" placeholder="jane@credvault.com" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">{roleDesc[form.role]}</p>
        </div>
        <SmInput label="Department" field="department" placeholder="Credentialing" />
      </div>
      <SmInput label="Phone" field="phone" placeholder="(555) 000-0000" />
      <PasswordField label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'} value={form.password || ''} onChange={v => set('password', v)} />
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? <RefreshCw size={13} className="animate-spin" /> : <Save size={15} />}
          {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"><X size={15} /></button>
      </div>
    </form>
  );
}

function UserCard({ user, currentUserId, onEdit, onToggleStatus }) {
  const isCurrentUser = user.id === currentUserId;
  const isInactive    = user.status === 'inactive';
  return (
    <div className={`bg-white rounded-xl border p-5 transition-all ${isInactive ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isInactive ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
            {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {user.firstName} {user.lastName}
              {isCurrentUser && <span className="ml-1.5 text-xs text-blue-500 font-normal">(you)</span>}
            </p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border capitalize mt-0.5 ${roleStyles[user.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{user.role}</span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(user)} title="Edit" className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition"><Edit2 size={15} /></button>
          {!isCurrentUser && (
            <button onClick={() => onToggleStatus(user)} title={isInactive ? 'Activate' : 'Deactivate'}
              className={`p-1.5 rounded-lg transition ${isInactive ? 'hover:bg-green-50 text-gray-400 hover:text-green-600' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
              <Power size={15} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500"><Mail size={12} className="text-gray-400 flex-shrink-0" /><span className="truncate">{user.email}</span></div>
        {user.department && <div className="flex items-center gap-2 text-xs text-gray-500"><Building2 size={12} className="text-gray-400 flex-shrink-0" /><span>{user.department}</span></div>}
        {user.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={12} className="text-gray-400 flex-shrink-0" /><span>{user.phone}</span></div>}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-100">
          <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
          {isInactive && <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">Inactive</span>}
        </div>
      </div>
    </div>
  );
}

function UserManagementTab({ currentUser, notify }) {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res    = await authFetch('/users');
      const result = await res.json();
      if (result.success) setUsers(result.data);
    } catch { notify('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [notify]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (form) => {
    const res = await authFetch('/users', { method: 'POST', body: JSON.stringify(form) });
    const result = await res.json();
    if (!result.success) throw new Error(result.error?.message || 'Failed to create user');
    await fetchUsers(); setShowForm(false);
    notify(`${form.firstName} ${form.lastName} created`);
  };

  const handleEdit = async (form) => {
    const payload = { ...form }; if (!payload.password) delete payload.password;
    const res = await authFetch(`/users/${editingUser.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    const result = await res.json();
    if (!result.success) throw new Error(result.error?.message || 'Failed to update');
    await fetchUsers(); setEditingUser(null);
    notify('User updated');
  };

  const handleToggle = async (user) => {
    const action = user.status === 'active' ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${action} ${user.firstName} ${user.lastName}?`)) return;
    const res = await authFetch(`/users/${user.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) { notify(result.error?.message || 'Failed', 'error'); return; }
    await fetchUsers();
    notify(`${user.firstName} ${user.lastName} ${result.data.status === 'active' ? 'activated' : 'deactivated'}`);
  };

  const stats = {
    active: users.filter(u => u.status === 'active').length,
    byRole: ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {})
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active users</p>
        </div>
        {ROLES.map(r => (
          <div key={r} className={`rounded-xl border p-4 ${roleStyles[r]}`}>
            <p className="text-2xl font-bold">{stats.byRole[r]}</p>
            <p className="text-xs mt-0.5 capitalize opacity-80">{r}</p>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Plus size={16} className="text-blue-600" /> Create New User</h3>
          <UserForm onSave={handleCreate} onCancel={() => setShowForm(false)} isEdit={false} />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Plus size={16} /> Add User
          </button>
        </div>
      )}

      {editingUser && (
        <div className="bg-white rounded-xl border border-amber-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Edit2 size={16} className="text-amber-600" /> Editing: {editingUser.firstName} {editingUser.lastName}</h3>
          <UserForm initial={{ ...editingUser, password: '' }} onSave={handleEdit} onCancel={() => setEditingUser(null)} isEdit={true} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-3 mb-4"><div className="w-10 h-10 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-3.5 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/3" /></div></div>
              <div className="space-y-2"><div className="h-2.5 bg-gray-100 rounded" /><div className="h-2.5 bg-gray-100 rounded w-2/3" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <UserCard key={u.id} user={u} currentUserId={currentUser?.id}
              onEdit={u => { setEditingUser(u); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onToggleStatus={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Settings Page ────────────────────────────────────────── */
const PROFILE_TABS = [
  { id: 'profile',  label: 'Profile Information', active: 'border-blue-500 text-blue-600',   inactive: 'text-gray-500 hover:text-blue-600' },
  { id: 'password', label: 'Change Password',     active: 'border-teal-500 text-teal-600',   inactive: 'text-gray-500 hover:text-teal-600' },
  { id: 'settings', label: 'Settings',            active: 'border-amber-500 text-amber-600', inactive: 'text-gray-500 hover:text-amber-600' },
  { id: 'feedback', label: 'Feedback',            active: 'border-purple-500 text-purple-600', inactive: 'text-gray-500 hover:text-purple-600' },
];

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const tabs = isAdmin
    ? [...PROFILE_TABS, { id: 'users', label: 'User Management', active: 'border-gray-600 text-gray-800', inactive: 'text-gray-500 hover:text-gray-700' }]
    : PROFILE_TABS;

  const [activeTab, setActiveTab] = useState('profile');
  const [toast,     setToast]     = useState(null);

  const notify = (message, type = 'success') => setToast({ message, type });

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile, preferences, and account settings</p>
      </div>

      {/* Color-coded tab bar */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === t.id ? `${t.active} border-b-2` : `border-transparent ${t.inactive}`
              }`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'profile'  && <ProfileInfoTab      notify={notify} />}
        {activeTab === 'password' && <ChangePasswordTab   notify={notify} />}
        {activeTab === 'settings' && <RegionalSettingsTab notify={notify} />}
        {activeTab === 'feedback' && <FeedbackTab         notify={notify} />}
        {activeTab === 'users'    && isAdmin && <UserManagementTab currentUser={currentUser} notify={notify} />}
      </div>
    </div>
  );
}
