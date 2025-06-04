import axios, { AxiosError } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authApi; 