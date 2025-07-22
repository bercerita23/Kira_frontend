"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DashboardHeader,
  MobileMenuContext,
} from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
type Badge = {
  badge_id: string;
  earned_at: string;
  is_viewed: boolean;
  name: string;
  description: string;
  icon_url?: string;
};

export default function ProgressPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [badges, setBadges] = useState<Badge[]>([]); // user badges
  const [allBadges, setAllBadges] = useState<Badge[]>([]); // all possible badges
  const [attempts, setAttempts] = useState<any[]>([]); // quiz attempts
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "quiz";
  const [tab, setTab] = useState(defaultTab);
  // Fetch user badges
  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/users/badges");
        if (!res.ok) throw new Error("Failed to fetch badges");
        const data = await res.json();
        setBadges(data.badges || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching badges:", err);
      }
    }
    fetchBadges();
  }, []);

  // Fetch all badges
  useEffect(() => {
    async function fetchAllBadges() {
      try {
        const res = await fetch("/api/users/badges/all");
        if (!res.ok) throw new Error("Failed to fetch all badges");
        const data = await res.json();
        setAllBadges(data.badges || []);
      } catch (err) {
        console.error("Error fetching all badges:", err);
      }
    }
    fetchAllBadges();
  }, []);

  // Fetch quiz attempts
  useEffect(() => {
    async function fetchAttempts() {
      try {
        const res = await fetch("/api/users/attempts");
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error("Error fetching attempts:", err);
      }
    }
    fetchAttempts();
  }, []);

  // Set of earned badge IDs for quick lookup
  const earnedBadgeIds = new Set(badges.map((b) => b.badge_id));

  return (
    <MobileMenuContext.Provider
      value={{ isMobileMenuOpen, setIsMobileMenuOpen }}
    >
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardSidebar />
          <main className="flex-1 pt-12 px-6 md:px-8 md:pt-12 md:pl-64">
            <div className="max-w-none py-4">
              <h1 className="text-2xl font-bold mb-6">Progress</h1>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="quiz">Quiz History</TabsTrigger>
                  <TabsTrigger value="badges">Badges</TabsTrigger>
                </TabsList>
                <TabsContent value="quiz">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Quiz
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Score
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {attempts.length > 0 ? (
                              attempts.map((attempt) => (
                                <tr
                                  key={`${attempt.quiz_id}-${attempt.attempt_count}`}
                                >
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {attempt.quiz_name ||
                                      `Quiz ${attempt.quiz_id}`}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {attempt.completed_at
                                      ? new Date(
                                          attempt.completed_at
                                        ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {attempt.pass_count} /{" "}
                                    {attempt.pass_count + attempt.fail_count}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-4 py-2 text-center text-gray-400"
                                >
                                  No quiz history yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="badges">
                  <Card>
                    <CardHeader>
                      <CardTitle>Badges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Icon
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Description
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Earned
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allBadges.length > 0 ? (
                              allBadges.map((badge) => {
                                const unlocked = earnedBadgeIds.has(
                                  badge.badge_id
                                );
                                return (
                                  <tr
                                    key={badge.badge_id}
                                    className={cn(
                                      unlocked
                                        ? ""
                                        : "opacity-60 grayscale bg-gray-50"
                                    )}
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap text-xl text-center">
                                      {badge.icon_url || "🏅"}
                                    </td>
                                    <td
                                      className={cn(
                                        "px-4 py-2 whitespace-nowrap text-sm",
                                        unlocked
                                          ? "text-gray-900 dark:text-white"
                                          : "text-gray-400"
                                      )}
                                    >
                                      {badge.name}
                                    </td>
                                    <td
                                      className={cn(
                                        "px-4 py-2 whitespace-nowrap text-sm",
                                        unlocked
                                          ? "text-gray-700 dark:text-gray-200"
                                          : "text-gray-400"
                                      )}
                                    >
                                      {badge.description}
                                    </td>
                                    <td
                                      className={cn(
                                        "px-4 py-2 whitespace-nowrap text-sm",
                                        unlocked
                                          ? "text-gray-500 dark:text-gray-400"
                                          : "text-gray-400"
                                      )}
                                    >
                                      {unlocked
                                        ? badge.earned_at
                                          ? new Date(
                                              badge.earned_at
                                            ).toLocaleDateString()
                                          : "✓"
                                        : "Locked"}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                >
                                  No badges available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
