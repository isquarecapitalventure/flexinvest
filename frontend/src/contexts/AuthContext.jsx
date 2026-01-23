import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// FIX: Add protocol to API_URL
const API_URL = `http://localhost:8000/api`;

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      
      if (adminToken) {
        try {
          const response = await axios.get(`${API_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${adminToken}` }
          });
          setAdmin({ dashboard: response.data });
        } catch (error) {
          console.error('Admin token validation failed:', error);
          localStorage.removeItem('adminToken');
          setAdminToken(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, [token, adminToken]);

  const register = async (data) => {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  };

  const verifyOTP = async (email, otp) => {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  const resendOTP = async (email) => {
    const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
    return response.data;
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  const adminLogin = async (email, password) => {
    const response = await axios.post(`${API_URL}/admin/login`, { email, password });
    const { token: newToken, admin: adminData } = response.data;
    localStorage.setItem('adminToken', newToken);
    setAdminToken(newToken);
    setAdmin(adminData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setAdmin(null);
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Profile refresh failed:', error);
      }
    }
  };

  const value = {
    user,
    admin,
    token,
    adminToken,
    loading,
    register,
    verifyOTP,
    resendOTP,
    login,
    adminLogin,
    logout,
    adminLogout,
    refreshProfile,
    isAuthenticated: !!token && !!user,
    isAdmin: !!adminToken && !!admin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
