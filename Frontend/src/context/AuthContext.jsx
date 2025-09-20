import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }

    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('https://college-event-pass-1.onrender.com/api/auth/me');
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://college-event-pass-1.onrender.com/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('https://college-event-pass-1.onrender.com/api/auth/register', userData);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key]);
      });

      const response = await axios.put('https://college-event-pass-1.onrender.com/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local storage and state with new user data
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Force reload profile picture by adding timestamp
      if (updatedUser.profilePic) {
        updatedUser.profilePic = `${updatedUser.profilePic}?t=${Date.now()}`;
      }
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};