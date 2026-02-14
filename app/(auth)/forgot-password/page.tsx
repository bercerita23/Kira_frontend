"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

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
    console.log("entering handle email submit");

    try {
      console.log("email", email);
      const response = await fetch("/api/auth/request-reset-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (
          response.status === 404 ||
          errorData.message?.includes("not found") ||
          errorData.message?.includes("not registered")
        ) {
          throw new Error("Email not found. Please check and try again.");
        }
        throw new Error("Unable to send reset code. Please try again.");
      }

      Cookies.set("resetEmail", email, { expires: 1 }); // Expires in 1 day
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
      const errorMessage =
        err.message || "Unable to send reset code. Please try again.";
      setError(errorMessage);

      // Show detailed toast for better user guidance
      toast({
        variant: "destructive",
        title: "Reset code failed",
        description: errorMessage.includes("Email not found")
          ? "Please verify your email address is correct and registered with us."
          : "There was an issue sending the reset code. Please check your connection and try again.",
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
            Forgot Password
          </span>

          <form
            onSubmit={handleEmailSubmit}
            className="w-full flex flex-col gap-4 mt-4"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-lato font-[500] text-[#2D0B18]"
              >
                Enter your email to receive a reset code
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-2 text-[#2D0B18] bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#2d7017] focus:border-[#2d7017]"
                style={{ fontSize: "1rem" }}
              />
            </div>

            <button
              type="submit"
              className="w-full text-white text-base font-lato font-[600] py-2 rounded-[4px] transition-colors duration-200 mt-4"
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
                  Sending...
                </span>
              ) : (
                "Send Code"
              )}
            </button>
          </form>

          {/* Only show if code was sent */}
          {codeSent && (
            <p className="text-sm font-lato font-[400] text-[#2D0B18] mt-4 text-center">
              If you do not receive the code within 5 minutes,{" "}
              <button
                onClick={handleEmailSubmit}
                className="font-lato font-[500] hover:underline"
                style={{ color: "#94b689" }}
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

          <div className="text-center mt-6">
            <span className="text-[#2D0B18] text-sm font-lato font-[400]">
              Remember your password?{" "}
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
