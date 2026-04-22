import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getRoleDashboardPath } from '../utils/permissions';

// API configuration
const API_BASE_URL = 'http://localhost:8083/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_START = 'AUTH_START';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'LOGOUT';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          // Ensure role is clean (remove ROLE_ prefix if present)
          if (userData.role && userData.role.startsWith('ROLE_')) {
            userData.role = userData.role.replace('ROLE_', '');
          }
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: userData,
              token: token,
            },
          });
        } catch (error) {
          dispatch({
            type: AUTH_FAILURE,
            payload: 'Invalid authentication data',
          });
        }
      } else {
        // No authentication data - user needs to login
        dispatch({ type: LOGOUT });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_START });
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, email: userEmail, roles, id } = response.data;
      
      // Clean role format - remove "ROLE_" prefix if present
      let cleanRole = 'TOURIST';
      if (roles && roles.length > 0) {
        cleanRole = roles[0].replace('ROLE_', '');
      } else if (response.data.role) {
        cleanRole = response.data.role.replace('ROLE_', '');
      }
      
      const user = {
        id,
        email: userEmail,
        role: cleanRole,
        name: userEmail.split('@')[0],
      };
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token },
      });
      
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data || 'Login failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_START });
    const { firstName, lastName, email, password, role, phone } = userData;
    
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        phone,
        passwordHash: password,
        role,
      });
      
      // Auto-login after registration
      const loginResult = await login(email, password);
      return loginResult;
    } catch (error) {
      const message = error.response?.data || 'Registration failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: LOGOUT });
    toast.success('Logged out successfully');
  };

  // Update Profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      const updatedUser = response.data;
      
      // Clean role format
      if (updatedUser.role && updatedUser.role.startsWith('ROLE_')) {
        updatedUser.role = updatedUser.role.replace('ROLE_', '');
      }
      
      // Merge with current user to keep some client-side only info if any
      const newUser = { ...state.user, ...updatedUser };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user: newUser, token: state.token },
      });
      
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Role-based dashboard redirection
  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'ECOLOGIST':
        return '/dashboard/ecologist';
      case 'TOURIST':
        return '/dashboard/tourist';
      case 'STAFF':
        return '/dashboard/staff';
      default:
        return '/dashboard/tourist';
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    getDashboardPath,
    api, // Export the configured axios instance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
