import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any old persistent logins so it forces password check
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    const checkAuth = async () => {
      const token = sessionStorage.getItem('adminToken');
      const savedAdmin = sessionStorage.getItem('adminUser');
      
      if (token && savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.role !== 'admin') {
          return { success: false, message: 'Unauthorized: Not an Admin' };
        }
        
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data));
        setAdmin(data);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login Failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network Error. Please try again.' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
