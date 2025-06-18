'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import authApi, { User, TokenResponse } from '@/lib/api/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, loginType?: 'student' | 'admin') => Promise<void>;
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

    // Check if user is trying to access protected routes without authentication
    const isProtectedRoute = typeof window !== 'undefined' && 
      ['/dashboard', '/admin', '/lessons', '/speaking', '/progress', '/achievements']
        .some(path => window.location.pathname.startsWith(path));

    const isAdminRoute = typeof window !== 'undefined' && 
      window.location.pathname.startsWith('/admin') && 
      !window.location.pathname.startsWith('/admin/login');

    if (isProtectedRoute && !token) {
      console.log('🚫 AuthProvider: Redirecting unauthenticated user from protected route');
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        // Redirect to appropriate login based on route
        const loginPath = isAdminRoute ? '/admin/login' : '/login';
        window.location.href = `${loginPath}?from=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }
    
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

  const login = async (email: string, password: string, loginType?: 'student' | 'admin') => {
    try {
      console.log('🔐 Attempting login for:', email, 'via', loginType || 'unknown', 'portal');
      const response: TokenResponse = await authApi.login({ email, password });
      
      console.log('✅ Login successful, storing credentials');
      
      // Store token in cookie with 30 days expiration
      Cookies.set('token', response.access_token, { expires: 30 });
      Cookies.set('userEmail', email, { expires: 30 }); // Store email to identify user later
      
      // Try to get user info from the users list
      let currentUser: any = null;
      try {
        const users = await authApi.getAllUsers();
        currentUser = users.find(u => u.email === email);
        if (currentUser) {
          console.log('✅ User data retrieved from API');
          
          // Enforce role-based login restrictions
          const isAdmin = currentUser.role === 'admin' || currentUser.role === 'adm';
          const isStudent = currentUser.role === 'stu';
          
          if (loginType === 'admin' && !isAdmin) {
            console.log('🚫 Student user attempted to login via admin portal');
            clearAuth();
            throw new Error('Access denied. This portal is for administrators only. Please use the student login.');
          }
          
          if (loginType === 'student' && isAdmin) {
            console.log('🚫 Admin user attempted to login via student portal');
            clearAuth();
            throw new Error('Admin users must use the Admin Portal. Please use the admin login.');
          }
          
          setUser(currentUser);
        }
      } catch (error) {
        // If the error is from role checking, re-throw it
        if (error instanceof Error && (error.message.includes('Access denied') || error.message.includes('Admin users must'))) {
          throw error;
        }
        
        console.log('⚠️ Could not fetch user data, creating basic user object');
        // If we can't get user info, create a basic user object
        currentUser = {
          id: 'unknown',
          email: email,
          first_name: '',
          last_name: '',
          role: 'stu' // Default to student role
        };
        setUser(currentUser);
      }
      
      // Role-based redirect
      const from = searchParams.get('from');
      let redirectPath = '/dashboard'; // Default for students
      
      // Check if user is admin
      if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'adm')) {
        redirectPath = '/admin';
        console.log('👑 Admin user detected, redirecting to admin dashboard');
      } else {
        console.log('🎓 Student user detected, redirecting to student dashboard');
        
        // If student tried to access admin routes, redirect them to student dashboard
        if (from && from.startsWith('/admin')) {
          console.log('⚠️ Student attempted to access admin route, redirecting to dashboard');
          redirectPath = '/dashboard';
        }
      }
      
      // Use the 'from' parameter if provided and user has appropriate role, otherwise use role-based redirect
      const finalRedirect = (from && !from.includes('/login')) ? from : redirectPath;
      console.log(`🔄 Redirecting to: ${finalRedirect} (role: ${currentUser?.role || 'unknown'})`);
      router.push(finalRedirect);
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
      await login(email, password, 'student');
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