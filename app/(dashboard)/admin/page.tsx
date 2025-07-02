"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { authApi, DbUser } from "@/lib/api/auth";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Crown,
  Shield,
  LogOut,
  UserPlus,
  Plus,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<DbUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Add Student form state
  const [addStudentForm, setAddStudentForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  console.log("🔒 Admin page render:", {
    isLoading,
    hasUser: !!user,
    userRole: user?.role,
    userEmail: user?.email,
  });

  // Fetch all users and filter students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log("🔄 Admin Dashboard: Fetching all users from API...");
        const token = document.cookie.match(/token=([^;]+)/)?.[1] || "";

        const response = await fetch("/api/admin/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        console.log("🎓 Admin Dashboard: Received students:", data);
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    if (user && (user.role === "admin" || user.role === "super_admin")) {
      fetchStudents();
    }
  }, [user]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log("⏳ Admin page: Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!user) {
    console.log("🚫 Admin page: No user found, showing login prompt");
    // Force redirect to admin login
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login?from=/admin";
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Admin Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Redirecting to admin login...
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/admin/login">Go to Admin Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user.role !== "admin" && user.role !== "super_admin") {
    console.log("🚫 Admin page: User is not admin, denying access", {
      userRole: user.role,
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/dashboard">Go to Student Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ Admin page: Access granted for admin user");

  // Helper function to get user initials
  const getUserInitials = (user: DbUser) => {
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || "";
    return (
      firstInitial + lastInitial || user.email?.charAt(0)?.toUpperCase() || "U"
    );
  };

  // Helper function to get display name
  const getDisplayName = (user: DbUser) => {
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return user.email || "Unknown User";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Add Student functionality
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addStudent = async () => {
    const { username, password, first_name, last_name } = addStudentForm;

    // Validation
    if (
      !username.trim() ||
      !password.trim() ||
      !first_name.trim() ||
      !last_name.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingStudent(true);

    try {
      console.log("🎓 Adding new student:", addStudentForm);

      const response = await fetch("/api/admin/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie.match(/token=([^;]+)/)?.[1] || ""
          }`,
        },
        body: JSON.stringify(addStudentForm),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("❌ Failed to parse response JSON:", jsonError);
        throw new Error(
          `Invalid response from server (Status: ${response.status})`
        );
      }

      if (!response.ok) {
        console.error("❌ Backend returned error:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to add students."
          );
        } else if (response.status === 422) {
          // Validation error
          const errorDetails =
            data.detail || data.message || "Validation failed";
          throw new Error(
            `Validation error: ${
              Array.isArray(errorDetails)
                ? errorDetails.map((e) => e.msg).join(", ")
                : errorDetails
            }`
          );
        } else if (response.status === 503) {
          // Service unavailable - show cleaner message
          throw new Error(
            "Add Student feature is temporarily unavailable due to backend issues. Please contact your system administrator."
          );
        } else {
          throw new Error(
            data.detail || data.message || `Server error (${response.status})`
          );
        }
      }

      toast({
        title: "Student Added Successfully!",
        description: `${first_name} ${last_name} has been added to the system.`,
      });

      // Reset form
      setAddStudentForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
      });

      // Refresh student list
      window.location.reload();
    } catch (error) {
      console.error("Failed to add student:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while adding the student. Please try again.";
      toast({
        title: "Failed to Add Student",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Handle key press for form inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addStudent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header - Fixed at top */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Student Management System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.first_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Active learners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Signups
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  students.filter((s) => {
                    const signupDate = new Date(s.created_at || "");
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return signupDate > weekAgo;
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                School Assigned
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter((s) => s.school_id).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Students with schools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Students ({students.length})
            </TabsTrigger>
            <TabsTrigger
              value="add-student"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Student
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                All Students ({students.length})
              </h2>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Data
              </Button>
            </div>

            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading students...
                </span>
              </div>
            ) : students.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No Students Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are currently no students registered in the system.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {students.map((student) => (
                  <Card
                    key={student.user_id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                            {getUserInitials(student)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {getDisplayName(student)}
                          </CardTitle>
                          <CardDescription className="text-sm truncate">
                            {student.email}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Role:
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Student
                          </Badge>
                        </div>

                        {student.school_id && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              School ID:
                            </span>
                            <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              #{student.school_id}
                            </span>
                          </div>
                        )}

                        {student.created_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Joined:
                            </span>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(student.created_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add Student Tab */}
          <TabsContent value="add-student" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Add New Student
                </CardTitle>
                <CardDescription>
                  Fill in the student’s credentials below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        value={addStudentForm.first_name}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            first_name: e.target.value,
                          })
                        }
                        onKeyPress={handleKeyPress}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        value={addStudentForm.last_name}
                        onChange={(e) =>
                          setAddStudentForm({
                            ...addStudentForm,
                            last_name: e.target.value,
                          })
                        }
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="student123"
                      value={addStudentForm.username}
                      onChange={(e) =>
                        setAddStudentForm({
                          ...addStudentForm,
                          username: e.target.value,
                        })
                      }
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={addStudentForm.password}
                      onChange={(e) =>
                        setAddStudentForm({
                          ...addStudentForm,
                          password: e.target.value,
                        })
                      }
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={addStudent}
                      disabled={isAddingStudent}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isAddingStudent ? "Adding..." : "Add Student"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
