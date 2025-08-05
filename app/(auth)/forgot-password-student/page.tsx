"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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

      if (!response.ok) throw new Error("Failed to send request to admin");

      localStorage.setItem("resetUsername", username);
      setCodeSent(true);

      toast({
        title: "Code has been sent ✓",
        description: "Your request has been forwarded to the admin.",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2FFF2] px-4">
      <div className="bg-white p-12 rounded-[8px] shadow-md w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-[#1B8A1B] mb-1">KIRA</h1>
        <h2 className="text-[24px] font-medium text-black mb-10">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 mb-14">
          <div className="text-left mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your username to send a request
            </label>
            <Input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-[7px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1B8A1B] hover:bg-[#157115] text-white font-semibold rounded-[7px]"
            disabled={isLoading || codeSent}
          >
            {codeSent
              ? "Code has been sent ✓"
              : isLoading
              ? "Sending..."
              : "Send Code"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {codeSent && (
          <p className="text-sm text-gray-700 mt-4">
            If you haven’t heard back for a while,{" "}
            <button
              className="text-[#1B8A1B] underline"
              onClick={() => {
                setCodeSent(false);
                setUsername("");
              }}
            >
              Resend your request
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
