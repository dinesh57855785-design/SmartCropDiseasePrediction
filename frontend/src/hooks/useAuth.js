/**
 * hooks/useAuth.js
 * Consumes the global AuthContext.
 * All components that call useAuth() share the same user state —
 * this fixes the login-then-refresh issue.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}

export default useAuth;
