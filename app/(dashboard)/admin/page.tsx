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
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [students, setStudents] = useState<DbUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  console.log("Admin's school:", user?.school_id);
  //updating studets
  const [selectedStudent, setSelectedStudent] = useState<DbUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  // Add new state for edit modal
  const [editStudent, setEditStudent] = useState<DbUser | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    notes: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  //
  // Add Student form state
  const [addStudentForm, setAddStudentForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  console.log("🔒 Admin page render:", {
    isLoading,
    hasUser: !!user,
    userRole: user?.role,
    userEmail: user?.email,
  });

  // Function to find student by username or email
  const findStudentByTarget = (targetStudent: {
    email?: string;
    username?: string;
  }) => {
    return students.find((student) => {
      if (
        targetStudent.username &&
        student.username === targetStudent.username
      ) {
        return true;
      }
      if (targetStudent.email && student.email === targetStudent.email) {
        return true;
      }
      return false;
    });
  };

  // Auto-select target student for password reset (special link flow only)
  useEffect(() => {
    if (students.length > 0) {
      const targetStudentData = sessionStorage.getItem("targetStudentReset");
      if (targetStudentData) {
        try {
          const targetStudent = JSON.parse(targetStudentData);
          const foundStudent = findStudentByTarget(targetStudent);
          if (foundStudent) {
            setSelectedStudent(foundStudent);
            setShowModal(true);
          }
          sessionStorage.removeItem("targetStudentReset");
        } catch (error) {
          sessionStorage.removeItem("targetStudentReset");
        }
      }
    }
  }, [students]);

  // When clicking a student, open edit modal (not password reset)
  const handleStudentClick = (student: DbUser) => {
    setEditStudent(student);
    setEditForm({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      notes: student.notes || "",
    });
  };

  // Update student info handler
  const handleUpdateStudent = async () => {
    if (!editStudent) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editStudent.username,
          ...editForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update student");
      toast({
        title: "Student Updated",
        description: `Information for ${editStudent.username} updated.`,
      });
      setEditStudent(null);
      // Optionally refresh students list
      window.location.reload();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update student.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchSchoolName = async () => {
      if (!user?.school_id) return;

      try {
        const response = await fetch("/api/auth/school");
        const schools = await response.json();

        const school = schools.find(
          (s: { school_id: string }) => s.school_id === user.school_id
        );

        if (school) {
          setSchoolName(school.name); // or whatever field represents the name
        }
      } catch (error) {
        console.error("Failed to fetch school data:", error);
      }
    };

    fetchSchoolName();
  }, [user?.school_id]);
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

  // Check password match whenever passwords change
  useEffect(() => {
    if (addStudentForm.password || addStudentForm.confirmPassword) {
      setPasswordMatch(
        addStudentForm.password === addStudentForm.confirmPassword
      );
    } else {
      setPasswordMatch(true);
    }
  }, [addStudentForm.password, addStudentForm.confirmPassword]);

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
    const { username, password, confirmPassword, first_name, last_name } =
      addStudentForm;

    // Validation
    if (
      !username.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
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

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirmation password do not match.",
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

      // Get token from cookies
      const token = document.cookie.match(/token=([^;]+)/)?.[1];

      const response = await fetch("/api/admin/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username,
          password,
          first_name,
          last_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add student");
      }

      toast({
        title: "Student Added Successfully",
        description: `${first_name} ${last_name} has been added to the system.`,
      });

      // Reset form
      setAddStudentForm({
        username: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
      });

      // Refresh the students list
      window.location.reload();
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Failed to Add Student",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };
  const resetStudentPassword = async () => {
    if (!selectedStudent) return;
    if (!newPassword.trim() || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setIsResettingPassword(true);
    try {
      const res = await fetch("/api/admin/reset-pw", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedStudent.username,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      toast({
        title: "Password Reset Successful",
        description: `Password for ${selectedStudent.username} updated.`,
      });
      setShowModal(false);
      setNewPassword("");
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err.message || "Could not reset password.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
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
                {schoolName} students
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
                    onClick={() => handleStudentClick(student)}
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
                  Fill in the student's credentials below.
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
                      className={
                        !passwordMatch
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={addStudentForm.confirmPassword}
                      onChange={(e) =>
                        setAddStudentForm({
                          ...addStudentForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      onKeyPress={handleKeyPress}
                      className={
                        !passwordMatch
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {!passwordMatch && (
                      <p className="text-sm text-red-500">
                        Passwords do not match
                      </p>
                    )}
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
          {showModal && selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">
                  Reset Password for {selectedStudent.username}
                </h2>
                <div className="space-y-4">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={resetStudentPassword}
                      disabled={isResettingPassword}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isResettingPassword ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {editStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">
                    Edit Student: {editStudent.username}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditStudent(null)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Editable Fields */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">
                        Student Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit_first_name">First Name *</Label>
                          <Input
                            id="edit_first_name"
                            value={editForm.first_name}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                first_name: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_last_name">Last Name *</Label>
                          <Input
                            id="edit_last_name"
                            value={editForm.last_name}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                last_name: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit_username">Username</Label>
                          <Input
                            id="edit_username"
                            value={editStudent.username}
                            disabled
                            className="mt-1 bg-gray-100 dark:bg-gray-700"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Username cannot be changed
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="edit_school_id">School</Label>
                          <Input
                            id="edit_school_id"
                            value={
                              schoolName ||
                              `School ID: ${
                                user?.school_id || "Not assigned"
                              } ()`
                            }
                            disabled
                            className="mt-1 bg-gray-100 dark:bg-gray-700"
                          />
                          {user?.school_id && (
                            <p className="text-xs text-gray-500 mt-1">
                              School ID: {user.school_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">Notes</h3>
                      <textarea
                        id="edit_notes"
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, notes: e.target.value }))
                        }
                        placeholder="Add notes about this student..."
                        className="mt-1 w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use this section to add any additional notes or comments
                        about the student.
                      </p>
                    </div>
                    {/* Learning Streak Activity Section (template with mock data) */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">
                        Learning Streak Activity
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div className="text-gray-500">
                          Consecutive Days Active:{" "}
                          <span className="font-semibold">14</span>
                        </div>
                        <div className="text-gray-500">
                          Total Time Spent Learning:{" "}
                          <span className="font-semibold">5h 30m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right Column - Info & Templates */}
                  <div className="space-y-6">
                    {/* Grade Level Section (template with mock data) */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">
                        Grade Level
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          3rd Grade
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Elementary School
                        </span>
                      </div>
                      <div className="mt-2 text-gray-500">
                        Homeroom:{" "}
                        <span className="font-semibold">Ms. Smith</span>
                      </div>
                    </div>
                    {/* Badges Earned Section (template with mock data) */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">
                        Badges Earned
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex flex-col items-center bg-yellow-100 dark:bg-yellow-900 rounded p-2">
                          <span className="text-2xl">🏅</span>
                          <span className="text-xs mt-1">Math Whiz</span>
                        </div>
                        <div className="flex flex-col items-center bg-green-100 dark:bg-green-900 rounded p-2">
                          <span className="text-2xl">📚</span>
                          <span className="text-xs mt-1">Bookworm</span>
                        </div>
                        <div className="flex flex-col items-center bg-blue-100 dark:bg-blue-900 rounded p-2">
                          <span className="text-2xl">🧪</span>
                          <span className="text-xs mt-1">Science Star</span>
                        </div>
                        <div className="flex flex-col items-center bg-purple-100 dark:bg-purple-900 rounded p-2">
                          <span className="text-2xl">🔥</span>
                          <span className="text-xs mt-1">Streak Master</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Total Points:{" "}
                        <span className="font-semibold">1,250</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">
                        Account Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Account Status</Label>
                          <div className="mt-1">
                            <Badge
                              variant={
                                editStudent.is_admin
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {editStudent.is_admin
                                ? "Admin Account"
                                : "Student Account"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label>Created At</Label>
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {editStudent.created_at
                              ? formatDate(editStudent.created_at)
                              : "Unknown"}
                          </div>
                        </div>
                        <div>
                          <Label>Last Login</Label>
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {editStudent.last_login_time
                              ? formatDate(editStudent.last_login_time)
                              : "Never logged in"}
                          </div>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <div className="mt-1 text-sm text-gray-900 dark:text-white">
                            {editStudent.email || "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quiz History Section (template with mock data) */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 shadow border">
                      <h3 className="text-lg font-semibold mb-4">
                        Quiz History
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="px-2 py-1 text-left font-medium">
                                Quiz
                              </th>
                              <th className="px-2 py-1 text-left font-medium">
                                Score
                              </th>
                              <th className="px-2 py-1 text-left font-medium">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-2 py-1">Math Basics</td>
                              <td className="px-2 py-1">85%</td>
                              <td className="px-2 py-1">2024-05-01</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1">Science Quiz 1</td>
                              <td className="px-2 py-1">92%</td>
                              <td className="px-2 py-1">2024-05-03</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1">
                                Reading Comprehension
                              </td>
                              <td className="px-2 py-1">78%</td>
                              <td className="px-2 py-1">2024-05-07</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-10 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setEditStudent(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStudent}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUpdating ? "Updating..." : "Update Student"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
