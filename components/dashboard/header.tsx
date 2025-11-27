"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Bell, Menu, Settings, User, LogOut, User2Icon } from "lucide-react";
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

const getHeader = (str: string) => {
  switch (str) {
    case "/dashboard/":
      return "Home";
    default:
      return "";
  }
};

type DashboardHeaderProps = {
  hidden?: boolean;
};

export function DashboardHeader({ hidden = false }: DashboardHeaderProps) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } =
    useContext(MobileMenuContext);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   *  Header Components
   */

  const [userProfilePicture, setUserProfilePicture] = useState<string | null>();
  const [currentPath, setCurrentPath] = useState<string>(getHeader(pathname));
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    school: "",
  });

  type NotificationItem = {
    id: string;
    name: string;
    description: string;
    type: "badge" | "achievement";
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDisplayName();
    setLoading(false);
  }, [user]);

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

    setUserInfo({ firstName, lastName, school: user.school_id });
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return user.email || "User";
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
    <header
      className={`sticky w-[95%] max-w-none bg-white border-b border-gray-100 z-40 h-12 rounded-2xl min-h-max p-4 top-3 justify-self-center self-center ${
        hidden && hidden === true ? "hidden" : ""
      }`}
    >
      <div className="px-4 h-full flex items-center justify-between min-h-min">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            {
              <img
                src="/assets/dashboard/kira_logo.png"
                alt="Kira Logo"
                className="max-h-12"
              />
            }
          </Link>
        </div>

        <div className="">
          <span className="text-2xl font-lato font-[600] hidden md:block">
            {currentPath ?? ""}
          </span>
        </div>

        <div
          className="flex items-center gap-2  hover:cursor-pointer"
          onClick={() => {
            router.push(`/studentprofile`);
          }}
        >
          {/** Name and school name */}
          <div className="flex flex-row gap-3">
            <div className="flex flex-col text-right">
              <span className="text-2xl font-lato font-[500] hidden md:block">
                {`${userInfo.firstName} ${userInfo.lastName}`}
              </span>
              <span className="text-l font-lato font-[400] justify-self-endsafe hidden md:block">
                {`${userInfo.school}`}
              </span>
            </div>
            {userProfilePicture ? (
              <img
                src={userProfilePicture}
                alt="user default logo"
                className="w-14 h-14 rounded-full object-cover2 bg-black"
              />
            ) : (
              <User2Icon className="w-14 h-14 rounded-full object-cover2 bg-black text-white" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
