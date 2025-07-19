//(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
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
type Badge = {
  badge_id: string;
  earned_at: string;
  is_viewed: boolean;
  name: string;
  description: string;
  icon_url?: string;
};
type Quiz = {
  quiz_id: number;
  school_id: string;
  creator_id: string;
  name: string;
  questions: string[];
  description: string;
  created_at: string;
  expired_at: string;
  is_locked: boolean;
};

type Attempt = {
  quiz_id: number;
  attempt_count: number;
  pass_count: number;
  fail_count: number;
};

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const [streaks, setStreaks] = useState<{
    current_streak: number;
    longest_streak: number;
    last_activity: string;
  } | null>(null);
  const [points, setPoints] = useState<{
    points: number;
  } | null>(null);
  const { minutes, goalMinutes, percent } = useTodaysGoal();
  const topicId = "greetings";
  const totalQuestions = 5;

  const weekKey = new Date().toISOString().slice(0, 10);

  const [correctCount, setCorrectCount] = useState(0);
  const [basicPhrasesCorrect, setBasicPhrasesCorrect] = useState(0);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const storedCorrect = localStorage.getItem(
        `topicScore:${user.email || user.id}:${topicId}:${weekKey}`
      );
      const storedBasic = localStorage.getItem(
        `topicScore:${user.email || user.id}:basic-phrases:${weekKey}`
      );

      setCorrectCount(Number(storedCorrect ?? 0));
      setBasicPhrasesCorrect(Number(storedBasic ?? 0));
    }
  }, [user, topicId, weekKey]);

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

  useEffect(() => {
    async function fetchStreaks() {
      try {
        const res = await fetch("/api/users/streaks");
        if (!res.ok) throw new Error("Failed to fetch streaks");
        const data = await res.json();
        setStreaks(data);
        // Log streaks to the console
        // eslint-disable-next-line no-console
        console.log("User streaks:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching streaks:", err);
      }
    }
    fetchStreaks();
  }, []);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/users/quizzes");
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        const data = await res.json();
        setQuizzes(data.quizzes || []);
        // eslint-disable-next-line no-console
        console.log("User quizzes:", data);
        // Fetch questions for the first quiz if available
        if (data.quizzes && data.quizzes.length > 0) {
          const quizId = data.quizzes[0].quiz_id;
          const questionsRes = await fetch(`/api/users/questions/${quizId}`);
          if (!questionsRes.ok) throw new Error("Failed to fetch questions");
          const questionsData = await questionsRes.json();
          // eslint-disable-next-line no-console
          console.log(`Questions for quiz ${quizId}:`, questionsData);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching quizzes or questions:", err);
      }
    }
    fetchQuizzes();
  }, []);

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

  // Leveling system: Level = floor(points / 100) + 1, XP = points, progress = (points % 100)
  const level = points ? Math.floor(points.points / 100) + 1 : "…";
  const xp = points ? points.points : "…";
  const xpForNextLevel = 100;
  const progressPercentage = points
    ? Math.min(100, Math.max(0, points.points % 100))
    : 0;

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
                        {streaks ? streaks.current_streak : "…"} days
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
                    <div className="relative w-full h-1.5 bg-gray-200 rounded overflow-hidden mt-2">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 transition-all"
                        style={{ width: `${percent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <CircularProgress
                        value={progressPercentage}
                        size={48}
                        strokeWidth={4}
                        color="primary"
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
                  {quizzes && quizzes.length > 0 ? (
                    quizzes.map((quiz: Quiz) => {
                      const attempt = attempts.find(
                        (a) => a.quiz_id === quiz.quiz_id
                      );
                      const totalQuestions = attempt
                        ? attempt.pass_count + attempt.fail_count
                        : 5;
                      const score = attempt ? attempt.pass_count : 0;
                      const shouldLock =
                        quiz.is_locked ||
                        (attempt && attempt.attempt_count === 2);
                      const progressColor =
                        score === totalQuestions ? "green" : "primary";
                      return shouldLock ? (
                        <div
                          key={quiz.quiz_id}
                          className="block bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed mb-2"
                        >
                          <div className="flex items-center">
                            <div className="relative mr-4">
                              <CircularProgress
                                value={
                                  totalQuestions > 0
                                    ? (score / totalQuestions) * 100
                                    : 0
                                }
                                size={48}
                                strokeWidth={4}
                                color={progressColor}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl">📝</span>
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                {quiz.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {quiz.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                Score: {score} / {totalQuestions}
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
                      ) : (
                        <Link
                          key={quiz.quiz_id}
                          href={`/lesson/${quiz.quiz_id}`}
                          className="block bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors mb-2"
                        >
                          <div className="flex items-center">
                            <div className="relative mr-4">
                              <CircularProgress
                                value={
                                  totalQuestions > 0
                                    ? (score / totalQuestions) * 100
                                    : 0
                                }
                                size={48}
                                strokeWidth={4}
                                color={progressColor}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl">📝</span>
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {quiz.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {quiz.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                Score: {score} / {totalQuestions}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No quizzes available today.
                    </p>
                  )}
                </div>
              </div>

              {/* Weekly Topics */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  This Week's Topics
                </h2>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border-2 border-green-500">
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full"></div>
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <CircularProgress
                            value={
                              totalQuestions > 0
                                ? Math.round(
                                    (correctCount / totalQuestions) * 100
                                  )
                                : 0
                            }
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
                            value={
                              totalQuestions > 0
                                ? Math.round(
                                    (basicPhrasesCorrect / totalQuestions) * 100
                                  )
                                : 0
                            }
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
