"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function AdminForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false); // 👈 track if code was sent

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

      localStorage.setItem("resetEmail", email);
      setCodeSent(true); // 👈 mark that the code was sent

      toast({
        title: "Check your email",
        description: "A reset code has been sent to your email address.",
      });

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
    <div className="min-h-screen flex items-center justify-center bg-[#FFF4F6] px-4">
      <div className="bg-white p-12 rounded-[8px] shadow-md w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-[#B71C3B] mb-1">KIRA</h1>
        <h2 className="text-[24px] font-medium text-black mb-10">
          Forgot Password
        </h2>

        <form onSubmit={handleEmailSubmit} className="space-y-6 mb-6">
          <div className="text-left mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your email to receive a reset code
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[7px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#B71C3B] hover:bg-[#a0152f] text-white font-semibold rounded-[7px]"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Code"}
          </Button>
        </form>

        {/* ✅ Only show if code was sent */}
        {codeSent && (
          <p className="text-sm text-gray-700">
            If you do not receive the code within 5 minutes,{" "}
            <button
              onClick={handleEmailSubmit}
              className="text-[#B71C3B] underline"
            >
              Resend Code
            </button>
          </p>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
