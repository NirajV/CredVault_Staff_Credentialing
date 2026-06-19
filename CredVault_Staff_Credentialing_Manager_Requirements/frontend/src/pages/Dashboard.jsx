import { authFetch, API_URL } from '../services/api.js';
import { useState, useEffect, useCallback } from 'react';
import {
  Users, AlertTriangle, CheckCircle, ShieldAlert,
  FileText, Clock, TrendingUp, Activity,
  ArrowRight, RefreshCw
} from 'lucide-react';


const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function Dashboard({ onNavigate, onNavigateToProvider }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(`/dashboard/summary`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  if (loading) return <DashboardSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle size={40} className="text-red-400" />
      <p className="text-gray-600">{error}</p>
      <button onClick={fetchSummary} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
        Retry
      </button>
    </div>
  );

  const cards = [
    {
      title: 'Total Providers',
      value: data.totalProviders,
      sub: `${data.activeProviders} active`,
      icon: Users,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
      trend: null,
      onClick: () => onNavigate?.('providers'),
    },
    {
      title: 'Expiring This Month',
      value: data.expiringThisMonth,
      sub: `${data.expiringIn90} within 90 days`,
      icon: Clock,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
      trend: data.expiringThisMonth > 5 ? 'high' : null,
      onClick: () => onNavigate?.('alerts'),
    },
    {
      title: 'Expired Credentials',
      value: data.expiredCount,
      sub: 'Require immediate action',
      icon: ShieldAlert,
      bg: 'bg-red-50',
      iconColor: 'text-red-600',
      border: 'border-red-100',
      trend: data.expiredCount > 0 ? 'critical' : null,
      onClick: () => onNavigate?.('alerts'),
    },
    {
      title: 'Compliance Rate',
      value: `${data.compliantPercentage}%`,
      sub: `${data.compliantCount} of ${data.totalProviders} providers`,
      icon: CheckCircle,
      bg: data.compliantPercentage >= 90 ? 'bg-green-50' : data.compliantPercentage >= 70 ? 'bg-amber-50' : 'bg-red-50',
      iconColor: data.compliantPercentage >= 90 ? 'text-green-600' : data.compliantPercentage >= 70 ? 'text-amber-600' : 'text-red-600',
      border: data.compliantPercentage >= 90 ? 'border-green-100' : data.compliantPercentage >= 70 ? 'border-amber-100' : 'border-red-100',
      trend: null,
      onClick: () => onNavigate?.('reports'),
    },
    {
      title: 'Avg Compliance Score',
      value: `${data.avgComplianceScore}%`,
      sub: 'Across all providers',
      icon: TrendingUp,
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      border: 'border-purple-100',
      trend: null,
      onClick: () => onNavigate?.('reports'),
    },
    {
      title: 'Total Credentials',
      value: data.totalCredentials,
      sub: 'Licenses, certs, DEA & more',
      icon: FileText,
      bg: 'bg-gray-50',
      iconColor: 'text-gray-600',
      border: 'border-gray-200',
      trend: null,
      onClick: () => onNavigate?.('providers'),
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lastUpdated && `Last updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={card.onClick}
            className={`bg-white rounded-xl border ${card.border} p-5 text-left hover:shadow-md transition-all group`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-3xl font-bold text-gray-900 leading-none">{card.value}</p>
                  {card.trend === 'critical' && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded mb-0.5">Action needed</span>
                  )}
                  {card.trend === 'high' && (
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mb-0.5">Review</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} flex-shrink-0 ml-3`}>
                <card.icon size={22} className={card.iconColor} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 group-hover:text-blue-500 transition">
              View details <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Urgent Alerts Feed */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-red-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Urgent Alerts</h2>
            </div>
            <button
              onClick={() => onNavigate?.('alerts')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {data.urgentAlerts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle size={28} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm text-gray-500">No urgent alerts</p>
              </div>
            ) : (
              data.urgentAlerts.map((alert, i) => {
                const isExpired = alert.status === 'expired';
                const isCritical = alert.status === 'critical';
                return (
                  <button
                    key={i}
                    onClick={() => alert.providerId && onNavigateToProvider?.(alert.providerId)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpired ? 'bg-red-100' : 'bg-amber-50'}`}>
                      {isExpired
                        ? <ShieldAlert size={15} className="text-red-600" />
                        : <Clock size={15} className="text-amber-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition">
                        {alert.providerName}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{alert.credType} · {formatDate(alert.expiryDate)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isExpired  ? 'bg-red-100 text-red-700' :
                      isCritical ? 'bg-amber-50 text-amber-700' :
                                   'bg-gray-100 text-gray-600'
                    }`}>
                      {alert.daysUntilExpiry < 0
                        ? `${Math.abs(alert.daysUntilExpiry)}d overdue`
                        : alert.daysUntilExpiry === 0 ? 'Today'
                        : `${alert.daysUntilExpiry}d`}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Provider Status + Credential Breakdown */}
        <div className="space-y-5">

          {/* Provider Status Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-4">Provider Status</h2>
            <div className="space-y-3">
              {Object.entries(data.byStatus).map(([status, count]) => {
                if (!count) return null;
                const pct = data.totalProviders > 0 ? Math.round((count / data.totalProviders) * 100) : 0;
                const colors = {
                  active:     { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  },
                  inactive:   { bar: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-50'   },
                  suspended:  { bar: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50'  },
                  terminated: { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
                };
                const c = colors[status] || colors.inactive;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{status}</span>
                      <span className="text-xs text-gray-500">{count} <span className="text-gray-400">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credential Type Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-4">Credentials on File</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.byCredentialType).map(([type, count]) => {
                const labels = {
                  license: 'Licenses', certification: 'Certifications',
                  dea: 'DEA', malpractice: 'Malpractice', privilege: 'Privileges'
                };
                const colors = {
                  license: 'bg-blue-50 text-blue-700', certification: 'bg-purple-50 text-purple-700',
                  dea: 'bg-green-50 text-green-700', malpractice: 'bg-amber-50 text-amber-700',
                  privilege: 'bg-pink-50 text-pink-700'
                };
                return (
                  <div key={type} className={`rounded-lg p-3 ${colors[type] || 'bg-gray-50 text-gray-700'}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs mt-0.5 opacity-80">{labels[type]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Breakdown */}
      {data.bySpecialty.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Providers by Specialty</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.bySpecialty.map(({ specialty, count }) => (
              <button
                key={specialty}
                onClick={() => onNavigate?.('providers')}
                className="flex flex-col items-center p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition text-center group"
              >
                <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700">{count}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight group-hover:text-blue-600">{specialty}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Add New Provider',    desc: 'Register a healthcare provider',      page: 'providers', color: 'blue'  },
            { label: 'Review Alerts',        desc: `${data.expiredCount + data.expiringThisMonth} credentials need attention`, page: 'alerts',    color: 'red'   },
            { label: 'Compliance Report',    desc: `${data.compliantPercentage}% org-wide compliance`, page: 'reports',   color: 'green' },
          ].map(({ label, desc, page, color }) => (
            <button
              key={label}
              onClick={() => onNavigate?.(page)}
              className={`p-4 border-2 border-dashed rounded-lg text-left transition hover:bg-${color}-50 border-${color}-200 group`}
            >
              <p className={`font-semibold text-gray-900 group-hover:text-${color}-700`}>{label}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-7 bg-gray-200 rounded w-1/3" />
                <div className="h-2 bg-gray-100 rounded w-2/3" />
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 h-48" />
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 h-28" />
          <div className="bg-white rounded-xl border border-gray-200 h-28" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
