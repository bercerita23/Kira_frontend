'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authApi, { User, TokenResponse } from '@/lib/api/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
    console.log('🔄 Clearing authentication data...');
    Cookies.remove('token');
    Cookies.remove('userEmail');
    setUser(null);
  };

  useEffect(() => {
    console.log('🔍 AuthProvider: Checking authentication status...');
    
    // Check if user is logged in on mount
    const token = Cookies.get('token');
    const userEmail = Cookies.get('userEmail');
    
    console.log('🍪 Found cookies:', { 
      hasToken: !!token, 
      userEmail: userEmail ? `${userEmail.substring(0, 3)}***` : 'none' 
    });
    
    if (token && userEmail) {
      console.log('🔄 Attempting to authenticate with stored credentials...');
      // Since Kira API doesn't have /auth/me, we'll try to find the user in the users list
      authApi.getAllUsers()
        .then(users => {
          console.log(`👥 Fetched ${users.length} users from API`);
          const currentUser = users.find(u => u.email === userEmail);
          if (currentUser) {
            console.log('✅ User found in API, logging in:', currentUser.email);
            setUser(currentUser);
          } else {
            console.log('❌ User not found in API, clearing tokens');
            clearAuth();
          }
        })
        .catch((error) => {
          console.log('❌ Failed to fetch users, clearing tokens:', error.message);
          clearAuth();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      console.log('👤 No authentication found, user not logged in');
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response: TokenResponse = await authApi.login({ email, password });
      
      console.log('✅ Login successful, storing credentials');
      
      // Store token in cookie with 30 days expiration
      Cookies.set('token', response.access_token, { expires: 30 });
      Cookies.set('userEmail', email, { expires: 30 }); // Store email to identify user later
      
      // Try to get user info from the users list
      try {
        const users = await authApi.getAllUsers();
        const currentUser = users.find(u => u.email === email);
        if (currentUser) {
          console.log('✅ User data retrieved from API');
          setUser(currentUser);
        }
      } catch (error) {
        console.log('⚠️ Could not fetch user data, creating basic user object');
        // If we can't get user info, create a basic user object
        setUser({
          id: 'unknown',
          email: email,
          first_name: '',
          last_name: '',
        });
      }
      
      // Redirect to the original requested page or dashboard
      const from = searchParams.get('from') || '/dashboard';
      router.push(from);
    } catch (error) {
      console.log('❌ Login failed:', error);
      throw error;
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      console.log('📝 Attempting signup for:', email);
      await authApi.signup({ 
        email, 
        password, 
        first_name: firstName, 
        last_name: lastName 
      });
      
      console.log('✅ Signup successful, auto-logging in...');
      // After successful signup, automatically log the user in
      await login(email, password);
    } catch (error) {
      console.log('❌ Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await authApi.logout();
      clearAuth();
      router.push('/');
    } catch (error) {
      console.log('⚠️ Logout error, clearing local state anyway:', error);
      // Even if logout fails, clear local state
      clearAuth();
      router.push('/');
    }
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