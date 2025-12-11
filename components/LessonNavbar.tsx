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
      <div className="flex items-center justify-between p-2 sm:p-4 max-w-6xl mx-auto">
        {/* Help button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-2 sm:px-3 text-xs sm:text-sm"
        >
          <Link href="/dashboard">
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
            <span className="hidden xs:inline">Help</span>
          </Link>
        </Button>

        {/* Progress indicators or timer bar */}
        {showProgressBar ? (
          <div className="flex flex-col items-center w-full max-w-[200px] sm:max-w-md px-2 sm:px-4">
            <div
              className="w-full h-3 sm:h-4 rounded-full flex items-center relative border border-black sm:border-2 p-1 sm:p-2"
              style={{
                background: "#09360c", // dark green outline
              }}
            >
              {/* Progress bar overlay */}
              <div
                className="absolute left-0 top-0 h-3 sm:h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: "linear-gradient(90deg, #fff 0%, #22c55e 100%)",
                  zIndex: 1,
                }}
              ></div>
              {/* Dots */}
              <div
                className="absolute left-0 top-0 w-full h-3 sm:h-4 flex items-center justify-between px-4 sm:px-10"
                style={{ zIndex: 2 }}
              >
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white shadow"
                  ></span>
                ))}
              </div>
            </div>
            <div className="text-[8px] sm:text-[10px] text-green-900 mt-1 sm:mt-3 font-semibold">
              Time: {formatTime(timer ?? 0)}
            </div>
          </div>
        ) : (
          <div className="flex space-x-1 sm:space-x-2">
            {total &&
              Array.from({ length: total }).map((_, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 sm:border-3 flex items-center justify-center text-xs sm:text-sm font-bold ${
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
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-2 sm:px-3 text-xs sm:text-sm"
            onClick={onExit}
          >
            <span className="hidden xs:inline">Exit</span>
            <X className="h-3 w-3 sm:h-4 sm:w-4 xs:ml-1" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="invisible px-2 sm:px-3">
            <span className="hidden xs:inline">Exit</span>
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
