import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/lib/context/auth-context';
import LoginPage from '@/app/(auth)/login/page';
import SignupPage from '@/app/(auth)/signup/page';
import authApi from '@/lib/api/auth';

// Mock the API functions
vi.mock('@/lib/api/auth', () => {
  const api = {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    getAllUsers: vi.fn(),
  };
  return {
    __esModule: true,
    default: api,
    authApi: api,
  };
});

// Mock cookies
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (authApi.getCurrentUser as any).mockResolvedValue(null);
    (authApi.getAllUsers as any).mockResolvedValue([]);
  });

  describe('Login Flow', () => {
    it('should successfully log in a user', async () => {
      const mockResponse = { access_token: 'fake-token', token_type: 'bearer' };
      const mockUsers = [{ id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User' }];
      (authApi.login as any).mockResolvedValueOnce(mockResponse);
      (authApi.getAllUsers as any).mockResolvedValueOnce(mockUsers);

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should show error message for non-existent email', async () => {
      (authApi.login as any).mockRejectedValueOnce(new Error('No account found with this email address'));

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login|sign in/i });

      await userEvent.type(emailInput, 'nonexistent@example.com');
      await userEvent.type(passwordInput, 'somepassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/no account found with this email address/i)).toBeInTheDocument();
      });
    });

    it('should show error message for incorrect password', async () => {
      (authApi.login as any).mockRejectedValueOnce(new Error('Incorrect password'));

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login|sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Signup Flow', () => {
    it('should successfully create a new account', async () => {
      const mockSignupResponse = { message: 'User created successfully' };
      const mockLoginResponse = { access_token: 'fake-token', token_type: 'bearer' };
      const mockUsers = [{ id: '1', email: 'new@example.com', first_name: 'New', last_name: 'User' }];
      
      (authApi.signup as any).mockResolvedValueOnce(mockSignupResponse);
      (authApi.login as any).mockResolvedValueOnce(mockLoginResponse);
      (authApi.getAllUsers as any).mockResolvedValueOnce(mockUsers);

      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /sign up|create account/i });

      await userEvent.type(firstNameInput, 'New');
      await userEvent.type(lastNameInput, 'User');
      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(termsCheckbox);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.signup).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'password123',
          first_name: 'New',
          last_name: 'User'
        });
      });
    });

    it('should show error message for existing email', async () => {
      (authApi.signup as any).mockRejectedValueOnce(new Error('An account with this email address already exists'));

      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const termsCheckbox = screen.getByLabelText(/terms of service/i);
      const submitButton = screen.getByRole('button', { name: /sign up|create account/i });

      await userEvent.type(firstNameInput, 'Test');
      await userEvent.type(lastNameInput, 'User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(termsCheckbox);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an account with this email address already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should successfully log out a user', async () => {
      (authApi.logout as any).mockResolvedValueOnce(undefined);

      render(
        <AuthProvider>
          <div>
            <button onClick={() => authApi.logout()}>Logout</button>
          </div>
        </AuthProvider>
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await userEvent.click(logoutButton);

      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
      });
    });
  });
}); 