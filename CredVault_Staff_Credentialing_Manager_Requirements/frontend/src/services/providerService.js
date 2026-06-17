const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3220/api/v1';

export const providerService = {
  getProviders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.specialty) queryParams.append('specialty', params.specialty);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_URL}/providers?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch providers');
    return response.json();
  },

  getProvider: async (id) => {
    const response = await fetch(`${API_URL}/providers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch provider');
    return response.json();
  },

  createProvider: async (data) => {
    const response = await fetch(`${API_URL}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create provider');
    }
    return response.json();
  },

  updateProvider: async (id, data) => {
    const response = await fetch(`${API_URL}/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update provider');
    return response.json();
  },

  deleteProvider: async (id) => {
    const response = await fetch(`${API_URL}/providers/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete provider');
    return response.json();
  }
};
