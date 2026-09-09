import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const BACKEND_URL = 'http://localhost:8085';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('evalai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('evalai_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Session invalid');
      })
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          localStorage.setItem('evalai_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      })
      .catch(() => {
        logout();
      });
    }
  }, [token]);

  const openAuthModal = (tab = 'login', callback = null) => {
    setAuthModalTab(tab);
    setOnAuthSuccessCallback(() => callback);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setOnAuthSuccessCallback(null);
  };

  const login = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('evalai_token', data.token);
    localStorage.setItem('evalai_user', JSON.stringify(data.user));

    if (onAuthSuccessCallback) {
      onAuthSuccessCallback(data.user);
    }
    closeAuthModal();
    return data;
  };

  const sendOtp = async (name, email) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid or expired OTP');
    }
    return data;
  };

  const register = async (name, email, otp, password) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, otp, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  };

  const sendForgotPasswordOtp = async (email) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send password reset code');
    }
    return data;
  };

  const verifyForgotPasswordOtp = async (email, otp) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid or expired OTP code');
    }
    return data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('evalai_token');
    localStorage.removeItem('evalai_user');
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isUser,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        sendOtp,
        verifyOtp,
        register,
        sendForgotPasswordOtp,
        verifyForgotPasswordOtp,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
