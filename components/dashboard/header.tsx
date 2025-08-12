"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  type NotificationItem = {
    id: string;
    name: string;
    description: string;
    type: "badge" | "achievement";
  };

  type Achievement = {
    achievement_id: string;
    name_en: string;
    name_ind: string;
    description_en: string;
    description_ind: string;
    points: number;
    completed_at: string;
    view_count: number | null;
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications (not viewed badges)
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [badgeRes, achievementRes] = await Promise.all([
        fetch("/api/users/badges/notification", { cache: "no-store" }),
        fetch("/api/users/achievements/notification", { cache: "no-store" }),
      ]);

      const badgeData = await badgeRes.json();
      const achievementData = await achievementRes.json();

      console.log("🎖️ Badge API Response:", badgeData);
      console.log("🏆 Achievement API Response:", achievementData);

      const badgeNotifications: NotificationItem[] =
        badgeData.badges?.map(
          (b: { badge_id: string; name: string; description: string }) => ({
            id: b.badge_id,
            name: b.name,
            description: b.description,
            type: "badge",
          })
        ) || [];

      const achievementNotifications: NotificationItem[] =
        (achievementData.user_achievements as Achievement[])?.map((a) => ({
          id: a.achievement_id,
          name: a.name_en,
          description: a.description_en,
          type: "achievement",
        })) || [];

      console.log("Parsed 🧠 Notifications:", [
        ...badgeNotifications,
        ...achievementNotifications,
      ]);

      setNotifications([...badgeNotifications, ...achievementNotifications]);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Monitor progress page visits and clear notifications automatically
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (pathname === "/progress") {
      if (tab === "badges") {
        // Clear badge notifications from the header
        setNotifications((prev) => prev.filter((n) => n.type !== "badge"));

        // Optionally call API to mark as viewed
        fetch("/api/users/badges/mark-viewed", { method: "POST" })
          .then(() => console.log("Badge notifications marked as viewed"))
          .catch((err) =>
            console.error("Error marking badges as viewed:", err)
          );
      } else if (tab === "achievements") {
        // Clear achievement notifications from the header
        setNotifications((prev) =>
          prev.filter((n) => n.type !== "achievement")
        );

        // Optionally call API to mark as viewed
        fetch("/api/users/achievements/mark-viewed", { method: "POST" })
          .then(() => console.log("Achievement notifications marked as viewed"))
          .catch((err) =>
            console.error("Error marking achievements as viewed:", err)
          );
      }
    }
  }, [pathname, searchParams]);

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

  const handleNotificationClick = async (
    id: string,
    type: "badge" | "achievement"
  ) => {
    // Remove the clicked notification immediately
    setNotifications((prev) =>
      prev.filter((n) => !(n.id === id && n.type === type))
    );

    // Navigate to the appropriate tab
    if (type === "badge") {
      router.push("/progress?tab=badges");
    } else if (type === "achievement") {
      router.push("/progress?tab=achievements");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 h-12">
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-semibold text-blue-600">
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
              className="w-72 bg-white border border-gray-200 shadow-lg rounded-md"
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
                notifications.map((item) => (
                  <DropdownMenuItem
                    key={`${item.type}-${item.id}`}
                    className="text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => handleNotificationClick(item.id, item.type)}
                  >
                    {item.type === "badge" ? "🎖️" : "🏆"} {item.name}:{" "}
                    {item.description}
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
                <Avatar className="h-8 w-8 border-2 border-gray-100">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                Signed in as{" "}
                <span className="font-medium text-gray-700">
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
                className="text-sm text-red-500"
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
