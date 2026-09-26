import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Computed roles */
  const isAdmin = user?.role === 'admin';
  const isSecurity = user?.role === 'security';

  /* Restore session on mount */
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser || null);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    if (result.success) {
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const updatedUser = authService.updateProfile(user.id, updates);
    if (updatedUser) {
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'Update failed' };
  }, [user]);

  const value = {
    user,
    loading,
    isAdmin,
    isSecurity,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
