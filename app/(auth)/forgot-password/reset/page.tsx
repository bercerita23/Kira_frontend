"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlCode = searchParams.get("code");
    const firstName = searchParams.get("first_name");

    if (urlCode) setCode(urlCode);
    if (firstName) {
      toast({
        title: `Hi ${firstName}!`,
        description: "Please enter your new password to complete the reset.",
      });
    }

    // Check for stored email in cookies
    const storedEmail = Cookies.get("resetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setShowEmailField(false); // Hide email field if found in cookies
    } else {
      setShowEmailField(true); // Show email field if not found
    }
  }, [searchParams, toast]);

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const resetRes = await fetch("/api/auth/reset-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      if (!resetRes.ok) {
        const errData = await resetRes.json();
        throw new Error(errData.detail || "Failed to reset password.");
      }

      toast({ title: "Success", description: "Password has been reset." });
      Cookies.remove("resetEmail"); // Remove cookie after successful reset
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    email && code && newPassword && confirmPassword && passwordsMatch && newPassword.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF4F6] px-4">
      <div className="bg-white p-12 rounded-[8px] shadow-md w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-[#B71C3B] mb-1">KIRA</h1>
        <h2 className="text-[24px] font-medium text-black mb-10">
          Reset Password
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-4 text-left">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={handleSubmitNewPassword}
          className="space-y-6 mb-2 text-left"
        >
          {/* Only show email field if not found in localStorage */}
          {showEmailField && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-[7px]"
                placeholder="Enter your email address"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reset Code
            </label>
            <Input
              id="code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-[7px]"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-[7px]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Repeat New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`rounded-[7px] ${
                confirmPassword && !passwordsMatch ? "border-red-500" : ""
              }`}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#B71C3B] hover:bg-[#a0152f] text-white font-semibold rounded-[7px]"
            disabled={isLoading || !canSubmit}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
