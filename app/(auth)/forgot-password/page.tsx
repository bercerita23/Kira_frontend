"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/request-reset-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send reset code.");

      // Store email before redirecting
      localStorage.setItem("resetEmail", email);

      toast({
        title: "Check your email",
        description: "A reset code has been sent to your email address.",
      });

      // Slight delay to ensure localStorage write finishes (optional but safer)
      setTimeout(() => {
        router.push("/forgot-password/reset");
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
