"use client";

import { useState, useEffect } from "react";
import ReviewQuestions from "@/components/ReviewQuestions";
import Link from "next/link";

interface AnalyticsProps {
  schoolName: string;
}

export default function AnalyticsPage({ schoolName }: AnalyticsProps) {
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
