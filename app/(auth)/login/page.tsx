"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-primary">Kira</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col items-center mb-2">
              <CardTitle className="text-2xl text-center">
                Welcome back
              </CardTitle>
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm font-medium mr-2 ${
                    loginType === "student" ? "text-primary" : "text-gray-400"
                  }`}
                >
                  Student
                </span>
                <button
                  type="button"
                  className={`relative w-12 h-6 bg-gray-200 rounded-none transition-colors duration-300 focus:outline-none ${
                    loginType === "admin" ? "bg-blue-500" : ""
                  }`}
                  onClick={() =>
                    setLoginType(loginType === "student" ? "admin" : "student")
                  }
                  aria-label="Switch login type"
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`absolute top-1 left-1 w-4 h-4 rounded-none bg-white shadow-md transition-transform duration-300 ${
                      loginType === "admin" ? "translate-x-6" : ""
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ml-2 ${
                    loginType === "admin" ? "text-primary" : "text-gray-400"
                  }`}
                >
                  Admin
                </span>
              </div>
            </div>
            <CardDescription className="text-center">
              {loginType === "student"
                ? "Student login - Sign in to your Kira account"
                : "Admin login - Sign in to your admin account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">Username or Email</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Enter your username or email"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  className={
                    error && getErrorType(error) === "identifier"
                      ? "border-red-500"
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/forgot-password-student/"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={
                    error && getErrorType(error) === "password"
                      ? "border-red-500"
                      : ""
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
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
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" /> Sign in
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <div className="border-t pt-3 w-full text-center">
              <p className="text-xs text-muted-foreground">
                Administrator?{" "}
                <Link
                  href="/admin/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Admin Portal
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
