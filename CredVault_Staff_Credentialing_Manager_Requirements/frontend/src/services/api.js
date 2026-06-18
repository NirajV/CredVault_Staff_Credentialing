const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3220/api/v1';

const getToken = () => localStorage.getItem('cv_access_token');

const authFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // If 401, clear tokens and reload to show login
  if (res.status === 401) {
    localStorage.removeItem('cv_access_token');
    localStorage.removeItem('cv_refresh_token');
    localStorage.removeItem('cv_user');
    window.location.reload();
    return;
  }

  return res;
};

export { authFetch, API_URL };
