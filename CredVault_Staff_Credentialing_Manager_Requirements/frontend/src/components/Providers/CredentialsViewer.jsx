import { authFetch } from '../../services/api.js';
import { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, X, Plus } from 'lucide-react';


const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const isExpired = (expiryDate) => expiryDate && new Date(expiryDate) < TODAY;

const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate) - TODAY;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getEffectiveStatus = (storedStatus, expiryDate) => {
  if (isExpired(expiryDate)) return 'expired';
  return storedStatus;
};

function StatusBadge({ status, expiryDate }) {
  const effective = getEffectiveStatus(status, expiryDate);
  const days = getDaysUntilExpiry(expiryDate);

  const colorMap = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    suspended: 'bg-amber-100 text-amber-800',
    revoked: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    lapsed: 'bg-red-100 text-red-800',
  };

  const label = effective.charAt(0).toUpperCase() + effective.slice(1);
  const expiringWarning = !isExpired(expiryDate) && days !== null && days <= 30;

  return (
    <div className="flex flex-col gap-0.5">
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorMap[effective] || 'bg-gray-100 text-gray-700'}`}>
        {label}
      </span>
      {isExpired(expiryDate) && (
        <span className="text-xs text-red-500 font-medium">
          Expired {Math.abs(days)}d ago
        </span>
      )}
      {expiringWarning && (
        <span className="text-xs text-amber-600 font-medium">
          Expires in {days}d
        </span>
      )}
    </div>
  );
}

function CredentialsViewer({ providerId, providerName, onProviderUpdate }) {
  const [provider, setProvider] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('licenses');
  const [editingProvider, setEditingProvider] = useState(false);
  const [editData, setEditData] = useState({});
  const [editingCredential, setEditingCredential] = useState(null);
  const [editingCredentialData, setEditingCredentialData] = useState({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    fetchProvider();
    fetchCredentials();
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const response = await authFetch(`/providers/${providerId}`);
      const result = await response.json();
      setProvider(result.data);
    } catch (error) {
      console.error('Failed to fetch provider:', error);
    }
  };

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/credentials/provider/${providerId}`);
      const result = await response.json();
      setCredentials(result.data);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    try {
      const response = await authFetch(`/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        await fetchProvider();
        setEditingProvider(false);
        if (onProviderUpdate) onProviderUpdate();
      }
    } catch (error) {
      console.error('Failed to save provider:', error);
    }
  };

  const getEndpoint = (type) => {
    const endpoints = {
      licenses: 'licenses',
      certifications: 'certifications',
      deas: 'dea',
      malpractices: 'malpractice',
      privileges: 'privileges',
      tasks: 'tasks'
    };
    return endpoints[type] || type;
  };

  const handleDeleteCredential = async (credentialType, id) => {
    if (!window.confirm('Delete this credential?')) return;
    try {
      const endpoint = getEndpoint(credentialType);
      await authFetch(`/credentials/${endpoint}/${id}`, { method: 'DELETE' });
      await fetchCredentials();
    } catch (error) {
      console.error('Failed to delete credential:', error);
    }
  };

  const handleEditCredential = (type, credential) => {
    setEditingCredential({ type, id: credential.id });
    setEditingCredentialData({ ...credential });
  };

  const handleSaveCredential = async () => {
    if (!editingCredential) return;

    if (isCreatingNew) {
      await handleCreateCredential();
    } else {
      try {
        const endpoint = getEndpoint(editingCredential.type);
        const response = await authFetch(`/credentials/${endpoint}/${editingCredential.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCredentialData)
        });

        if (response.ok) {
          await fetchCredentials();
          setEditingCredential(null);
          setEditingCredentialData({});
          setIsCreatingNew(false);
        } else {
          const error = await response.json();
          alert('Error updating credential: ' + (error.error?.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Failed to save credential:', error);
        alert('Error updating credential: ' + error.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCredential(null);
    setEditingCredentialData({});
    setIsCreatingNew(false);
  };

  const getDefaultCredentialData = (type) => {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const defaults = {
      licenses: { state: '', licenseNumber: '', licenseType: 'MD', issueDate: today, expiryDate: nextYear, status: 'active', providerId },
      certifications: { certName: '', certifyingBody: '', certificateNumber: '', issueDate: today, expiryDate: nextYear, status: 'active', providerId },
      deas: { deaNumber: '', state: '', issueDate: today, expiryDate: nextYear, schedulesAuthorized: '1,2,3,4,5', status: 'active', providerId },
      malpractices: { carrier: '', policyNumber: '', coveragePerClaim: 1000000, effectiveDate: today, expiryDate: nextYear, tailCoverage: true, status: 'active', providerId },
      privileges: { privilegeType: 'clinical', approvalStatus: 'approved', grantedDate: today, expiryDate: nextYear, restrictions: '', providerId },
      tasks: { title: '', taskType: 'verification', dueDate: nextYear, priority: 'medium', status: 'pending', providerId }
    };
    return defaults[type] || {};
  };

  const handleAddCredential = (type) => {
    setEditingCredential({ type, id: null });
    setEditingCredentialData(getDefaultCredentialData(type));
    setIsCreatingNew(true);
  };

  const handleCreateCredential = async () => {
    if (!editingCredential) return;
    try {
      const endpoint = getEndpoint(editingCredential.type);
      const response = await authFetch(`/credentials/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCredentialData)
      });

      if (response.ok) {
        await fetchCredentials();
        setEditingCredential(null);
        setEditingCredentialData({});
        setIsCreatingNew(false);
      } else {
        const error = await response.json();
        alert('Error creating credential: ' + (error.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create credential:', error);
      alert('Error creating credential: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><p>Loading provider details...</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Provider Header */}
      {provider && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-sm p-8">
          {editingProvider ? (
            <ProviderEditForm
              provider={provider}
              editData={editData}
              setEditData={setEditData}
              onSave={handleSaveProvider}
              onCancel={() => setEditingProvider(false)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold">{provider.firstName} {provider.lastName}</h1>
                  <p className="text-blue-100 text-lg mt-1">{provider.specialty}</p>
                  {provider.subSpecialty && (
                    <p className="text-blue-200 text-sm">{provider.subSpecialty}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditData(provider);
                    setEditingProvider(true);
                  }}
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  <Edit2 size={18} />
                  Edit Details
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-blue-400">
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">NPI</p>
                  <p className="text-white text-lg font-mono mt-1">{provider.npi}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Status</p>
                  <p className={`text-lg font-medium mt-1 ${provider.status === 'active' ? 'text-green-300' : 'text-red-300'}`}>
                    {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Email</p>
                  <p className="text-white text-sm mt-1 break-all">{provider.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Phone</p>
                  <p className="text-white text-sm mt-1">{provider.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Employment Type</p>
                  <p className="text-white text-sm mt-1 capitalize">{provider.employmentType?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Compliance Score</p>
                  <p className="text-white text-lg font-bold mt-1">{provider.complianceScore}%</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Hire Date</p>
                  <p className="text-white text-sm mt-1">{provider.hireDate ? new Date(provider.hireDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium uppercase">Credentials Count</p>
                  <p className="text-white text-lg font-bold mt-1">{credentials ? Object.values(credentials).flat().length : 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Credentials Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Credentials</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'licenses',       label: 'Licenses',       items: credentials?.licenses },
            { key: 'certifications', label: 'Certifications', items: credentials?.certifications },
            { key: 'deas',           label: 'DEA',            items: credentials?.deas },
            { key: 'malpractices',   label: 'Malpractice',    items: credentials?.malpractices },
            { key: 'privileges',     label: 'Privileges',     items: credentials?.privileges },
            { key: 'tasks',          label: 'Tasks',          items: credentials?.tasks, isDueDateCheck: true },
          ].map(({ key, label, items, isDueDateCheck }) => {
            const expiredCount = items?.filter(i =>
              isDueDateCheck
                ? (i.status !== 'completed' && isExpired(i.dueDate))
                : isExpired(i.expiryDate)
            ).length || 0;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'
                }`}
              >
                {label}
                <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-1.5">{items?.length || 0}</span>
                {expiredCount > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs rounded-full px-1.5 font-bold">{expiredCount} expired</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'licenses' && (
            <>
              {editingCredential?.type === 'licenses' ? (
                <LicenseEditForm
                  data={editingCredentialData}
                  setData={setEditingCredentialData}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelEdit}
                  isCreatingNew={isCreatingNew}
                />
              ) : (
                <>
                  <button
                    onClick={() => handleAddCredential('licenses')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
                  >
                    <Plus size={18} />
                    Add License
                  </button>
                  <CredentialTable
                    title="Licenses"
                    headers={['State', 'License #', 'Type', 'Issued', 'Expires', 'Status', 'Actions']}
                    expiryDates={credentials?.licenses?.map(l => l.expiryDate) || []}
                    rows={credentials?.licenses?.map(l => [
                      l.state,
                      l.licenseNumber,
                      l.licenseType,
                      new Date(l.issueDate).toLocaleDateString(),
                      <span key="exp" className={isExpired(l.expiryDate) ? 'text-red-600 font-semibold' : ''}>{new Date(l.expiryDate).toLocaleDateString()}</span>,
                      <StatusBadge key="status" status={l.status} expiryDate={l.expiryDate} />,
                      <div key="actions" className="flex gap-1">
                        <button onClick={() => handleEditCredential('licenses', l)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCredential('licenses', l.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ]) || []}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'certifications' && (
            <>
              {editingCredential?.type === 'certifications' ? (
                <CertificationEditForm
                  data={editingCredentialData}
                  setData={setEditingCredentialData}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelEdit}
                  isCreatingNew={isCreatingNew}
                />
              ) : (
                <>
                  <button
                    onClick={() => handleAddCredential('certifications')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
                  >
                    <Plus size={18} />
                    Add Certification
                  </button>
                  <CredentialTable
                    title="Certifications"
                    headers={['Name', 'Body', 'Certificate #', 'Issued', 'Expires', 'Status', 'Actions']}
                    expiryDates={credentials?.certifications?.map(c => c.expiryDate) || []}
                    rows={credentials?.certifications?.map(c => [
                      c.certName,
                      c.certifyingBody,
                      c.certificateNumber,
                      new Date(c.issueDate).toLocaleDateString(),
                      <span key="exp" className={isExpired(c.expiryDate) ? 'text-red-600 font-semibold' : ''}>{new Date(c.expiryDate).toLocaleDateString()}</span>,
                      <StatusBadge key="status" status={c.status} expiryDate={c.expiryDate} />,
                      <div key="actions" className="flex gap-1">
                        <button onClick={() => handleEditCredential('certifications', c)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCredential('certifications', c.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ]) || []}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'deas' && (
            <>
              {editingCredential?.type === 'deas' ? (
                <DeaEditForm
                  data={editingCredentialData}
                  setData={setEditingCredentialData}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelEdit}
                  isCreatingNew={isCreatingNew}
                />
              ) : (
                <>
                  <button
                    onClick={() => handleAddCredential('deas')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
                  >
                    <Plus size={18} />
                    Add DEA Registration
                  </button>
                  <CredentialTable
                    title="DEA Registrations"
                    headers={['DEA Number', 'State', 'Issued', 'Expires', 'Schedules', 'Status', 'Actions']}
                    expiryDates={credentials?.deas?.map(d => d.expiryDate) || []}
                    rows={credentials?.deas?.map(d => [
                      d.deaNumber,
                      d.state,
                      d.issueDate ? new Date(d.issueDate).toLocaleDateString() : 'N/A',
                      <span key="exp" className={isExpired(d.expiryDate) ? 'text-red-600 font-semibold' : ''}>{new Date(d.expiryDate).toLocaleDateString()}</span>,
                      d.schedulesAuthorized,
                      <StatusBadge key="status" status={d.status} expiryDate={d.expiryDate} />,
                      <div key="actions" className="flex gap-1">
                        <button onClick={() => handleEditCredential('deas', d)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCredential('deas', d.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ]) || []}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'malpractices' && (
            <>
              {editingCredential?.type === 'malpractices' ? (
                <MalpracticeEditForm
                  data={editingCredentialData}
                  setData={setEditingCredentialData}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelEdit}
                  isCreatingNew={isCreatingNew}
                />
              ) : (
                <>
                  <button
                    onClick={() => handleAddCredential('malpractices')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
                  >
                    <Plus size={18} />
                    Add Malpractice Insurance
                  </button>
                  <CredentialTable
                    title="Malpractice Insurance"
                    headers={['Carrier', 'Policy #', 'Coverage Per Claim', 'Effective', 'Expires', 'Status', 'Tail', 'Actions']}
                    expiryDates={credentials?.malpractices?.map(m => m.expiryDate) || []}
                    rows={credentials?.malpractices?.map(m => [
                      m.carrier,
                      m.policyNumber,
                      `$${m.coveragePerClaim?.toLocaleString()}`,
                      new Date(m.effectiveDate).toLocaleDateString(),
                      <span key="exp" className={isExpired(m.expiryDate) ? 'text-red-600 font-semibold' : ''}>{new Date(m.expiryDate).toLocaleDateString()}</span>,
                      <StatusBadge key="status" status={m.status} expiryDate={m.expiryDate} />,
                      m.tailCoverage ? '✓ Yes' : 'No',
                      <div key="actions" className="flex gap-1">
                        <button onClick={() => handleEditCredential('malpractices', m)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCredential('malpractices', m.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ]) || []}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'privileges' && (
            <>
              {editingCredential?.type === 'privileges' ? (
                <PrivilegeEditForm
                  data={editingCredentialData}
                  setData={setEditingCredentialData}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelEdit}
                  isCreatingNew={isCreatingNew}
                />
              ) : (
                <>
                  <button
                    onClick={() => handleAddCredential('privileges')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
                  >
                    <Plus size={18} />
                    Add Privilege
                  </button>
                  <CredentialTable
                    title="Privileges"
                    headers={['Type', 'Granted', 'Expires', 'Status', 'Restrictions', 'Actions']}
                    expiryDates={credentials?.privileges?.map(p => p.expiryDate) || []}
                    rows={credentials?.privileges?.map(p => [
                      p.privilegeType,
                      new Date(p.grantedDate).toLocaleDateString(),
                      <span key="exp" className={isExpired(p.expiryDate) ? 'text-red-600 font-semibold' : ''}>{new Date(p.expiryDate).toLocaleDateString()}</span>,
                      <StatusBadge key="status" status={p.approvalStatus} expiryDate={p.expiryDate} />,
                      <span key="restr" className="text-xs" title={p.restrictions}>{p.restrictions || 'None'}</span>,
                      <div key="actions" className="flex gap-1">
                        <button onClick={() => handleEditCredential('privileges', p)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCredential('privileges', p.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ]) || []}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'tasks' && (
            <>
              {editingCredential?.type === 'tasks' ? (
                <TaskEditForm
                  data={editingCredentialData}
                  setData={setEditingCredentialData}
                  onSave={handleSaveCredential}
                  onCancel={handleCancelEdit}
                  isCreatingNew={isCreatingNew}
                />
              ) : (
                <>
                  <button
                    onClick={() => handleAddCredential('tasks')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium mb-4"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                  <CredentialTable
                    title="Tasks"
                    headers={['Title', 'Type', 'Due Date', 'Priority', 'Status', 'Actions']}
                    expiryDates={credentials?.tasks?.map(t => t.status !== 'completed' ? t.dueDate : null) || []}
                    rows={credentials?.tasks?.map(t => {
                      const overdue = t.status !== 'completed' && isExpired(t.dueDate);
                      return [
                      t.title,
                      t.taskType?.replace(/_/g, ' '),
                      <span key="due" className={overdue ? 'text-red-600 font-semibold' : ''}>{new Date(t.dueDate).toLocaleDateString()}{overdue ? ' ⚠' : ''}</span>,
                      <span key="priority" className={`px-2 py-0.5 rounded text-xs font-medium ${t.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{t.priority}</span>,
                      <span key="taskstatus" className={`px-2 py-0.5 rounded text-xs font-medium ${t.status === 'completed' ? 'bg-green-100 text-green-800' : overdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{overdue && t.status !== 'completed' ? 'overdue' : t.status}</span>,
                      <div key="actions" className="flex gap-1">
                        <button onClick={() => handleEditCredential('tasks', t)} className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCredential('tasks', t.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ];}) || []}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CredentialTable({ title, headers, rows, expiryDates = [] }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, i) => (
            <th key={i} className="px-4 py-2 text-left font-semibold text-gray-700">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="px-4 py-3 text-center text-gray-500">No records found</td></tr>
        ) : (
          rows.map((row, i) => {
            const expired = expiryDates[i] && isExpired(expiryDates[i]);
            return (
              <tr key={i} className={`border-t border-gray-200 transition ${expired ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-sm">{cell}</td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

function ProviderEditForm({ provider, editData, setEditData, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">First Name</label>
          <input
            type="text"
            value={editData.firstName || ''}
            onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Last Name</label>
          <input
            type="text"
            value={editData.lastName || ''}
            onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Specialty</label>
          <input
            type="text"
            value={editData.specialty || ''}
            onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Sub-Specialty</label>
          <input
            type="text"
            value={editData.subSpecialty || ''}
            onChange={(e) => setEditData({ ...editData, subSpecialty: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Email</label>
          <input
            type="email"
            value={editData.email || ''}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Phone</label>
          <input
            type="tel"
            value={editData.phone || ''}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Status</label>
          <select
            value={editData.status || 'active'}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-100 mb-1">Employment Type</label>
          <select
            value={editData.employmentType || 'full_time'}
            onChange={(e) => setEditData({ ...editData, employmentType: e.target.value })}
            className="w-full px-3 py-2 border border-blue-300 rounded bg-blue-50 text-gray-900"
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contractor">Contractor</option>
            <option value="locum">Locum</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
        >
          <Save size={18} />
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-white rounded-lg hover:bg-blue-700 transition font-medium text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CertificationEditForm({ data, setData, onSave, onCancel, isCreatingNew }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{isCreatingNew ? 'Add Certification' : 'Edit Certification'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" value={data.certName || ''} onChange={(e) => setData({...data, certName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Certifying Body</label>
          <input type="text" value={data.certifyingBody || ''} onChange={(e) => setData({...data, certifyingBody: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Certificate #</label>
          <input type="text" value={data.certificateNumber || ''} onChange={(e) => setData({...data, certificateNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input type="date" value={data.issueDate ? new Date(data.issueDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, issueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={data.status || 'active'} onChange={(e) => setData({...data, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save size={18} /> {isCreatingNew ? 'Create' : 'Save'}</button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"><X size={18} /> Cancel</button>
      </div>
    </div>
  );
}

function DeaEditForm({ data, setData, onSave, onCancel, isCreatingNew }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{isCreatingNew ? 'Add DEA Registration' : 'Edit DEA Registration'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DEA Number</label>
          <input type="text" value={data.deaNumber || ''} onChange={(e) => setData({...data, deaNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input type="text" value={data.state || ''} onChange={(e) => setData({...data, state: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input type="date" value={data.issueDate ? new Date(data.issueDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, issueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedules Authorized</label>
          <input type="text" value={data.schedulesAuthorized || ''} onChange={(e) => setData({...data, schedulesAuthorized: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={data.status || 'active'} onChange={(e) => setData({...data, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save size={18} /> {isCreatingNew ? 'Create' : 'Save'}</button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"><X size={18} /> Cancel</button>
      </div>
    </div>
  );
}

function PrivilegeEditForm({ data, setData, onSave, onCancel, isCreatingNew }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{isCreatingNew ? 'Add Privilege' : 'Edit Privilege'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Privilege Type</label>
          <input type="text" value={data.privilegeType || ''} onChange={(e) => setData({...data, privilegeType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
          <select value={data.approvalStatus || 'approved'} onChange={(e) => setData({...data, approvalStatus: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="denied">Denied</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Granted Date</label>
          <input type="date" value={data.grantedDate ? new Date(data.grantedDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, grantedDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Restrictions</label>
          <textarea value={data.restrictions || ''} onChange={(e) => setData({...data, restrictions: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" rows="2"></textarea>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save size={18} /> {isCreatingNew ? 'Create' : 'Save'}</button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"><X size={18} /> Cancel</button>
      </div>
    </div>
  );
}

function TaskEditForm({ data, setData, onSave, onCancel, isCreatingNew }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{isCreatingNew ? 'Add Task' : 'Edit Task'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" value={data.title || ''} onChange={(e) => setData({...data, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
          <select value={data.taskType || 'document'} onChange={(e) => setData({...data, taskType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="document">Document</option>
            <option value="verification">Verification</option>
            <option value="renewal">Renewal</option>
            <option value="update">Update</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" value={data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, dueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select value={data.priority || 'medium'} onChange={(e) => setData({...data, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={data.status || 'pending'} onChange={(e) => setData({...data, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save size={18} /> Save</button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"><X size={18} /> Cancel</button>
      </div>
    </div>
  );
}

function LicenseEditForm({ data, setData, onSave, onCancel, isCreatingNew }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{isCreatingNew ? 'Add License' : 'Edit License'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input type="text" value={data.state || ''} onChange={(e) => setData({...data, state: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License #</label>
          <input type="text" value={data.licenseNumber || ''} onChange={(e) => setData({...data, licenseNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input type="text" value={data.licenseType || ''} onChange={(e) => setData({...data, licenseType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
          <input type="date" value={data.issueDate ? new Date(data.issueDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, issueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={data.status || 'active'} onChange={(e) => setData({...data, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save size={18} /> {isCreatingNew ? 'Create' : 'Save'}</button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"><X size={18} /> Cancel</button>
      </div>
    </div>
  );
}

function MalpracticeEditForm({ data, setData, onSave, onCancel, isCreatingNew }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{isCreatingNew ? 'Add Malpractice Insurance' : 'Edit Malpractice Insurance'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
          <input type="text" value={data.carrier || ''} onChange={(e) => setData({...data, carrier: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policy #</label>
          <input type="text" value={data.policyNumber || ''} onChange={(e) => setData({...data, policyNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Per Claim ($)</label>
          <input type="number" value={data.coveragePerClaim || ''} onChange={(e) => setData({...data, coveragePerClaim: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
          <input type="date" value={data.effectiveDate ? new Date(data.effectiveDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, effectiveDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
          <input type="date" value={data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => setData({...data, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={data.tailCoverage || false} onChange={(e) => setData({...data, tailCoverage: e.target.checked})} className="rounded" />
            Tail Coverage
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Save size={18} /> {isCreatingNew ? 'Create' : 'Save'}</button>
        <button onClick={onCancel} className="flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"><X size={18} /> Cancel</button>
      </div>
    </div>
  );
}

export default CredentialsViewer;
