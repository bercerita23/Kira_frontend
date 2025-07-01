"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeValid, setCodeValid] = useState<null | boolean>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
  }, [searchParams]);
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.replace("/forgot-password");
    }
  }, [router]);
  useEffect(() => {
    const verifyCode = async () => {
      if (!email || code.trim().length !== 8) {
        setCodeValid(null); // neutral state
        return;
      }

      try {
        const res = await fetch(`/api/code?email=${email}`);
        if (!res.ok) {
          setCodeValid(null);
          return;
        }

        const data = await res.json();
        const isMatch = data.code.trim() === code.trim();
        setCodeValid(isMatch);
      } catch {
        setCodeValid(null);
      }
    };

    verifyCode();
  }, [code, email]);
  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const verifyRes = await fetch(`/api/code?email=${email}`);
      if (!verifyRes.ok) throw new Error("Code verification failed.");
      const data = await verifyRes.json();
      const isMatch = data.code.trim() === code.trim();
      setCodeValid(isMatch);
      if (!isMatch) {
        setError("Invalid verification code.");
        return;
      }

      const resetRes = await fetch("/api/admin/reset-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });
      if (!resetRes.ok) throw new Error("Failed to reset password.");
      await fetch(`/api/code?email=${email}`, { method: "DELETE" });

      toast({ title: "Success", description: "Password has been reset." });
      localStorage.removeItem("resetEmail");
      router.push("/admin/login");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    newPassword && confirmPassword && passwordsMatch && newPassword.length >= 8;

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
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your code and new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmitNewPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    confirmPassword && !passwordsMatch ? "border-red-500" : ""
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
