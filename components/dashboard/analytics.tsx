"use client";

import { useState, useEffect } from "react";
import ReviewQuestions from "@/components/ReviewQuestions";
import Link from "next/link";

interface QuizStats {
  quiz_id: number;
  quiz_name?: string;
  mean_score: number;
  min_score?: number;
  max_score?: number;
  stddev_score?: number;
  median_score?: number;
  completion?: number;
}

interface AnalyticsProps {
  schoolName: string;
  quizStats: QuizStats[] | null;
  totalStudents?: number;
}

export default function AnalyticsPage({
  schoolName,
  quizStats,
  totalStudents,
}: AnalyticsProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizStats | null>(null);

  if (!quizStats || quizStats.length === 0) {
    return (
      <p className="mt-4 text-sm text-gray-500">
        No quiz statistics available.
      </p>
    );
  }

  return (
    <div className="flex flex-col mt-6 rounded-2xl border bg-white p-5 shadow-sm">
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
            <p className="text-[#113604]"> 20 hours 25 minutes</p>
          </div>
          <div className="flex flex-col gap-2 ">
            <p className="text-sm"> Average per Student per Month </p>
            <p className="text-[#113604]"> 4 hours 5 minutes </p>
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
            {quizStats.map((quiz) => (
              <option key={quiz.quiz_id} value={quiz.quiz_id}>
                {quiz.quiz_name || `Quiz ${quiz.quiz_id}`}
              </option>
            ))}
          </select>

          {selectedQuiz && (
            <div className="mt-6 w-full">
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

          {/* {quizStats && quizStats.length > 0 ? (
          quizStats.map((stat) => (
            <div
              key={stat.quiz_id}
              className="mt-4 flex flex-row justify-between"
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm"> Quiz ID: {stat.quiz_id} </p>
                <p className="text-sm">
                  {" "}
                  Mean Score: {stat.mean_score.toFixed(2)}{" "}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            No quiz statistics available.
          </p> */}
          {/* )} */}
        </div>
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
