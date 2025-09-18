import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle, X } from "lucide-react";
import React from "react";

interface LessonNavbarProps {
  current?: number;
  total?: number;
  timer?: number;
  timerMax?: number;
  showProgressBar?: boolean;
  onExit?: () => void;
}

export default function LessonNavbar({
  current,
  total,
  timer,
  timerMax,
  showProgressBar = false,
  onExit,
}: LessonNavbarProps) {
  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Progress bar percent
  const percent =
    timer && timerMax
      ? Math.max(0, Math.min(100, (timer / timerMax) * 100))
      : 100;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
        {/* Help button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <Link href="/dashboard">
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Link>
        </Button>

        {/* Progress indicators or timer bar */}
        {showProgressBar ? (
          <div className="flex flex-col items-center w-[100%] max-w-md px-4">
            <div
              className="w-full h-4 rounded-full flex items-center relative border-2 border-black p-2"
              style={{
                background: "#09360c", // dark green outline
              }}
            >
              {/* Progress bar overlay */}
              <div
                className="absolute left-0 top-0 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg, #fff 0%, #22c55e 100%)",
                  zIndex: 1,
                }}
              ></div>
              {/* Dots */}
              <div
                className="absolute left-0 top-0 w-full h-4 flex items-center justify-between px-10"
                style={{ zIndex: 2 }}
              >
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full bg-white shadow"
                  ></span>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-green-900 mt-3 font-semibold">
              Time Remaining: {formatTime(timer ?? 0)}
            </div>
          </div>
        ) : (
          <div className="flex space-x-2">
            {total &&
              Array.from({ length: total }).map((_, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full border-3 flex items-center justify-center text-sm font-bold ${
                    current && index < current - 1
                      ? "bg-green-500 border-green-600 text-white"
                      : current && index === current - 1
                      ? "bg-green-400 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
          </div>
        )}

        {/* Exit button */}
        {onExit ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            onClick={onExit}
          >
            Exit
            <X className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="invisible">
            Exit
            <X className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
