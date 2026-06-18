import { authFetch, API_URL } from './api.js';

export const providerService = {
  getProviders: async (params = {}) => {
    const q = new URLSearchParams();
    if (params.page)      q.append('page',      params.page);
    if (params.limit)     q.append('limit',     params.limit);
    if (params.search)    q.append('search',    params.search);
    if (params.specialty) q.append('specialty', params.specialty);
    if (params.status)    q.append('status',    params.status);

    const res = await authFetch(`/providers?${q}`);
    if (!res.ok) throw new Error('Failed to fetch providers');
    return res.json();
  },

  getProvider: async (id) => {
    const res = await authFetch(`/providers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch provider');
    return res.json();
  },

  createProvider: async (data) => {
    const res = await authFetch('/providers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to create provider');
    }
    return res.json();
  },

  updateProvider: async (id, data) => {
    const res = await authFetch(`/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update provider');
    return res.json();
  },

  deleteProvider: async (id) => {
    const res = await authFetch(`/providers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete provider');
    return res.json();
  }
};
