import { useState } from 'react';
import { Search, Plus, Trash2, Eye, User, Mail, Hash, Stethoscope } from 'lucide-react';
import { useProviders } from '../../hooks/useProviders';
import ProviderForm from './ProviderForm';
import CredentialsViewer from './CredentialsViewer';

function ProviderDirectory() {
  const { providers, loading, error, pagination, setPage, setSearchFilter, deleteProvider, refetch } = useProviders();
  const [showForm, setShowForm] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchFilter(searchInput);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this provider?')) return;
    try {
      await deleteProvider(id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      active: 'bg-green-100 text-green-700 border border-green-200',
      inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
      suspended: 'bg-amber-100 text-amber-700 border border-amber-200',
      terminated: 'bg-red-100 text-red-700 border border-red-200'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreRing = (score) => {
    if (score >= 90) return 'ring-2 ring-green-400';
    if (score >= 70) return 'ring-2 ring-amber-400';
    return 'ring-2 ring-red-400';
  };

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const getAvatarBg = (status) => {
    const map = {
      active: 'bg-blue-600',
      inactive: 'bg-gray-400',
      suspended: 'bg-amber-500',
      terminated: 'bg-red-500'
    };
    return map[status] || 'bg-blue-600';
  };

  if (showForm) return <ProviderForm onClose={() => { setShowForm(false); refetch(); }} />;

  if (showCredentials && selectedProvider) {
    return (
      <div>
        <button
          onClick={() => { setShowCredentials(false); setSelectedProvider(null); refetch(); }}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
        >
          ← Back to Providers
        </button>
        <CredentialsViewer
          providerId={selectedProvider.id}
          providerName={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
          onProviderUpdate={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Directory</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pagination.total} provider{pagination.total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={18} />
          Add Provider
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or NPI..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium text-gray-700"
        >
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-3/5" />
                </div>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg font-medium">No providers found</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Provider" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onView={() => { setSelectedProvider(provider); setShowCredentials(true); }}
              onDelete={(e) => handleDelete(e, provider.id)}
              getStatusColor={getStatusColor}
              getScoreColor={getScoreColor}
              getScoreRing={getScoreRing}
              getInitials={getInitials}
              getAvatarBg={getAvatarBg}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  pagination.page === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider, onView, onDelete, getStatusColor, getScoreColor, getScoreRing, getInitials, getAvatarBg }) {
  const credentialCount = provider.credentials?.length || 0;
  const hasExpired = provider.credentials?.some(c => c.status === 'expired') || false;

  return (
    <div
      onClick={onView}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex items-center gap-4"
    >
      {/* Avatar Section */}
      <div className={`w-14 h-14 rounded-full ${getAvatarBg(provider.status)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm`}>
        {getInitials(provider.firstName, provider.lastName)}
      </div>

      {/* Main Info Section */}
      <div className="flex-1 min-w-0">
        {/* Name and Specialty Row */}
        <div className="flex items-baseline gap-2 mb-1">
          <p className="font-semibold text-gray-900 text-base">
            {provider.firstName} {provider.lastName}
          </p>
          <span className="text-gray-500 text-sm">{provider.specialty || 'Specialist'}</span>
        </div>

        {/* Details Row */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-500">NPI:</span>
            <span className="font-mono text-gray-700">{provider.npi}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-500">Dept:</span>
            <span className="text-gray-700">{provider.specialty || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail size={12} className="text-gray-400" />
            <a href={`mailto:${provider.email}`} className="text-blue-600 hover:underline truncate">
              {provider.email || 'N/A'}
            </a>
          </div>
        </div>
      </div>

      {/* Credentials Badge Section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {credentialCount} {credentialCount === 1 ? 'credential' : 'credentials'}
          </div>
          {hasExpired && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
              Expired
            </span>
          )}
          {!hasExpired && credentialCount > 0 && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
          title="View Credentials"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-100 rounded-lg transition text-red-500"
          title="Delete Provider"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default ProviderDirectory;
