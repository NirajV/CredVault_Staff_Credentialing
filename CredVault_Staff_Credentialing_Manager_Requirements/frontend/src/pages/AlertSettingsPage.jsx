import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, Send, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { authFetch } from '../services/api.js';

const CREDENTIAL_TYPES = [
  { value: 'all',           label: 'All Types' },
  { value: 'license',       label: 'License' },
  { value: 'certification', label: 'Certification' },
  { value: 'dea',           label: 'DEA' },
  { value: 'malpractice',   label: 'Malpractice' },
  { value: 'privilege',     label: 'Privilege' },
];

const THRESHOLD_OPTIONS = [7, 14, 30, 60, 90, 120, 180];

const TYPE_LABEL = Object.fromEntries(CREDENTIAL_TYPES.map(t => [t.value, t.label]));

const DEFAULT_FORM = {
  credentialType: 'all',
  thresholds: [7, 30, 60, 90],
  notifyEmail: '',
  notifyRole: '',
};

export default function AlertSettingsPage() {
  const [rules, setRules]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [form, setForm]           = useState(DEFAULT_FORM);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch('/alert-settings');
      const data = await res.json();
      if (data.success) setRules(data.data);
    } catch (err) {
      console.error('Failed to fetch alert rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const toggleThreshold = (day) => {
    setForm(f => ({
      ...f,
      thresholds: f.thresholds.includes(day)
        ? f.thresholds.filter(d => d !== day)
        : [...f.thresholds, day].sort((a, b) => a - b)
    }));
  };

  const handleSaveRule = async () => {
    if (!form.thresholds.length) { showToast('Select at least one reminder threshold', 'error'); return; }
    try {
      setSaving(true);
      const res = await authFetch('/alert-settings', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setRules(prev => [...prev, data.data]);
        setForm(DEFAULT_FORM);
        showToast('Alert rule saved');
      } else {
        showToast('Failed to save rule', 'error');
      }
    } catch (err) {
      showToast('Error saving rule', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      const res = await authFetch(`/alert-settings/${rule.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !rule.enabled })
      });
      const data = await res.json();
      if (data.success) {
        setRules(prev => prev.map(r => r.id === rule.id ? data.data : r));
      }
    } catch (err) {
      showToast('Failed to toggle rule', 'error');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this alert rule?')) return;
    try {
      const res = await authFetch(`/alert-settings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRules(prev => prev.filter(r => r.id !== id));
        showToast('Rule deleted');
      }
    } catch (err) {
      showToast('Failed to delete rule', 'error');
    }
  };

  const handleTestAlert = async (rule) => {
    if (!rule.notifyEmail) {
      showToast('Add a notify email to this rule before testing', 'error');
      return;
    }
    try {
      setTestingId(rule.id);
      const res = await authFetch(`/alert-settings/test/${rule.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) showToast(`Test email sent to ${rule.notifyEmail}`);
      else showToast(data.error?.message || 'Test failed', 'error');
    } catch (err) {
      showToast('Failed to send test', 'error');
    } finally {
      setTestingId(null);
    }
  };

  const handleSendAlerts = async () => {
    try {
      setTriggering(true);
      const res = await authFetch('/alert-settings/send-alerts', { method: 'POST' });
      const data = await res.json();
      if (data.success) showToast(`${data.message} — ${data.sent} email(s) sent`);
      else showToast('Failed to trigger alerts', 'error');
    } catch (err) {
      showToast('Error triggering alerts', 'error');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alert Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure credential expiration reminders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchRules}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={handleSendAlerts}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition font-medium"
          >
            <Send size={15} />
            {triggering ? 'Sending…' : 'Send Alerts Now'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── New Alert Rule Form ── */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={18} className="text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">New Alert Rule</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">Set up when and who gets notified about expirations</p>

          {/* Credential Type */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Credential Type</label>
            <div className="relative">
              <select
                value={form.credentialType}
                onChange={e => setForm(f => ({ ...f, credentialType: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CREDENTIAL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Reminder Thresholds <span className="text-gray-400 font-normal">(days before expiry)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {THRESHOLD_OPTIONS.map(day => {
                const active = form.thresholds.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleThreshold(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      active
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {day}d
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notify Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notify Email</label>
            <input
              type="email"
              placeholder="credentialing@hospital.org"
              value={form.notifyEmail}
              onChange={e => setForm(f => ({ ...f, notifyEmail: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notify Role */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notify Role</label>
            <input
              type="text"
              placeholder="e.g. Credentialing Coordinator"
              value={form.notifyRole}
              onChange={e => setForm(f => ({ ...f, notifyRole: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveRule}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition font-medium text-sm"
            >
              <Plus size={16} />
              {saving ? 'Saving…' : 'Save Rule'}
            </button>
          </div>
        </div>

        {/* ── Active Rules ── */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Active Rules</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--primary)' }}>
            {rules.length} alert rule{rules.length !== 1 ? 's' : ''} configured
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--surface-raised)' }} />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-faint)' }}>
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No alert rules configured yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="flex items-start gap-3 p-4 rounded-xl transition"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className="flex-shrink-0 mt-0.5"
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.enabled
                      ? <ToggleRight size={28} style={{ color: 'var(--primary)' }} />
                      : <ToggleLeft  size={28} style={{ color: 'var(--text-faint)' }} />
                    }
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: rule.enabled ? 'var(--text)' : 'var(--text-faint)' }}>
                      {TYPE_LABEL[rule.credentialType] || rule.credentialType}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(Array.isArray(rule.thresholds) ? rule.thresholds : []).map(d => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                          }}
                        >
                          {d}d
                        </span>
                      ))}
                    </div>
                    {rule.notifyEmail && (
                      <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{rule.notifyEmail}</p>
                    )}
                    {rule.notifyRole && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{rule.notifyRole}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleTestAlert(rule)}
                      disabled={testingId === rule.id}
                      title="Send test alert"
                      className="p-1.5 rounded-lg transition disabled:opacity-50"
                      style={{ color: 'var(--primary)' }}
                    >
                      <Send size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      title="Delete rule"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* How it works note */}
          {rules.length > 0 && (
            <div className="mt-5 p-3 rounded-lg" style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--primary)' }}>How alerts work</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                When a credential matches a threshold, an email is automatically sent to the provider
                and to the configured notify email. Click <strong>Send Alerts Now</strong> to trigger immediately,
                or rules run nightly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
