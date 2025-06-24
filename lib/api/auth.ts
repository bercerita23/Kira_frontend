import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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
    const customError = new Error(errorMessage);
    customError.name = 'APIError';
    return Promise.reject(customError);
  }
);

// Request payload for login
export interface LoginCredentials {
  email?: string;
  user_id?: string;
  password: string;
}

// Response returned by backend on login
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Signup payload
export interface SignupCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  school_id?: string;
  employee_code?: string;
}

// Response for signup
export interface SignupResponse {
  message: string;
}


export interface CurrentUser {
  id: string;  // from decoded.sub
  email: string;
  first_name: string;
  role: string;  // 'student' | 'admin' | 'super_admin'
  school_id: string;
}

// This is the raw user fetched from /users endpoint
export interface DbUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name?: string;
  hashed_password?: string;
  is_admin: boolean;
  is_super_admin: boolean;
  school_id?: string | null;
  notes?: string | null;
  created_at?: string;
  last_login_time?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    try {
      const response = await api.post<TokenResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  signup: async (credentials: SignupCredentials): Promise<SignupResponse> => {
    try {
      const response = await api.post<SignupResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    Cookies.remove('token');
  },
  getAllUsers: async (): Promise<DbUser[]> => {
  try {
    const response = await api.get<{ "Hello_Form": DbUser[] }>('/users');
    return response.data["Hello_Form"];
  } catch (error) {
    throw error;
  }
},

};

export default authApi;
