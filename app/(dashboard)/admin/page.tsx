//(dashboard}/admin/page.tsx)

"use client";
import AddStudentForm from "@/components/admin-dashboard/AddStudentForm";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { authApi } from "@/lib/api/auth";
import AnalyticsPage from "@/components/dashboard/analytics";
import ReviewQuestions from "@/components/ReviewQuestions";
import { parseISO, isThisWeek } from "date-fns";
import QuizAverageChart from "@/components/dashboard/line-graph";
import StudentList from "@/components/admin-dashboard/StudentList";
import StudentPasswordResetModal from "@/components/admin-dashboard/StudentPasswordResetModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import StudentToolbar from "@/components/admin-dashboard/StudentToolbar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import Link from "next/link";
import UploadContentSection from "@/components/admin-dashboard/UploadContentSection";
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
import StudentEditModal from "@/components/admin-dashboard/studentEditModal";
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
  const [reviewTopic, setReviewTopic] = useState<{
    topic_id: number;
    topic_name: string;
  } | null>(null);

  type QuizStat = {
    quiz_id: number;
    quiz_name?: string;
    mean_score: number;
    min_score?: number;
    max_score?: number;
    stddev_score?: number;
    median_score?: number;
    completion?: number;
  };

  interface StudentStat {
    user_id: number;
    first_name: string;
    mean_score: number;
  }

  interface TimeStats {
    avg_student_per_month: number;
    total_minutes: number;
  }

  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStat[] | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStat[] | null>(null);
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
  // Add new state for edit modal
  const [editStudent, setEditStudent] = useState<DbUser | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    notes: "",
    school: "",
    grade: "",
    username: "", // Add username to the form
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
    grade: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "students" | "analytics" | "upload"
  >("students");
  const [passwordError, setPasswordError] = useState(false);
  const [studentsActiveTab, setStudentsActiveTab] = useState<
    "students" | "add-student"
  >("students");

  const createStatsForStudent = (quizHistory: StudentQuizData) => {
    return quizHistory["quiz_history"].map(({ quiz_name, grade }) => ({
      quiz: quiz_name,
      average: parseFloat(grade),
    }));
  };

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
      //KAN 157: since api calls happen only once for this case we locally change the state to deactivated
      if (studentQuizAttempts) {
        setStudentQuizAttempts({
          ...studentQuizAttempts,
          student_info: {
            ...studentQuizAttempts.student_info,
            deactivated: true,
          },
        });
      }
      console.log("✅ Student deactivated:", data);
      toast({
        title: "Student Deactivated",
        description: "The student account has been deactivated.",
      });
    } catch (error) {
      console.error("❌ Error deactivating student:", error);
      toast({
        title: "Deactivation Failed",
        description: "Failed to deactivate student account.",
        variant: "destructive",
      });
    }
  }

  async function reactivateStudent(username: string) {
    try {
      const response = await fetch("/api/admin/reactivate_student", {
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
      if (studentQuizAttempts) {
        setStudentQuizAttempts({
          ...studentQuizAttempts,
          student_info: {
            ...studentQuizAttempts.student_info,
            deactivated: false,
          },
        });
      }
      toast({
        title: "Student Reactivated",
        description: "The student account has been reactivated.",
      });
    } catch (error) {
      console.error("❌ Reactivation failed:", error);
      toast({
        title: "Reactivation Failed",
        description: "Failed to reactivate student account.",
        variant: "destructive",
      });
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
      school: student.school || "",
      grade: student.grade || "",
      username: student.username || "", // Include current username
    });

    try {
      const res = await fetch(`/api/admin/student/${student.username}`);
      if (!res.ok) throw new Error("Failed to fetch student quiz attempts");
      const data = await res.json();
      console.log("Quiz attempts:", data);
      setStudentQuizAttempts(data); // store it in state
      console.log(studentQuizAttempts);
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
      const payload: any = {
        username: editStudent.username, // Original username for identification
      };

      // Add new_username if it has changed
      if (editForm.username && editForm.username !== editStudent.username) {
        payload.new_username = editForm.username;
      }

      // Add other fields that are not empty
      if (editForm.first_name.trim()) payload.first_name = editForm.first_name;
      if (editForm.last_name.trim()) payload.last_name = editForm.last_name;
      if (editForm.email.trim()) payload.email = editForm.email;
      if (editForm.notes.trim()) payload.notes = editForm.notes;
      if (editForm.grade.trim()) payload.grade = editForm.grade;
      if (editStudent.school) payload.school = editStudent.school;

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
        description: `Information for ${
          editForm.username || editStudent.username
        } updated successfully.`,
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
      console.log("Fetching school name for school_id:", user?.school_id);
      if (!user?.school_id) return;

      try {
        const response = await fetch("/api/auth/school");
        const schools = await response.json();
        console.log("Fetched schools:", schools);
        const school = schools.find(
          (s: { school_id: string }) => s.school_id === user.school_id
        );

        if (school) {
          setSchoolName(school.name);
        }

        const quizStatsRes = await fetch("/api/admin/quizzes");
        const quizStats = await quizStatsRes.json();
        console.log("Fetched stats:", quizStats);

        if (quizStats) {
          setQuizStats(quizStats);
        }

        const scoresRes = await fetch("/api/admin/mean-scores");
        const studentMeanScore = await scoresRes.json();
        console.log("Fetched scores:", studentMeanScore);
        if (studentMeanScore) {
          setStudentStats(studentMeanScore);
        }

        const timeStatsRes = await fetch("/api/admin/time-stats");
        const timeStatsData = await timeStatsRes.json();
        console.log("Fetched time stats:", timeStatsData);
        if (timeStatsData) {
          setTimeStats(timeStatsData);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Admin Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">Redirecting to admin login...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
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
    const {
      username,
      password,
      confirmPassword,
      first_name,
      last_name,
      grade,
    } = addStudentForm;

    // Validation
    if (
      !username.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !first_name.trim() ||
      !last_name.trim() ||
      !grade.trim()
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
          grade,
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
        grade: "",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left side: Branding */}
          <div className="flex items-center gap-2">
            <img
              src="/assets/header.png"
              alt="Kira Auth"
              style={{
                height: 40,
                width: "auto",
                objectFit: "contain",
                marginBottom: 0,
              }}
            />
            <span className="text-gray-700 font-lato font-[500]">
              Admin Dashboard
            </span>
          </div>

          {/* Middle: Tabs */}
          <div className="flex bg-[#f1f1f1] p-1 rounded-[8px] ">
            <button
              className={`px-4 py-1 text-sm font-lato font-[500] rounded-[8px] ${
                activeTab === "students"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("students")}
            >
              My Students
            </button>
            <button
              className={`px-4 py-1 text-sm font-lato font-[500] rounded-[8px] ${
                activeTab === "analytics"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Usage Analytics
            </button>
            <button
              className={`px-4 py-1 text-sm font-lato font-[500] rounded-[8px] ${
                activeTab === "upload"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Upload Content
            </button>
          </div>

          {/* Right side: User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-lato font-[500] text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs font-lato font-[400] text-[#006400]">
                Administrator
              </p>
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
        {activeTab === "students" && (
          <Tabs
            value={studentsActiveTab}
            onValueChange={(value) =>
              setStudentsActiveTab(value as "students" | "add-student")
            }
            className="space-y-6"
          >
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
                <h2 className="text-2xl font-lato font-[600] text-gray-900">
                  {schoolName} students
                </h2>
                <StudentToolbar
                  search={search}
                  setSearch={setSearch}
                  showFilter={showFilter}
                  setShowFilter={setShowFilter}
                  selectedGrades={selectedGrades}
                  setSelectedGrades={setSelectedGrades}
                  students={students}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onAddStudent={() => setStudentsActiveTab("add-student")}
                />
              </div>
              <StudentList
                students={filteredStudents}
                loading={loadingStudents}
                viewMode={viewMode}
                onStudentClick={handleStudentClick}
                getUserInitials={getUserInitials}
                getDisplayName={getDisplayName}
              />
            </TabsContent>

            {/* Add Student Tab */}
            <TabsContent value="add-student" className="space-y-6">
              <AddStudentForm
                addStudentForm={addStudentForm}
                setAddStudentForm={setAddStudentForm}
                handleKeyPress={handleKeyPress}
                addStudent={addStudent}
                isAddingStudent={isAddingStudent}
                passwordMatch={passwordMatch}
              />
            </TabsContent>

            {/* Password Reset Modal */}
            <StudentPasswordResetModal
              show={showModal}
              selectedStudent={selectedStudent}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordError={passwordError}
              setShowModal={setShowModal}
              resetStudentPassword={resetStudentPassword}
              isResettingPassword={isResettingPassword}
            />

            {/* Student Edit Modal */}
            {editStudent && (
              <StudentEditModal
                editStudent={editStudent}
                setEditStudent={setEditStudent}
                editForm={editForm}
                setEditForm={setEditForm}
                studentQuizAttempts={studentQuizAttempts}
                setStudentQuizAttempts={setStudentQuizAttempts}
                showAllPointsHistory={showAllPointsHistory}
                setShowAllPointsHistory={setShowAllPointsHistory}
                showAllQuizHistory={showAllQuizHistory}
                setShowAllQuizHistory={setShowAllQuizHistory}
                showAllAwards={showAllAwards}
                setShowAllAwards={setShowAllAwards}
                getUserInitials={getUserInitials}
                getDisplayName={getDisplayName}
                formatDate={formatDate}
                createStatsForStudent={createStatsForStudent}
                getThisWeekQuizStatus={getThisWeekQuizStatus}
                handleUpdateStudent={handleUpdateStudent}
                isUpdating={isUpdating}
                schoolName={schoolName}
                GRADES={GRADES}
                deactivateStudent={deactivateStudent}
                reactivateStudent={reactivateStudent}
              />
            )}
          </Tabs>
        )}

        {activeTab === "analytics" && (
          <AnalyticsPage
            schoolName={schoolName || "My School"}
            quizStats={quizStats}
            totalStudents={students.length}
            studentStats={studentStats}
            timeStats={timeStats}
          />
        )}

        {activeTab === "upload" && (
          <div className="space-y-6">
            {reviewTopic ? (
              <ReviewQuestions
                topicId={reviewTopic.topic_id}
                topicLabel={`#${reviewTopic.topic_id} - ${reviewTopic.topic_name}`}
                onApprove={() => setReviewTopic(null)}
                onCancel={() => setReviewTopic(null)}
              />
            ) : (
              <UploadContentSection onReview={(t) => setReviewTopic(t)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
