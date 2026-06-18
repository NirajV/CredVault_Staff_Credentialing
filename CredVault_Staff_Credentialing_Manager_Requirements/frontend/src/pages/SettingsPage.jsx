import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Edit2, Save, X, Power,
  ShieldCheck, Mail, Phone, Building2,
  AlertCircle, CheckCircle2, Key, Eye, EyeOff
} from 'lucide-react';
import { authFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function UserForm({ initial, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState(initial || {
    firstName: '', lastName: '', email: '', password: '', role: 'coordinator', department: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email) { setError('First name, last name and email are required'); return; }
    if (!isEdit && (!form.password || form.password.length < 8)) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
          <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
            placeholder="Jane" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
          <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
            placeholder="Doe" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          disabled={isEdit} placeholder="jane@credvault.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">{roleDesc[form.role]}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
          <input value={form.department} onChange={e => set('department', e.target.value)}
            placeholder="Credentialing" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <input value={form.phone} onChange={e => set('phone', e.target.value)}
          placeholder="(555) 000-0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <PasswordField
        label={isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}
        value={form.password || ''}
        onChange={v => set('password', v)}
      />

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> : <Save size={15} />}
          {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User')}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
          <X size={15} />
        </button>
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
        {/* Avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
            isInactive ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-blue-700'
          }`}>
            {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {user.firstName} {user.lastName}
              {isCurrentUser && <span className="ml-1.5 text-xs text-blue-500 font-normal">(you)</span>}
            </p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border capitalize mt-0.5 ${roleStyles[user.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(user)} title="Edit user"
            className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition">
            <Edit2 size={15} />
          </button>
          {!isCurrentUser && (
            <button onClick={() => onToggleStatus(user)} title={isInactive ? 'Activate' : 'Deactivate'}
              className={`p-1.5 rounded-lg transition ${isInactive ? 'hover:bg-green-50 text-gray-400 hover:text-green-600' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
              <Power size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Info rows */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.department && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Building2 size={12} className="text-gray-400 flex-shrink-0" />
            <span>{user.department}</span>
          </div>
        )}
        {user.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} className="text-gray-400 flex-shrink-0" />
            <span>{user.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-100">
          <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
          {isInactive && <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">Inactive</span>}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [activeTab,  setActiveTab]  = useState('users');
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast,      setToast]      = useState(null);

  const notify = (message, type = 'success') => setToast({ message, type });

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const res    = await authFetch('/users');
      const result = await res.json();
      if (result.success) setUsers(result.data);
    } catch (err) {
      notify('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (form) => {
    const res = await authFetch('/users', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error?.message || 'Failed to create user');
    await fetchUsers();
    setShowForm(false);
    notify(`${form.firstName} ${form.lastName} created successfully`);
  };

  const handleEdit = async (form) => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    const res = await authFetch(`/users/${editingUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error?.message || 'Failed to update user');
    await fetchUsers();
    setEditingUser(null);
    notify('User updated successfully');
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === 'active' ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${action} ${user.firstName} ${user.lastName}?`)) return;
    const res = await authFetch(`/users/${user.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) { notify(result.error?.message || 'Failed to update status', 'error'); return; }
    await fetchUsers();
    notify(`${user.firstName} ${user.lastName} ${result.data.status === 'active' ? 'activated' : 'deactivated'}`);
  };

  const stats = {
    total:  users.length,
    active: users.filter(u => u.status === 'active').length,
    byRole: ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {})
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage system settings and user accounts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <Users size={15} /> User Management
        </button>
        <button onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <ShieldCheck size={15} /> My Profile
        </button>
      </div>

      {/* ── User Management Tab ── */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {!isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <ShieldCheck size={32} className="mx-auto text-amber-400 mb-2" />
              <p className="font-semibold text-amber-900">Admin access required</p>
              <p className="text-amber-700 text-sm mt-1">Only administrators can manage user accounts.</p>
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4 col-span-1">
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

              {/* Add user / inline form */}
              {showForm ? (
                <div className="bg-white rounded-xl border border-blue-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-blue-600" /> Create New User
                  </h3>
                  <UserForm onSave={handleCreate} onCancel={() => setShowForm(false)} isEdit={false} />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stats.total} user{stats.total !== 1 ? 's' : ''} total</p>
                  <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    <Plus size={16} /> Add User
                  </button>
                </div>
              )}

              {/* Edit form */}
              {editingUser && (
                <div className="bg-white rounded-xl border border-amber-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Edit2 size={16} className="text-amber-600" />
                    Editing: {editingUser.firstName} {editingUser.lastName}
                  </h3>
                  <UserForm
                    initial={{ ...editingUser, password: '' }}
                    onSave={handleEdit}
                    onCancel={() => setEditingUser(null)}
                    isEdit={true}
                  />
                </div>
              )}

              {/* User cards grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 bg-gray-100 rounded" />
                        <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map(u => (
                    <UserCard
                      key={u.id}
                      user={u}
                      currentUserId={currentUser?.id}
                      onEdit={(u) => { setEditingUser(u); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── My Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="max-w-xl">
          <ProfileTab currentUser={currentUser} onUpdated={() => notify('Profile updated')} />
        </div>
      )}
    </div>
  );
}

function ProfileTab({ currentUser, onUpdated }) {
  const [form, setForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName:  currentUser?.lastName  || '',
    phone:     currentUser?.phone     || '',
    department: currentUser?.department || '',
    password:  '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password && form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const payload = { firstName: form.firstName, lastName: form.lastName, phone: form.phone, department: form.department };
      if (form.password) payload.password = form.password;
      const res = await authFetch(`/users/${currentUser.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error?.message);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
          {`${currentUser?.firstName?.[0] ?? ''}${currentUser?.lastName?.[0] ?? ''}`.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
          <p className="text-sm text-gray-500">{currentUser?.email}</p>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border capitalize mt-1 ${roleStyles[currentUser?.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {currentUser?.role}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
            <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
            <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input value={currentUser?.email} disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <input value={form.department} onChange={e => set('department', e.target.value)}
              placeholder="e.g. Credentialing"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Key size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Password</p>
          </div>
          <PasswordField label="New Password (leave blank to keep current)" value={form.password} onChange={v => set('password', v)} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? <span className="animate-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> : <Save size={15} />}
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
