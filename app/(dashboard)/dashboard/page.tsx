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
import { ChevronRight, Star, Award, Book, BadgeSwissFranc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useTodaysGoal } from "@/hooks/useTodaysGoal";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import AwardDisplay, { badgeTypes } from "@/components/dashboard/awards";
import KiraGpt from "@/components/Kira-gpt";
type Quiz = {
  quiz_id: number;
  school_id: string;
  creator_id: string;
  name: string;
  questions: Question[]; // Changed from string[] to Question[]
  description: string;
  created_at: string;
  expired_at: string;
  is_locked: boolean;
};

type Question = {
  question_id: number;
  content: string;
  options: string[];
  question_type: "MCQ" | "FITB" | "SA";
  points: number;
  answer: string;
  image_url?: string;
};

type Attempt = {
  quiz_id: number;
  attempt_count: number;
  pass_count: number;
  fail_count: number;
  completed_at: string;
};

type Badge = {
  badge_id: string;
  earned_at: string;
  name: string;
};

type Achievements = {
  achievement_id: string;
  completed_at: string;
  name_en: string;
};

type userAwards = {
  userAchievements: Achievements[];
  userBadges: Badge[];
};

type mergedAward = {
  id: badgeTypes;
  dateAwarded: Date;
  name: string;
};

