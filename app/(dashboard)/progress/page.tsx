// app/(dashboard)/progress/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
  bahasa_indonesia_name?: string;
  bahasa_indonesia_description?: string;
  description: string;
  icon_url?: string;
};
type Achievement = {
  achievement_id: string;
  name_en: string;
  name_ind?: string;
  description_en: string;
  description_ind: string;
  points: number;
  completed_at: string;
  view_count: number;
};
import { CircularProgress } from "@/components/ui/circular-progress";

export default function ProgressPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]); // user badges
  const [allBadges, setAllBadges] = useState<Badge[]>([]); // all possible badges
  const [goalPoints, setGoalPoints] = useState<number>(350);
  const [attempts, setAttempts] = useState<any[]>([]); // quiz attempts
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "quiz";
  const [tab, setTab] = useState(defaultTab);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState<{
    points: number;
  } | null>(null);

  // Add hover state for translations
  const [hoveredBadgeName, setHoveredBadgeName] = useState<string | null>(null);
  const [hoveredBadgeDesc, setHoveredBadgeDesc] = useState<string | null>(null);
  const [hoveredAchievementName, setHoveredAchievementName] = useState<string | null>(null);
  const [hoveredAchievementDesc, setHoveredAchievementDesc] = useState<string | null>(null);

  // Clear all hover states when tab changes
  useEffect(() => {
    setHoveredBadgeName(null);
    setHoveredBadgeDesc(null);
    setHoveredAchievementName(null);
    setHoveredAchievementDesc(null);
  }, [tab]);

  // Clear hover states when component unmounts or user navigates away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHoveredBadgeName(null);
        setHoveredBadgeDesc(null);
        setHoveredAchievementName(null);
        setHoveredAchievementDesc(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  type Attempt = {
    quiz_id: number;
    quiz_name: string;
    pass_count: number;
    fail_count: number;
    attempt_count: number;
    completed_at: string | null;
    duration_in_sec: number | null;
  };
  const [selectedQuiz, setSelectedQuiz] = useState<Attempt | null>(null);

  function formatDuration(seconds: number | null): string {
    if (seconds === null || seconds < 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  // Fetch user's unlocked achievements
  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("/api/users/achievements");
        if (!res.ok) throw new Error("Failed to fetch achievements");
        const data = await res.json();
        setAchievements(data.user_achievements || []);
        console.log("User poiachievements:", data);
      } catch (err) {
        console.error("Error fetching achievements:", err);
      }
    }

    if (tab === "achievements") {
      fetchAchievements();
    }
  }, [tab]);

  // Fetch all possible achievements
  useEffect(() => {
    async function fetchAllAchievements() {
      try {
        const res = await fetch("/api/users/achievements/all");
        if (!res.ok) throw new Error("Failed to fetch all achievements");
        const data = await res.json();
        setAllAchievements(data.achievements || []);
      } catch (err) {
        console.error("Error fetching all achievements:", err);
      }
    }

    fetchAllAchievements();
  }, []);

  // Fetch user badges
  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/users/badges");
        if (!res.ok) throw new Error("Failed to fetch badges");
        const data = await res.json();
        setBadges(data.badges || []);
      } catch (err) {
        console.error("Error fetching badges:", err);
      }
    }

    if (tab === "badges") {
      fetchBadges();
    }
  }, [tab]);

  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await fetch("/api/users/points");
        if (!res.ok) throw new Error("Failed to fetch points");
        const data = await res.json();
        setPoints(data);
        // Log points to the console
        // eslint-disable-next-line no-console
        console.log("User points:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching points:", err);
      }
    }
    fetchPoints();
  }, []);

  // Fetch all badges
  useEffect(() => {
    async function fetchAllBadges() {
      try {
        const res = await fetch("/api/users/badges/all");
        if (!res.ok) throw new Error("Failed to fetch all badges");
        const data = await res.json();
        setAllBadges(data.badges || []);

        const highest = data.badges?.reduce((max: number, b: any) => {
          return Math.max(max, b.points_required || 0);
        }, 0);

        if (highest > 0) setGoalPoints(highest);
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
        console.log("Fetched attempts:", data.attempts);
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
              {points && (
                <div className="mb-6">
                  <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-none shadow-lg">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {points.points} / {goalPoints} XP
                        </p>
                        <span className="text-2xl">🏁</span>
                      </div>
                      <div className="relative w-full h-4 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (points.points / goalPoints) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {350 - points.points > 0
                          ? `${350 - points.points
                          } XP to reach the finish line!`
                          : "🎉 You've reached the maximum XP!"}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="quiz">Quiz History</TabsTrigger>
                  <TabsTrigger value="badges">Medals</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
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
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Duration
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {attempts.length > 0 ? (
                              attempts.map((attempt) => (
                                <tr
                                  key={`${attempt.quiz_id}-${attempt.attempt_count}`}
                                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                  onClick={() => setSelectedQuiz(attempt)}
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
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {formatDuration(attempt.duration_in_sec)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                                    {attempt.pass_count <
                                      attempt.pass_count + attempt.fail_count &&
                                      attempt.attempt_count < 2 && (
                                        <Link
                                          href={`/lesson/${attempt.quiz_id}`}
                                          className="px-2 py-1.5 rounded hover:bg-purple-700 hover:text-white transition text-sm"
                                          onClick={(e) => e.stopPropagation()} // to prevent modal opening
                                        >
                                          Retake Quiz
                                        </Link>
                                      )}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-4 py-2 text-center text-gray-400"
                                >
                                  Ready to begin? Take your first quiz!
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
                      <CardTitle>Medals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Icon
                              </th>
                              <th className="w-48 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                              </th>
                              <th className="px-4  py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Description
                              </th>
                              <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
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
                                      "transition-colors duration-200",
                                      unlocked
                                        ? "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        : "opacity-100 bg-gray-50 hover:bg-gray-100"
                                    )}
                                  >
                                    <td className="w-16 px-4 py-2 text-xl text-center">
                                      {badge.icon_url || "🏅"}
                                    </td>

                                    <td
                                      className={cn(
                                        "w-48 px-4 py-2 text-sm relative",
                                        unlocked
                                          ? "text-gray-900 dark:text-white"
                                          : "text-gray-600"
                                      )}
                                    >
                                      <div
                                        className="truncate"
                                        onMouseEnter={() => {
                                          setTimeout(() => setHoveredBadgeName(badge.badge_id), 1000);
                                        }}
                                        onMouseLeave={() => setHoveredBadgeName(null)}
                                      >
                                        {badge.name}
                                      </div>
                                      {hoveredBadgeName === badge.badge_id && badge.bahasa_indonesia_name && (
                                        <div className="absolute bottom-full left-0 mb-1 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                                          {badge.bahasa_indonesia_name}
                                        </div>
                                      )}
                                    </td>

                                    <td
                                      className={cn(
                                        "px-4 py-2 text-sm relative",
                                        unlocked
                                          ? "text-gray-700 dark:text-gray-200"
                                          : "text-gray-400"
                                      )}
                                    >
                                      <div
                                        className="line-clamp-2"
                                        onMouseEnter={() => {
                                          setTimeout(() => setHoveredBadgeDesc(badge.badge_id), 1000);
                                        }}
                                        onMouseLeave={() => setHoveredBadgeDesc(null)}
                                      >
                                        {badge.description}
                                      </div>
                                      {hoveredBadgeDesc === badge.badge_id && badge.bahasa_indonesia_description && (
                                        <div className="absolute bottom-full left-0 mb-1 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded z-10 max-w-xs">
                                          {badge.bahasa_indonesia_description}
                                        </div>
                                      )}
                                    </td>
                                    <td
                                      className={cn(
                                        "w-24 px-4 py-2 text-sm",
                                        unlocked
                                          ? "text-gray-500 dark:text-gray-400"
                                          : "text-gray-600"
                                      )}
                                    >
                                      <div className="truncate">
                                        {unlocked
                                          ? badge.earned_at
                                            ? new Date(
                                              badge.earned_at
                                            ).toLocaleDateString()
                                            : "✓"
                                          : "Locked"}
                                      </div>
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

                <TabsContent value="achievements">
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="w-48 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Description
                              </th>
                              <th className="w-20 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Points
                              </th>
                              <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Completed
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allAchievements.length > 0 ? (
                              allAchievements.map((achievement) => {
                                const unlocked = achievements.some(
                                  (a) =>
                                    a.achievement_id ===
                                    achievement.achievement_id
                                );
                                const userData = achievements.find(
                                  (a) =>
                                    a.achievement_id ===
                                    achievement.achievement_id
                                );
                                return (
                                  <tr
                                    key={achievement.achievement_id}
                                    className={cn(
                                      "transition-colors duration-200",
                                      unlocked
                                        ? "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        : "opacity-100 bg-gray-50 hover:bg-gray-100"
                                    )}
                                  >
                                    <td
                                      className={cn(
                                        "w-48 px-4 py-2 text-sm relative",
                                        unlocked
                                          ? "text-gray-900 dark:text-white"
                                          : "text-gray-600"
                                      )}
                                    >
                                      <div
                                        className="h-6 max-w-[160px] overflow-hidden truncate"
                                        onMouseEnter={() => {
                                          setTimeout(() => setHoveredAchievementName(achievement.achievement_id), 1000);
                                        }}
                                        onMouseLeave={() => setHoveredAchievementName(null)}
                                      >
                                        {achievement.name_en}
                                      </div>
                                      {hoveredAchievementName === achievement.achievement_id && achievement.name_ind && (
                                        <div className="absolute bottom-full left-0 mb-1 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                                          {achievement.name_ind}
                                        </div>
                                      )}
                                    </td>
                                    <td
                                      className={cn(
                                        "px-4 py-2 text-sm relative",
                                        unlocked
                                          ? "text-gray-700 dark:text-gray-200"
                                          : "text-gray-400"
                                      )}
                                    >
                                      <div
                                        className="line-clamp-2"
                                        onMouseEnter={() => {
                                          setTimeout(() => setHoveredAchievementDesc(achievement.achievement_id), 1000);
                                        }}
                                        onMouseLeave={() => setHoveredAchievementDesc(null)}
                                      >
                                        {achievement.description_en}
                                      </div>
                                      {hoveredAchievementDesc === achievement.achievement_id && achievement.description_ind && (
                                        <div className="absolute bottom-full left-0 mb-1 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded z-10 max-w-xs">
                                          {achievement.description_ind}
                                        </div>
                                      )}
                                    </td>
                                    <td
                                      className={cn(
                                        "w-20 px-4 py-2 text-sm text-center",
                                        unlocked
                                          ? "text-gray-700 dark:text-gray-200"
                                          : "text-gray-600"
                                      )}
                                    >
                                      {achievement.points}
                                    </td>
                                    <td
                                      className={cn(
                                        "w-24 px-4 py-2 text-sm",
                                        unlocked
                                          ? "text-gray-500 dark:text-gray-400"
                                          : "text-gray-600"
                                      )}
                                    >
                                      <div className="truncate">
                                        {unlocked && userData?.completed_at
                                          ? new Date(
                                            userData.completed_at
                                          ).toLocaleDateString()
                                          : "Locked"}
                                      </div>
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
                                  No achievements available.
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

              {selectedQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-[300px] relative">
                    {/* Close X Button */}
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                      onClick={() => setSelectedQuiz(null)}
                    >
                      ✕
                    </button>

                    {/* Quiz Title */}
                    <h2 className="text-3xl font-bold text-center mb-8">
                      {selectedQuiz.quiz_name || `Quiz ${selectedQuiz.quiz_id}`}
                    </h2>

                    {/* Circular Progress */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <CircularProgress
                          value={
                            (selectedQuiz.pass_count /
                              (selectedQuiz.pass_count +
                                selectedQuiz.fail_count)) *
                            100
                          }
                          size={160}
                          strokeWidth={14}
                          color="primary"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-gray-800 dark:text-white">
                            {selectedQuiz.pass_count}/
                            {selectedQuiz.pass_count + selectedQuiz.fail_count}
                          </span>
                          <span className="text-base text-gray-500 dark:text-gray-400">
                            Correct
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-center mb-8">
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Completed On:</span>{" "}
                        {selectedQuiz.completed_at
                          ? new Date(
                            selectedQuiz.completed_at
                          ).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Attempts:</span>{" "}
                        {selectedQuiz.attempt_count}
                      </p>
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Duration:</span>{" "}
                        {formatDuration(selectedQuiz.duration_in_sec)}
                      </p>
                    </div>

                    {/* Retake Quiz Button */}
                    {selectedQuiz.pass_count <
                      selectedQuiz.pass_count + selectedQuiz.fail_count &&
                      selectedQuiz.attempt_count < 2 && (
                        <div className="flex justify-center">
                          <Link
                            href={`/lesson/${selectedQuiz.quiz_id}`}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-purple-700 transition text-center"
                          >
                            Retake Quiz
                          </Link>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
