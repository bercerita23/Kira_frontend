"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DashboardHeader,
  MobileMenuContext,
} from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

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
  const [tab, setTab] = useState("quiz");
  const [badges, setBadges] = useState<Badge[]>([]);

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
                                Max Score
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Example row, replace with dynamic data when available */}
                            <tr>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                Week 1 Quiz
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                2024-06-01
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                8/10
                              </td>
                            </tr>
                            {/* Add more rows as needed */}
                          </tbody>
                        </table>
                        <div className="text-xs text-gray-400 mt-2">
                          No quiz history yet. This is a template.
                        </div>
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
                            {badges && badges.length > 0 ? (
                              badges.map((badge) => (
                                <tr key={badge.badge_id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-xl text-center">
                                    🏅
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {badge.name}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {badge.description}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {badge.earned_at
                                      ? new Date(
                                          badge.earned_at
                                        ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                                >
                                  No badges earned yet.
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
