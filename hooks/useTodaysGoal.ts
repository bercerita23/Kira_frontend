import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/auth-context";

// Helper to get today's date as YYYY-MM-DD
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function useTodaysGoal(goalMinutes = 20) {
  const { user } = useAuth();
  const [minutes, setMinutes] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(
    null
  );
  const activeCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef<number>(Date.now());

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

  // Track user activity (mouse, keyboard, scroll)
  const updateActivity = () => {
    lastActivityTime.current = Date.now();
  };

  // Start tracking time for an activity
  const startTracking = () => {
    if (!user || isTracking) return;

    setIsTracking(true);
    setCurrentSessionStart(Date.now());
    lastActivityTime.current = Date.now();

    // Add event listeners for user activity
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    // Check every 10 seconds if user is still active
    activeCheckInterval.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime.current;
      const inactiveThreshold = 30000; // 30 seconds of inactivity

      if (timeSinceLastActivity > inactiveThreshold) {
        // User has been inactive, pause tracking
        pauseTracking();
      }
    }, 10000);
  };

  // Pause tracking (user inactive)
  const pauseTracking = () => {
    if (activeCheckInterval.current) {
      clearInterval(activeCheckInterval.current);
      activeCheckInterval.current = null;
    }
    setIsTracking(false);
  };

  // Stop tracking and save the elapsed time
  const stopTracking = () => {
    if (!user || !isTracking || !currentSessionStart) return;

    const sessionEnd = Date.now();
    const elapsedMs = sessionEnd - currentSessionStart;
    const elapsedMinutes = Math.round(elapsedMs / (1000 * 60)); // Convert to minutes

    // Only count if session was at least 10 seconds
    if (elapsedMs >= 10000) {
      addActualMinutes(elapsedMinutes);
    }

    // Cleanup
    setIsTracking(false);
    setCurrentSessionStart(null);

    if (activeCheckInterval.current) {
      clearInterval(activeCheckInterval.current);
      activeCheckInterval.current = null;
    }

    // Remove event listeners
    window.removeEventListener("mousemove", updateActivity);
    window.removeEventListener("keydown", updateActivity);
    window.removeEventListener("click", updateActivity);
    window.removeEventListener("scroll", updateActivity);
  };

  // Add actual measured minutes to today's goal
  const addActualMinutes = (mins: number) => {
    if (!user || mins <= 0) return;

    const userId = user.email || user.id;
    const todayKey = getTodayKey();
    const storageKey = `goalMinutes:${userId}:${todayKey}`;
    const current = Number(localStorage.getItem(storageKey) || 0);
    const updated = current + mins;
    localStorage.setItem(storageKey, String(updated));
    setMinutes(updated);
  };

  // Keep the original addMinutes for manual additions if needed
  const addMinutes = (mins: number) => {
    addActualMinutes(mins);
  };

  // Get current session time in minutes (for live display)
  const getCurrentSessionMinutes = () => {
    if (!isTracking || !currentSessionStart) return 0;
    const elapsed = Date.now() - currentSessionStart;
    return Math.floor(elapsed / (1000 * 60));
  };

  const percent = Math.min(100, Math.round((minutes / goalMinutes) * 100));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeCheckInterval.current) {
        clearInterval(activeCheckInterval.current);
      }
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  return {
    minutes,
    goalMinutes,
    percent,
    addMinutes,
    startTracking,
    stopTracking,
    isTracking,
    getCurrentSessionMinutes,
  };
}
