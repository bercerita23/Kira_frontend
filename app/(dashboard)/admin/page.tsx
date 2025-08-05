"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { authApi } from "@/lib/api/auth";
import { parseISO, isThisWeek } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  school: string;
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
  student_info: {
    first_name: string;
    last_name: string;
    created_at: string;
    notes: string;
    last_login_time: string;
    deactivated: boolean;
    grade: string;
  };
};

export default function AdminDashboardPage() {
  const GRADES = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
  const [showAllQuizHistory, setShowAllQuizHistory] = useState(false);
  const [showAllAwards, setShowAllAwards] = useState(false);

  const { user, isLoading, logout } = useAuth();
  const [showFilter, setShowFilter] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
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
  const [showAllPointsHistory, setShowAllPointsHistory] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  // Add new state for edit modal
  const [editStudent, setEditStudent] = useState<DbUser | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    notes: "",
    school: "",
    grade: "",
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
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "analytics">(
    "students"
  );
  const [passwordError, setPasswordError] = useState(false);

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

  async function deactivateStudent(username: string) {
    try {
      const response = await fetch("/api/admin/deactivate_student", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to deactivate student");
      }

      console.log("✅ Student deactivated:", data);
      // Optionally refetch students or show a success toast here
    } catch (error) {
      console.error("❌ Error deactivating student:", error);
      // Optionally show an error toast here
    }
  }

  async function reactivateStudent(username: string) {
    try {
      const response = await fetch("/api/admin/reactivate-student", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to reactivate student");
      }

      console.log("✅ Student reactivated:", data);
      // Optionally refresh state/UI here
    } catch (error) {
      console.error("❌ Reactivation failed:", error);
    }
  }

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
      school: student.school || "", // or student.school if that’s correct
      grade: student.grade || "",
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
  type QuizStatus = { status: "completed" | "pending"; id: string };

  function getThisWeekQuizStatus(
    quizHistory: StudentQuizData["quiz_history"]
  ): QuizStatus[] {
    const weekly = quizHistory
      .filter((entry) => isThisWeek(parseISO(entry.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const uniqueQuizzes = Array.from(
      new Map(weekly.map((q) => [q.quiz_name, q])).values()
    );

    const result: QuizStatus[] = [];

    for (let i = 0; i < 3; i++) {
      if (i < uniqueQuizzes.length) {
        const entry = uniqueQuizzes[i];
        result.push({
          status: "completed",
          id: `${entry.date}-${entry.quiz_name}`,
        });
      } else {
        result.push({
          status: "pending",
          id: `pending-${i}`,
        });
      }
    }

    return result;
  }
  const handleUpdateStudent = async () => {
    if (!editStudent) return;
    setIsUpdating(true);

    try {
      const rawPayload = {
        username: editStudent.username,
        ...editForm,
        school: editStudent.school || "",
        grade: editForm.grade || "",
      };

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== "")
      );
      console.log("🟡 Sending update payload to /api/admin/update:", payload);

      const res = await fetch("/api/admin/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update student");
      }

      toast({
        title: "Student Updated",
        description: `Information for ${editStudent.username} updated.`,
      });

      // Reset and refresh
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
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase());
    const matchesGrade =
      selectedGrades.length === 0 ||
      selectedGrades.includes(student.grade || "");

    return matchesSearch && matchesGrade;
  });

  {
    /* Stats Overview */
  }
  // <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  //   <Card>
  //     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //       <CardTitle className="text-sm font-medium">
  //         Total Students
  //       </CardTitle>
  //       <Users className="h-4 w-4 text-muted-foreground" />
  //     </CardHeader>
  //     <CardContent>
  //       <div className="text-2xl font-bold">{students.length}</div>
  //       <p className="text-xs text-muted-foreground">Active learners</p>
  //     </CardContent>
  //   </Card>

  //   <Card>
  //     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //       <CardTitle className="text-sm font-medium">
  //         Recent Signups
  //       </CardTitle>
  //       <UserCheck className="h-4 w-4 text-muted-foreground" />
  //     </CardHeader>
  //     <CardContent>
  //       <div className="text-2xl font-bold">
  //         {
  //           students.filter((s) => {
  //             const signupDate = new Date(s.created_at || "");
  //             const weekAgo = new Date();
  //             weekAgo.setDate(weekAgo.getDate() - 7);
  //             return signupDate > weekAgo;
  //           }).length
  //         }
  //       </div>
  //       <p className="text-xs text-muted-foreground">Last 7 days</p>
  //     </CardContent>
  //   </Card>

  //   <Card>
  //     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //       <CardTitle className="text-sm font-medium">
  //         School Assigned
  //       </CardTitle>
  //       <Users className="h-4 w-4 text-muted-foreground" />
  //     </CardHeader>
  //     <CardContent>
  //       <div className="text-2xl font-bold">
  //         {students.filter((s) => s.school_id).length}
  //       </div>
  //       <p className="text-xs text-muted-foreground">
  //         Students with schools
  //       </p>
  //     </CardContent>
  //   </Card>
  // </div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side: Branding */}
          <div className="flex items-center gap-2">
            <span className="text-[#B40000] font-semibold text-lg">Kira</span>
            <span className="text-gray-700 font-medium">Admin Dashboard</span>
          </div>

          {/* Middle: Tabs */}
          <div className="flex bg-[#f1f1f1] p-1 rounded-[8px] ">
            <button
              className={`px-4 py-1 text-sm font-medium rounded-[8px] ${
                activeTab === "students"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("students")}
            >
              My Students
            </button>
            <button
              className={`px-4 py-1 text-sm font-medium rounded-[8px] ${
                activeTab === "analytics"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Usage Analytics
            </button>
          </div>

          {/* Right side: User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-[#B40000]">Administrator</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarFallback>
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-50 bg-white">
                <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`ml-2 ${
                      selectedGrades.length > 0 ? "text-[#B40000]" : ""
                    }`}
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                  {selectedGrades.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[#B40000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedGrades.length}
                    </div>
                  )}
                </div>
                {showFilter && (
                  <div className="absolute mt-[280px] mr-12 w-64 right-0 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-semibold">Filter Results</h3>
                      <button onClick={() => setShowFilter(false)}>✕</button>
                    </div>
                    <hr className="mb-3" />
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Grade</p>
                      {["3rd", "4th", "5th", "6th", "7th"].map((grade) => (
                        <label
                          key={grade}
                          className="flex items-center justify-between mb-2"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedGrades.includes(grade)}
                              onChange={() => {
                                setSelectedGrades((prev) =>
                                  prev.includes(grade)
                                    ? prev.filter((g) => g !== grade)
                                    : [...prev, grade]
                                );
                              }}
                            />
                            <span>{grade}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({students.filter((s) => s.grade === grade).length})
                          </span>
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={() => setShowFilter(false)}
                      className="w-full bg-[#B40000] text-white rounded-sm"
                    >
                      Apply
                    </Button>
                    <button
                      className="mt-2 text-sm text-[#B40000] underline w-full"
                      onClick={() => setSelectedGrades([])}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

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
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={cn(passwordError && "border-red-500")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(passwordError && "border-red-500")}
                    />
                  </div>

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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-500 text-white font-semibold text-1xl">
                        {getUserInitials(editStudent)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-1xl font-bold">
                        {getDisplayName(editStudent)}
                      </h2>
                      <p className="text-gray-500 text-[13px]">
                        {editStudent.username}
                      </p>
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
                <div className="bg-white dark:bg-gray-900 pl-1 pr-1  pb-2 rounded-xl">
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
                                  studentQuizAttempts.quiz_history
                                ).map((entry, index) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-center justify-center gap-2"
                                  >
                                    <span
                                      className={
                                        entry.status === "completed"
                                          ? "text-green-600"
                                          : "text-yellow-500"
                                      }
                                    >
                                      {entry.status === "completed"
                                        ? "✔️"
                                        : "🕒"}
                                    </span>
                                    <span>Quiz {index + 1}</span>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )}
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
                                  {(showAllPointsHistory
                                    ? studentQuizAttempts?.points_history
                                    : studentQuizAttempts?.points_history.slice(
                                        0,
                                        3
                                      )
                                  )?.map((entry, idx) => (
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
                                  ))}
                                </div>

                                {/* View Details Link */}
                                <div
                                  className="text-right mt-2 text-sm text-purple-700 font-medium cursor-pointer hover:underline"
                                  onClick={() =>
                                    setShowAllPointsHistory(
                                      !showAllPointsHistory
                                    )
                                  }
                                >
                                  {showAllPointsHistory
                                    ? "Hide Details ⌃"
                                    : "View Details ⌄"}
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
                                    {(showAllQuizHistory
                                      ? studentQuizAttempts?.quiz_history
                                      : studentQuizAttempts?.quiz_history.slice(
                                          0,
                                          3
                                        )
                                    )?.map((quiz, idx) => (
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
                                    ))}
                                  </div>

                                  {/* View Details Link */}
                                  <div
                                    className="text-right mt-2 text-sm text-purple-700 font-medium cursor-pointer hover:underline"
                                    onClick={() =>
                                      setShowAllQuizHistory(!showAllQuizHistory)
                                    }
                                  >
                                    {showAllQuizHistory
                                      ? "Hide Details ⌃"
                                      : "View Details ⌄"}
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
                                    {(showAllAwards
                                      ? studentQuizAttempts?.badges
                                      : studentQuizAttempts?.badges.slice(0, 3)
                                    )?.map((badge, idx) => (
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
                                    ))}
                                  </div>
                                </div>

                                {/* Achievements List */}
                                <div className="flex-1 space-y-2">
                                  <div className="border rounded-lg overflow-hidden divide-y">
                                    {(showAllAwards
                                      ? studentQuizAttempts?.achievements
                                      : studentQuizAttempts?.achievements.slice(
                                          0,
                                          3
                                        )
                                    )?.map((ach, idx) => (
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
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* View Details Link */}
                            <div
                              className="text-right mt-4 text-sm text-purple-700 font-medium cursor-pointer hover:underline"
                              onClick={() => setShowAllAwards(!showAllAwards)}
                            >
                              {showAllAwards
                                ? "Hide Details ⌃"
                                : "View Details ⌄"}
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
                                <div className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                  {schoolName || "Not assigned"}
                                </div>
                              </div>
                              <div>
                                <Label>Grade</Label>
                                <select
                                  value={editForm.grade || ""}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      grade: e.target.value,
                                    }))
                                  }
                                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="">Not assigned</option>
                                  {GRADES.map((grade) => (
                                    <option key={grade} value={grade}>
                                      {grade}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label>Notes</Label>
                              <hr className="my-2 w-full border-t border-gray-300 mb-4 mt-3" />
                              <textarea
                                value={
                                  editForm.notes !== ""
                                    ? editForm.notes
                                    : studentQuizAttempts?.student_info.notes ||
                                      ""
                                }
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

                          {/* Account Options Section */}
                          <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 mb-5">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                Account Options
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`border-red-600 hover:bg-red-50 ${
                                  studentQuizAttempts?.student_info.deactivated
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                                onClick={() => {
                                  const username = editStudent.username;
                                  if (
                                    studentQuizAttempts?.student_info
                                      .deactivated
                                  ) {
                                    reactivateStudent(username);
                                  } else {
                                    deactivateStudent(username);
                                  }
                                }}
                              >
                                {studentQuizAttempts?.student_info.deactivated
                                  ? "Reactivate Account"
                                  : "Deactivate Account"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
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
