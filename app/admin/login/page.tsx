"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Crown, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/context/auth-context';

export default function AdminLoginPage() {
  console.log('🔑 Admin Login Page loaded successfully');
  
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password, 'admin');
      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard!",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      
      // Show specific error for non-admin users
      if (errorMessage.includes('Access denied')) {
        toast({
          title: "Access Denied",
          description: "This portal is for administrators only.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('Incorrect Credentials')) {
        setError('Invalid admin credentials. Please check your email and password.');
      } else {
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError('');
    }
  };

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('email') || errorMessage.includes('account')) {
      return 'email';
    } else if (errorMessage.includes('password')) {
      return 'password';
    }
    return 'general';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">Kira Admin</span>
          </Link>
        </div>
        
        <Card className="shadow-xl border-purple-200 dark:border-purple-700">
          <CardHeader>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Administrator Access</CardTitle>
            </div>
            <CardDescription className="text-center">
              Admin login - Sign in to access the administration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="admin@example.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  className={`focus:ring-purple-500 focus:border-purple-500 ${error && getErrorType(error) === 'email' ? 'border-red-500' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  className={`focus:ring-purple-500 focus:border-purple-500 ${error && getErrorType(error) === 'password' ? 'border-red-500' : ''}`}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" /> Access Admin Panel
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Shield className="inline h-3 w-3 mr-1" />
              Authorized Personnel Only
            </div>
            <div className="border-t pt-3 w-full text-center">
              <p className="text-xs text-muted-foreground">
                Not an admin?{' '}
                <Link href="/login" className="text-purple-600 hover:underline font-medium">
                  Student Login
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
        
        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-purple-600 dark:text-purple-400">
            This portal is protected and monitored for security.
          </p>
        </div>
      </div>
    </div>
  );
} 