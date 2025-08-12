"use client";

import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import {
  BarChart2,
  BookOpen,
  Award,
  Users,
  Settings,
  HelpCircle,
  Home,
  X,
  Mic,
  Crown,
} from "lucide-react";
import { MobileMenuContext } from "./header";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } =
    useContext(MobileMenuContext);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    // Conditionally add Admin Dashboard for admin users
    ...(user?.role === "admin" || user?.role === "adm"
      ? [
          {
            name: "Admin Dashboard",
            href: "/admin",
            icon: <Crown className="h-5 w-5" />,
          },
        ]
      : []),
    {
      name: "(Coming Soon)",
      href: "/lessons",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Progress",
      href: "/progress",
      icon: <BarChart2 className="h-5 w-5" />,
    },
  ];

  const bottomMenuItems = [
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "Help",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];
  /*
{
      name: "Speaking",
      href: "/speaking",
      icon: <Mic className="h-5 w-5" />,
    },

    {
      name: "Achievements",
      href: "/achievements",
      icon: <Award className="h-5 w-5" />,
    },
*/
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-12 bottom-0 z-30 hidden md:block w-56 border-r border-gray-100 bg-white overflow-y-auto">
        <div className="flex flex-col h-full pt-4">
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span
                    className={`mr-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                  {item.name === "Achievements" && (
                    <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 mt-auto">
            <div className="rounded-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-xs font-medium text-gray-900">
                    Premium Badges
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Unlock special rewards
                  </p>
                </div>
              </div>
              <button className="mt-2 text-xs w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                Upgrade
              </button>
            </div>

            <div className="mt-6 space-y-1">
              {bottomMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm rounded-md
                      ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }
                    `}
                  >
                    <span className="mr-3 text-gray-400">
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-200 ease-in-out ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-200 ease-in-out shadow-lg md:hidden
                    ${
                      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        <div className="flex items-center justify-between h-12 px-4 border-b border-gray-100">
          <span className="font-semibold text-blue-600">
            Kira
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile menu content */}
        <div className="py-2 overflow-y-auto">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`mobile-${item.name}`}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-md font-medium transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200"
                    }
                  `}
                >
                  <span
                    className={`mr-3 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                  {item.name === "Achievements" && (
                    <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 px-3">
            <div className="rounded-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    Premium Badges
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Unlock special rewards
                  </p>
                </div>
              </div>
              <button className="mt-2 text-xs w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                Upgrade
              </button>
            </div>
          </div>

          <div className="mt-6 px-3 space-y-1">
            {bottomMenuItems.map((item) => (
              <Link
                key={`mobile-${item.name}`}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <span className="mr-3 text-gray-400 dark:text-gray-500">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
