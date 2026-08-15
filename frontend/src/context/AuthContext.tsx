import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (email: string, full_name?: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const loginWithGoogle = async (email: string, full_name?: string) => {
    const res = await api.post('/auth/google', { email, full_name });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { access_token, user: regUser } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(regUser);
    return regUser;
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.put('/auth/me', data);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = Boolean(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'));

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, register, updateProfile, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
