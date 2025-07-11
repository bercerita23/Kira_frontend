"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authApi, { LoginCredentials, TokenResponse } from "@/lib/api/auth";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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
  loginStudent: (credentials: LoginCredentials) => Promise<void>;
  loginAdmin: (credentials: LoginCredentials) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
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
    Cookies.remove("token");
    setUser(null);
  };

  useEffect(() => {
    const token = Cookies.get("token");
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
        console.error("Failed to decode token:", err);
        clearAuth();
      }
    }
    setIsLoading(false);
  }, []);

  // centralize token handling logic
  const handleLoginSuccess = (
    token: string,
    loginType: "student" | "admin"
  ) => {
    Cookies.set("token", token, { expires: 30 });

    const decoded: DecodedToken = jwtDecode(token);
    const currentUser: User = {
      id: decoded.sub,
      email: decoded.email,
      first_name: decoded.first_name,
      role: decoded.role,
      school_id: decoded.school_id,
    };
    setUser(currentUser);

    // redirect logic - respect the login type used
    const from = searchParams.get("from");
    let redirectPath = "/dashboard";

    if (loginType === "student") {
      // Always go to student dashboard when logging in through student login
      redirectPath = "/dashboard";
    } else if (loginType === "admin") {
      // Use role-based routing for admin login
      if (currentUser.role === "super_admin") {
        redirectPath = "/super-admin";
      } else if (currentUser.role === "admin") {
        redirectPath = "/admin";
      } else {
        // If admin logs in but user is not admin, go to student dashboard
        redirectPath = "/dashboard";
      }
    }

    const finalRedirect =
      from && !from.includes("/login") ? from : redirectPath;
    router.push(finalRedirect);
  };

  const loginStudent = async (credentials: LoginCredentials) => {
    const response: TokenResponse = await authApi.login(credentials, "student");
    handleLoginSuccess(response.access_token, "student");
  };

  const loginAdmin = async (credentials: LoginCredentials) => {
    const response: TokenResponse = await authApi.login(credentials, "admin");
    handleLoginSuccess(response.access_token, "admin");
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    await authApi.signup({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
    await loginStudent({ email, password }); // default to student signup
  };

  const logout = async () => {
    await authApi.logout();
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginStudent,
        loginAdmin,
        signup,
        logout,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
