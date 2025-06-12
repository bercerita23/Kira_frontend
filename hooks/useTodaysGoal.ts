import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";

// today's date as YYYY-MM-DD
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useTodaysGoal(goalMinutes = 20) {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      setMinutes(0);
      return;
    }
    const userId = user.email || user.id;
    const todayKey = getTodayKey();
    const storageKey = `goalMinutes:${userId}:${todayKey}`;
    const stored = Number(localStorage.getItem(storageKey) || 0);
    setMinutes(stored);
  }, [user]);

  const startTracking = () => {
    if (!user || sessionStart || typeof window === "undefined") return;
    setSessionStart(Date.now());
  };

  const stopTracking = () => {
    if (!user || !sessionStart || typeof window === "undefined") return;
    setSessionStart(null);
  };

  const completeActivity = () => {
    if (!user || !sessionStart || typeof window === "undefined") return;

    const sessionEnd = Date.now();
    const elapsedMs = sessionEnd - sessionStart;
    const elapsedMinutes = Math.round(elapsedMs / (1000 * 60));

    if (elapsedMinutes > 0) {
      const userId = user.email || user.id;
      const todayKey = getTodayKey();
      const storageKey = `goalMinutes:${userId}:${todayKey}`;
      const current = Number(localStorage.getItem(storageKey) || 0);
      const updated = current + elapsedMinutes;
      localStorage.setItem(storageKey, String(updated));
      setMinutes(updated);
    }

    setSessionStart(null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      if (!user) return;
      const userId = user.email || user.id;
      const todayKey = getTodayKey();
      const storageKey = `goalMinutes:${userId}:${todayKey}`;
      const stored = Number(localStorage.getItem(storageKey) || 0);
      setMinutes(stored);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const percent = Math.min(100, Math.round((minutes / goalMinutes) * 100));

  return {
    minutes: minutes ?? 0,
    goalMinutes: goalMinutes ?? 1,
    percent: isNaN(percent) || !isFinite(percent) ? 0 : percent,
    startTracking,
    stopTracking,
    completeActivity,
  };
}
