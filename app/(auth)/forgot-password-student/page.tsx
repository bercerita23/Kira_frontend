"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/request-reset-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (
          response.status === 404 ||
          errorData.message?.includes("not found") ||
          errorData.message?.includes("not registered")
        ) {
          throw new Error("Username not found. Please check and try again.");
        }
        throw new Error("Unable to send request to admin. Please try again.");
      }

      localStorage.setItem("resetUsername", username);
      setCodeSent(true);

      toast({
        title: "Code has been sent ✓",
        description: "Your request has been forwarded to the admin.",
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.message || "Unable to send request. Please try again.";
      setError(errorMessage);

      // Show detailed toast for better user guidance
      toast({
        variant: "destructive",
        title: "Request failed",
        description: errorMessage.includes("Username not found")
          ? "Please verify your username is correct and registered with us."
          : "There was an issue sending your request. Please check your connection and try again.",
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
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-4 mt-4"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="username"
                className="text-sm font-lato font-[500] text-[#2D0B18]"
              >
                Enter your username to send a request
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              disabled={isLoading || codeSent}
            >
              {codeSent
                ? "Code has been sent ✓"
                : isLoading
                ? "Sending..."
                : "Send Code"}
            </button>
          </form>

          {codeSent && (
            <p className="text-sm font-lato font-[400] text-[#2D0B18] mt-4 text-center">
              If you haven't heard back for a while,{" "}
              <button
                className="font-lato font-[500] hover:underline"
                style={{ color: "#94b689" }}
                onClick={() => {
                  setCodeSent(false);
                  setUsername("");
                }}
              >
                Resend your request
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
