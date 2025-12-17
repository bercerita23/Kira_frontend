"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ResendVerificationPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (
          response.status === 404 ||
          errorData.detail?.includes("not found") ||
          errorData.detail?.includes("No pending")
        ) {
          throw new Error(
            "Email not found or already verified. Please check and try again."
          );
        }
        throw new Error(
          errorData.detail ||
            "Unable to resend verification code. Please try again."
        );
      }

      setCodeSent(true);

      toast({
        title: "Verification code sent ✓",
        description: "Please check your email for the verification code.",
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.message || "Unable to resend verification code. Please try again.";
      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Request failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#f5f5f5" }}
    >
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-sm shadow-lg px-10 py-10 flex flex-col items-center"
          style={{ minWidth: 400 }}
        >
          <img
            src="/assets/auth.png"
            alt="Kira Auth"
            className="mb-1"
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
          <span className="text-xl font-lato font-[500] text-[#2D0B18] mb-6">
            Resend Verification Code
          </span>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-4 mt-4"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-lato font-[500] text-[#2D0B18]"
              >
                Enter your email to resend verification code
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                style={{ fontSize: "1rem" }}
                placeholder="admin@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full text-white text-base font-lato font-[600] py-2 rounded-[4px] transition-colors duration-200 mt-4"
              style={{
                background: "#2d7017",
                color: "#fff",
              }}
              disabled={isLoading || codeSent}
            >
              {codeSent
                ? "Code has been sent ✓"
                : isLoading
                ? "Sending..."
                : "Resend Code"}
            </button>
          </form>

          {codeSent && (
            <p className="text-sm font-lato font-[400] text-[#2D0B18] mt-4 text-center">
              Didn't receive the code?{" "}
              <button
                className="font-lato font-[500] hover:underline"
                style={{ color: "#94b689" }}
                onClick={() => {
                  setCodeSent(false);
                  setEmail("");
                }}
              >
                Try again
              </button>
            </p>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mt-6">
            <span className="text-[#2D0B18] text-sm font-lato font-[400]">
              Already verified?{" "}
            </span>
            <Link
              href="/login"
              className="font-lato font-[500] hover:underline text-sm"
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
