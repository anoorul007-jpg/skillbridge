import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skillbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem('skillbridge_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (tokens?.access) {
        try {
          const res = await apiClient.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('skillbridge_user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Failed to verify session:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login/', { email, password });
    const { user: userData, tokens: tokenData } = res.data;
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('skillbridge_user', JSON.stringify(userData));
    localStorage.setItem('skillbridge_tokens', JSON.stringify(tokenData));
    return userData;
  };

  const register = async (formData) => {
    const res = await apiClient.post('/auth/register/', formData);
    const { user: userData, tokens: tokenData } = res.data;
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('skillbridge_user', JSON.stringify(userData));
    localStorage.setItem('skillbridge_tokens', JSON.stringify(tokenData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('skillbridge_user');
    localStorage.removeItem('skillbridge_tokens');
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('skillbridge_user', JSON.stringify(updatedData));
  };

  // 1-Click Demo Switcher for fast evaluation
  const loginAsDemo = async (role) => {
    let email = 'student@skillbridge.edu';
    let password = 'StudentPass123!';
    if (role === 'MENTOR') {
      email = 'mentor.alex@skillbridge.edu';
      password = 'MentorPass123!';
    } else if (role === 'ADMIN') {
      email = 'admin@skillbridge.edu';
      password = 'AdminPass123!';
    }
    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        login,
        register,
        logout,
        updateUser,
        loginAsDemo,
        isAuthenticated: !!user,
        isStudent: user?.role === 'STUDENT',
        isMentor: user?.role === 'MENTOR',
        isAdmin: user?.role === 'ADMIN' || user?.is_staff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
