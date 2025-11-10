import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.warn('Auth check failed:', error);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.success) setUser(res.user);
    return res;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.success) setUser(res.user);
    return res;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
