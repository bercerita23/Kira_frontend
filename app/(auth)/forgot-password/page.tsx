"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  //all the steps (email input, code input, and new passwords) are revolved in this hook
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // for step 1
  //~~~~~~~~~~~~
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
       //request a password reset code
      const response = await fetch('/auth/reset-pw-req', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send reset code.');
      toast({
        title: "Check your email",
        description: "A reset code has been sent to your email address."
      });
      setStep(2);
    } catch (err) {
            toast({
        title: "Failed to send reset code.",
        description: "please re type your email and try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // for step 2
  //~~~~~~~~~~~~
  // verify code
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  // for step 3
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // set new password
    try {
      const response = await fetch('/auth/reset-pw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (!response.ok) throw new Error('Failed to reset password.');
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password."
      });
      //redirect to login page
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit = newPassword && confirmPassword && passwordsMatch && newPassword.length >= 8;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-primary">Bercerita</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Enter Code"}
              {step === 3 && "Set New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the code sent to your email"}
              {step === 3 && "Enter your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Reset Code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Enter code"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={confirmPassword && !passwordsMatch ? 'border-red-500' : ''}
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500">
                      Passwords do not match
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !canSubmit}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
