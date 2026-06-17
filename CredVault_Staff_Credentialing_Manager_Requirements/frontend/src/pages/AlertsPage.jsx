import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bell, Clock, AlertTriangle, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3220/api/v1';

const typeStyles = {
  upcoming: { icon: Clock,         bg: 'bg-amber-50',  text: 'text-amber-600', border: 'border-amber-200' },
  critical: { icon: AlertTriangle, bg: 'bg-red-50',    text: 'text-red-600',   border: 'border-red-200'   },
  expired:  { icon: XCircle,       bg: 'bg-red-100',   text: 'text-red-700',   border: 'border-red-300'   },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AlertsPage({ onNavigateToProvider }) {
  const [alerts, setAlerts]           = useState([]);
  const [counts, setCounts]           = useState({ expired: 0, critical: 0, upcoming: 0 });
  const [isLoading, setIsLoading]     = useState(true);
  const [typeFilter, setTypeFilter]   = useState('all');
  const [itemFilter, setItemFilter]   = useState('all');
  const [acknowledged, setAcknowledged] = useState(new Set());

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/alerts`);
      const result = await res.json();
      if (result.success) {
        setAlerts(result.data);
        setCounts(result.counts);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleAcknowledge = (alertId) => {
    setAcknowledged(prev => new Set([...prev, alertId]));
  };

  const filtered = useMemo(() => {
    return alerts
      .filter(a => typeFilter === 'all' || a.alert_type === typeFilter)
      .filter(a => itemFilter === 'all' || a.item_type === itemFilter)
      .sort((a, b) => {
        const order = { expired: 0, critical: 1, upcoming: 2 };
        return (order[a.alert_type] ?? 3) - (order[b.alert_type] ?? 3);
      });
  }, [alerts, typeFilter, itemFilter]);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">{alerts.length} active alerts</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary Buttons */}
      <div className="flex gap-3 flex-wrap">
        {[
          { type: 'expired',  label: 'Expired',  count: counts.expired  },
          { type: 'critical', label: 'Critical', count: counts.critical },
          { type: 'upcoming', label: 'Upcoming', count: counts.upcoming },
        ].map(({ type, label, count }) => {
          const style = typeStyles[type];
          const Icon  = style.icon;
          const active = typeFilter === type;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(active ? 'all' : type)}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium',
                active
                  ? `${style.bg} ${style.text} ${style.border}`
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              ].join(' ')}
            >
              <Icon size={16} />
              {label}
              <span className={[
                'ml-1 text-xs font-bold px-2 py-0.5 rounded-full',
                active ? 'bg-white/60' : 'bg-gray-100 text-gray-600'
              ].join(' ')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Filter */}
      <div className="flex gap-3">
        <div className="relative">
          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="appearance-none w-44 px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="license">Licenses</option>
            <option value="certification">Certifications</option>
            <option value="dea">DEA</option>
            <option value="malpractice">Malpractice</option>
            <option value="privilege">Privileges</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Alert List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => {
            const style    = typeStyles[alert.alert_type] || typeStyles.upcoming;
            const Icon     = style.icon;
            const days     = alert.days_until_expiry;
            const dayLabel = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`;
            const isAcked  = acknowledged.has(alert.id);

            return (
              <div
                key={alert.id}
                className={[
                  'flex items-center gap-4 p-4 rounded-xl border transition-all',
                  isAcked
                    ? 'bg-gray-50 opacity-60 border-gray-100'
                    : `bg-white ${style.border}`
                ].join(' ')}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                  <Icon size={20} className={style.text} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => !isAcked && onNavigateToProvider?.(alert.provider_id)}
                      className="text-sm font-semibold text-gray-900 hover:underline hover:text-blue-600 transition"
                    >
                      {alert.provider_name || 'Provider'}
                    </button>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 capitalize">
                      {alert.item_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {alert.item_name || alert.item_type}
                    {' '}— Expires {formatDate(alert.expiry_date)}
                  </p>
                </div>

                {/* Day Badge */}
                <span className={[
                  'text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0',
                  days < 0   ? 'bg-red-100 text-red-700'     :
                  days <= 30 ? 'bg-red-50 text-red-600'      :
                               'bg-amber-50 text-amber-600'
                ].join(' ')}>
                  {dayLabel}
                </span>

                {/* Ack Button */}
                {!isAcked && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-200 transition flex-shrink-0"
                  >
                    <CheckCircle2 size={14} />
                    Ack
                  </button>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No alerts match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
