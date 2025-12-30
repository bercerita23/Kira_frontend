"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import AwardDisplay, { badgeTypes } from "@/components/dashboard/awards";
import { CircularProgress } from "@/components/ui/circular-progress";

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

type Badges = {
  name: string;
  badge_id: string;
  points_required: number;
  description: string;
  earned_at: string | null;
};

type Achievement = {
  name_en: string;
  description_en: string;
  achievement_id: string;
  points: string;
  completed_at: string | null;
};

export default function QuizzesAndAwards() {
  const searchParams = useSearchParams();
  const route = searchParams.get("r");

  const router = useRouter();
  /**
   * Open medals and achievements if passed, if not then quizzes
   */
  const [displayType, setDisplayType] = useState<"quizzes" | "awards">(
    route === "quizzes" || route === "awards" ? route : "quizzes"
  );

  return (
    <div className="h-screen bg-[#113604] flex flex-col">
      <DashboardHeader />
      <div className="flex-1 min-h-0 pt-6">
        <div className="flex flex-col md:flex-col bg-white rounded-2xl w-[95%] mx-auto h-full overflow-auto items-center">
          <div className="w-[80%] top-0 bg-white z-10 flex items-center justify-between px-4 pt-6 pb-4">
            <span
              className="hover:cursor-pointer text-[#2D7017]"
              onClick={() => {
                router.back();
              }}
            >
              {"< "}Go Back to Home
            </span>

            <div className="flex justify-center flex-1">
              <div className="flex rounded-[4px] p-[2px] overflow-hidden h-10 w-[60%] border bg-[#F1F1F1]">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 text-base font-medium transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 border rounded-[4px]
          ${
            displayType === "quizzes"
              ? "bg-white border-[#E5E7EB] shadow-sm text-black z-10"
              : "bg-transparent border-transparent text-[#2D0B18]"
          }
        `}
                  style={{
                    borderRadius:
                      displayType === "quizzes" ? "8px" : "8px 0 0 8px",
                  }}
                  onClick={() => setDisplayType("quizzes")}
                >
                  Quizzes
                </button>

                <button
                  type="button"
                  className={`flex-1 py-2 px-4 text-base font-medium transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 border rounded-[4px] whitespace-nowrap
          ${
            displayType === "awards"
              ? "bg-white border-[#E5E7EB] shadow-sm text-black z-10"
              : "bg-transparent border-transparent text-[#2D0B18]"
          }
        `}
                  style={{
                    borderRadius:
                      displayType === "awards" ? "8px" : "0 8px 8px 0",
                  }}
                  onClick={() => setDisplayType("awards")}
                >
                  Medals & Achievements
                </button>
              </div>
            </div>
            <div className="w-32" />
          </div>
          <Quizzes router={router} onDisplay={displayType === "quizzes"} />
          <Awards router={router} onDisplay={displayType === "awards"} />
        </div>
      </div>
    </div>
  );
}

interface ChildProps {
  router: AppRouterInstance;
  onDisplay: boolean;
}
const Quizzes = ({ router, onDisplay }: ChildProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  var globalDailyRetryCount = 0;

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
        // eslint-disable-next-line no-console
        console.log("User quizzes:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching quizzes or questions:", err);
      }
    }

    fetchQuizzes();
  }, [attempts]);

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
    async function fetchAllAttempts() {
      try {
        setAllAttempts([]);
      } catch (error) {}
    }
    fetchAttempts();
    fetchAllAttempts();
  }, []);

  return (
    <div
      className={`flex flex-col items-center text-center w-[80%] py-6 self-center rounded-xl border-solid border-2 shadow-sm mt-8 ${
        onDisplay ? "" : "hidden"
      }`}
    >
      <span className="text-3xl mb-8">All Quizzes</span>
      {quizzes && quizzes.length > 0 ? (
        quizzes.map((quiz) => {
          const attempt = attempts.find((a) => a.quiz_id === quiz.quiz_id);
          const totalQuestions = quiz.questions?.length || 10; // Use actual quiz length instead of hardcoded 5
          const score = attempt ? attempt.pass_count : 0;
          // Lock quiz if:
          // 1. Quiz is inherently locked, OR
          // 2. User has reached max attempts (2) for this quiz, OR
          // 3. User has used their daily retry and hasn't maxed out this quiz
          const hasMaxedAttempts = attempt && attempt.attempt_count >= 2;
          const hasUsedDailyRetry = globalDailyRetryCount >= 1;
          const shouldLock =
            new Date(quiz.expired_at) <= new Date() ||
            quiz.is_locked ||
            (attempt && attempt.attempt_count === 2);
          hasMaxedAttempts || (hasUsedDailyRetry && !hasMaxedAttempts);
          const progressColor = score === totalQuestions ? "green" : "primary";
          const date = attempt ? new Date(attempt.completed_at) : null;
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

          const expiredDate = toDateSafe(quiz.expired_at);
          const hideButton =
            (attempt && attempt.attempt_count < 2) || expiredDate! < new Date();
          return shouldLock ? (
            <div
              key={quiz.quiz_id}
              className="bg-white rounded-lg p-4 shadow-sm border opacity-60 mb-2 h-16 flex flex-row align-center border-black w-[90%]"
            >
              <span className="text-black self-center flex-1">{quiz.name}</span>
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
              className="bg-white rounded-lg p-4 shadow-sm border opacity-60 cursor-not-allowed mb-2 h-16 flex flex-row align-center border-black w-[90%]"
            >
              <span className="text-black self-center flex-1">{quiz.name}</span>
              <span className="text-black self-center flex-1 text-xs text-center">
                {displayGrade}
              </span>
              <span className="text-black self-center flex-1 text-xs text-center">
                {date ? takenDate : "N/A"}
              </span>
              <div className="flex flex-1  justify-center items-center mx-auto">
                <button
                  className={`px-4 py-2 rounded text-sm text-[#2D7017] border-[#2D7017] border border-solid  ${hideButton} ? "hidden" : ""`}
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
  );
};

const Awards = ({ router, onDisplay }: ChildProps) => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userBadges, setUserBadges] = useState<Badges[]>([]);
  const [allBadges, setAllBadges] = useState<Badges[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getPoints() {
      try {
        const res = await fetch("/api/users/points");
        if (!res.ok) throw new Error("Failed to fetch points");
        const data = await res.json();
        setUserPoints(data.points);
        // Log points to the console
        // eslint-disable-next-line no-console
        //console.log("User points: ", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        //console.error("Error fetching points:", err);
      }
    }
    async function getAllBadges() {
      try {
        const res = await fetch("/api/users/badges/all");
        const userBadgesRes = await fetch("/api/users/badges");
        if (!res.ok || !userBadgesRes)
          throw new Error("Failed to fetch badges");

        const data = await res.json();
        const userBadges = await userBadgesRes.json();

        setAllBadges(data.badges);

        // Log points to the console
        // eslint-disable-next-line no-console
        //console.log("User badges:", data);
      } catch (err) {
        // eslint-disable-next-line no-console
        //console.error("Error fetching points:", err);
      }
    }

    async function getAllAchievements() {
      try {
        const res = await fetch("/api/users/achievements/all");
        if (!res.ok) throw new Error("Failed to fetch achievements");
        const data = await res.json();
        //console.log(data.user_achievements);

        //console.log(data);
        setAllAchievements(data.achievements);
      } catch (error) {
        //console.error(error);
      }
    }

    async function getUserBadges() {
      try {
        const res = await fetch("/api/users/badges");
        if (!res.ok) throw new Error("Failed to fetch achievements");
        const data = await res.json();
        setUserBadges(data.badges);
      } catch (error) {
        //console.error(error);
      }
    }

    async function getUserAchievements() {
      try {
        const res = await fetch("/api/users/achievements");
        if (!res.ok) throw new Error("Failed to fetch achievements");
        const data = await res.json();
        //console.log("user achievements", data);
        setUserAchievements(data.user_achievements);
      } catch (error) {
        //console.error(error);
      }
    }

    setIsLoading(true);
    getPoints();
    getAllBadges();
    getAllAchievements();
    getUserAchievements();
    getUserBadges();
    setIsLoading(false);
  }, []);

  function toDateSafe(s: string | undefined): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }

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

  return (
    <div
      className={`flex flex-col items-center text-center w-[80%] py-6 self-center rounded-xl border-solid border-2 shadow-sm mt-8 ${
        onDisplay ? "" : "hidden"
      }`}
    >
      <span>Medals & Achievements</span>
      <div className="bg-[#E7F7E2] mr-8 mt-6 mb-6 ml-8 rounded-xl flex flex-row overflow-hidden border-[#AFD8A1] border-2 border-solid w-[90%]">
        <div className="flex-1 flex space-x-2 h-max flex-row items-center object-center pb-4 px-4 pt-4 gap-x-6">
          <span className="flex-row flex justify-center items-center">
            <div className="flex-row flex items-center text-xl">
              <img
                src="/assets/dashboard/points_icon.png"
                className="w-8 max-h-8"
              />
              {userPoints ?? 0}
            </div>
          </span>

          <div className="flex-1 self-center mx-auto mt-3">
            <PointsBar
              points={userPoints ?? 0}
              pointsMax={355}
              badges={allBadges}
            />
          </div>
        </div>
      </div>
      <div className="mx-8 my-6  rounded-xl flex flex-col w-[90%] gap-y-4">
        <span className="self-start text-2xl font-semibold">Medals</span>
        {allBadges.map((badge) => {
          const pct = Math.min(
            100,
            Math.round(((userPoints ?? 0) / badge.points_required) * 100)
          );
          const reached = (userPoints ?? 0) >= badge.points_required;
          const acquired = userBadges.find(
            (b) => b.badge_id === badge.badge_id
          );

          var takenDate = "-";
          if (acquired && acquired.earned_at) {
            const date = toDateSafe(acquired.earned_at);
            takenDate = date!.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }
          return (
            <div
              key={badge.badge_id}
              className="flex flex-row border-black border-solid border w-full rounded-xl pt-3 pb-3 text-center align-center"
            >
              <CircularProgress
                value={pct}
                size={48}
                strokeWidth={6}
                color={"green"}
                className="mr-3 ml-3"
              >
                <AwardDisplay
                  name={badge.badge_id as unknown as badgeTypes}
                  size={24}
                  disabled={!reached}
                />
              </CircularProgress>
              <span className="self-center flex-1">{badge.name}</span>
              <span className="self-center flex-1">{badge.description}</span>
              <span className="self-center flex-1">{takenDate}</span>
            </div>
          );
        })}
      </div>
      <div className="mr-8 mt-6 mb-6 ml-8 rounded-xl flex flex-col w-[90%] gap-y-4">
        <span className="self-start text-2xl font-semibold">Achievements</span>
        {allAchievements.map((Achievement) => {
          const acquired = userAchievements.find(
            (b) => b.achievement_id === Achievement.achievement_id
          );

          var takenDate = "-";
          if (acquired && acquired.completed_at) {
            const date = toDateSafe(acquired.completed_at);
            takenDate = date!.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }

          return (
            <div
              key={Achievement.achievement_id}
              className="flex flex-row border-black border-solid border w-full rounded-xl pt-3 pb-3 text-center align-center"
            >
              <AwardDisplay
                name={Achievement.achievement_id as unknown as badgeTypes}
                size={40}
                className={`ml-6`}
                disabled={acquired == null}
              />
              <span className="self-center flex-1">{Achievement.name_en}</span>
              <span className="self-center flex-1">
                {Achievement.description_en}
              </span>
              <span className="self-center flex-1">{takenDate}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface PointsBarProps {
  points: number;
  pointsMax: number;
  className?: string;
  badges: Badges[];
}

const PointsBar = ({ points, pointsMax, badges }: PointsBarProps) => {
  const clampPct = (n: number) => Math.max(0, Math.min(100, n));
  const percent = pointsMax ? clampPct((points / pointsMax) * 100) : 0;

  const DOT_HALF_REM = 0.375;
  const AWARD_SIZE_PX = 40;
  const HALF = AWARD_SIZE_PX / 2;
  return (
    <div>
      {/* BAR */}
      <div className="w-full h-8 bg-[#113604] rounded-full relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#E7F7E2] to-[#5CA145] rounded-full"
          style={{ width: `${percent}%` }}
        />
        {badges.map((b, i) => {
          const badgeDistance =
            b.points_required && pointsMax
              ? clampPct((b.points_required / pointsMax) * 100)
              : 0;

          return (
            <div
              key={`dot-${i}`}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full z-10"
              style={{
                left: `clamp(${DOT_HALF_REM}rem, ${badgeDistance}%, calc(100% - ${DOT_HALF_REM}rem))`,
              }}
            />
          );
        })}
      </div>

      {/* LABEL RAIL (positions awards under the dots) */}
      <div className="relative mt-3 h-6">
        {badges.map((b, i) => {
          const badgeDistance =
            b.points_required && pointsMax
              ? Math.max(
                  0,
                  Math.min(100, (b.points_required / pointsMax) * 100)
                )
              : 0;

          return (
            <div
              key={`award-${i}`}
              className="absolute -translate-x-1/2"
              style={{
                // Explicit wrapper size prevents collapsing/squeezing
                width: `${AWARD_SIZE_PX}px`,
                height: `${AWARD_SIZE_PX}px`,
                // Keep the CENTER inside the rail bounds
                left: `clamp(${HALF}px, ${badgeDistance}%, calc(100% - ${HALF}px))`,
                top: 0,
              }}
            >
              {/* Make the icon fill its wrapper */}
              <div className="w-full h-full">
                <AwardDisplay
                  name={b.badge_id as unknown as badgeTypes}
                  size={AWARD_SIZE_PX}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
