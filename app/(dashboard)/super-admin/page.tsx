"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { DbUser } from "@/lib/api/auth";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  Crown,
  Shield,
  LogOut,
  Database,
  BarChart3,
  School,
  UserPlus,
  AlertTriangle,
  Send,
  Mail,
  Plus,
  Trash2,
  Pencil,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// UI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { MoreVertical, Power } from "lucide-react";

export default function SuperAdminDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [allUsers, setAllUsers] = useState<DbUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    admins: 0,
    superAdmins: 0,
    schools: 0,
  });

  console.log("🔒 Super Admin page render:", {
    isLoading,
    hasUser: !!user,
    userRole: user?.role,
    userEmail: user?.email,
  });

  // Fetch all users for super admin overview
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        console.log(
          "🔄 Super Admin Dashboard: Fetching all users from /api/super_admin..."
        );
        // Fetch with credentials so cookies are sent
        const response = await fetch("/api/super_admin", {
          credentials: "same-origin",
        });
        console.log("\uD83D\uDCE1 API: Raw response status:", response.status);
        const users = await response.json();
        console.log("\uD83D\uDCE1 API: Raw response data:", users);

        if (!Array.isArray(users)) {
          console.error("❌ API returned non-array data:", users);
          setAllUsers([]);
          return;
        }

        console.log(
          "📊 Super Admin Dashboard: Users array length:",
          users.length
        );
        if (users.length > 0) {
          console.log(
            "📊 Super Admin Dashboard: First user example:",
            users[0]
          );
          users.forEach((user, index) => {
            console.log(`�� User ${index + 1}:`, user);
          });
        } else {
          console.log("⚠️ Users array is empty");
        }

        setAllUsers(users);

        // Calculate stats with detailed logging
        const students = users.filter(
          (u) => !u.is_admin && !u.is_super_admin && !u.deactivated
        );
        const admins = users.filter(
          (u) => u.is_admin && !u.is_super_admin && !u.deactivated
        );
        const superAdmins = users.filter(
          (u) => u.is_super_admin && !u.deactivated
        );
        const uniqueSchools = new Set(
          users.map((u) => u.school_id).filter(Boolean)
        );

        console.log("🎓 Filtered students:", students);
        console.log("🛡️ Filtered admins:", admins);
        console.log("👑 Filtered super admins:", superAdmins);

        setStats({
          totalUsers: users.length,
          students: students.length,
          admins: admins.length,
          superAdmins: superAdmins.length,
          schools: uniqueSchools.size,
        });

        console.log("📊 Super Admin Dashboard: Final stats:", {
          totalUsers: users.length,
          students: students.length,
          admins: admins.length,
          superAdmins: superAdmins.length,
          schools: uniqueSchools.size,
        });
      } catch (error) {
        console.error("❌ Failed to fetch users:", error);
        if (error instanceof Error) {
          console.error("❌ Error details:", error.message);
        } else {
          console.error("❌ Unknown error occurred while fetching users.");
        }
      } finally {
        setLoadingUsers(false);
      }
    };

    console.log("[SuperAdminDashboard] useAuth user:", user);
    if (user && user.role === "super_admin") {
      fetchAllUsers();
    } else {
      console.log("⚠️ Not fetching users - user role:", user?.role);
      setLoadingUsers(false);
    }
  }, [user]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log("⏳ Super Admin page: Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-lato font-[400]">
            Verifying super admin access...
          </p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!user) {
    console.log("🚫 Super Admin page: No user found, showing login prompt");
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login?from=/super_admin";
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-lato font-[600] mb-4">
            Super Admin Authentication Required
          </h1>
          <p className="text-gray-600 mb-6 font-lato font-[400]">
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

  // Check if user is super admin
  if (user.role !== "super_admin") {
    console.log(
      "🚫 Super Admin page: User is not super admin, denying access",
      {
        userRole: user.role,
      }
    );
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-lato font-[600] mb-4 text-red-600">
            Super Admin Access Required
          </h1>
          <p className="text-gray-600 mb-6 font-lato font-[400]">
            You don't have permission to access the super admin dashboard.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            {user.role === "admin" && (
              <Button asChild variant="outline">
                <Link href="/admin">Go to Admin Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ Super Admin page: Access granted for super admin user");

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

  // Helper function to get user role badge
  const getUserRoleBadge = (user: DbUser) => {
    if (user.is_super_admin) {
      return (
        <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
      );
    }
    if (user.is_admin) {
      return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
    }
    return <Badge variant="secondary">Student</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Super Admin Header - Fixed at top */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-300" />
              <div>
                <h1 className="text-xl font-lato font-[600] text-white">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm font-lato font-[400] text-purple-200">
                  System-wide Management & Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-lato font-[500] text-white">
                  {user.first_name}
                </p>
                <p className="text-xs font-lato font-[400] text-purple-200">
                  Super Administrator
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-lato font-[500]">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-lato font-[600]">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-lato font-[500]">
                Students
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-lato font-[600]">
                {stats.students}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-lato font-[500]">
                Admins
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-lato font-[600]">
                {stats.admins}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-lato font-[500]">
                Super Admins
              </CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-lato font-[600]">
                {stats.superAdmins}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-lato font-[500]">
                Schools
              </CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-lato font-[600]">
                {stats.schools}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="invite">Invite Admins</TabsTrigger>
            <TabsTrigger value="schools">Manage Schools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Students Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-lato font-[600]">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Students ({stats.students})
                </CardTitle>
                <CardDescription className="font-lato font-[400]">
                  All student accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-lato font-[400]">
                      Loading students...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers
                      .filter((user) => !user.is_admin && !user.is_super_admin)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-green-100 text-green-700">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-lato font-[500] text-gray-900">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm font-lato font-[400] text-gray-500">
                                {user.email}
                              </p>
                              {user.school_id && (
                                <p className="text-xs font-lato font-[400] text-gray-400">
                                  School ID: {user.school_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              Student
                            </Badge>
                            <div className="text-right">
                              {user.created_at && (
                                <p className="text-xs font-lato font-[400] text-gray-500">
                                  Joined {formatDate(user.created_at)}
                                </p>
                              )}
                              {user.last_login_time && (
                                <p className="text-xs font-lato font-[400] text-gray-500">
                                  Last login: {formatDate(user.last_login_time)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {allUsers.filter(
                      (user) => !user.is_admin && !user.is_super_admin
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-lato font-[400]">
                          No students found
                        </p>
                        <p className="text-xs mt-2 font-lato font-[400]">
                          Total users loaded: {allUsers.length}
                        </p>
                        {allUsers.length > 0 && (
                          <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm font-lato font-[400]">
                              Debug: Show raw user data
                            </summary>
                            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                              {JSON.stringify(allUsers, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admins Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-lato font-[600]">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Administrators ({stats.admins})
                </CardTitle>
                <CardDescription className="font-lato font-[400]">
                  All admin accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-lato font-[400]">
                      Loading admins...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers
                      .filter((user) => user.is_admin && !user.is_super_admin)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-lato font-[500] text-gray-900">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm font-lato font-[400] text-gray-500">
                                {user.email}
                              </p>
                              {user.school_id && (
                                <p className="text-xs font-lato font-[400] text-gray-400">
                                  School ID: {user.school_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-100 text-blue-800">
                              Admin
                            </Badge>
                            <div className="text-right">
                              {user.created_at && (
                                <p className="text-xs font-lato font-[400] text-gray-500">
                                  Joined {formatDate(user.created_at)}
                                </p>
                              )}
                              {user.last_login_time && (
                                <p className="text-xs font-lato font-[400] text-gray-500">
                                  Last login: {formatDate(user.last_login_time)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {allUsers.filter(
                      (user) => user.is_admin && !user.is_super_admin
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-lato font-[400]">No admins found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Super Admins Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-lato font-[600]">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Super Administrators ({stats.superAdmins})
                </CardTitle>
                <CardDescription className="font-lato font-[400]">
                  All super admin accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-lato font-[400]">
                      Loading super admins...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers
                      .filter((user) => user.is_super_admin)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-lato font-[500] text-gray-900">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm font-lato font-[400] text-gray-500">
                                {user.email}
                              </p>
                              {user.school_id && (
                                <p className="text-xs font-lato font-[400] text-gray-400">
                                  School ID: {user.school_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-purple-100 text-purple-800">
                              Super Admin
                            </Badge>
                            <div className="text-right">
                              {user.created_at && (
                                <p className="text-xs font-lato font-[400] text-gray-500">
                                  Joined {formatDate(user.created_at)}
                                </p>
                              )}
                              {user.last_login_time && (
                                <p className="text-xs font-lato font-[400] text-gray-500">
                                  Last login: {formatDate(user.last_login_time)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {allUsers.filter((user) => user.is_super_admin).length ===
                      0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-lato font-[400]">
                          No super admins found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invite" className="space-y-6">
            <InviteAdminsTab />
          </TabsContent>

          <TabsContent value="schools" className="space-y-6">
            <ManageSchoolsTab allUsers={allUsers} loadingUsers={loadingUsers} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-lato font-[600]">
                  <BarChart3 className="h-5 w-5" />
                  System Analytics
                </CardTitle>
                <CardDescription className="font-lato font-[400]">
                  Platform usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-lato font-[400]">
                    Advanced analytics dashboard coming soon...
                  </p>
                  <p className="text-sm font-lato font-[400]">
                    User activity, engagement metrics, and system performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-lato font-[600]">
                  <Database className="h-5 w-5" />
                  System Management
                </CardTitle>
                <CardDescription className="font-lato font-[400]">
                  Database management and system configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-lato font-[400]">
                    System management tools coming soon...
                  </p>
                  <p className="text-sm font-lato font-[400]">
                    Database backups, system health, and maintenance tools
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Invite Admins Tab Component

interface Invitation {
  email: string;
  first_name: string;
  last_name: string;
  school_id: string;
}
function InviteAdminsTab() {
  const { toast } = useToast();
  const [invitationForm, setInvitationForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    school_id: "",
  });
  const [invitationList, setInvitationList] = useState<Array<Invitation>>([]);
  const [isSending, setIsSending] = useState(false);

  const [schools, setSchools] = useState<Array<School>>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // Fetch schools for validation
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("/api/super_admin/schools", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              document.cookie.match(/token=([^;]+)/)?.[1] || ""
            }`,
          },
        });
        if (response.ok) {
          const schoolData = await response.json();
          console.log("Schools:", schoolData.schools);
          setSchools(schoolData.schools || []);
        } else {
          console.error("Failed to fetch schools");
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, [isSending]);

  // Add invitation to the list
  const addInvitation = () => {
    const { email, first_name, last_name, school_id } = invitationForm;

    // Validation
    if (
      !email.trim() ||
      !first_name.trim() ||
      !last_name.trim() ||
      !school_id.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (invitationList.some((inv) => inv.email === email.trim())) {
      toast({
        title: "Duplicate Email",
        description: "This email is already in the list.",
        variant: "destructive",
      });
      return;
    }

    // Validate school ID exists
    const schoolExists = schools.some(
      (school) => school.school_id === school_id.trim()
    );
    if (!schoolExists && schools.length > 0) {
      toast({
        title: "Invalid School ID",
        description: `School ID "${school_id.trim()}" does not exist. Please select a valid school ID.`,
        variant: "destructive",
      });
      return;
    }

    setInvitationList([
      ...invitationList,
      {
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        school_id: school_id.trim(),
      },
    ]);

    // Reset form
    setInvitationForm({
      email: "",
      first_name: "",
      last_name: "",
      school_id: "",
    });
  };

  // Remove invitation from list
  const removeInvitation = (emailToRemove: string) => {
    setInvitationList(
      invitationList.filter((inv) => inv.email !== emailToRemove)
    );
  };

  // Simple email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle key press in form inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInvitation();
    }
  };

  // Send invitations
  const sendInvitations = async () => {
    const fullList =
      invitationList.length > 0
        ? invitationList
        : [invitationForm].filter(
            (inv) =>
              inv.email.trim() &&
              inv.first_name.trim() &&
              inv.last_name.trim() &&
              inv.school_id.trim()
          );

    if (fullList.length === 0) {
      toast({
        title: "Missing Information",
        description:
          "Please add to the list or fill all fields to send a single invite.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      console.log("📧 Sending invitations:", invitationList);

      const response = await fetch("/api/super_admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie.match(/token=([^;]+)/)?.[1] || ""
          }`,
        },
        body: JSON.stringify({ invitations: fullList }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send invitations");
      }

      // Handle partial success/failure
      if (data.failed_count > 0) {
        // Show detailed error messages for each failed invitation
        if (data.failed_count === 1) {
          // Show detailed error for single failure
          const error = data.failed[0];
          toast({
            title: "Invitation Failed",
            description: `${error.email}: ${error.error}`,
            variant: "destructive",
          });
        } else {
          // Show summary for multiple failures
          const errorList = data.failed
            .map(
              (failed: { email: string; error: string }) =>
                `• ${failed.email}: ${failed.error}`
            )
            .join("\n");

          toast({
            title: `${data.failed_count} Invitations Failed`,
            description: `${data.sent} sent successfully.\n\nFailed invitations:\n${errorList}`,
            variant: "destructive",
          });
        }
        console.error("Failed invitations:", data.failed);
      } else {
        toast({
          title: "Invitations Sent!",
          description: `Successfully sent ${data.sent} admin invitation(s).`,
        });
      }

      setInvitationList([]);
    } catch (error) {
      console.error("Failed to send invitations:", error);

      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while sending invitations. Please try again.";

      toast({
        title: "Failed to Send Invitations",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-lato font-[600]">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Invite New Administrators
          </CardTitle>
          <CardDescription className="font-lato font-[400]">
            Send registration invitations to new administrators. They will
            receive an email with a link to create their admin account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Form */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <Label className="text-base font-lato font-[500]">
              Add New Invitation
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="font-lato font-[500]">
                  First Name *
                </Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  value={invitationForm.first_name}
                  onChange={(e) =>
                    setInvitationForm({
                      ...invitationForm,
                      first_name: e.target.value,
                    })
                  }
                  onKeyPress={handleKeyPress}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name" className="font-lato font-[500]">
                  Last Name *
                </Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  value={invitationForm.last_name}
                  onChange={(e) =>
                    setInvitationForm({
                      ...invitationForm,
                      last_name: e.target.value,
                    })
                  }
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-input" className="font-lato font-[500]">
                Email Address *
              </Label>
              <Input
                id="email-input"
                type="email"
                placeholder="admin@example.com"
                value={invitationForm.email}
                onChange={(e) =>
                  setInvitationForm({
                    ...invitationForm,
                    email: e.target.value,
                  })
                }
                onKeyPress={handleKeyPress}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-id" className="font-lato font-[500]">
                School *
              </Label>
              <Select
                value={invitationForm.school_id}
                onValueChange={(value) =>
                  setInvitationForm({ ...invitationForm, school_id: value })
                }
                disabled={loadingSchools}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a school" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {schools &&
                    schools.map((school) => (
                      <SelectItem
                        key={school.school_id}
                        value={school.school_id}
                        className="!bg-white !text-black hover:!bg-gray-100"
                      >
                        {school.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500">
                {schools.length > 0 && (
                  <p className="mt-1 font-lato font-[400]">
                    <strong>Available schools:</strong>{" "}
                    {schools && schools.map((s) => s.name).join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={addInvitation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add to List
              </Button>
            </div>
          </div>

          {/* Invitation List */}
          {invitationList.length > 0 && (
            <div className="space-y-2">
              <Label>Invitation List ({invitationList.length})</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg  p-3 space-y-3">
                {invitationList.map((invitation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-lato font-[500]">
                          {invitation.first_name} {invitation.last_name}
                        </p>
                        <p className="text-xs font-lato font-[400] text-gray-500">
                          {invitation.email}
                        </p>
                        <p className="text-xs font-lato font-[400] text-blue-600">
                          School: {invitation.school_id}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvitation(invitation.email)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <Button
              onClick={sendInvitations}
              disabled={
                isSending ||
                (invitationList.length === 0 &&
                  !invitationForm.email.trim() &&
                  !invitationForm.first_name.trim() &&
                  !invitationForm.last_name.trim() &&
                  !invitationForm.school_id.trim())
              }
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending Invitations...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send{" "}
                  {invitationList.length > 0 ? `${invitationList.length} ` : ""}
                  Invitation{invitationList.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-lato font-[600]">
            <Mail className="h-5 w-5 text-green-600" />
            How Invitations Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="font-lato font-[400]">
                Invited users will receive an email with a unique registration
                link
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="font-lato font-[400]">
                They can use this link to create their admin account with a
                secure password
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="font-lato font-[400]">
                Once registered, they will have administrative access to their
                designated school
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="font-lato font-[400]">
                You can track invitation status and manage admin permissions
                from this dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
interface School {
  school_id: string;
  name: string;
  email: string;
  status: string;
  telephone: string;
  address: string;
}
function ManageSchoolsTab({
  allUsers,
  loadingUsers,
}: {
  allUsers: DbUser[];
  loadingUsers: boolean;
}) {
  const { toast } = useToast();
  const [schools, setSchools] = useState<Array<School>>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalForm, setApprovalForm] = useState({
    school_id: "",
    admin_email: "",
    admin_first_name: "",
    admin_last_name: "",
  });
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [pending, setPending] = useState<{
    action: "deactivate" | "suspend";
    schoolId: string;
    schoolName: string;
  } | null>(null);

  const [updatedSchoolFields, setUpdatedSchoolFields] = useState<{
    school_id: string;
    name: string;
    telephone: string;
    address: string;
    email: string;
  }>({
    school_id: "",
    name: "",
    telephone: "",
    address: "",
    email: "",
  });

  const [inactiveSchools, setInactiveSchools] = useState<Array<School>>([]);
  const [loadingInactive, setLoadingInactive] = useState(true);

  // Fetch schools data
  type SchoolsResponse = { schools: School[] };

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = document.cookie.match(/token=([^;]+)/)?.[1] || "";
        const response = await fetch("/api/super_admin/schools", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          toast({
            title: "Error",
            description: "Failed to load schools data",
            variant: "destructive",
          });
          return;
        }

        const data: unknown = await response.json();
        const arr = Array.isArray(data)
          ? data
          : (data as SchoolsResponse).schools ?? [];
        setSchools(arr);
      } catch (error) {
        console.error("Error fetching schools:", error);
        toast({
          title: "Error",
          description: "Failed to load schools data",
          variant: "destructive",
        });
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, [toast]);

  const fetchInactiveSchools = async () => {
    setLoadingInactive(true);
    setInactiveSchools([]);

    try {
      const token = document.cookie.match(/token=([^;]+)/)?.[1] || "";
      const response = await fetch(`/api/super_admin/inactive-schools`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 404) {
        setInactiveSchools([]);
        setLoadingInactive(false);
        return;
      }

      if (!response.ok) {
        let msg = "Failed to load inactive schools";
        try {
          const err = await response.json();
          msg = err?.detail || err?.message || msg;
        } catch {}
        toast({ title: "Error", description: msg, variant: "destructive" });
        return;
      }
      const data = await response.json();
      const arr = Array.isArray(data) ? data : data.schools ?? [];
      setInactiveSchools(arr);
    } catch (error) {
      console.error("Error fetching inactive schools:", error);
      toast({
        title: "Error",
        description: "Failed to load inactive schools",
        variant: "destructive",
      });
    } finally {
      setLoadingInactive(false);
    }
  };

  useEffect(() => {
    fetchInactiveSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create school-admin mapping
  const schoolAdminMap = React.useMemo(() => {
    if (loadingUsers || loadingSchools) return new Map();

    const map = new Map();

    // First add all schools
    schools.forEach((school) => {
      map.set(school.school_id, {
        school: school,
        admins: [],
      });
    });

    // Then add admins to their respective schools
    allUsers
      .filter((user) => user.is_admin && !user.is_super_admin && user.school_id)
      .forEach((admin) => {
        if (map.has(admin.school_id)) {
          map.get(admin.school_id).admins.push(admin);
        }
      });

    return map;
  }, [schools, allUsers, loadingUsers, loadingSchools]);

  // Filter schools based on search term
  const filteredSchools = React.useMemo(() => {
    if (!searchTerm.trim()) return Array.from(schoolAdminMap.values());

    const term = searchTerm.toLowerCase();
    return Array.from(schoolAdminMap.values()).filter(
      (item) =>
        item.school.name.toLowerCase().includes(term) ||
        item.school.school_id.toLowerCase().includes(term) ||
        item.admins.some(
          (admin: DbUser) =>
            admin.email.toLowerCase().includes(term) ||
            admin.first_name.toLowerCase().includes(term) ||
            admin.last_name?.toLowerCase().includes(term)
        )
    );
  }, [schoolAdminMap, searchTerm]);

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const AddNewSchool = () => {
    const [newSchoolForm, setNewSchoolForm] = useState({
      name: "",
      email: "",
      telephone: "",
      address: "",
    });

    const [isApproving, setIsApproving] = useState<boolean>(false);

    const submit = async () => {
      setIsApproving(true);
      try {
        const response = await fetch("/api/super_admin/create-school", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              document.cookie.match(/token=([^;]+)/)?.[1] || ""
            }`,
          },
          body: JSON.stringify(newSchoolForm),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle different error cases
          if (response.status === 409) {
            toast({
              title: "School Already Exists",
              description:
                data.detail || "A school with this information already exists.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Failed to Add School",
              description:
                data.detail ||
                data.message ||
                "An error occurred while adding the school.",
              variant: "destructive",
            });
          }
          return;
        }

        // Success case
        toast({
          title: "School Added Successfully",
          description: `${newSchoolForm.name} has been added to the system.`,
        });

        // Reset form on success
        setNewSchoolForm({
          name: "",
          email: "",
          telephone: "",
          address: "",
        });
      } catch (error) {
        console.error("Error adding school:", error);
        toast({
          title: "Network Error",
          description: "Failed to connect to the server. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsApproving(false);
        await fetchSchools();
        await fetchInactiveSchools();
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-lato font-[600]">
            <School className="h-5 w-5 text-green-600" />
            Add new school
          </CardTitle>
          <CardDescription className="font-lato font-[400]">
            Add a new school to the school list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school name" className="font-lato font-[500]">
                School Name *
              </Label>
              <Input
                id="school name"
                placeholder="KALISONGO, JAWA TIMUR, INDONESIA"
                value={newSchoolForm.name}
                onChange={(e) => {
                  setNewSchoolForm((f) => ({ ...f, name: e.target.value }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school name" className="font-lato font-[500]">
                School email *
              </Label>
              <Input
                id="school email"
                type="email"
                placeholder="sdn08@gmail.com"
                value={newSchoolForm.email}
                onChange={(e) => {
                  setNewSchoolForm((f) => ({ ...f, email: e.target.value }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="school telephone"
                className="font-lato font-[500]"
              >
                School Telephone *
              </Label>
              <Input
                id="school telephone"
                placeholder="+62 1234-5678-9101"
                type="tel"
                value={newSchoolForm.telephone}
                onChange={(e) => {
                  setNewSchoolForm((f) => ({
                    ...f,
                    telephone: e.target.value,
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school address" className="font-lato font-[500]">
                School Address *
              </Label>
              <Input
                id="school address"
                placeholder="Kalisongo, Jawa Timur"
                value={newSchoolForm.address}
                onChange={(e) => {
                  setNewSchoolForm((f) => ({
                    ...f,
                    address: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={submit}
              disabled={isApproving}
              className="flex items-center gap-2"
            >
              {isApproving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding School ....
                </>
              ) : (
                <>Add School</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  // Handle admin removal
  const handleRemoveAdmin = async (adminEmail: string, schoolName: string) => {
    try {
      const res = await fetch("/api/admin/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail }),
      });

      // Try to read error message (some backends return 204; guard it)
      if (!res.ok) {
        let msg = "Failed to remove admin";
        try {
          const data = await res.json();
          msg = data?.detail || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      // Some servers return 501 for “not implemented”
      if (res.status === 501) {
        let detail =
          "Backend endpoint for deactivating admins needs to be implemented";
        try {
          const data = await res.json();
          detail = data?.detail || detail;
        } catch {}
        toast({
          title: "Feature Not Available",
          description: detail,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin Removed",
        description: `${adminEmail} has been deactivated and removed from ${schoolName}`,
      });
    } catch (error) {
      console.error("Failed to remove admin:", error);
      toast({
        title: "Failed to Remove Admin",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while removing the admin.",
        variant: "destructive",
      });
    }
  };

  const fetchSchools = async (arg?: string) => {
    setSchools([]);
    try {
      const token = document.cookie.match(/token=([^;]+)/)?.[1] || "";
      const response = await fetch(`/api/super_admin/schools`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const schoolData = await response.json();
        setSchools(schoolData.schools || []);
      } else {
        console.error("Failed to fetch schools");
        toast({
          title: "Error",
          description: "Failed to load schools data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Error",
        description: "Failed to load schools data",
        variant: "destructive",
      });
    } finally {
      setLoadingSchools(false);
    }
  };

  const [display, setDisplay] = useState<string>("active");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleDeactivateSchool = async (schoolID: string) => {
    try {
      const res = await fetch(
        `/api/super_admin/deactivate-school/${schoolID}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        let msg = "Failed to deactivate school";
        try {
          const data = await res.json();
          msg = data?.detail || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      toast({
        title: "School Deactivated",
        description: `School ${schoolID} has been set to inactive.`,
      });
    } catch (error) {
      toast({
        title: "Failed to deactivate school",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      await fetchSchools();
      await fetchInactiveSchools();
    }
  };

  const handleActivate = async (schoolID: string) => {
    try {
      const res = await fetch(`/api/super_admin/activate-school/${schoolID}`, {
        method: "POST",
      });

      if (!res.ok) {
        let msg = "Failed to activate school";
        try {
          const data = await res.json();
          msg = data?.detail || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      toast({
        title: "School Activated",
        description: `School ${schoolID} is now active.`,
      });
    } catch (error) {
      toast({
        title: "Activation failed",
        description:
          error instanceof Error ? error.message : "Could not activate school.",
        variant: "destructive",
      });
    } finally {
      await fetchSchools();
      await fetchInactiveSchools();
    }
  };

  const handleSuspension = async (schoolID: string) => {
    try {
      const res = await fetch(
        `/api/super_admin/delete-school/${encodeURIComponent(schoolID)}`,
        { method: "POST" }
      );

      if (!res.ok) {
        let msg = "Failed to delete/suspend school";
        try {
          const data = await res.json();
          msg = data?.detail || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      toast({
        title: "School Deleted",
        description: `School ${schoolID} has been removed/suspended.`,
      });
    } catch (error) {
      toast({
        title: "Failed to delete/suspend school",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      await fetchSchools();
      await fetchInactiveSchools();
    }
  };

  if (loadingUsers || loadingSchools) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 font-lato font-[400]">
          Loading schools and administrators...
        </p>
      </div>
    );
  }

  const requestConfirmation = (
    action: "deactivate" | "suspend",
    schoolId: string,
    schoolName: string
  ) => {
    setPending({ action, schoolId, schoolName });
    setIsWaiting(true);
  };

  const confirmAction = async () => {
    if (!pending) return;
    try {
      if (pending.action === "deactivate") {
        await handleDeactivateSchool(pending.schoolId);
      } else {
        await handleSuspension(pending.schoolId);
      }
    } finally {
      setIsWaiting(false);
      setPending(null);
    }
  };

  const handleUpdateSchool = async () => {
    const { school_id, name, email, telephone, address } = updatedSchoolFields;

    // Required fields
    if (!school_id?.trim()) {
      toast({
        title: "Missing School ID",
        description: "A valid school_id is required to update a school.",
        variant: "destructive",
      });
      return;
    }
    if (!name.trim() || !email.trim() || !telephone.trim() || !address.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in name, email, telephone, and address.",
        variant: "destructive",
      });
      return;
    }
    // Email format
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingEdit(true);
    try {
      const token = document.cookie.match(/token=([^;]+)/)?.[1] || "";

      const res = await fetch("/api/super_admin/update-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          school_id,
          name,
          email,
          telephone,
          address,
        }),
      });

      toast({
        title: "School Updated",
        description: `${name} has been updated successfully.`,
      });

      setIsEditOpen(false);
    } catch (error) {
      console.error("Update school failed:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Could not update school.",
        variant: "destructive",
      });
    } finally {
      await fetchSchools();
      await fetchInactiveSchools();
      setIsSavingEdit(false);
    }
  };

  const openEdit = (school: School) => {
    setUpdatedSchoolFields({
      school_id: school.school_id,
      name: school.name ?? "",
      email: school.email ?? "",
      telephone: school.telephone ?? "",
      address: school.address ?? "",
    });
    setIsEditOpen(true);
  };

  return (
    <>
      <AlertDialog
        open={isWaiting}
        onOpenChange={(open) => {
          setIsWaiting(open);
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === "deactivate"
                ? "Deactivate school?"
                : "Delete school?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending
                ? pending.action === "deactivate"
                  ? `Are you sure you want to deactivate ${pending.schoolName} (${pending.schoolId})?`
                  : `Are you sure you want to DELETE ${pending.schoolName} (${pending.schoolId})? This action is NOT REVERSIBLE`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPending(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className="bg-red-600 hover:bg-red-700"
            >
              {pending?.action === "deactivate" ? "Deactivate" : "DELETE"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-lato font-[600]">
              Update School Information
            </DialogTitle>
            <DialogDescription className="font-lato font-[400]">
              Update the school's details. Changes apply immediately after
              saving.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* use ids without spaces */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school-id" className="font-lato font-[500]">
                School ID
              </Label>
              <Input
                id="school-id"
                value={updatedSchoolFields.school_id}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-name" className="font-lato font-[500]">
                School Name *
              </Label>
              <Input
                id="school-name"
                value={updatedSchoolFields.name}
                onChange={(e) =>
                  setUpdatedSchoolFields((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-email" className="font-lato font-[500]">
                School email *
              </Label>
              <Input
                id="school-email"
                type="email"
                value={updatedSchoolFields.email}
                onChange={(e) =>
                  setUpdatedSchoolFields((f) => ({
                    ...f,
                    email: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="school-telephone"
                className="font-lato font-[500]"
              >
                School Telephone *
              </Label>
              <Input
                id="school-telephone"
                type="tel"
                value={updatedSchoolFields.telephone}
                onChange={(e) =>
                  setUpdatedSchoolFields((f) => ({
                    ...f,
                    telephone: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-address" className="font-lato font-[500]">
                School Address *
              </Label>
              <Input
                id="school-address"
                value={updatedSchoolFields.address}
                onChange={(e) =>
                  setUpdatedSchoolFields((f) => ({
                    ...f,
                    address: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSchool} disabled={isSavingEdit}>
              {isSavingEdit ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Main content */}
      <div className="space-y-6">
        <AddNewSchool />
        {display === "active" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-lato font-[600]">
                <School className="h-5 w-5 text-blue-600" />
                Approved Schools ({filteredSchools.length})
              </CardTitle>
              <CardDescription className="font-lato font-[400]">
                Manage currently approved schools and their administrators
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Search Bar */}
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Search schools, admins, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {filteredSchools.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-lato font-[400]">
                    No approved schools found
                  </p>
                  <p className="text-sm font-lato font-[400]">
                    Use the form above to approve new schools
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSchools &&
                    filteredSchools.map(({ school, admins }) => (
                      <div
                        key={school.school_id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-lato font-[500] text-lg">
                                {school.name}
                              </h3>
                              <Badge variant="outline">
                                {school.school_id}
                              </Badge>
                            </div>

                            {admins.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Administrators ({admins.length}):
                                </p>

                                {admins &&
                                  admins.map((admin: DbUser) => (
                                    <div
                                      key={admin.user_id}
                                      className="flex items-center justify-between bg-white rounded p-3 border"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                            {admin.first_name?.[0]}
                                            {admin.last_name?.[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-lato font-[500] text-sm">
                                            {admin.first_name} {admin.last_name}
                                          </p>
                                          <p className="text-xs font-lato font-[400] text-gray-500">
                                            {admin.email}
                                          </p>
                                          {admin.last_login_time && (
                                            <p className="text-xs font-lato font-[400] text-gray-400">
                                              Last login:{" "}
                                              {new Date(
                                                admin.last_login_time
                                              ).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          console.log(admin.email, school.name);
                                          handleRemoveAdmin(
                                            admin.email,
                                            school.name
                                          );
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                                <p className="text-sm font-lato font-[400]">
                                  No administrator assigned
                                </p>
                                <p className="text-xs font-lato font-[400]">
                                  School is registered but has no admin access
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Open actions menu"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-white"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem
                                className="text-black"
                                onClick={() => openEdit(school)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit School
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() =>
                                  requestConfirmation(
                                    "deactivate",
                                    school.school_id,
                                    school.name
                                  )
                                }
                              >
                                <Power className="mr-2 h-4 w-4" />
                                Deactivate school
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 font-bold"
                                onClick={() =>
                                  requestConfirmation(
                                    "suspend",
                                    school.school_id,
                                    school.name
                                  )
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete school
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-lato font-[600]">
              <School className="h-5 w-5 text-blue-600" />
              Inactive Schools ({inactiveSchools.length})
            </CardTitle>
            <CardDescription className="font-lato font-[400]">
              Schools that are currently inactive.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loadingInactive ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-gray-600 font-lato font-[400]">
                  Loading inactive schools...
                </p>
              </div>
            ) : inactiveSchools.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-lato font-[400]">
                  No inactive schools found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inactiveSchools &&
                  inactiveSchools.map((school) => {
                    const admins = allUsers.filter(
                      (u) =>
                        u.is_admin &&
                        !u.is_super_admin &&
                        u.school_id === school.school_id
                    );
                    return (
                      <div
                        key={school.school_id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-lato font-[500] text-lg">
                                {school.name}
                              </h3>
                              <Badge variant="outline">
                                {school.school_id}
                              </Badge>
                            </div>

                            {admins.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Administrators ({admins.length}):
                                </p>
                                {admins.map((admin: DbUser) => (
                                  <div
                                    key={admin.user_id}
                                    className="flex items-center justify-between bg-white rounded p-3 border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                          {admin.first_name?.[0]}
                                          {admin.last_name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-lato font-[500] text-sm">
                                          {admin.first_name} {admin.last_name}
                                        </p>
                                        <p className="text-xs font-lato font-[400] text-gray-500">
                                          {admin.email}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                                <p className="text-sm font-lato font-[400]">
                                  No administrator assigned
                                </p>
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Open actions menu"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 bg-white"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                className="text-green-700"
                                onClick={() => handleActivate(school.school_id)}
                              >
                                Activate school
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 font-bold"
                                onClick={() =>
                                  requestConfirmation(
                                    "suspend",
                                    school.school_id,
                                    school.name
                                  )
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete school
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>{" "}
      </div>
    </>
  );
}
