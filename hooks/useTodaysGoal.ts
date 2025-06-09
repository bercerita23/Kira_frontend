import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";

// Helper to get today's date as YYYY-MM-DD
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useTodaysGoal(goalMinutes = 20) {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  // Load today's minutes on mount or when user changes
  useEffect(() => {
    if (!user) {
      setMinutes(0);
      return;
    }
    const userId = user.email || user.id;
    const todayKey = getTodayKey();
    const storageKey = `goalMinutes:${userId}:${todayKey}`;
    const stored = Number(localStorage.getItem(storageKey) || 0);
    setMinutes(stored);
  }, [user]);

  // Start tracking when activity starts
  const startTracking = () => {
    if (!user || sessionStart) return;
    setSessionStart(Date.now());
  };

  // Stop tracking WITHOUT saving (for early exits)
  const stopTracking = () => {
    if (!user || !sessionStart) return;
    setSessionStart(null); // Just reset, don't save time
  };

  // Complete activity and save elapsed time (only call this on successful completion)
  const completeActivity = () => {
    if (!user || !sessionStart) return;

    const sessionEnd = Date.now();
    const elapsedMs = sessionEnd - sessionStart;
    const elapsedMinutes = Math.round(elapsedMs / (1000 * 60)); // No minimum time

    // Only save if there was actual time spent (at least 1 minute)
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

  // Daily reset at midnight
  useEffect(() => {
    const interval = setInterval(() => {
      if (!user) return;
      const userId = user.email || user.id;
      const todayKey = getTodayKey();
      const storageKey = `goalMinutes:${userId}:${todayKey}`;
      const stored = Number(localStorage.getItem(storageKey) || 0);
      setMinutes(stored);
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [user]);

  const percent = Math.min(100, Math.round((minutes / goalMinutes) * 100));

  return {
    minutes,
    goalMinutes,
    percent,
    startTracking,
    stopTracking,
    completeActivity, // New function for successful completion
  };
}
