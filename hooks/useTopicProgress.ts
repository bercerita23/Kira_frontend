import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";

interface TopicProgress {
  [topicId: string]: {
    completed: number;
    total: number;
  };
}

// topics and their total activities
const TOPIC_CONFIG = {
  greetings: { total: 5, name: "Greetings" },
  "basic-phrases": { total: 5, name: "Basic Phrases" },
  family: { total: 4, name: "Family" },
  // add more topics as needed
};

export function useTopicProgress() {
  const { user } = useAuth();
  const [topicProgress, setTopicProgress] = useState<TopicProgress>({});

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      setTopicProgress({});
      return;
    }

    const userId = user.email || user.id;
    const progressKey = `topicProgress:${userId}`;
    const stored = localStorage.getItem(progressKey);

    if (stored) {
      try {
        setTopicProgress(JSON.parse(stored));
      } catch {
        setTopicProgress({});
      }
    } else {
      const initialProgress: TopicProgress = {};
      Object.keys(TOPIC_CONFIG).forEach((topicId) => {
        initialProgress[topicId] = {
          completed: 0,
          total: TOPIC_CONFIG[topicId as keyof typeof TOPIC_CONFIG].total,
        };
      });
      setTopicProgress(initialProgress);
    }
  }, [user]);

  const completeActivity = (topicId: string) => {
    if (!user || typeof window === "undefined") return;

    const config = TOPIC_CONFIG[topicId as keyof typeof TOPIC_CONFIG];
    if (!config) return;

    setTopicProgress((prev) => {
      const current = prev[topicId] || { completed: 0, total: config.total };
      const newCompleted = Math.min(current.completed + 1, config.total);

      const updated = {
        ...prev,
        [topicId]: {
          ...current,
          completed: newCompleted,
        },
      };

      const userId = user.email || user.id;
      const progressKey = `topicProgress:${userId}`;
      localStorage.setItem(progressKey, JSON.stringify(updated));

      return updated;
    });
  };

  const getTopicProgress = (topicId: string) => {
    const config = TOPIC_CONFIG[topicId as keyof typeof TOPIC_CONFIG];
    if (!config) return { completed: 0, total: 0, percentage: 0 };

    const progress = topicProgress[topicId] || {
      completed: 0,
      total: config.total,
    };
    const percentage =
      progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

    return {
      ...progress,
      percentage,
    };
  };

  const isTopicCompleted = (topicId: string) => {
    const progress = getTopicProgress(topicId);
    return progress.completed >= progress.total;
  };

  const isTopicUnlocked = (topicId: string) => {
    const topicIds = Object.keys(TOPIC_CONFIG);
    const currentIndex = topicIds.indexOf(topicId);
    if (currentIndex === 0) return true;

    const previousTopicId = topicIds[currentIndex - 1];
    return isTopicCompleted(previousTopicId);
  };

  return {
    topicProgress,
    completeActivity,
    getTopicProgress,
    isTopicCompleted,
    isTopicUnlocked,
    TOPIC_CONFIG,
  };
}
