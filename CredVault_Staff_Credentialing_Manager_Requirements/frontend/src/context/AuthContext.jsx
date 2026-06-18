import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3220/api/v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialise from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('cv_access_token');
    const saved  = localStorage.getItem('cv_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const register = useCallback(async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error?.message || 'Registration failed');
    localStorage.setItem('cv_access_token',  result.data.accessToken);
    localStorage.setItem('cv_refresh_token', result.data.refreshToken);
    localStorage.setItem('cv_user',          JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result.data.user;
  }, []);

  const updateUser = useCallback((updates) => {
    const current = JSON.parse(localStorage.getItem('cv_user') || '{}');
    const updated = { ...current, ...updates };
    localStorage.setItem('cv_user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error?.message || 'Login failed');

    localStorage.setItem('cv_access_token',  data.data.accessToken);
    localStorage.setItem('cv_refresh_token', data.data.refreshToken);
    localStorage.setItem('cv_user',          JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cv_access_token');
    localStorage.removeItem('cv_refresh_token');
    localStorage.removeItem('cv_user');
    setUser(null);
  }, []);

  const getToken = useCallback(() => localStorage.getItem('cv_access_token'), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
