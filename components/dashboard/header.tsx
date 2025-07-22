"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 Next.js router
import { Bell, Menu, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/context/auth-context";

// Create a context for the mobile menu state
export const MobileMenuContext = createContext({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: (value: boolean) => {},
});

export function DashboardHeader() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } =
    useContext(MobileMenuContext);
  const { user, logout } = useAuth();
  const router = useRouter(); // 👈 Initialize router

  const [notifications, setNotifications] = useState<
    { badge_id: string; name: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch unviewed badges
  useEffect(() => {
    const fetchUnviewedBadges = async () => {
      try {
        const res = await fetch("/api/users/badges/not-viewed", {
          cache: "no-store", // 💥 Force no-cache like attempts
        });
        if (!res.ok) throw new Error("Failed to fetch badges");
        const data = await res.json();
        setNotifications(data.badges || []);
      } catch (err) {
        console.error("Error fetching unviewed badges:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnviewedBadges();
  }, []);

  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || "";
    return (
      firstInitial + lastInitial || user.email?.charAt(0)?.toUpperCase() || "U"
    );
  };

  const getDisplayName = () => {
    if (!user) return "User";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return user.email || "User";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNotificationClick = async (badgeId: string) => {
    try {
      // Call proxy PATCH route
      const res = await fetch(`/api/users/badges/${badgeId}/viewed`, {
        method: "PATCH",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to mark badge as viewed");

      // Remove badge from local state
      setNotifications((prev) =>
        prev.filter((badge) => badge.badge_id !== badgeId)
      );

      // Navigate to /progress?tab=badges
      router.push("/progress?tab=badges");
    } catch (err) {
      console.error("Error marking badge as viewed:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 z-40 h-12">
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Kira
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Bell with notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md"
            >
              <DropdownMenuLabel className="text-xs font-medium text-gray-500">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loading ? (
                <DropdownMenuItem className="text-sm text-gray-400">
                  Loading notifications...
                </DropdownMenuItem>
              ) : notifications.length > 0 ? (
                notifications.map((badge) => (
                  <DropdownMenuItem
                    key={badge.badge_id}
                    className="text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleNotificationClick(badge.badge_id)}
                  >
                    🎖️ {badge.name}: {badge.description}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-sm text-gray-400">
                  No new notifications
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-sm text-blue-500 cursor-pointer"
                onClick={() => router.push("/progress/")}
              >
                View progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full ml-1"
              >
                <Avatar className="h-8 w-8 border-2 border-gray-100 dark:border-gray-800">
                  <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                Signed in as{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {getDisplayName()}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-sm text-red-500 dark:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
