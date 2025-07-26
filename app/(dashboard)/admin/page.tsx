"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { authApi } from "@/lib/api/auth";
import { parseISO, isThisWeek } from "date-fns";

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
  Search,
  Filter,
  List,
  Grid,
  User as UserIcon,
  Star,
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
import { cn } from "@/lib/utils";
type DbUser = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_login_time: string;
  school_id: string;
  notes: string;
  grade?: string;
  points?: number;
};

// Add proper type for student quiz data
type StudentQuizData = {
  total_points: number;
  points_history: Array<{
    points: number;
    date: string;
    description: string;
  }>;
  avg_quiz_grade: string;
  quiz_history: Array<{
    quiz_name: string;
    date: string;
    grade: string;
    retakes: number;
  }>;
  badges_earned: number;
  badges: Array<{
    badge_id: string;
    name: string;
    earned_at: string;
    description: string;
    icon_url: string;
  }>;
  learning_streak: number;
  achievements: Array<{
    achievement_id: string;
    name: string;
    description: string;
    completed_at: string;
  }>;
};

export default function AdminDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [students, setStudents] = useState<DbUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  //updating studets
  const [selectedStudent, setSelectedStudent] = useState<DbUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  // Fix the type here - it should be StudentQuizData or null, not an array
  const [studentQuizAttempts, setStudentQuizAttempts] =
    useState<StudentQuizData | null>(null);

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

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
  const handleStudentClick = async (student: DbUser) => {
    setEditStudent(student);
    setEditForm({
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      email: student.email || "",
      notes: student.notes || "",
    });

    try {
      const res = await fetch(`/api/admin/student/${student.username}`);
      if (!res.ok) throw new Error("Failed to fetch student quiz attempts");
      const data = await res.json();
      console.log("Quiz attempts:", data);
      setStudentQuizAttempts(data); // store it in state
    } catch (error) {
      console.error("Error fetching student quiz attempts:", error);
      setStudentQuizAttempts(null); // clear or fallback
    }
  };
  function getThisWeekQuizStatus(
    pointsHistory: StudentQuizData["points_history"]
  ) {
    const weekly = pointsHistory
      .filter((entry) => isThisWeek(parseISO(entry.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const result: ("completed" | "pending")[] = [];

    for (let i = 0; i < 3; i++) {
      result.push(i < weekly.length ? "completed" : "pending");
    }

    return result;
  }
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
        // If data.student_data exists, convert to array
        if (data.student_data) {
          setStudents(Object.values(data.student_data));
        } else {
          setStudents(data);
        }
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

  // Filtered students based on search
  const filteredStudents = students.filter((student) => {
    const name = `${student.first_name || ""} ${
      student.last_name || ""
    }`.toLowerCase();
    const username = student.username?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase())
    );
  });

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {schoolName} students
              </h2>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Input
                    type="text"
                    placeholder="Search Students"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button variant="outline" size="icon" className="ml-2">
                  <Filter className="h-5 w-5" />
                </Button>
                <div className="flex items-center ml-2 border rounded overflow-hidden">
                  <button
                    className={`px-2 py-1 ${
                      viewMode === "list" ? "bg-gray-200 dark:bg-gray-700" : ""
                    }`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    type="button"
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    className={`px-2 py-1 ${
                      viewMode === "grid" ? "bg-gray-200 dark:bg-gray-700" : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    type="button"
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                </div>
                <Button
                  className="ml-2 bg-rose-600 hover:bg-rose-700"
                  onClick={() => {
                    /* trigger add student tab */
                  }}
                >
                  Add a Student
                </Button>
              </div>
            </div>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading students...
                </span>
              </div>
            ) : filteredStudents.length === 0 ? (
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
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredStudents.map((student, idx) => (
                  <Card
                    key={student.user_id || student.username || idx}
                    onClick={() => handleStudentClick(student)}
                    className="hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-lg">
                            {getUserInitials(student)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            {getDisplayName(student)}
                          </CardTitle>
                          <CardDescription className="text-sm truncate">
                            {student.username}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto p-0 mb-4"
                        >
                          <span className="sr-only">More options</span>
                          ...
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <UserIcon className="h-4 w-4 mr-1" />{" "}
                          {student.grade ? student.grade + " grade" : "-"}
                        </span>
                        <span className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <Star className="h-4 w-4 mr-1" />{" "}
                          {typeof student.points === "number"
                            ? student.points
                            : 0}{" "}
                          points
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredStudents.map((student, idx) => (
                  <Card
                    key={student.user_id || student.username || idx}
                    onClick={() => handleStudentClick(student)}
                    className="hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer rounded-2xl bg-white dark:bg-gray-900 px-0"
                  >
                    <CardContent className="flex items-center justify-between gap-x-6 py-2 px-6 min-h-[56px]">
                      {/* Avatar + Name */}
                      <div className="flex items-center gap-x-3 min-w-[180px]">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold text-base">
                            {getUserInitials(student)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-base text-gray-900 dark:text-white whitespace-nowrap">
                          {getDisplayName(student)}
                        </span>
                      </div>
                      {/* Username */}
                      <span className="text-gray-500 dark:text-gray-400 text-base whitespace-nowrap min-w-[120px] ml-[100px] text-center">
                        {student.username}
                      </span>
                      {/* Grade */}
                      <span className="flex items-center dark:text-gray-400  text-base whitespace-nowrap min-w-[110px] ml-[100px] justify-center">
                        <UserIcon className="h-5 w-5 mr-1" />{" "}
                        {student.grade ? student.grade + " grade" : "-"}
                      </span>
                      {/* Points */}
                      <span className="flex items-center dark:text-gray-400  text-base whitespace-nowrap min-w-[110px] ml-[100px] justify-center">
                        <Star className="h-5 w-5 mr-1" />{" "}
                        {typeof student.points === "number"
                          ? student.points
                          : 0}{" "}
                        points
                      </span>
                      {/* Menu */}
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <span className="sr-only">More options</span>
                        ...
                      </Button>
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

          {/* Password Reset Modal */}
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

          {/* Student Edit Modal */}
          {editStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-7xl max-h-[94vh] overflow-y-auto shadow-2xl">
                {/* Header with Avatar and Name */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-green-500 text-white font-semibold text-2xl">
                        {getUserInitials(editStudent)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {getDisplayName(editStudent)}
                      </h2>
                      <p className="text-gray-500">{editStudent.username}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditStudent(null)}
                  >
                    ✕
                  </Button>
                </div>
                <hr className="my-2 w-full border-t border-gray-300 mb-4" />
                {/* Two Tab Layout */}
                <div className="bg-white dark:bg-gray-900 pl-1 pr-1  pb-6 rounded-xl">
                  <Tabs defaultValue="progress" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 rounded-md overflow-hidden ">
                      <TabsTrigger value="progress">PROGRESS</TabsTrigger>
                      <TabsTrigger value="profile" className="rounded-[8px]">
                        STUDENT PROFILE
                      </TabsTrigger>
                    </TabsList>

                    {/* Progress Tab */}
                    <TabsContent value="progress" className="space-y-4 p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6 w-full max-w-[300px]">
                          {studentQuizAttempts && (
                            <Card className="rounded-2xl shadow-sm">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-center text-base font-medium">
                                  This Week’s Progress
                                </CardTitle>
                              </CardHeader>

                              <CardContent className="text-sm space-y-2 text-center text-muted-foreground">
                                {getThisWeekQuizStatus(
                                  studentQuizAttempts.points_history
                                ).map((status, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-center gap-2"
                                  >
                                    <span
                                      className={
                                        status === "completed"
                                          ? "text-green-600"
                                          : "text-yellow-500"
                                      }
                                    >
                                      {status === "completed" ? "✔️" : "🕒"}
                                    </span>
                                    <span>Quiz {index + 1}</span>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )}

                          {/* Learning Streak + Time Spent */}
                          <Card className="p-6 rounded-2xl shadow-sm text-center flex flex-col items-center">
                            <div className="w-40 h-40 rounded-full border-[12px] border-rose-500 bg-rose-100 flex items-center justify-center relative">
                              <div className="text-center">
                                <div className="text-base text-gray-600 font-medium">
                                  Learning Streak
                                </div>
                                <div className="text-3xl font-bold text-rose-600">
                                  {studentQuizAttempts?.learning_streak || 0}{" "}
                                  days
                                </div>
                              </div>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-black">
                              {"10 hours 20 minutes"}
                            </p>
                            <hr className="my-2 w-[138px] border-t border-gray-300" />
                            <p className="text-xs text-muted-foreground ml-5">
                              time spent learning
                            </p>
                          </Card>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                          {/* Total Points */}
                          <Card className="p-6 rounded-2xl shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              {/* Left: Total Points Circle */}
                              <div className="flex justify-center md:justify-start md:w-[180px] ">
                                <div className="w-36 h-36 rounded-full border-[10px] border-emerald-400 bg-emerald-100 flex flex-col items-center justify-center text-center shadow-lg">
                                  <div className="text-sm text-emerald-700 font-semibold">
                                    Total Points
                                  </div>
                                  <div className="text-3xl font-bold text-black">
                                    {studentQuizAttempts?.total_points}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Points History Table */}
                              <div className="flex-1 space-y-2 w-full">
                                <div className="border rounded-lg overflow-hidden divide-y">
                                  {studentQuizAttempts?.points_history.map(
                                    (entry, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center px-4 py-2 text-sm bg-white"
                                      >
                                        <span className="font-medium text-black">
                                          {entry.points} points
                                        </span>
                                        <span className="text-muted-foreground">
                                          {formatDate(entry.date)}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {entry.description}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>

                                {/* View Details Link */}
                                <div className="text-right mt-2 text-sm text-purple-700 font-medium cursor-pointer hover:underline">
                                  View Details{" "}
                                  <span className="inline-block">⌄</span>
                                </div>
                              </div>
                            </div>
                          </Card>

                          {/* Average Quiz Grade + History */}
                          <Card className="p-6 rounded-2xl shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              {/* Left: Average Quiz Grade Circle */}
                              <div className="flex justify-center md:justify-start md:w-[180px] ">
                                <div className="w-36 h-36 rounded-full border-[10px] border-purple-700 bg-purple-100 flex flex-col items-center justify-center text-center shadow-lg">
                                  <div className="text-sm text-purple-700 font-semibold">
                                    Avg. Quiz Grade
                                  </div>
                                  <div className="text-3xl font-bold text-black">
                                    {studentQuizAttempts?.avg_quiz_grade ||
                                      "N/A"}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Quiz History Table */}
                              <div className="flex-1 space-y-2 w-full">
                                <div className="flex-1 w-full">
                                  <div className="border rounded-lg overflow-hidden divide-y">
                                    {studentQuizAttempts?.quiz_history.map(
                                      (quiz, idx) => (
                                        <div
                                          key={idx}
                                          className="grid grid-cols-4 gap-4 items-center px-4 py-2 text-sm bg-white"
                                        >
                                          <span className="text-black">
                                            {quiz.quiz_name}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {new Date(
                                              quiz.date
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {quiz.grade}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {quiz.retakes} retakes
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>

                                  {/* View Details Link */}
                                  <div className="text-right mt-2 text-sm text-purple-700 font-medium cursor-pointer hover:underline">
                                    View Details{" "}
                                    <span className="inline-block">⌄</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>

                          {/* Badges & Achievements */}
                          <Card className="p-6 rounded-2xl shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              {/* Left: Badges & Achievements Circle */}
                              <div className="flex justify-center md:justify-start md:w-[180px]">
                                <div className="w-36 h-36 rounded-full border-[10px] border-yellow-400 bg-yellow-100 flex flex-col items-center justify-center text-center shadow-lg">
                                  <div className="text-sm text-yellow-700 font-semibold">
                                    Badges & Achievements
                                  </div>
                                  <div className="text-3xl font-bold text-black">
                                    {(studentQuizAttempts?.badges.length || 0) +
                                      (studentQuizAttempts?.achievements
                                        .length || 0)}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Badges and Achievements Lists */}
                              <div className="flex flex-col md:flex-row gap-4 w-full">
                                {/* Badges List */}
                                <div className="flex-1 space-y-2">
                                  <div className="border rounded-lg overflow-hidden divide-y">
                                    {studentQuizAttempts?.badges.map(
                                      (badge, idx) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-center px-4 py-2 text-sm bg-white"
                                        >
                                          <span className="text-black">
                                            {badge.name}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {new Date(
                                              badge.earned_at
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Achievements List */}
                                <div className="flex-1 space-y-2">
                                  <div className="border rounded-lg overflow-hidden divide-y">
                                    {studentQuizAttempts?.achievements.map(
                                      (ach, idx) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-center px-4 py-2 text-sm bg-white"
                                        >
                                          <span className="text-black">
                                            {ach.name}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {new Date(
                                              ach.completed_at
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* View Details Link */}
                            <div className="text-right mt-4 text-sm text-purple-700 font-medium cursor-pointer hover:underline">
                              View Details{" "}
                              <span className="inline-block">⌄</span>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Student Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                      <div className="w-full flex justify-center">
                        <div className="max-w-2xl ">
                          {/* Account Details Section */}
                          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">
                                Account Details
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Edit
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>First Name</Label>
                                <Input
                                  value={editForm.first_name}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      first_name: e.target.value,
                                    }))
                                  }
                                  className="mt-1"
                                  placeholder="First name"
                                />
                              </div>
                              <div>
                                <Label>Last Name</Label>
                                <Input
                                  value={editForm.last_name}
                                  onChange={(e) =>
                                    setEditForm((f) => ({
                                      ...f,
                                      last_name: e.target.value,
                                    }))
                                  }
                                  className="mt-1"
                                  placeholder="Last name"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label>Email</Label>
                              <Input
                                value={editForm.email}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    email: e.target.value,
                                  }))
                                }
                                className="mt-1"
                                placeholder="Email address"
                              />
                            </div>

                            <div className="mt-4">
                              <Label>Username</Label>
                              <Input
                                value={editStudent.username}
                                disabled
                                className="mt-1 bg-gray-100 dark:bg-gray-700"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <Label>School</Label>
                                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                  <option>
                                    {schoolName || "Not assigned"}
                                  </option>
                                </select>
                              </div>
                              <div>
                                <Label>Grade</Label>
                                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                  <option>
                                    {editStudent.grade || "Not assigned"}
                                  </option>
                                </select>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label>Assigned Administrator</Label>
                              <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option>
                                  {user.first_name || "Current Admin"}
                                </option>
                              </select>
                            </div>

                            <div className="mt-4">
                              <Label>Notes</Label>
                              <hr className="my-2 w-full border-t border-gray-300 mb-4 mt-3" />
                              <textarea
                                value={editForm.notes}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    notes: e.target.value,
                                  }))
                                }
                                placeholder="Add notes about this student..."
                                className="mt-1 w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                              />
                            </div>
                          </div>

                          {/* Password Settings Section */}
                          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">
                                Password Settings
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => setSelectedStudent(editStudent)}
                              >
                                Change Password
                              </Button>
                            </div>

                            <div>
                              <Label>Password</Label>
                              <div className="relative mt-1">
                                <Input
                                  type="password"
                                  value="••••••••••••"
                                  disabled
                                  className="bg-gray-100 dark:bg-gray-700 pr-10"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Account Options Section */}
                          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Account Options
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="text-red-600 border-red-600 opacity-50"
                                title="Delete functionality not yet available"
                              >
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
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
                    {isUpdating ? "Updating..." : "Save Changes"}
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
