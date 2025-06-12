//(dashboard)/dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  DashboardHeader,
  MobileMenuContext,
} from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/lib/context/auth-context";
import Link from "next/link";
import { ChevronRight, Star, Award, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useTodaysGoal } from "@/hooks/useTodaysGoal";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStreak } from "@/hooks/useStreak";
import { useLevel } from "@/hooks/useLevel";
export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const streak = useStreak();
  const { level, xp, xpForNextLevel, progressPercentage } = useLevel();
  const { minutes, goalMinutes, percent } = useTodaysGoal();
  const topicId = "greetings";
  const weekKey = new Date().toISOString().slice(0, 10);
  const correctCount = Number(
    typeof window !== "undefined" && user
      ? localStorage.getItem(
          `topicScore:${user.email || user.id}:${topicId}:${weekKey}`
        ) || 0
      : 0
  );
  const totalQuestions = 5;
  // basic Phrases (if you have multiple topics):
  const basicPhrasesCorrect = Number(
    typeof window !== "undefined" && user
      ? localStorage.getItem(
          `topicScore:${user.email || user.id}:basic-phrases:${weekKey}`
        ) || 0
      : 0
  );
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show simple login message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your dashboard.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get user's display name
  const getDisplayName = () => {
    if (!user) return "User";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return user.email || "User";
  };

  return (
    <MobileMenuContext.Provider
      value={{ isMobileMenuOpen, setIsMobileMenuOpen }}
    >
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardSidebar />
          <main className="flex-1 pt-16 px-4 md:px-6 md:pt-8 md:pl-72">
            <div className="max-w-4xl mx-auto py-6">
              {/* Welcome Section */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Hello, {getDisplayName()}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Continue your English learning journey
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Daily Streak
                      </p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {streak} days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Today's Goal
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-medium">
                        {minutes}/{goalMinutes} minutes
                      </p>
                      <p className="text-xs font-medium text-blue-500">
                        {percent}%
                      </p>
                    </div>
                    <Progress value={percent} className="h-1.5 mt-2" />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <CircularProgress
                        value={progressPercentage}
                        size={48}
                        strokeWidth={4}
                        color="primary" // Use "primary", "secondary", "green", "yellow" as allowed by your component
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Award className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Level
                      </p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {level}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {xp}/{xpForNextLevel} XP
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Activities */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Today's Activities
                </h2>

                <div className="space-y-3">
                  <Link
                    href="/lesson/weekly-quiz"
                    className="block bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <Book className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Weekly Quiz: Greetings
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          10 questions • 5 minutes
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>

                  <Link
                    href="/lesson/speaking-practice"
                    className="block bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-orange-500"
                        >
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Speaking Practice
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pronunciation • 3 minutes
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Weekly Topics */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  This Week's Topics
                </h2>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <CircularProgress
                            value={Math.round(
                              (correctCount / totalQuestions) * 100
                            )}
                            size={48}
                            strokeWidth={4}
                            color={
                              correctCount >= totalQuestions
                                ? "green"
                                : "primary"
                            }
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">👋</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Greetings
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {correctCount} of {totalQuestions} questions correct
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-500"
                          asChild
                        >
                          <Link href="/lesson/greetings">
                            <span>Review</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border-2 border-blue-500">
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <CircularProgress
                            value={Math.round(
                              (basicPhrasesCorrect / totalQuestions) * 100
                            )}
                            size={48}
                            strokeWidth={4}
                            color={
                              basicPhrasesCorrect >= totalQuestions
                                ? "green"
                                : "primary"
                            }
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl">💬</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Basic Phrases
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {basicPhrasesCorrect} of {totalQuestions} questions
                            correct
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500"
                          asChild
                        >
                          <Link href="/lesson/basic-phrases">
                            <span>Continue</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 opacity-60">
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-xl opacity-70">👪</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Family
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Complete Basic Phrases to unlock
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400"
                          disabled
                        >
                          <span>Locked</span>
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
