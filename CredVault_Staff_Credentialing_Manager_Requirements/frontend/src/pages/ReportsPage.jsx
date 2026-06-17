import { useState, useMemo, useEffect, useCallback } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3220/api/v1';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status) => {
  const map = {
    expired:  'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-red-50 text-red-600 border-red-100',
    upcoming: 'bg-amber-50 text-amber-600 border-amber-200',
    active:   'bg-green-50 text-green-700 border-green-200',
    unknown:  'bg-gray-100 text-gray-500 border-gray-200',
  };
  return map[status] || map.unknown;
};

const getComplianceColor = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-700';
  if (score >= 70) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export default function ReportsPage() {
  const [activeTab,       setActiveTab]       = useState('calendar');
  const [calendarData,    setCalendarData]    = useState([]);
  const [complianceData,  setComplianceData]  = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [loadingCompliance, setLoadingCompliance] = useState(true);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoadingCalendar(true);
      const res = await fetch(`${API_URL}/reports/calendar`);
      const result = await res.json();
      if (result.success) setCalendarData(result.data);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoadingCompliance(true);
      const res = await fetch(`${API_URL}/reports/compliance`);
      const result = await res.json();
      if (result.success) setComplianceData(result.data);
    } catch (err) {
      console.error('Failed to fetch compliance:', err);
    } finally {
      setLoadingCompliance(false);
    }
  }, []);

  useEffect(() => { fetchCalendar();   }, [fetchCalendar]);
  useEffect(() => { fetchCompliance(); }, [fetchCompliance]);

  const exportCSV = () => {
    const headers = ['Provider', 'NPI', 'Specialty', 'Department', 'Compliance %', 'Licenses', 'Certifications', 'DEA', 'Malpractice', 'Privileges', 'Expired'];
    const rows = complianceData.map(p => [
      p.name, p.npi, p.specialty, p.department,
      p.compliance, p.licenseCount, p.certCount,
      p.deaCount, p.malCount, p.privCount, p.expiredCount
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `credvault-compliance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Compliance reports and expiration calendar</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={[
              'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition',
              activeTab === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <Calendar size={14} />
            Expiration Calendar
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={[
              'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition',
              activeTab === 'compliance'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <FileText size={14} />
            Compliance Summary
          </button>
        </div>

        {/* ── Expiration Calendar Tab ── */}
        {activeTab === 'calendar' && (
          loadingCalendar ? <TableSkeleton cols={5} /> : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Expiry Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarData.slice(0, 50).map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.providerName}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {calendarData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No expiration data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {calendarData.length > 50 && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                  Showing 50 of {calendarData.length} items (sorted by expiry date)
                </div>
              )}
            </div>
          )
        )}

        {/* ── Compliance Summary Tab ── */}
        {activeTab === 'compliance' && (
          loadingCompliance ? <TableSkeleton cols={7} /> : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">NPI</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Specialty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Licenses</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Certifications</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceData.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{p.npi}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.specialty}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{p.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.licenseCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.certCount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${getComplianceColor(p.compliance)}`}>
                          {p.compliance}%
                          {p.expiredCount > 0 && (
                            <span className="text-red-500">· {p.expiredCount} expired</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {complianceData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No provider data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                <span>{complianceData.length} providers · sorted by compliance (lowest first)</span>
                <button onClick={exportCSV} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Download size={12} /> Download CSV
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TableSkeleton({ cols }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded animate-pulse flex-1" />
        ))}
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-gray-100 flex gap-4">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-3 bg-gray-100 rounded animate-pulse flex-1" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
