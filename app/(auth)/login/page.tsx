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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
const getLoginCredentials = (
  identifier: string,
  password: string,
  schoolId?: string
) => {
  if (isEmail(identifier)) {
    const credentials: any = { email: identifier, password };
    if (schoolId) {
      credentials.school_id = schoolId;
    }
    return credentials;
  } else {
    // If it's not an email, treat it as username
    const credentials: any = { username: identifier, password };
    if (schoolId) {
      credentials.school_id = schoolId;
    }
    return credentials;
  }
};

export default function LoginPage() {
  const { loginStudent, loginAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [schools, setSchools] = useState<{ school_id: string; name: string }[]>(
    []
  );
  const [targetStudent, setTargetStudent] = useState<{
    email?: string;
    username?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    identifier: "", // Single field for username or email
    password: "",
    schoolId: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      if (loginType === "student") {
        const credentials = getLoginCredentials(
          formData.identifier,
          formData.password,
          formData.schoolId
        );
        await loginStudent(credentials);
        toast({
          title: "Student Login successful",
          description: "Welcome back to Kira!",
        });
      } else {
        const credentials = getLoginCredentials(
          formData.identifier,
          formData.password
        );
        await loginAdmin(credentials);
        toast({
          title: "Admin login successful",
          description: "Welcome back to Kira!",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);

      // Add this to debug
      console.log("Full error object:", error);
      console.log("Error message:", errorMessage);

      // Show specific error messages - CHECK DEACTIVATED FIRST
      if (
        errorMessage.toLowerCase().includes("deactivated") ||
        errorMessage.toLowerCase().includes("user is deactivated")
      ) {
        toast({
          title: "Account Deactivated",
          description:
            "Your account has been deactivated. Please contact your teacher or school admin for assistance.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("Admin users must")) {
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
            "The email/username/school or password you entered is incorrect.",
          variant: "destructive",
        });
      } else if (errorMessage.toLowerCase().includes("admin accounts cannot")) {
        toast({
          title: "Access denied",
          description:
            "Admin accounts cannot log in as students. Please use the Admin login.",
          variant: "destructive",
        });
      } else {
        // Fallback for any other backend errors
        toast({
          title: "Login Failed",
          description: errorMessage,
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

  const handleSchoolChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      schoolId: value,
    }));
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
    const loadSchools = async () => {
      try {
        const res = await fetch("/api/auth/school");
        if (!res.ok) throw new Error("Failed to load schools");

        const data = await res.json();
        setSchools(data);
      } catch (err) {
        console.warn("Using temporarily stored schools due to error:", err);
      }
    };

    loadSchools();
  }, []);

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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#f5f5f5" }}
    >
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-2xl shadow-lg px-10 py-10 flex flex-col items-center"
          style={{ minWidth: 400 }}
        >
          {/* Replace KIRA text with auth.png */}
          <img
            src="/assets/auth.png"
            alt="Kira Auth"
            className="mb-1"
            style={{ width: 64, height: 64, objectFit: "contain" }}
          />
          <span className="text-xl font-lato font-[500] text-[#2D0B18] mb-11">
            Log in to your account
          </span>
          <span className="text-sm font-lato font-[400] text-[#2D0B18] mb-2">
            Choose your account type
          </span>
          <div className="flex w-full justify-center mb-6 ">
            <div
              className="flex rounded-[4px] p-[2px] overflow-hidden h-10 w-full border"
              style={{ background: "#e7f7e2", borderColor: "#e7f7e2" }}
            >
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-base font-lato font-[500] transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 border rounded-[4px]
                  ${
                    loginType === "admin"
                      ? "bg-white border-[#E5E7EB] shadow-sm text-[#2d7017] z-10"
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
                    loginType === "admin" ? "text-[#2d7017]" : "text-[#A0A0A0]"
                  }
                />
                Administrator
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-base font-lato font-[500] transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 border rounded-[4px]
                  ${
                    loginType === "student"
                      ? "bg-white border-[#E5E7EB] shadow-sm text-[#2d7017] z-10"
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
                      ? "text-[#2d7017]"
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
                className="text-sm font-lato font-[500] text-[#2D0B18]"
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
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                style={{ fontSize: "1rem" }}
              />
            </div>

            {loginType === "student" && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="schoolId"
                  className="text-sm font-lato font-[500] text-[#2D0B18]"
                >
                  Select School
                </label>
                <Select
                  value={formData.schoolId}
                  onValueChange={handleSchoolChange}
                >
                  <SelectTrigger className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]">
                    <SelectValue placeholder="Choose a school" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="max-h-80 overflow-y-auto z-[100] bg-white"
                  >
                    {schools.map((school) => (
                      <SelectItem
                        className="!bg-white !text-black hover:!bg-gray-100"
                        key={school.school_id}
                        value={school.school_id}
                      >
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-3 mb-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-lato font-[500] text-[#2D0B18]"
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
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                style={{ fontSize: "1rem" }}
              />
              <a
                href={
                  loginType === "admin"
                    ? "/forgot-password"
                    : "/forgot-password-student/"
                }
                className="text-xs font-lato font-[400] hover:underline"
                style={{ color: "#94b689" }}
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full text-white text-base font-lato font-[600] py-2 rounded-[4px] transition-colors duration-200"
              style={{
                background: "#2d7017",
                color: "#fff",
              }}
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
              <span className="text-[#2D0B18] text-sm font-lato font-[400]">
                Don't have an account?{" "}
              </span>
              <a
                href="/signup"
                className="font-lato font-[500] hover:underline text-sm"
                style={{ color: "#94b689" }}
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
