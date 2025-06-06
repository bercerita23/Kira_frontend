import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL pointing to local API proxy
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors consistently
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Extract error message from response
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create a new error with the extracted message
    const customError = new Error(errorMessage);
    customError.name = 'APIError';
    return Promise.reject(customError);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface SignupResponse {
  message: string;
}

export interface User {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  school_id?: number | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('username', credentials.email); // OAuth2 expects 'username'
      params.append('password', credentials.password);
      const response = await api.post<TokenResponse>(
        '/auth/login',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data;
    } catch (error) {
      // Re-throw the error with proper message
      throw error;
    }
  },

  signup: async (credentials: SignupCredentials): Promise<SignupResponse> => {
    try {
      const response = await api.post<SignupResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      // Re-throw the error with proper message
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    // Note: Kira API may not have a logout endpoint, so we just remove the token
    Cookies.remove('token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Kira API provides /auth/db endpoint that returns a list of users
      // We'll need to find the current user from this list
      // Since there's no /auth/me endpoint, this is a limitation
      // For now, we'll return null and handle this in the auth context
      return null;
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/auth/db');
      // Handle the Kira API response format which wraps users in "Hello From: " object
      if (response.data && response.data['Hello From: ']) {
        return response.data['Hello From: '];
      }
      // Fallback for direct array response
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authApi; 