"use client";

import { useState, useEffect } from "react";
import ReviewQuestions from "@/components/ReviewQuestions";
import Link from "next/link";
import QuizAverageChart from "@/components/dashboard/line-graph";
import { ExternalLink } from "lucide-react";
import ScoreHistogram from "@/components/dashboard/bar-graph";

interface QuizStats {
  quiz_id: number;
  quiz_name?: string;
  mean_score: number;
  min_score?: number;
  max_score?: number;
  stddev_score?: number;
  median_score?: number;
  completion?: number;
  scores?: number[];
}

interface TimeStats {
  avg_student_per_month: number;
  total_minutes: number;
}

interface StudentStat {
  user_id: number;
  first_name: string;
  mean_score: number;
  username?: string;
}

interface AnalyticsProps {
  schoolName: string;
  quizStats: QuizStats[] | null;
  totalStudents?: number;
  studentStats: StudentStat[] | null;
  timeStats?: TimeStats | null;
}

interface QuizAverage {
  quiz: string;
  average: number;
}

export default function AnalyticsPage({
  schoolName,
  quizStats,
  totalStudents,
  studentStats,
  timeStats,
}: AnalyticsProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizStats | null>(null);
  const [showClassStandings, setShowClassStandings] = useState(false);

  useEffect(() => {
    if (quizStats && quizStats.length > 0) {
      setSelectedQuiz(quizStats[quizStats.length - 1]);
    }
  }, [quizStats]);

  const getQuizAverages = (): QuizAverage[] => {
    return (
      quizStats?.map((quiz) => ({
        quiz: quiz.quiz_name || `Quiz ${quiz.quiz_id}`,
        average: quiz.mean_score * 100,
      })) || []
    );
  };
  if (!quizStats || quizStats.length === 0) {
    return (
      <p className="mt-4 text-sm text-gray-500">
        No quiz statistics available.
      </p>
    );
  }

  return (
    <div className="font-lato flex flex-col mt-6 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="border-b px-6 py-4 text-center">
        <h3 className="text-lg font-semibold">{schoolName}</h3>
      </div>

      <div className="flex p-8 flex-col mt-6 rounded-sm border bg-white p-0 shadow-sm ">
        <h3 className="text-gray-400 font-semibold text-lg">
          {" "}
          Time Spent on KIRA{" "}
        </h3>
        <div className="mt-4 flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm"> Total </p>
            <p className="text-[#113604]">
              {timeStats?.total_minutes !== undefined
                ? (() => {
                    const totalMinutes = Math.round(timeStats.total_minutes);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    if (hours > 0 && minutes > 0)
                      return `${hours} hours ${minutes} mins`;
                    if (hours > 0) return `${hours} hours`;
                    return `${minutes} mins`;
                  })()
                : "0 mins"}
            </p>{" "}
          </div>
          <div className="flex flex-col gap-2 ">
            <p className="text-sm"> Average per Student per Month </p>
            {timeStats?.avg_student_per_month !== undefined
              ? (() => {
                  const totalMinutes = Math.round(
                    timeStats.avg_student_per_month
                  );
                  const hours = Math.floor(totalMinutes / 60);
                  const minutes = totalMinutes % 60;
                  if (hours > 0 && minutes > 0)
                    return `${hours} hours ${minutes} mins`;
                  if (hours > 0) return `${hours} hours`;
                  return `${minutes} mins`;
                })()
              : "0 mins"}
          </div>
          <div className="flex flex-col gap-2"></div>
        </div>
      </div>

      <div className="flex p-8 flex-col mt-6 rounded-sm border bg-white p-0 shadow-sm ">
        <h3 className="text-gray-400 font-semibold text-lg">Quiz Stats</h3>
        <div className="flex flex-col gap-4 items-center justify-center">
          <select
            id="quizSelect"
            value={selectedQuiz?.quiz_id || ""}
            onChange={(e) => {
              const quiz =
                quizStats.find((q) => q.quiz_id === Number(e.target.value)) ||
                null;
              setSelectedQuiz(quiz);
            }}
            className="w-1/2 border border rounded-[4px] px-3 py-2 text-sm"
          >
            <option value="">Select Quiz</option>
            {quizStats?.map((quiz) => (
              <option key={quiz.quiz_id} value={quiz.quiz_id}>
                {quiz.quiz_name || `Quiz ${quiz.quiz_id}`}
              </option>
            ))}
          </select>
          {selectedQuiz?.scores && (
            <ScoreHistogram scores={selectedQuiz.scores} />
          )}

          {selectedQuiz && (
            <div className="w-full">
              <div className="flex flex-row justify-between items-start w-full p-4 rounded-md bg-white">
                {/* Average */}
                <div className="flex flex-col items-center text-center flex-1">
                  <p className="text-sm text-gray-500">Average</p>
                  <p className="text-lg font-semibold text-green-900 mt-1">
                    {(selectedQuiz.mean_score * 100).toFixed(0)}%
                  </p>
                </div>

                {/* Median */}
                <div className="flex flex-col items-center text-center flex-1">
                  <p className="text-sm text-gray-500">Median</p>
                  <p className="text-lg font-semibold text-green-900 mt-1">
                    {selectedQuiz.median_score !== undefined
                      ? `${(selectedQuiz.median_score * 100).toFixed(0)}%`
                      : "—"}
                  </p>
                </div>

                {/* Min / Max */}
                <div className="flex flex-col items-center text-center flex-1">
                  <p className="text-sm text-gray-500">Min / Max</p>
                  <p className="text-lg font-semibold text-green-900 mt-1">
                    {selectedQuiz.min_score !== undefined &&
                    selectedQuiz.max_score !== undefined
                      ? `${(selectedQuiz.min_score * 100).toFixed(0)}% / ${(
                          selectedQuiz.max_score * 100
                        ).toFixed(0)}%`
                      : "—"}
                  </p>
                </div>

                {/* Standard Deviation */}
                <div className="flex flex-col items-center text-center flex-1">
                  <p className="text-sm text-gray-500">Standard Deviation</p>
                  <p className="text-lg font-semibold text-green-900 mt-1">
                    {selectedQuiz.stddev_score !== undefined
                      ? selectedQuiz.stddev_score.toFixed(2)
                      : "—"}
                  </p>
                </div>

                {/* Completion (fraction) */}
                <div className="flex flex-col items-center text-center flex-1">
                  <p className="text-sm text-gray-500">Completion</p>
                  <p className="text-lg font-semibold text-green-900 mt-1">
                    {selectedQuiz.completion !== undefined &&
                    totalStudents !== undefined
                      ? `${selectedQuiz.completion} / ${totalStudents}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex p-8 flex-col mt-6 gap-8 rounded-sm border bg-white p-0 shadow-sm ">
        <h3 className="text-gray-400 font-semibold opacity-90  text-lg">
          Average Quiz Score Over Time
        </h3>

        <div className="flex flex-row gap-4 items-center justify-evenly ">
          <div className="flex flex-col gap-2 items-center justify-center bg-gray-50 px-12 py-4 gap-4 rounded-sm">
            <div className="text-center text-lg border-b px-6 py-4">
              <p> Latest Quiz Average </p>
            </div>
            <p className="text-lg font-bold">
              {(quizStats[quizStats.length - 1].mean_score * 100).toFixed(0)}%
            </p>
            {(() => {
              const averages = getQuizAverages();
              const len = averages.length;

              if (len < 2) {
                return (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-400 bg-gray-50 text-gray-600 text-sm font-semibold">
                    <span className="text-lg leading-none">–</span>
                    <span>100%</span>
                  </div>
                );
              }

              const last = averages[len - 1].average;
              const prev = averages[len - 2].average;
              const diff = last - prev;

              let colorClasses = "";
              let arrow = "";
              let formattedDiff = diff.toFixed(0);

              if (diff > 0) {
                colorClasses = "border-green-700 bg-green-50 text-green-700";
                arrow = "↑";
                formattedDiff = `+${formattedDiff}`;
              } else if (diff < 0) {
                colorClasses = "border-red-700 bg-red-50 text-red-700";
                arrow = "↓";
              } else {
                colorClasses = "border-gray-400 bg-gray-50 text-gray-600";
                arrow = "–";
              }

              return (
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border ${colorClasses} text-sm font-semibold`}
                >
                  <span className="text-lg leading-none">{arrow}</span>
                  <span>{formattedDiff}%</span>
                </div>
              );
            })()}
          </div>

          <QuizAverageChart quizStats={getQuizAverages()} />
        </div>
      </div>
      <div className="flex p-8 flex-col mt-6 gap-8 rounded-sm border bg-white p-0 shadow-sm ">
        <h3 className="text-gray-400 font-semibold opacity-90  text-lg">
          Student Leaderboard - Average Quiz Score
        </h3>

        <div className="mt-2 text-lg border-b px-6 py-4">
          <p> TOP SCORERS </p>
        </div>

        <div className="flex flex-row items-start justify-evenly w-full mt-6">
          {!studentStats || studentStats.length === 0 ? (
            <p className="text-sm text-gray-500">No stats available</p>
          ) : (
            studentStats.slice(0, 3).map((student, index) => (
              <div
                key={student.user_id}
                className="flex flex-col items-center text-center"
              >
                <p className="text-sm font-medium text-green-700">
                  {index === 0
                    ? "1st Place"
                    : index === 1
                    ? "2nd Place"
                    : index === 2
                    ? "3rd Place"
                    : `${index + 1}th Place`}
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {(student.mean_score * 100).toFixed(0)}%
                </p>
                <p className="text-base text-gray-800 mt-1">
                  {student.first_name}
                </p>
              </div>
            ))
          )}
        </div>

        {studentStats && studentStats.length > 3 && (
          <>
            <div className="mt-8 text-lg border-b px-6 py-4">
              <p>LOW SCORERS</p>
            </div>

            <div className="flex flex-row items-start justify-evenly w-full mt-6">
              {studentStats
                .slice(-3)
                .reverse()
                .map((student, index) => {
                  const actualPosition = studentStats.length - 2 + index;
                  return (
                    <div
                      key={student.user_id}
                      className="flex flex-col items-center text-center"
                    >
                      <p className="text-sm font-medium text-red-600">
                        {actualPosition === studentStats.length
                          ? "Last Place"
                          : `${actualPosition}${
                              actualPosition % 10 === 1 && actualPosition !== 11
                                ? "st"
                                : actualPosition % 10 === 2 &&
                                  actualPosition !== 12
                                ? "nd"
                                : actualPosition % 10 === 3 &&
                                  actualPosition !== 13
                                ? "rd"
                                : "th"
                            } Place`}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {(student.mean_score * 100).toFixed(0)}%
                      </p>
                      <p className="text-base text-gray-800 mt-1">
                        {student.first_name}
                      </p>
                    </div>
                  );
                })}
            </div>
          </>
        )}
        {/* View Class Standings Toggle */}
        {studentStats && studentStats.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowClassStandings(!showClassStandings)}
              className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1"
            >
              View Class Standings
              <span
                className={`transform transition-transform ${
                  showClassStandings ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
          </div>
        )}
        {/* Class Standings Table */}
        {showClassStandings && studentStats && (
          <div className="mt-6">
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-6">
              CLASS STANDINGS
            </h3>

            <div className="flex flex-col items-center w-full">
              <div className="w-[80%] max-w-3xl flex flex-col">
                {/* Header */}
                <div className="grid grid-cols-12 w-11/12 px-8 py-3 text-xs text-gray-500 font-medium">
                  <div className="col-span-2 text-left">Ranking</div>
                  <div className="col-span-7 text-left">Student</div>
                  <div className="col-span-3 text-right pr-20">
                    Quiz Average
                  </div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col w-11/12">
                  {studentStats.map((student, index) => (
                    <div
                      key={student.user_id}
                      className="grid grid-cols-12 items-center w-full bg-white border rounded-xl px-8 py-3 mb-3 hover:shadow-sm transition-all"
                    >
                      {/* Ranking */}
                      <div className="col-span-2 text-left font-semibold text-gray-800">
                        {index + 1}
                      </div>

                      {/* Student (Name + Username inline) */}
                      <div className="col-span-7 text-left text-gray-800 flex items-center gap-2">
                        <span className="font-medium">
                          {student.first_name || "First Last"}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {student.username || "username1234!"}{" "}
                        </span>
                      </div>

                      {/* Quiz Average + Arrow Button */}
                      <div className="col-span-3 flex items-center justify-end gap-20">
                        <span className="font-semibold text-gray-800 text-sm">
                          {(student.mean_score * 100).toFixed(0)}%
                        </span>
                        <button
                          title="View details"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border-transparent hover:border-gray-400 transition"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

//  <div className="mt-6 rounded-2xl border bg-white p-0 shadow-sm">
//         <div className="border-b px-6 py-4">
//           <h3 className="text-lg font-semibold">Existing Content Uploads</h3>
//         </div>

//         <div className="hidden grid-cols-12 gap-4 px-6 py-3 text-sm text-gray-600 md:grid">
//           <div className="col-span-6">Topic Title</div>
//           <div className="col-span-3">Status</div>
//           <button
//             className="col-span-3 flex items-center gap-1 text-left hover:opacity-80"
//             onClick={toggleSort}
//             aria-label="Sort by last updated"
//           ></button>
