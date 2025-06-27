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
  Settings, 
  Database,
  BarChart3,
  Key,
  School,
  UserPlus,
  AlertTriangle
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

export default function SuperAdminDashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [allUsers, setAllUsers] = useState<DbUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    admins: 0,
    superAdmins: 0,
    schools: 0
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
        console.log("🔄 Super Admin Dashboard: Fetching all users from API...");
        console.log("🌐 API Base URL:", process.env.NEXT_PUBLIC_API_URL || "/api");
        const users = await authApi.getAllUsers();
        console.log("📊 Super Admin Dashboard: Raw API response:", users);
        console.log("📊 Super Admin Dashboard: Type of users:", typeof users);
        console.log("📊 Super Admin Dashboard: Is Array:", Array.isArray(users));
        
        // Check if users is valid before accessing
        if (!users) {
          console.error("❌ Users is null/undefined");
          setAllUsers([]);
          return;
        }
        
        if (!Array.isArray(users)) {
          console.error("❌ Users is not an array, got:", users);
          setAllUsers([]);
          return;
        }
        
        console.log("📊 Super Admin Dashboard: Users array length:", users.length);
        if (users.length > 0) {
          console.log("📊 Super Admin Dashboard: First user example:", users[0]);
          
          // Debug: Check each user's properties
          users.forEach((user, index) => {
            console.log(`👤 User ${index + 1}:`, {
              user_id: user.user_id,
              email: user.email,
              first_name: user.first_name,
              is_admin: user.is_admin,
              is_super_admin: user.is_super_admin,
              school_id: user.school_id
            });
          });
        } else {
          console.log("⚠️ Users array is empty");
        }
        
        setAllUsers(users);
        
        // Calculate stats with detailed logging
        const students = users.filter(u => !u.is_admin && !u.is_super_admin);
        const admins = users.filter(u => u.is_admin && !u.is_super_admin);
        const superAdmins = users.filter(u => u.is_super_admin);
        const uniqueSchools = new Set(users.map(u => u.school_id).filter(Boolean));
        
        console.log("🎓 Filtered students:", students);
        console.log("🛡️ Filtered admins:", admins);
        console.log("👑 Filtered super admins:", superAdmins);
        
        setStats({
          totalUsers: users.length,
          students: students.length,
          admins: admins.length,
          superAdmins: superAdmins.length,
          schools: uniqueSchools.size
        });
        
        console.log("📊 Super Admin Dashboard: Final stats:", {
          totalUsers: users.length,
          students: students.length,
          admins: admins.length,
          superAdmins: superAdmins.length,
          schools: uniqueSchools.size
        });
        
      } catch (error) {
        console.error("❌ Failed to fetch users:", error);
        console.error("❌ Error details:", error.message);
      } finally {
        setLoadingUsers(false);
      }
    };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
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
      window.location.href = "/admin/login?from=/super-admin";
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Super Admin Authentication Required
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

  // Check if user is super admin
  if (user.role !== "super_admin") {
    console.log("🚫 Super Admin page: User is not super admin, denying access", {
      userRole: user.role,
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Super Admin Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access the super admin dashboard.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            {(user.role === "admin") && (
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
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Super Admin</Badge>;
    }
    if (user.is_admin) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Admin</Badge>;
    }
    return <Badge variant="secondary">Student</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Super Admin Header - Fixed at top */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-300" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-purple-200">
                  System-wide Management & Analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.first_name}
                </p>
                <p className="text-xs text-purple-200">
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.superAdmins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schools</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.schools}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Students Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Students ({stats.students})
                </CardTitle>
                <CardDescription>
                  All student accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers
                      .filter(user => !user.is_admin && !user.is_super_admin)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                              {user.school_id && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  School ID: {user.school_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Student
                            </Badge>
                            <div className="text-right">
                              {user.created_at && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Joined {formatDate(user.created_at)}
                                </p>
                              )}
                              {user.last_login_time && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Last login: {formatDate(user.last_login_time)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                                         {allUsers.filter(user => !user.is_admin && !user.is_super_admin).length === 0 && (
                       <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                         <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                         <p>No students found</p>
                         <p className="text-xs mt-2">Total users loaded: {allUsers.length}</p>
                         {allUsers.length > 0 && (
                           <details className="mt-4 text-left">
                             <summary className="cursor-pointer text-sm">Debug: Show raw user data</summary>
                             <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-40">
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
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Administrators ({stats.admins})
                </CardTitle>
                <CardDescription>
                  All admin accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading admins...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers
                      .filter(user => user.is_admin && !user.is_super_admin)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                              {user.school_id && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  School ID: {user.school_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Admin
                            </Badge>
                            <div className="text-right">
                              {user.created_at && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Joined {formatDate(user.created_at)}
                                </p>
                              )}
                              {user.last_login_time && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Last login: {formatDate(user.last_login_time)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {allUsers.filter(user => user.is_admin && !user.is_super_admin).length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No admins found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Super Admins Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Super Administrators ({stats.superAdmins})
                </CardTitle>
                <CardDescription>
                  All super admin accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading super admins...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers
                      .filter(user => user.is_super_admin)
                      .map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getDisplayName(user)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                              {user.school_id && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  School ID: {user.school_id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              Super Admin
                            </Badge>
                            <div className="text-right">
                              {user.created_at && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Joined {formatDate(user.created_at)}
                                </p>
                              )}
                              {user.last_login_time && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Last login: {formatDate(user.last_login_time)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    {allUsers.filter(user => user.is_super_admin).length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No super admins found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Analytics
                </CardTitle>
                <CardDescription>
                  Platform usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced analytics dashboard coming soon...</p>
                  <p className="text-sm">User activity, engagement metrics, and system performance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Management
                </CardTitle>
                <CardDescription>
                  Database management and system configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>System management tools coming soon...</p>
                  <p className="text-sm">Database backups, system health, and maintenance tools</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Global platform configuration and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Platform settings coming soon...</p>
                  <p className="text-sm">Security policies, feature flags, and system configuration</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 