"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import Link from "next/link";

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
    email &&
    code &&
    newPassword &&
    confirmPassword &&
    passwordsMatch &&
    newPassword.length >= 8;

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
          <span className="text-xl font-medium text-[#2D0B18] mb-6">
            Reset Password
          </span>

          {error && (
            <Alert variant="destructive" className="mb-4 w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmitNewPassword}
            className="w-full flex flex-col gap-4"
          >
            {/* Only show email field if not found in localStorage */}
            {showEmailField && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#2D0B18]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                  style={{ fontSize: "1rem" }}
                  placeholder="Enter your email address"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="code"
                className="text-sm font-medium text-[#2D0B18]"
              >
                Reset Code
              </label>
              <input
                id="code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                style={{ fontSize: "1rem" }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="newPassword"
                className="text-sm font-medium text-[#2D0B18]"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                style={{ fontSize: "1rem" }}
              />
              {newPassword && newPassword.length < 8 && (
                <span className="text-sm text-red-500">
                  Password must be at least 8 characters
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#2D0B18]"
              >
                Repeat New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-[4px] border px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017] ${
                  confirmPassword && !passwordsMatch
                    ? "border-red-500"
                    : "border-[#E5E7EB]"
                }`}
                style={{ fontSize: "1rem" }}
              />
              {confirmPassword && !passwordsMatch && (
                <span className="text-sm text-red-500">
                  Passwords do not match
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full text-white text-base font-semibold py-2 rounded-[4px] transition-colors duration-200 mt-4"
              style={{
                background: canSubmit ? "#2d7017" : "#94a3af",
                color: "#fff",
              }}
              disabled={isLoading || !canSubmit}
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
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-[#2D0B18] text-sm">
              Remember your password?{" "}
            </span>
            <Link
              href="/login"
              className="font-medium hover:underline text-sm"
              style={{ color: "#94b689" }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
