// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();

  // Check token validity
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (err) {
      return false;
    }
  };

  // Initialize auth state from local storage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && isTokenValid(token)) {
        try {
          // Set auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
          setLastActivity(Date.now());
        } catch (err) {
          console.error('Failed to get user data:', err);
          localStorage.removeItem('token');
        }
      } else if (token) {
        // Token exists but is invalid
        localStorage.removeItem('token');
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Activity tracking to handle session timeout
  useEffect(() => {
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const resetInactivityTimer = () => {
      setLastActivity(Date.now());
    };
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });
    
    // Check for inactivity
    const interval = setInterval(() => {
      if (user && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        logout();
        navigate('/login', { state: { message: 'Session expired due to inactivity' } });
      }
    }, 60000); // Check every minute
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      clearInterval(interval);
    };
  }, [user, lastActivity, navigate]);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setLastActivity(Date.now());
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setError(null);
      await axios.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
      return { success: false, error: err.response?.data };
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      await axios.post('/api/auth/reset-password', { token, password });
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      return { success: false, error: err.response?.data };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};