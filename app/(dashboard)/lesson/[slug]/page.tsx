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

    const currentQuestion = lessonSteps[currentStep];

    if (type === "word") {
      // If this word is already matched, unselect it
      const existingPair = Object.entries(selectedPairs).find(
        ([_, v]) => v === item
      );
      if (existingPair) {
        const updatedPairs = { ...selectedPairs };
        delete updatedPairs[existingPair[0]];
        setSelectedPairs(updatedPairs);
        return;
      }

      // If user has already selected a meaning, create a pair
      const selectedMeaning = Object.keys(selectedPairs).find(
        (key) => !selectedPairs[key]
      );
      if (selectedMeaning) {
        setSelectedPairs({
          ...selectedPairs,
          [selectedMeaning]: item,
        });
      }
    } else {
      // If this meaning is already in a pair, remove the pair
      if (selectedPairs[item]) {
        const updatedPairs = { ...selectedPairs };
        delete updatedPairs[item];
        setSelectedPairs(updatedPairs);
        return;
      }

      // Add the meaning as a key with no value yet
      if (!Object.keys(selectedPairs).includes(item)) {
        setSelectedPairs({
          ...selectedPairs,
          [item]: "",
        });
      }
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
              return { word, meaning };
            });
          const allPairsMatched = answerPairs.every((pair: any) => {
            const selectedMeaning = Object.keys(selectedPairs).find(
              (key) => selectedPairs[key] === pair.word
            );
            return selectedMeaning === pair.meaning;
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
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
    router.replace("/dashboard");
  };
  const handleExit = () => {
    stopTracking();
    router.push("/dashboard");
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
          </p>
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {currentLesson.options?.map((pair: any, idx: number) => {
                  const [word, meaning] = pair.split(":");
                  const isSelected =
                    Object.values(selectedPairs).includes(word);
                  return (
                    <button
                      key={`word-${idx}`}
                      onClick={() => handlePairSelect("word", word)}
                      className={`w-full p-3 rounded-lg border text-left font-medium ${
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      disabled={isSubmitted}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {currentLesson.options?.map((pair: any, idx: number) => {
                  const [word, meaning] = pair.split(":");
                  const isPaired =
                    pair.split(":").length === 2 &&
                    pair.split(":")[1] in selectedPairs;
                  const isComplete = selectedPairs[pair.split(":")[1]] !== "";
                  return (
                    <button
                      key={`meaning-${idx}`}
                      onClick={() =>
                        handlePairSelect("meaning", pair.split(":")[1])
                      }
                      className={`w-full p-3 rounded-lg border text-left font-medium ${
                        isPaired
                          ? isComplete
                            ? "bg-primary/10 border-primary"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      disabled={isSubmitted}
                    >
                      {meaning}
                    </button>
                  );
                })}
              </div>
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
