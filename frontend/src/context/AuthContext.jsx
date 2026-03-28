import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('smaart_token'));
  const [loading, setLoading] = useState(true);

  // On mount: validate existing token
  useEffect(() => {
    if (!token || token === 'demo_token') {
      if (token === 'demo_token') {
        try {
          const saved = JSON.parse(localStorage.getItem('smaart_user') || 'null');
          if (saved) setUser({ ...saved, isDemo: true });
        } catch {}
      }
      setLoading(false);
      return;
    }
    // Validate token with backend
    fetch('/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUser(data.user);
        localStorage.setItem('smaart_user', JSON.stringify(data.user));
      })
      .catch(() => {
        // Token expired or backend down — try cached user
        try {
          const cached = JSON.parse(localStorage.getItem('smaart_user') || 'null');
          if (cached) setUser({ ...cached, isOffline: true });
          else { setToken(null); localStorage.removeItem('smaart_token'); }
        } catch { setToken(null); localStorage.removeItem('smaart_token'); }
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('smaart_token', newToken);
    localStorage.setItem('smaart_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smaart_token');
    localStorage.removeItem('smaart_user');
    localStorage.removeItem('smaart_analysis_id');
    localStorage.removeItem('smaart_last_analysis');
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PO';
  const isStudent = user?.role === 'STUDENT' || !user?.role;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;
