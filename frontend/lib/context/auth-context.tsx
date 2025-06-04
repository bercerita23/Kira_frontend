'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authApi, { AuthResponse } from '@/lib/api/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get('token');
    if (token) {
      authApi.getCurrentUser()
        .then(user => {
          setUser(user);
        })
        .catch(() => {
          Cookies.remove('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      // Store token in cookie with 30 days expiration
      Cookies.set('token', response.token, { expires: 30 });
      setUser(response.user);
      
      // Redirect to the original requested page or dashboard
      const from = searchParams.get('from') || '/dashboard';
      router.push(from);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await authApi.signup({ firstName, lastName, email, password });
      // Store token in cookie with 30 days expiration
      Cookies.set('token', response.token, { expires: 30 });
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      Cookies.remove('token');
      setUser(null);
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 