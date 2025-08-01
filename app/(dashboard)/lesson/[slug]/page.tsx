//(dashboard)/lesson/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTodaysGoal } from "@/hooks/useTodaysGoal";
import { useTopicProgress } from "@/hooks/useTopicProgress";
import { useAuth } from "@/lib/context/auth-context";

import {
  CheckCircle,
  X,
  MessageCircle,
  Heart,
  Volume as VolumeUp,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { useLevel } from "@/hooks/useLevel";

export default function LessonPage() {
  const { addXp } = useLevel();
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedPairs, setSelectedPairs] = useState<{ [key: string]: string }>(
    {}
  );
  const [activeWord, setActiveWord] = useState<string | null>(null);

  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [livesLeft, setLivesLeft] = useState(5);
  const [progress, setProgress] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const { startTracking, stopTracking, completeActivity } = useTodaysGoal();
  const [correctCount, setCorrectCount] = useState(0);
  const [startAt, setStartAt] = useState<string>("");
  const { user } = useAuth();
  //later on can be dynamically changed based on lesson
  const topicId = "greetings";
  const weekKey = new Date().toISOString().slice(0, 10);
  const [lessonSteps, setLessonSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [dailyRetryCount, setDailyRetryCount] = useState(0);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/questions/${params.slug}`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setLessonSteps(data.questions || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching questions:", err);
        setLessonSteps([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  useEffect(() => {
    setProgress(Math.round((currentStep / lessonSteps.length) * 100));

    // If we've moved to a word arrangement exercise, initialize the shuffled word array
    if (lessonSteps[currentStep]?.question_type === "word-arrangement") {
      const words = lessonSteps[currentStep]?.options || [];
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);
      setArrangedWords([]);
    }

    // If we've moved to a matching exercise, initialize the selected pairs object
    if (lessonSteps[currentStep]?.question_type === "match-pairs") {
      setSelectedPairs({});
    }
  }, [currentStep, lessonSteps.length]);

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const res = await fetch("/api/users/attempts");
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const data = await res.json();
        const attempts = data.attempts || [];
        const quizId = Number(params.slug);
        const currentQuizAttempt = attempts.find(
          (a: any) => a.quiz_id === quizId
        );
        setAttemptCount(
          currentQuizAttempt ? currentQuizAttempt.attempt_count : 0
        );

        // Check global daily retry count from localStorage (global across all quizzes)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const globalDailyRetryKey = `globalDailyRetry:${user?.email || user?.id}:${today}`;
        const storedGlobalDailyRetries = localStorage.getItem(globalDailyRetryKey);
        setDailyRetryCount(storedGlobalDailyRetries ? parseInt(storedGlobalDailyRetries) : 0);

        // Clean up old per-quiz daily retry keys (migration cleanup)
        const oldDailyRetryKey = `dailyRetry:${user?.email || user?.id}:${quizId}:${today}`;
        if (localStorage.getItem(oldDailyRetryKey)) {
          localStorage.removeItem(oldDailyRetryKey);
        }
      } catch (err) {
        console.error("Error fetching attempts:", err);
        setAttemptCount(0);
        setDailyRetryCount(0);
      }
    }
    fetchAttempts();
  }, [params.slug, user]);

  // Submit failed attempt when all lives are lost
  useEffect(() => {
    const submitFailedAttempt = async () => {
      if (livesLeft <= 0 && !showCompletionScreen && startAt) {
        try {
          const pass_count = correctCount;
          const fail_count = lessonSteps.length - correctCount;
          const end_at = new Date().toISOString();
          const quiz_id = Number(params.slug);
          const payload = {
            quiz_id,
            pass_count,
            fail_count,
            start_at: startAt,
            end_at,
          };
          const res = await fetch("/api/users/submit-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          console.log("Failed quiz submit response:", data);

          // Update attempt count after failed submission
          setAttemptCount((prev) => prev + 1);
        } catch (err) {
          console.error("Error submitting failed quiz:", err);
        }
      }
    };

    submitFailedAttempt();
  }, [
    livesLeft,
    showCompletionScreen,
    startAt,
    correctCount,
    lessonSteps.length,
    params.slug,
  ]);

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleWordSelect = (word: string) => {
    if (isSubmitted) return;

    if (arrangedWords.includes(word)) {
      // Remove the word if it's already selected
      setArrangedWords(arrangedWords.filter((w) => w !== word));
    } else {
      // Add the word
      setArrangedWords([...arrangedWords, word]);
    }
  };

  const handlePairSelect = (type: "word" | "meaning", item: string) => {
    if (isSubmitted) return;

    if (type === "word") {
      // Select or deselect the word
      setActiveWord((prev) => (prev === item ? null : item));
    } else {
      // User clicked on meaning (English)
      if (!activeWord) {
        // If no active word but this meaning is already connected, disconnect it
        const connectedWord = Object.keys(selectedPairs).find(
          (key) => selectedPairs[key] === item
        );
        if (connectedWord) {
          const newPairs = { ...selectedPairs };
          delete newPairs[connectedWord];
          setSelectedPairs(newPairs);
        }
        return;
      }

      // Check if the active word is already connected to something
      if (selectedPairs[activeWord]) {
        // If clicking on the same meaning, disconnect
        if (selectedPairs[activeWord] === item) {
          const newPairs = { ...selectedPairs };
          delete newPairs[activeWord];
          setSelectedPairs(newPairs);
          setActiveWord(null);
          return;
        }
        // If clicking on a different meaning, replace the connection
        const newPairs = { ...selectedPairs };
        newPairs[activeWord] = item;
        setSelectedPairs(newPairs);
        setActiveWord(null);
        return;
      }

      // Check if that meaning is already taken by another word
      const meaningAlreadyUsed = Object.values(selectedPairs).includes(item);
      if (meaningAlreadyUsed) {
        // Find and remove the existing connection
        const existingWord = Object.keys(selectedPairs).find(
          (key) => selectedPairs[key] === item
        );
        if (existingWord) {
          const newPairs = { ...selectedPairs };
          delete newPairs[existingWord];
          // Create new connection
          newPairs[activeWord] = item;
          setSelectedPairs(newPairs);
          setActiveWord(null);
        }
        return;
      }

      // Save the new pair: { Indonesian: English }
      setSelectedPairs({
        ...selectedPairs,
        [activeWord]: item,
      });

      // Clear selected word
      setActiveWord(null);
    }
  };

  const checkAnswer = () => {
    let correct = false;
    const currentQuestion = lessonSteps[currentStep];

    switch (currentQuestion.question_type) {
      case "translation":
      case "multiple-choice":
      case "fill-blank":
        correct = selectedOption === currentQuestion.answer;
        break;

      case "word-arrangement":
        correct = arrangedWords.join(" ") === currentQuestion.answer;
        break;

      case "match-pairs":
        if (currentQuestion.answer) {
          const answerPairs = currentQuestion.answer
            .split(",")
            .map((pair: any) => {
              const [word, meaning] = pair.split(":");
              return { word: word.trim(), meaning: meaning.trim() };
            });
          console.log("✅ Answer Pairs:", answerPairs);
          console.log("🟨 Selected Pairs:", selectedPairs);
          const allPairsMatched = answerPairs.every((pair: any) => {
            return selectedPairs[pair.word] === pair.meaning;
          });
          correct =
            Object.keys(selectedPairs).length === answerPairs.length &&
            allPairsMatched;
        } else {
          correct = false; // or handle as needed
        }
        break;
    }

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      // Add XP for correct answer
      addXp(10);
      setXpEarned((prev) => prev + 10);

      // Show confetti for correct answers
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } else {
      // Reduce lives for incorrect answers
      setLivesLeft((prev) => prev - 1);
    }
  };
  useEffect(() => {
    startTracking();
    setStartAt(new Date().toISOString());
    // Cleanup function to stop tracking if user navigates away
    return () => {
      stopTracking();
    };
  }, []);

  const handleContinue = () => {
    if (currentStep < lessonSteps.length - 1 && livesLeft > 0) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setIsSubmitted(false);
    } else {
      // Show completion screen
      setShowCompletionScreen(true);
    }
  };

  const handleFinish = async () => {
    if (user) {
      const userId = user.email || user.id;
      const key = `topicScore:${userId}:${topicId}:${weekKey}`;
      const prevHigh = Number(localStorage.getItem(key) || 0);

      if (correctCount > prevHigh) {
        localStorage.setItem(key, `${correctCount}`);
      }
    }
    completeActivity();
    // Submit quiz attempt
    try {
      const pass_count = correctCount;
      const fail_count = lessonSteps.length - correctCount;
      const end_at = new Date().toISOString();
      const quiz_id = Number(params.slug);
      const payload = {
        quiz_id,
        pass_count,
        fail_count,
        start_at: startAt,
        end_at,
      };
      const res = await fetch("/api/users/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Quiz submit response:", data);

      // Update attempt count after successful submission
      setAttemptCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
    router.replace("/dashboard");
  };
  const handleExit = () => {
    stopTracking();
    router.push("/dashboard");
  };

  const handleRetry = () => {
    // Increment global daily retry count (max 1 retry per day across ALL quizzes)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const globalDailyRetryKey = `globalDailyRetry:${user?.email || user?.id}:${today}`;
    const newDailyRetryCount = dailyRetryCount + 1;
    localStorage.setItem(globalDailyRetryKey, newDailyRetryCount.toString());
    setDailyRetryCount(newDailyRetryCount);

    // Reset all quiz state
    setCurrentStep(0);
    setSelectedOption(null);
    setSelectedPairs({});
    setActiveWord(null);
    setArrangedWords([]);
    setIsCorrect(null);
    setIsSubmitted(false);
    setLivesLeft(5);
    setProgress(0);
    setXpEarned(0);
    setCorrectCount(0);
    setShowCompletionScreen(false);

    // Start tracking again
    startTracking();
    setStartAt(new Date().toISOString());
  };

  // If all lives are lost
  if (livesLeft <= 0 && !showCompletionScreen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6 text-red-500 dark:text-red-400">
            <AlertCircle size={64} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Out of hearts!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You've run out of hearts. Practice makes perfect! Try again.
            {dailyRetryCount >= 1 && attemptCount < 2 && (
              <span className="block mt-2 text-sm">
                You've used your daily retry for today. Come back tomorrow for another chance!
              </span>
            )}
          </p>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleRetry}
              disabled={attemptCount >= 2 || dailyRetryCount >= 1}
            >
              {attemptCount >= 2 
                ? "Maximum attempts reached" 
                : dailyRetryCount >= 1 
                ? "Daily retry limit reached" 
                : "Retry Quiz"}
            </Button>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Lesson completion screen
  if (showCompletionScreen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6 text-primary">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Lesson Complete!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Great job! You've earned {xpEarned} XP
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xl font-bold">{xpEarned}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                XP Earned
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xl font-bold">{livesLeft}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Hearts Left
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-xl font-bold">{lessonSteps.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Exercises
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleFinish}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }
  if (!lessonSteps.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No questions found for this quiz.
          </p>
        </div>
      </div>
    );
  }

  const currentLesson = lessonSteps[currentStep];

  return (
    <div
      className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 pt-16"
      style={
        currentLesson.image_url
          ? {
              backgroundImage: `url(${currentLesson.image_url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }
          : {}
      }
    >
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={handleExit}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-md mx-4">
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
              <Heart
                size={16}
                className="text-red-500 dark:text-red-400 fill-current"
              />
              <span className="text-sm font-medium">{livesLeft}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-xl font-bold mb-6">{currentLesson.content}</h1>

          {currentLesson.question_type === "translation" && (
            <>
              <div className="flex items-center mb-6">
                <p className="text-lg font-medium mr-2">
                  {currentLesson.content}
                </p>
                <button className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <VolumeUp size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {currentLesson.options?.map((option: any, index: number) => (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-lg border text-left transition-colors ${
                      selectedOption === option
                        ? isSubmitted
                          ? isCorrect
                            ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isSubmitted}
                  >
                    {option}
                    {isSubmitted && selectedOption === option && (
                      <span className="float-right">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {currentLesson.question_type === "multiple-choice" && (
            <>
              <div className="mb-6">
                <p className="text-lg">{currentLesson.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentLesson.options?.map((option: any, index: number) => (
                  <button
                    key={index}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      selectedOption === option
                        ? isSubmitted
                          ? isCorrect
                            ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isSubmitted}
                  >
                    <span className="block font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {currentLesson.question_type === "word-arrangement" && (
            <>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg min-h-20 flex items-center justify-center">
                <div className="flex flex-wrap gap-2">
                  {arrangedWords.length > 0 ? (
                    arrangedWords.map((word: any, idx: number) => (
                      <button
                        key={`arranged-${idx}`}
                        onClick={() => handleWordSelect(word)}
                        className={`px-3 py-2 rounded-lg bg-primary text-white font-medium`}
                        disabled={isSubmitted}
                      >
                        {word}
                      </button>
                    ))
                  ) : (
                    <span className="text-gray-400">
                      Tap words to build the sentence
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {currentLesson.options?.map((word: any, idx: number) => {
                  const isSelected = arrangedWords.includes(word);
                  return (
                    <button
                      key={`word-${idx}`}
                      onClick={() => handleWordSelect(word)}
                      className={`px-3 py-2 rounded-lg border font-medium ${
                        isSelected
                          ? "opacity-40 border-gray-300 dark:border-gray-600"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                      disabled={isSubmitted || isSelected}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {currentLesson.question_type === "match-pairs" && (
            <div className="relative">
              {/* Canvas for drawing connection lines */}
              <canvas
                ref={(canvas) => {
                  if (canvas && Object.keys(selectedPairs).length > 0) {
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      // Clear previous lines
                      ctx.clearRect(0, 0, canvas.width, canvas.height);

                      // Set line style
                      ctx.strokeStyle = "#3b82f6"; // Blue color
                      ctx.lineWidth = 3;
                      ctx.lineCap = "round";

                      // Draw lines for each connection
                      Object.entries(selectedPairs).forEach(
                        ([word, meaning]) => {
                          const wordElement = document.querySelector(
                            `[data-word="${word}"]`
                          );
                          const meaningElement = document.querySelector(
                            `[data-meaning="${meaning}"]`
                          );

                          if (wordElement && meaningElement) {
                            const wordRect =
                              wordElement.getBoundingClientRect();
                            const meaningRect =
                              meaningElement.getBoundingClientRect();
                            const canvasRect = canvas.getBoundingClientRect();

                            const startX = wordRect.right - canvasRect.left;
                            const startY =
                              wordRect.top +
                              wordRect.height / 2 -
                              canvasRect.top;
                            const endX = meaningRect.left - canvasRect.left;
                            const endY =
                              meaningRect.top +
                              meaningRect.height / 2 -
                              canvasRect.top;

                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();

                            // Add small circles at connection points
                            ctx.fillStyle = "#3b82f6";
                            ctx.beginPath();
                            ctx.arc(startX, startY, 4, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.beginPath();
                            ctx.arc(endX, endY, 4, 0, 2 * Math.PI);
                            ctx.fill();
                          }
                        }
                      );
                    }
                  }
                }}
                className="absolute inset-0 pointer-events-none z-10"
                width="800"
                height="400"
              />

              <div className="grid grid-cols-2 gap-8">
                {/* Left column - Words */}
                <div className="space-y-3">
                  {currentLesson.options?.map((pair: any, idx: number) => {
                    const [word, meaning] = pair.split(":");
                    const isSelected =
                      Object.keys(selectedPairs).includes(word);
                    const isActive = activeWord === word;
                    const isMatched = selectedPairs[word];

                    return (
                      <button
                        key={`word-${idx}`}
                        data-word={word}
                        onClick={() => handlePairSelect("word", word)}
                        className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 relative ${
                          isMatched && isSubmitted
                            ? isCorrect
                              ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow-md"
                              : "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600"
                            : isMatched
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-md"
                            : isActive
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 shadow-lg scale-105"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        disabled={isSubmitted}
                      >
                        <div className="flex items-center justify-between">
                          <span>{word}</span>
                          {isMatched && (
                            <div className="flex items-center space-x-2">
                              {isSubmitted && (
                                <span className="text-sm">
                                  {isCorrect ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right column - Meanings */}
                <div className="space-y-3">
                  {currentLesson.options?.map((pair: any, idx: number) => {
                    const [word, meaning] = pair.split(":");
                    const isMatched =
                      Object.values(selectedPairs).includes(meaning);
                    const connectedWord = Object.keys(selectedPairs).find(
                      (key) => selectedPairs[key] === meaning
                    );

                    return (
                      <button
                        key={`meaning-${idx}`}
                        data-meaning={meaning}
                        onClick={() => handlePairSelect("meaning", meaning)}
                        className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 relative ${
                          isMatched && isSubmitted
                            ? isCorrect
                              ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow-md"
                              : "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600"
                            : isMatched
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-md"
                            : activeWord && !isMatched
                            ? "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 dark:hover:border-yellow-600"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        disabled={isSubmitted || (!activeWord && isMatched)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{meaning}</span>
                          {isMatched && (
                            <div className="flex items-center space-x-2">
                              {isSubmitted && (
                                <span className="text-sm">
                                  {isCorrect ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress indicator */}
              {Object.keys(selectedPairs).length > 0 && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {Object.keys(selectedPairs).length} of{" "}
                      {currentLesson.options?.length || 0} pairs matched
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentLesson.question_type === "fill-blank" && (
            <>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-lg text-center">
                  {currentLesson.content
                    ?.split("___")
                    .map((part: any, idx: number, arr: any[]) => (
                      <React.Fragment key={idx}>
                        {part}
                        {idx < arr.length - 1 && (
                          <span
                            className={`px-2 py-1 mx-1 rounded-md inline-block min-w-24 text-center ${
                              selectedOption
                                ? isSubmitted
                                  ? isCorrect
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                  : "bg-primary/10 text-primary"
                                : "bg-gray-200 dark:bg-gray-600"
                            }`}
                          >
                            {selectedOption || "___"}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentLesson.options?.map((option: any, index: number) => (
                  <button
                    key={index}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedOption === option
                        ? isSubmitted
                          ? isCorrect
                            ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isSubmitted}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/70 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto max-w-2xl">
            {!isSubmitted ? (
              <Button
                className="w-full"
                size="lg"
                onClick={checkAnswer}
                disabled={
                  ((currentLesson.question_type === "translation" ||
                    currentLesson.question_type === "multiple-choice" ||
                    currentLesson.question_type === "fill-blank") &&
                    !selectedOption) ||
                  (currentLesson.question_type === "word-arrangement" &&
                    arrangedWords.length !==
                      (currentLesson.options?.length || 0)) ||
                  (currentLesson.question_type === "match-pairs" &&
                    (Object.keys(selectedPairs).length !==
                      (currentLesson.options?.length || 0) ||
                      Object.values(selectedPairs).includes("")))
                }
              >
                Check
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={handleContinue}
                variant={isCorrect ? "default" : "destructive"}
              >
                {isCorrect ? "Continue" : "Got it"}
              </Button>
            )}
          </div>
        </div>

        {isSubmitted && !isCorrect && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6 mb-20">
            <h3 className="text-lg font-medium mb-2">Correct Solution:</h3>
            <p className="text-green-600 dark:text-green-400 font-medium">
              {currentLesson.question_type === "match-pairs"
                ? currentLesson.options
                    ?.map((pair: any) => {
                      const [word, meaning] = pair.split(":");
                      return `${word} → ${meaning}`;
                    })
                    .join(", ")
                : currentLesson.answer}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
