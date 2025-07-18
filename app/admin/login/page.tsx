"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

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

export default function AdminLoginPage() {
  const { loginAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store the target student info from URL parameters
  const [targetStudent, setTargetStudent] = useState<{
    email?: string;
    username?: string;
  } | null>(null);

  useEffect(() => {
    const identifier =
      searchParams.get("identifier") || searchParams.get("email");
    const password = searchParams.get("password");
    const email = searchParams.get("email");
    const username = searchParams.get("username");

    if (identifier || password) {
      setFormData((prev) => ({
        ...prev,
        identifier: identifier || prev.identifier,
        password: password || prev.password,
      }));
    }

    // Store target student info if provided in URL
    if (email || username) {
      setTargetStudent({
        email: email || undefined,
        username: username || undefined,
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const requestBody = {
        email: formData.identifier.includes("@")
          ? formData.identifier
          : undefined,
        user_id: !formData.identifier.includes("@")
          ? formData.identifier
          : undefined,
        password: formData.password,
      };

      await loginAdmin(requestBody);

      // If we have target student info, store it in sessionStorage for the admin dashboard
      if (targetStudent) {
        sessionStorage.setItem(
          "targetStudentReset",
          JSON.stringify(targetStudent)
        );
      }

      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard!",
      });
      // Don't manually redirect - let the auth context handle role-based routing
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              Kira Admin
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-purple-200 dark:border-purple-700">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
                Administrator Access
              </CardTitle>
            </div>
            <CardDescription className="text-center">
              Admin login - Sign in to access the administration panel
            </CardDescription>
            {targetStudent && (
              <Alert className="mt-4">
                <AlertDescription>
                  Password reset requested for:{" "}
                  {targetStudent.username || targetStudent.email}
                </AlertDescription>
              </Alert>
            )}
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
                <Label htmlFor="identifier">Email</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="admin@example.com"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary text-purple-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>{" "}
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
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
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" /> Access Admin Panel
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-purple-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>

            <div className="border-t pt-3 w-full text-center">
              <p className="text-xs text-muted-foreground">
                Not an admin?{" "}
                <Link
                  href="/login"
                  className="text-purple-600 hover:underline font-medium"
                >
                  Student Login
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
