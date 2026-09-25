/**
 * contexts/AuthContext.jsx
 * Global authentication context — fixes the login page-refresh issue.
 * Provides a single shared user state consumed by Navbar, ProtectedRoute,
 * and all pages through the useAuth hook.
 *
 * Note: AuthContext is exported separately to satisfy Vite Fast Refresh rules.
 */

import { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const USER_KEY = 'smartcrop_user';

export const AuthContext = createContext(null);

// AuthProvider is the default and only component export in this file.
// This satisfies Vite Fast Refresh: a file may export components OR named values, not both.
// AuthContext (non-component) is in this file only because it is tightly coupled.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // loading = true only during the initial token rehydration on mount
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('access_token');
    const stored = localStorage.getItem(USER_KEY);
    return !!token && !stored;
  });

  const [error, setError] = useState(null);

  // Rehydrate user profile on mount if token exists but user not in storage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      setLoading(true);
      authAPI.getProfile()
        .then(({ data }) => {
          localStorage.setItem(USER_KEY, JSON.stringify(data));
          setUser(data);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem(USER_KEY);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const { data } = await authAPI.login(username, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const profile = await authAPI.getProfile();
      localStorage.setItem(USER_KEY, JSON.stringify(profile.data));
      setUser(profile.data);
      return profile.data;
    } catch (err) {
      let msg = 'Unable to reach backend server. Please verify Django backend is running at port 8000.';
      if (err.response) {
        if (err.response.data?.detail) {
          msg = err.response.data.detail;
        } else if (err.response.data?.non_field_errors) {
          msg = err.response.data.non_field_errors.join(' ');
        } else if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else {
          msg = `Login failed (${err.response.statusText || 'Server Error'}, status ${err.response.status}).`;
        }
      } else if (err.message && err.message !== 'Network Error') {
        msg = err.message;
      }
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const loginWithOTP = useCallback(async (target, otpCode) => {
    setError(null);
    try {
      const isEmail = typeof target === 'string' && target.includes('@');
      const apiCall = isEmail ? otpAPI.loginEmail(target, otpCode) : otpAPI.loginPhone(target, otpCode);
      const { data } = await apiCall;
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      let msg = 'OTP login failed. Please check your Gmail / Email address and OTP code.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user && !!localStorage.getItem('access_token'),
    login,
    loginWithOTP,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
