import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

const API_BASE = '/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOfficial: boolean;
  isCitizen: boolean;
  isAdmin: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  demoLogin: (demoUserId: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  demoUsers: User[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bhoomi_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bhoomi_token') || null;
  });

  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch demo users from backend on load
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/demo-users`);
        if (res.ok) {
          const data = await res.json();
          setDemoUsers(data.users || []);
          
          // If no user is logged in, default to Citizen Ramesh Sharma for pleasant zero-friction demo experience
          if (!localStorage.getItem('bhoomi_user') && data.users && data.users.length > 0) {
            const defaultUser = data.users[0]; // Ramesh Sharma
            setUser(defaultUser);
            localStorage.setItem('bhoomi_user', JSON.stringify(defaultUser));
            localStorage.setItem('bhoomi_token', 'demo-token-' + defaultUser.user_id);
          }
        }
      } catch (err) {
        console.error('Failed to load demo users:', err);
      }
    };
    fetchDemoUsers();
  }, []);

  const login = async (username: string, password?: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('bhoomi_user', JSON.stringify(data.user));
        localStorage.setItem('bhoomi_token', data.token);
        return { success: true, message: data.message || 'Login successful' };
      } else {
        return { success: false, message: data.detail || 'Invalid credentials' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('bhoomi_user', JSON.stringify(data.user));
        localStorage.setItem('bhoomi_token', data.token);
        return { success: true, message: data.message || 'Registration successful' };
      } else {
        return { success: false, message: data.detail || 'Registration failed' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during registration' };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (demoUserId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_user_id: demoUserId })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('bhoomi_user', JSON.stringify(data.user));
        localStorage.setItem('bhoomi_token', data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Demo login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bhoomi_user');
    localStorage.removeItem('bhoomi_token');
  };

  const refreshUser = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me?user_id=${user.user_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('bhoomi_user', JSON.stringify(data.user));
        }
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  const isOfficial = user ? ['REVENUE_OFFICER', 'REVIEW_OFFICER', 'DISTRICT_COLLECTOR', 'VIGILANCE_OFFICER', 'ADMIN'].includes(user.role) : false;
  const isCitizen = user ? user.role === 'CITIZEN' : false;
  const isAdmin = user ? user.role === 'ADMIN' || user.role === 'DISTRICT_COLLECTOR' : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isOfficial,
        isCitizen,
        isAdmin,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        demoUsers,
        loading
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
