"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, AlertCircle } from "lucide-react";
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
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    employeeCode: "",
    email: "",
    password: "",
    terms: false,
    isAdmin: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-email-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) throw new Error("Failed to send verification email.");
      toast({
        title: "Check your email",
        description: "A reset code has been sent to your email address.",
      });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Error requesting verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        employee_code: formData.isAdmin ? formData.employeeCode : undefined,
        code: verificationCode,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to complete registration.");
      }
      await fetch(`/api/auth/code?email=${formData.email}`, {
        method: "DELETE",
      });
      toast({
        title: "Account created successfully!",
        description:
          "Welcome to Kira! Your account has been created successfully.",
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Error completing registration.");
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-2xl text-center">
              {step === 1 ? "Create an account" : "Enter Code"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? "Start your English learning journey with Kira"
                : "Enter the code sent to your email"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestEmail} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Show Employee Code only if Admin is checked */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdmin"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAdmin: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="isAdmin" className="text-sm">
                    Register as an Adminastrator
                  </Label>
                </div>

                {formData.isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="employeeCode">Employee Code</Label>
                    <Input
                      id="employeeCode"
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleChange}
                      required={formData.isAdmin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    name="terms"
                    required
                    checked={formData.terms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        terms: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !formData.terms}
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
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus className="mr-2 h-4 w-4" /> Create account
                    </span>
                  )}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    name="code"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Complete Registration"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
