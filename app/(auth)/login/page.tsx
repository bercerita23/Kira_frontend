"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, AlertCircle, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/context/auth-context";
import { motion } from "framer-motion";

// Function to detect if input is an email
const isEmail = (input: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

// Function to determine the type of identifier and return appropriate credentials
const getLoginCredentials = (identifier: string, password: string) => {
  if (isEmail(identifier)) {
    return { email: identifier, password };
  } else {
    // If it's not an email, treat it as username
    return { username: identifier, password };
  }
};

export default function LoginPage() {
  const { loginStudent, loginAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [targetStudent, setTargetStudent] = useState<{
    email?: string;
    username?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    identifier: "", // Single field for username or email
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      const credentials = getLoginCredentials(
        formData.identifier,
        formData.password
      );
      if (loginType === "student") {
        await loginStudent(credentials);
        toast({
          title: "Login successful",
          description: "Welcome back to Kira!",
        });
      } else {
        await loginAdmin(credentials);
        toast({
          title: "Admin login successful",
          description: "Welcome back, Admin!",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);

      // Show specific error messages
      if (errorMessage.includes("Admin users must")) {
        toast({
          title: "Wrong Portal",
          description: "Admin users must use the Admin Portal below.",
          variant: "destructive",
        });
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("server")
      ) {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else if (
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("incorrect") ||
        errorMessage.toLowerCase().includes("credentials")
      ) {
        toast({
          title: "Incorrect credentials",
          description:
            "The email/username or password you entered is incorrect.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const getErrorType = (errorMessage: string) => {
    if (
      errorMessage.includes("email") ||
      errorMessage.includes("account") ||
      errorMessage.includes("username")
    ) {
      return "identifier";
    } else if (errorMessage.includes("password")) {
      return "password";
    }
    return "general";
  };
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    const username = searchParams.get("username");

    if (email || username) {
      const target = {
        email: email || undefined,
        username: username || undefined,
      };
      setTargetStudent(target);

      // Set identifier input prefill (email or username)
      setFormData((prev) => ({
        ...prev,
        identifier: email || username || "",
      }));

      // Switch to admin login if email is provided
      if (email) {
        setLoginType("admin");
      }

      sessionStorage.setItem("targetStudentReset", JSON.stringify(target));
    }
  }, [searchParams]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF4F6]">
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-2xl shadow-lg px-10 py-10 flex flex-col items-center"
          style={{ minWidth: 400 }}
        >
          <span className="text-3xl font-bold text-[#B71C3B] mb-1">KIRA</span>
          <span className="text-xl font-medium text-[#2D0B18] mb-11">
            Log in to your account
          </span>
          <span className="text-sm text-[#2D0B18] mb-2">
            Choose your account type
          </span>
          <div className="flex w-full justify-center mb-6 ">
            <div className="flex bg-[#FDECEF] rounded-[4px] p-[2px] overflow-hidden h-10 w-full  border border-[#FDECEF]">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-base font-medium transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 border rounded-[4px]
                  ${
                    loginType === "admin"
                      ? "bg-white border-[#E5E7EB] shadow-sm text-[#B71C3B] z-10"
                      : "bg-transparent border-transparent text-[#2D0B18]"
                  }
                `}
                style={{
                  borderRadius: loginType === "admin" ? "8px" : "8px 0 0 8px",
                }}
                onClick={() => setLoginType("admin")}
              >
                <Shield
                  size={18}
                  className={
                    loginType === "admin" ? "text-[#B71C3B]" : "text-[#A0A0A0]"
                  }
                />
                Administrator
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-base font-medium transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 border rounded-[4px]
                  ${
                    loginType === "student"
                      ? "bg-white border-[#E5E7EB] shadow-sm text-[#B71C3B] z-10"
                      : "bg-transparent border-transparent text-[#2D0B18]"
                  }
                `}
                style={{
                  borderRadius: loginType === "student" ? "8px" : "0 8px 8px 0",
                }}
                onClick={() => setLoginType("student")}
              >
                <User
                  size={18}
                  className={
                    loginType === "student"
                      ? "text-[#B71C3B]"
                      : "text-[#A0A0A0]"
                  }
                />
                Student
              </button>
            </div>
          </div>
          {targetStudent && (
            <div className="w-full mb-4 p-3 text-sm text-purple-800 bg-purple-50 border border-purple-200 rounded">
              Password reset requested for:{" "}
              <strong>{targetStudent.username || targetStudent.email}</strong>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-4 mt-5"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="identifier"
                className="text-sm font-medium text-[#2D0B18]"
              >
                Email or User ID
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder=""
                value={formData.identifier}
                onChange={handleChange}
                required
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#B71C3B] focus:border-[#B71C3B]"
                style={{ fontSize: "1rem" }}
              />
            </div>
            <div className="flex flex-col gap-2 mt-3 mb-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#2D0B18]"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#B71C3B] focus:border-[#B71C3B]"
                style={{ fontSize: "1rem" }}
              />
              <a
                href={
                  loginType === "admin"
                    ? "/forgot-password"
                    : "/forgot-password-student/"
                }
                className="text-xs text-[#B71C3B] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#B71C3B] hover:bg-[#a0152f] text-white text-base font-semibold py-2 rounded-[4px] transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
            <div className="text-center ">
              <span className="text-[#2D0B18] text-sm">
                Don't have an account?{" "}
              </span>
              <a
                href="/signup"
                className="text-[#B71C3B] font-medium hover:underline text-sm"
              >
                Admin Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
