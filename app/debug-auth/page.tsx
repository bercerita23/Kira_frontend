"use client";

import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DebugAuthPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Function to manually clear all auth data
  const forceReset = () => {
    // Clear all cookies
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    //console.log('🧹 All auth data cleared');

    // Force reload the page
    window.location.reload();
  };

  // Function to navigate directly to login bypassing router
  const forceLogin = () => {
    window.location.href = "/login";
  };

  // Function to navigate directly to dashboard bypassing router
  const forceDashboard = () => {
    window.location.href = "/dashboard";
  };

  const getCookies = () => {
    if (typeof document !== "undefined") {
      return document.cookie;
    }
    return "N/A (server-side)";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Auth State</CardTitle>
              <CardDescription>
                Current authentication status and user data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
              </div>
              <div>
                <strong>User:</strong>{" "}
                {user ? JSON.stringify(user, null, 2) : "null"}
              </div>
              <div>
                <strong>Cookies:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                  {getCookies()}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Actions</CardTitle>
              <CardDescription>
                Actions to test and reset authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={forceReset} variant="destructive">
                  🧹 Force Reset All Auth Data
                </Button>
                <Button onClick={() => logout()} variant="outline">
                  🚪 Normal Logout
                </Button>
                <Button onClick={forceLogin} variant="default">
                  🔑 Force Navigate to Login
                </Button>
                <Button onClick={forceDashboard} variant="secondary">
                  📊 Force Navigate to Dashboard
                </Button>
                <Button onClick={() => router.push("/login")} variant="outline">
                  🔑 Router Push to Login
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                >
                  📊 Router Push to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
