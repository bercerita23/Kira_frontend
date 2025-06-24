'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authApi, { LoginCredentials, TokenResponse } from '@/lib/api/auth';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
// Type for decoded token payload
interface DecodedToken {
  sub: string;
  email: string;
  first_name: string;
  role: string;
  school_id: string;
  exp: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  role: string;
  school_id: string;
}


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;  // <-- this change
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const clearAuth = () => {
    Cookies.remove('token');
    setUser(null);
  };

  // Load user from token on initial page load
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentUser: User = {
          id: decoded.sub,
          email: decoded.email,
          first_name: decoded.first_name,
          role: decoded.role,
          school_id: decoded.school_id,
        };
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to decode token:', err);
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

const login = async (credentials: LoginCredentials) => {
  try {
    const response: TokenResponse = await authApi.login(credentials);
    Cookies.set('token', response.access_token, { expires: 30 });

    const decoded: DecodedToken = jwtDecode(response.access_token);
    const currentUser: User = {
      id: decoded.sub,
      email: decoded.email,
      first_name: decoded.first_name,
      role: decoded.role,
      school_id: decoded.school_id,
    };
    setUser(currentUser);

    // Handle role-based redirects
    const from = searchParams.get('from');
    let redirectPath = '/dashboard';
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      redirectPath = '/admin';
    }
    const finalRedirect = (from && !from.includes('/login')) ? from : redirectPath;
    router.push(finalRedirect);
  } catch (error) {
    throw error;
  }
};

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      await authApi.signup({ email, password, first_name: firstName, last_name: lastName });
      await login({ email, password })
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authApi.logout();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, clearAuth }}>
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
