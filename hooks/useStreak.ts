import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";

function areConsecutiveDays(last: string, today: string) {
  const lastDate = new Date(last);
  const todayDate = new Date(today);
  const diff = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff === 1;
}

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      setStreak(0);
      return;
    }

    const userId = user.email || user.id;
    const streakCountKey = `streakCount:${userId}`;
    const streakLastActiveKey = `streakLastActive:${userId}`;

    const today = new Date().toDateString();
    const lastActive = localStorage.getItem(streakLastActiveKey);
    let streakCount = Number(localStorage.getItem(streakCountKey) || 0);

    if (!lastActive) {
      localStorage.setItem(streakLastActiveKey, today);
      localStorage.setItem(streakCountKey, "1");
      setStreak(1);
      return;
    }

    if (lastActive === today) {
      setStreak(streakCount);
      return;
    }

    if (areConsecutiveDays(lastActive, today)) {
      streakCount += 1;
      localStorage.setItem(streakCountKey, String(streakCount));
      setStreak(streakCount);
    } else {
      streakCount = 1;
      localStorage.setItem(streakCountKey, "1");
      setStreak(1);
    }

    localStorage.setItem(streakLastActiveKey, today);
  }, [user]);

  return streak;
}
