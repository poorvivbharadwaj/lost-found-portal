import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    const verifyAuth = async () => {
      if (token && adminData) {
        try {
          const res = await verifyToken();
          if (res.data?.success) {
            setAdmin(JSON.parse(adminData));
            return;
          }
        } catch {
          // invalid token or backend unreachable
        }
      }
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    };

    verifyAuth().finally(() => setLoading(false));
  }, []);

  const login = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      login, 
      logout, 
      loading, 
      isAuthenticated: !!admin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};