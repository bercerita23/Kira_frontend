import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";

interface LevelData {
  level: number;
  xp: number;
  xpForNextLevel: number;
  progressPercentage: number;
}

export function useLevel() {
  const { user } = useAuth();
  const [levelData, setLevelData] = useState<LevelData>({
    level: 1,
    xp: 0,
    xpForNextLevel: 100,
    progressPercentage: 0,
  });

  const getXpForLevel = (level: number): number => {
    return level * 100;
  };

  const calculateLevelFromXp = (totalXp: number) => {
    let level = 1;
    let xpUsed = 0;

    while (xpUsed + getXpForLevel(level) <= totalXp) {
      xpUsed += getXpForLevel(level);
      level++;
    }

    const currentLevelXp = totalXp - xpUsed;
    const xpForNextLevel = getXpForLevel(level);
    const progressPercentage = Math.round(
      (currentLevelXp / xpForNextLevel) * 100
    );

    return {
      level,
      xp: currentLevelXp,
      xpForNextLevel,
      progressPercentage,
    };
  };

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      setLevelData({
        level: 1,
        xp: 0,
        xpForNextLevel: 100,
        progressPercentage: 0,
      });
      return;
    }

    const userId = user.email || user.id;
    const totalXpKey = `totalXp:${userId}`;
    const totalXp = Number(localStorage.getItem(totalXpKey) || 0);

    const newLevelData = calculateLevelFromXp(totalXp);
    setLevelData(newLevelData);
  }, [user]);

  const addXp = (xpGained: number) => {
    if (!user || typeof window === "undefined") return false;

    const userId = user.email || user.id;
    const totalXpKey = `totalXp:${userId}`;
    const currentTotalXp = Number(localStorage.getItem(totalXpKey) || 0);
    const newTotalXp = currentTotalXp + xpGained;

    const oldLevel = levelData.level;
    const newLevelData = calculateLevelFromXp(newTotalXp);

    localStorage.setItem(totalXpKey, String(newTotalXp));
    setLevelData(newLevelData);

    return newLevelData.level > oldLevel;
  };

  const updateLevel = (newLevel: number) => {
    if (!user || typeof window === "undefined") return;

    const userId = user.email || user.id;
    const levelKey = `level:${userId}`;
    localStorage.setItem(levelKey, String(newLevel));
    setLevelData((prev) => ({ ...prev, level: newLevel }));
  };

  return {
    level: levelData.level,
    xp: levelData.xp,
    xpForNextLevel: levelData.xpForNextLevel,
    progressPercentage: levelData.progressPercentage,
    addXp,
    updateLevel,
  };
}