type bintangStatus = {
  chat_unlocked: boolean;
  minutes_remaining: number;
};

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);

  const [userAwards, setUserAwards] = useState<userAwards>({
    userAchievements: [],
    userBadges: [],
  });
  const [displayAwards, setDisplayAwards] = useState<mergedAward[]>([]);

  const { user, isLoading } = useAuth();
  const [userPoints, setUserPoints] = useState<{
    points: number;
  } | null>(null);
  const totalQuestions = 5;

  const weekKey = new Date().toISOString().slice(0, 10);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [week, setWeek] = useState<number>(0);
  const [nextQuiz, setNextQuiz] = useState<Quiz | null>();
  const [isBintangAvailable, setIsBintangAvailable] =
    useState<bintangStatus | null>(null);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [mostRecentQuizId, setMostRecentQuizId] = useState<number | null>(null);
  const [globalDailyRetryCount, setGlobalDailyRetryCount] = useState(0);

  function toDateSafe(s: string | undefined): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const res = await fetch("/api/users/attempts");
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const data = await res.json();
        setAttempts(data.attempts || []);
        console.log("attempts ", data.attempts);
      } catch (err) {
        console.error("Error fetching attempts:", err);
      }
    }

    async function fetchAchievements() {
      try {
        const res = await fetch("/api/users/achievements");
        if (!res.ok) throw new Error("Failed to fetch achievements");
        const data = await res.json();
        //console.log(data.user_achievements);

        console.log(data);
        setUserAwards((a) => ({
          ...a,
          userAchievements: data.user_achievements,
        }));
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchBadges() {
      try {
        const res = await fetch("/api/users/badges");
        if (!res.ok) throw new Error("Failed to fetch badges");
        const data = await res.json();

        console.log(data);

        setUserAwards((a) => ({
          ...a,
          userBadges: data.badges,
        }));
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchPoints() {
      try {
        const res = await fetch("/api/users/points");
        if (!res.ok) throw new Error("Failed to fetch points");
        const data = await res.json();
        setUserPoints(data);
        // Log points to the console
        // eslint-disable-next-line no-console
        console.log("User points:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching points:", err);
      }
    }
    setIsLoading(true);
    fetchAchievements();
    fetchBadges();
    fetchAttempts();
    fetchPoints();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/users/quizzes");
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        const data = await res.json();

        const today = new Date().getDay();
        const parseQuizNumber = (name: string): number | null => {
          const m = name.match(/quiz\s*(\d+)/i);
          return m ? parseInt(m[1], 10) : null;
        };
        const UNLOCK_DAY_BY_NUMBER: Record<number, number> = {
          1: 1, // Monday
          2: 3, // Wednesday
          3: 5, // Friday
        };

        const now = new Date();
        const unlockedQuizzes: Quiz[] = (data.quizzes ?? [])
          .filter((q: Quiz) => {
            // 1) Include ALL expired quizzes
            const isExpired = q.expired_at
              ? new Date(q.expired_at) <= now
              : false;
            if (isExpired) return true;

            // 2) Otherwise (not expired), include if:
            //    a) user has an attempt for it, OR
            //    b) it is unlockable by schedule and not locked
            const hasAttempt = attempts.some((a) => a.quiz_id === q.quiz_id);
            if (hasAttempt) return true;

            if (q.is_locked) return false;

            const num = parseQuizNumber(q.name);
            if (num == null) return false;

            const unlockDow = UNLOCK_DAY_BY_NUMBER[num];
            if (unlockDow === undefined) return false;

            return today >= unlockDow; // your existing rule
          })
          .reverse();

        setQuizzes(unlockedQuizzes);

        const next = unlockedQuizzes.find(
          (q) => !attempts.some((a) => a.quiz_id === q.quiz_id)
        );
        setNextQuiz(
          next && new Date(next.expired_at) > new Date() ? next : null
        );

        // eslint-disable-next-line no-console
        console.log("User quizzes:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching quizzes or questions:", err);
      }
    }
    fetchQuizzes();
  }, [attempts]);

  useEffect(() => {
    async function fetchBintangStatus() {
      try {
        const res = await fetch("/api/users/chat/eligibility");
        if (!res.ok) throw new Error("Failed to fetch bintang status");
        const data = await res.json();
        console.log("bintang status", data);
        setIsBintangAvailable(data);
        // Log points to the console
        // eslint-disable-next-line no-console
        console.log("User points:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching points:", err);
      }
    }
    attempts[0] && setMostRecentQuizId(attempts[0].quiz_id);
    fetchBintangStatus();
  }, [attempts]);

  useEffect(() => {
    async function getTop3() {
      const achievedAchievements = userAwards.userAchievements
        .map((a) => {
          const date = toDateSafe(a.completed_at);
          if (!date) return undefined;

          const id = a.achievement_id as badgeTypes;
          return {
            id,
            name: a.name_en,
            dateAwarded: date,
          } as mergedAward;
        })
        // type predicate to tell TS we removed undefined
        .filter((x): x is mergedAward => x !== undefined);

      const achievedBadges = userAwards.userBadges
        .map((b) => {
          const date = toDateSafe(b.earned_at);
          if (!date) return undefined;

          const id = b.badge_id as badgeTypes;
          return {
            id,
            name: b.name,
            dateAwarded: date,
          } as mergedAward;
        })
        // type predicate to tell TS we removed undefined
        .filter((x): x is mergedAward => x !== undefined);

      // normalize badges -> mergedAward
      const badges: mergedAward[] = [];

      // merge, sort by most recent, take top 3
      const top3 = [...achievedAchievements, ...achievedBadges]
        .sort((a, b) => b.dateAwarded.getTime() - a.dateAwarded.getTime())
        .slice(0, 3);

      console.log(top3);

      setDisplayAwards(top3);
    }

    getTop3();
  }, [userAwards]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show simple login message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper to get correct count for a topic
  const getCorrectCount = (topic: string) => {
    // Find the quiz for the topic
    const quiz = quizzes.find((q) => q.name.toLowerCase().includes(topic));
    if (!quiz) return 0;
    const attempt = attempts.find((a) => a.quiz_id === quiz.quiz_id);
    return attempt ? attempt.pass_count : 0;
  };

  const router = useRouter();
  if (showChatbot) {
    console.log("isBintangAvailable ", isBintangAvailable);
    return (
      <KiraGpt
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        initialTopic={`Quiz ${mostRecentQuizId} topics`}
        remainingTime={60} //isBintangAvailable!.minutes_remaining * 60}
      />
    );
  }
  return (
    <MobileMenuContext.Provider
      value={{ isMobileMenuOpen, setIsMobileMenuOpen }}
    >
      <div className="h-screen bg-[#113604] flex flex-col select-none">
        <DashboardHeader hidden={showChatbot} />
        <div className={`flex-1 min-h-0 ${showChatbot ? "" : "pt-6"}`}>
          <div className="flex flex-col md:flex-row bg-white rounded-2xl w-[95%] mx-auto h-full overflow-auto items-start">
            <div className="grid grid-cols-2 gap-4 w-full max-w-[90%] mx-auto mt-3 mb-3">
              <div className="col-span-2 border-[#5CA145] border-2 border-solid rounded-2xl overflow-hidden flex flex-col md:flex-row h-40">
                <div className="flex-1 flex flex-col justify-center ml-12">
                  <span className="text-black text-xl">
                    Hi, {user.first_name}
                    {user.last_name ? user.last_name : ""}
                  </span>
                  <span className="text-black text-4xl">
                    Welcome Back to Week {week}
                  </span>
                </div>

                <div className="bg-[#E7F7E2] flex-1 mr-8 mt-6 mb-6 rounded-xl flex flex-row overflow-hidden border-[#AFD8A1] border-2 border-solid whitespace-nowrap">
                  <div className="flex-1 flex items-center justify-center space-x-2">
                    <img
                      src="/assets/dashboard/points_icon.png"
                      className="w-8"
                    />
                    <span className="text-xl">
                      {userPoints?.points ?? 0} Points
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center space-x-2r">
                    <img
                      src="/assets/dashboard/medals_icon.png"
                      className="w-8"
                    />
                    <span className="text-xl">
                      {userAwards.userBadges.length ?? 0} Medals
                    </span>
                  </div>
                  <div className="flex-1 flex items-center justify-center space-x-2r mr-3">
                    <img
                      src="/assets/dashboard/trophy_icon.png"
                      className="w-8"
                    />
                    <span className="text-xl">
                      {userAwards.userAchievements.length ?? 0} Achievements
                    </span>
                  </div>
                </div>
              </div>
              {nextQuiz ? (
                <div className="col-span-2 rounded-xl bg-[#AFD8A1] border-4 border-[#5CA145] min-h-40 flex flex-row">
                  <div className="items-center w-[60%] flex flex-row justify-center ">
                    <img
                      src="/assets/dashboard/head_surprised.png"
                      className="w-40 ml-10 mt-10 mb-10"
                    />
                    <div className="relative bg-white rounded-2xl px-6 py-4 shadow items-center align-center h-20 w-[60%]">
                      {/* Bubble content */}
                      <p className="text-center text-green-900 font-medium">
                        There is a new quiz available:
                      </p>
                      <p className="text-center text-green-900 text-lg font-semibold">
                        {nextQuiz?.name}
                      </p>
                      {/* Bubble tail (left side) */}
                      <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white" />
                    </div>
                  </div>
                  <div className="flex flex-1 justify-center items-center">
                    <button
                      className="bg-green-700 text-white px-6 py-2 rounded-full flex items-center space-x-2 hover:bg-green-800 transition w-[60%] text-center justify-center"
                      onClick={() => {
                        router.push(`/lesson/${nextQuiz!.quiz_id}`);
                      }}
                    >
                      <span className="text-xl">Go to Quiz →</span>
                    </button>
                  </div>
                </div>
              ) : isBintangAvailable?.chat_unlocked ? (
                <div className="col-span-2 rounded-xl bg-[#AFD8A1] border-4 border-[#5CA145] min-h-40 flex flex-row">
                  <div className="items-center w-[60%] flex flex-row justify-center ">
                    <img
                      src="/assets/dashboard/head_surprised.png"
                      className="w-40 ml-10 mt-10 mb-10"
                    />
                    <div className="relative bg-white rounded-2xl px-6 py-4 shadow items-center align-center h-20 w-[60%]">
                      {/* Bubble content */}
                      <p className="text-center text-green-900 text-lg font-semibold">
                        Great Job!
                      </p>
                      <p className="text-center text-green-900 text-lg">
                        You Unlocked Kira!
                      </p>
                      {/* Bubble tail (left side) */}
                      <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white" />
                    </div>
                  </div>
                  <div className="flex flex-1 justify-center items-center">
                    <button
                      className="bg-green-700 text-white px-6 py-2 rounded-full flex items-center space-x-2 hover:bg-green-800 transition w-[60%] text-center justify-center"
                      onClick={() => {
                        setShowChatbot(true);
                      }}
                    >
                      <span className="text-xl">Talk to Kira →</span>
                    </button>
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div className="min-h-80 rounded-xl border-[#113604] border-2 border-solid overflow-hidden flex flex-col items-center justify-start">
                <div className="rounded-lg p-4 mb-4 h-[15] flex flex-row items-center w-[90%] mt-2">
                  <span className="text-black text-xl flex-1">
                    Past Quizzes
                  </span>
                  <span
                    className="text-[#2D7017] justify-end hover:cursor-pointer"
                    onClick={() => {
                      router.push("/dashboard/quizzes-and-awards?r=quizzes");
                    }}
                  >
                    See All Quizzes {">"}
                  </span>
                </div>
                {quizzes && quizzes.length > 0 ? (
                  quizzes.slice(0, 3).map((quiz) => {
                    const attempt = attempts.find(
                      (a) => a.quiz_id === quiz.quiz_id
                    );
                    const totalQuestions = quiz.questions?.length || 10; // Use actual quiz length instead of hardcoded 5
                    const score = attempt ? attempt.pass_count : 0;
                    // Lock quiz if:
                    // 1. Quiz is inherently locked, OR
                    // 2. User has reached max attempts (2) for this quiz, OR
                    // 3. User has used their daily retry and hasn't maxed out this quiz
                    const hasMaxedAttempts =
                      attempt && attempt.attempt_count >= 2;
                    const hasUsedDailyRetry = globalDailyRetryCount >= 1;
                    const shouldLock =
                      new Date(quiz.expired_at) <= new Date() ||
                      quiz.is_locked ||
                      (attempt && attempt.attempt_count === 2);
                    const progressColor =
                      score === totalQuestions ? "green" : "primary";
                    const date = attempt
                      ? new Date(attempt.completed_at)
                      : null;
                    var takenDate;
                    if (date) {
                      takenDate = date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }

                    const displayGrade = attempt
                      ? (attempt?.pass_count /
                          (attempt?.fail_count + attempt?.pass_count)) *
                          100 +
                        "%"
                      : "N/A";

                    return shouldLock ? (
                      <div
                        key={quiz.quiz_id}
                        className="bg-white rounded-lg p-4 shadow-sm border mb-2 h-[15] flex flex-row align-center border-black w-[90%]"
                      >
                        <span className="text-black self-center flex-1">
                          {quiz.name}
                        </span>
                        <span className="text-black self-center flex-1 text-xs text-center">
                          {displayGrade}
                        </span>
                        <span className="text-black self-center flex-1 text-xs text-center">
                          {date ? takenDate : "N/A"}
                        </span>
                        <div className="flex flex-1  justify-center items-center mx-auto"></div>
                      </div>
                    ) : (
                      <div
                        key={quiz.quiz_id}
                        className="bg-white rounded-lg p-4 shadow-sm border mb-2 h-[15] flex flex-row align-center border-black w-[90%]"
                      >
                        <span className="text-black self-center flex-1">
                          {quiz.name}
                        </span>
                        <span className="text-black self-center flex-1 text-xs text-center">
                          {displayGrade}
                        </span>
                        <span className="text-black self-center flex-1 text-xs text-center">
                          {date ? takenDate : ""}
                        </span>
                        <div className="flex flex-1  justify-center items-center mx-auto">
                          <button
                            className={`px-4 py-2 rounded text-sm text-[#2D7017] border-[#2D7017] border border-solid`}
                            onClick={() => {
                              router.push(`/lesson/${quiz.quiz_id}`);
                            }}
                          >
                            {attempt
                              ? attempt?.attempt_count < 2
                                ? "Try Again"
                                : "Try"
                              : "Do Quiz"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No quizzes available.</p>
                )}
              </div>
              <div className="min-h-80 rounded-xl border-[#113604] border-2 border-solid overflow-hidden flex flex-col items-center justify-start">
                <div className="rounded-lg p-4 mb-4 h-[15] flex flex-row items-center w-[90%] mt-2">
                  <span className="flex-1 text-xl">Medals & Achievements</span>
                  <span
                    className="hover:cursor-pointer text-[#2D7017]"
                    onClick={() => {
                      router.push("/dashboard/quizzes-and-awards?r=awards");
                    }}
                  >
                    See All Awards {">"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col xl:flex-row mt-3 mr-3 w-full items-stretch overflow-y-auto overflow-x-hidden ">
                  {displayAwards.map((d) => (
                    <div
                      key={d.id}
                      className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center flex-1 px-2"
                    >
                      {/* Name */}
                      <div className="min-h-[40px] flex items-center">
                        <span className="bg-[#FEB030] rounded-full px-3 py-1 text-center">
                          {d.name.toUpperCase()}
                        </span>
                      </div>

                      {/* Icon fills the middle row */}
                      <div className="flex items-center justify-center">
                        <AwardDisplay name={d.id} size={90} />
                      </div>

                      {/* Date */}
                      <div className="mt-4 mb-4">
                        <span className="border border-black px-3 rounded-full whitespace-nowrap">
                          {d.dateAwarded.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
