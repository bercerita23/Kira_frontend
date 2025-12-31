//(dashboard)/lesson/[slug]/page.tsx
"use client";
import { getS3BlobUrl, toS3Key } from "@/lib/s3-client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DashboardHeader,
  MobileMenuContext,
} from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, X, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Mic, Send, ArrowRight } from "lucide-react";
import KiraGpt from "@/components/Kira-gpt";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import LessonNavbar from "@/components/LessonNavbar"; // Add this import
import { distance } from "fastest-levenshtein";

type Question = {
  question_id: number;
  content: string;
  options: string[];
  question_type: "MCQ" | "FITB" | "SA" | "TRANS";
  points: number;
  answer: string;
  image_url?: string;
  cloud_front_url?: string;
};

type Quiz = {
  quiz_id: number;
  name: string;
  description: string;
  questions: Question[];
};

type Attempt = {
  attempt_id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  max_score: number;
  created_at: string;
  attempt_count: number;
};

function isTypoTolerantMatch(input: string, correct: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^A-Za-z\s]/g, "")
      .trim()
      .replace(/\s+/g, " ");

  const a = normalize(input);
  const b = normalize(correct);

  const compactA = a.replace(/\s+/g, "");
  const compactB = b.replace(/\s+/g, "");
  const overallDist = distance(compactA, compactB);

  if (overallDist <= 2 && correct.length >= 4) return true;

  const wordsA = a.split(" ");
  const wordsB = b.split(" ");

  let matches = 0;
  let comparisons = Math.max(wordsA.length, wordsB.length);

  for (const wordA of wordsA) {
    let bestDistance = Infinity;
    for (const wordB of wordsB) {
      const d = distance(wordA, wordB);
      bestDistance = Math.min(bestDistance, d);
    }

    const allowedTypos = wordA.length <= 4 ? 0 : wordA.length <= 8 ? 1 : 2;
    if (bestDistance <= allowedTypos) matches++;
  }

  const ratio = matches / comparisons;
  //console.log(ratio);

  return ratio >= 0.8;
}

export default function LessonPage() {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const quizId = params.slug as string;
  const [imgBlobUrl, setImgBlobUrl] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  // Add state for chat timer (sync with KiraGpt timer duration)
  const CHAT_SESSION_LIMIT_MINUTES = 5;
  const [chatTimer, setChatTimer] = useState(CHAT_SESSION_LIMIT_MINUTES * 60);

  // Preload next question's image (cloudfront or fallback)
  useEffect(() => {
    if (!quiz || !quiz.questions) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quiz.questions.length) {
      const nextQ = quiz.questions[nextIndex];
      const nextImageUrl = nextQ.cloud_front_url || nextQ.image_url;
      if (nextImageUrl) {
        const img = new window.Image();
        img.src = nextImageUrl;
      }
    }
  }, [quiz, currentQuestionIndex]);

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/users/questions/${quizId}`);
        if (!res.ok) throw new Error("Failed to fetch quiz");

        const data = await res.json();
        console.log("Quiz data:", data);

        if (data.questions && data.questions.length > 0) {
          setQuiz({
            quiz_id: parseInt(quizId),
            name: `Quiz ${quizId}`,
            description: "Complete this quiz to test your knowledge",
            questions: data.questions,
          });
          setUserAnswers(new Array(data.questions.length).fill(""));
          setQuizStartTime(new Date()); // Set start time when quiz loads
        } else {
          setError("No questions found for this quiz");
        }
      } catch (err) {
        // console.error("Error fetching quiz:", err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const res = await fetch("/api/users/attempts");
        if (!res.ok) throw new Error("Failed to fetch attempts");
        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        // console.error("Error fetching attempts:", err);
      }
    }
    fetchAttempts();
  }, []);

  const currentAttempt = attempts.find((a) => a.quiz_id === parseInt(quizId));
  const attemptCount = currentAttempt ? currentAttempt.attempt_count : 0;

  // When chatbot is shown, start the timer countdown
  useEffect(() => {
    if (!showChatbot) return;
    const interval = setInterval(() => {
      setChatTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showChatbot]);

  if (isLoading || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/assets/quiz/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-green-200/60"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800 font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/assets/quiz/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-green-200/60"></div>
        <div className="text-center relative z-10 bg-white rounded-2xl p-8 shadow-lg max-w-md mx-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the quiz.
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/assets/quiz/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-green-200/60"></div>
        <div className="text-center relative z-10 bg-white rounded-2xl p-8 shadow-lg max-w-md mx-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Quiz Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The quiz you're looking for doesn't exist."}
          </p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    //console.log("User answers", userAnswers);
    if (!selectedAnswer.trim()) return;

    // Trigger confetti if current answer is correct before moving to next question
    if (isTypoTolerantMatch(selectedAnswer, currentQuestion.answer)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || "");
      setShowResult(false);
    } else {
      const finalScore = userAnswers.reduce(
        (acc, answer, index) =>
          isTypoTolerantMatch(answer, quiz.questions[index].answer)
            ? acc + 1
            : acc,
        0
      );
      setScore(finalScore);

      // Submit quiz results to backend
      submitQuizResults(finalScore);

      setQuizCompleted(true);
    }
  };

  const submitQuizResults = async (finalScore: number) => {
    try {
      const correctAnswers = userAnswers.filter((ans, index) =>
        isTypoTolerantMatch(ans, quiz!.questions[index].answer)
      ).length;

      const submissionData = {
        quiz_id: parseInt(quizId),
        pass_count: correctAnswers,
        fail_count: quiz!.questions.length - correctAnswers,
        start_at: quizStartTime?.toISOString() || new Date().toISOString(),
        end_at: new Date().toISOString(),
      };

      const response = await fetch("/api/users/submit-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        //console.error("Failed to submit quiz results:", await response.json());
      } else {
        //console.log("Quiz results submitted successfully");
      }
    } catch (error) {
      //console.error("Error submitting quiz results:", error);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || "");
      setShowResult(false);
    }
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const renderQuestion = () => {
    switch (currentQuestion.question_type) {
      case "MCQ":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-xl mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-2 sm:p-3 rounded-full border-2 transition-all duration-200 font-medium text-xs sm:text-sm ${
                  selectedAnswer === option
                    ? "border-orange-400 bg-orange-100 text-orange-800 shadow-md"
                    : "border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50 text-gray-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  <span
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-2 flex items-center justify-center text-xs font-bold ${
                      selectedAnswer === option
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-400 bg-white text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-left flex-1">{option}</span>
                </span>
              </button>
            ))}
          </div>
        );

      case "FITB":
        return (
          <div className="max-w-xl mx-auto relative px-2 sm:px-0">
            <div className="relative">
              <div className="absolute -top-4 sm:-top-5 left-2 sm:left-4 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                My Answer:
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                <textarea
                  value={
                    showResult &&
                    !isTypoTolerantMatch(selectedAnswer, currentQuestion.answer)
                      ? `Incorrect - Correct answer: ${currentQuestion.answer}`
                      : selectedAnswer
                  }
                  onChange={(e) => {
                    if (!showResult) {
                      handleAnswerSelect(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Type Here..."
                  className={`flex-1 p-3 sm:p-4 pt-5 sm:pt-6 border-2 rounded-full resize-none focus:border-orange-500 focus:outline-none text-xs sm:text-sm ${
                    showResult
                      ? isTypoTolerantMatch(
                          selectedAnswer,
                          currentQuestion.answer
                        )
                        ? "border-green-400 bg-green-50 text-green-800"
                        : "border-red-400 bg-red-50 text-red-800"
                      : "border-orange-400 bg-white text-gray-700"
                  } placeholder-gray-400`}
                  rows={1}
                  style={{ minHeight: "45px" }}
                  readOnly={showResult}
                />
                {!showResult && selectedAnswer.trim() && (
                  <Button
                    onClick={handleSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto"
                    style={{ minHeight: "45px" }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case "TRANS":
        return (
          <div className="max-w-xl mx-auto relative px-2 sm:px-0">
            <div className="relative">
              <div className="absolute -top-4 sm:-top-5 left-2 sm:left-4 bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                My Answer:
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                <textarea
                  value={
                    showResult &&
                    !isTypoTolerantMatch(selectedAnswer, currentQuestion.answer)
                      ? `Incorrect - Correct answer: ${currentQuestion.answer}`
                      : selectedAnswer
                  }
                  onChange={(e) => {
                    if (!showResult) {
                      handleAnswerSelect(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Type Here..."
                  className={`flex-1 p-3 sm:p-4 pt-5 sm:pt-6 border-2 rounded-full resize-none focus:border-orange-500 focus:outline-none text-xs sm:text-sm ${
                    showResult
                      ? isTypoTolerantMatch(
                          selectedAnswer,
                          currentQuestion.answer
                        )
                        ? "border-green-400 bg-green-50 text-green-800"
                        : "border-red-400 bg-red-50 text-red-800"
                      : "border-orange-400 bg-white text-gray-700"
                  } placeholder-gray-400`}
                  rows={1}
                  style={{ minHeight: "45px" }}
                  readOnly={showResult}
                />
                {!showResult && selectedAnswer.trim() && (
                  <Button
                    onClick={handleSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap w-full sm:w-auto"
                    style={{ minHeight: "45px" }}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (quizCompleted) {
    const scorePercentage = Math.round((score / quiz.questions.length) * 100);
    const isHighScore = scorePercentage >= 80;
    const hasMaxedAttempts = attemptCount >= 1;

    // Show chatbot component if showChatbot is true and chat is unlocked
    if (showChatbot) {
      // Show the navbar with timer bar above the chatbot
      return (
        <div className="min-h-screen flex flex-col">
          <LessonNavbar
            timer={chatTimer}
            timerMax={CHAT_SESSION_LIMIT_MINUTES * 60}
            showProgressBar={true}
          />
          <KiraGpt
            isOpen={showChatbot}
            onClose={() => {
              setShowChatbot(false);
            }}
            initialTopic={`${quiz.name} topics`}
            remainingTime={chatTimer}
          />
        </div>
      );
    }

    // Show quiz results if chatbot is not active
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/assets/quiz/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-green-200/60"></div>
        <div className="relative z-10 flex flex-col items-center">
          {/* Kira Monkey Image on top of white card - Made larger */}
          <div className="mb-[-20px] z-20">
            <Image
              src={
                isHighScore
                  ? "/assets/quiz/excited.png"
                  : "/assets/quiz/happy.png"
              }
              alt="Kira Monkey"
              width={160}
              height={160}
            />
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-3xl w-full mx-auto">
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-green-600">
                  {isHighScore ? "Great Job!" : "Awesome effort!"}
                </h1>
                <div className="mt-2 h-px bg-gray-200 mx-8"></div>
              </div>

              <div className="flex items-center justify-center space-x-6">
                <div className="relative w-40 h-40">
                  <svg
                    className="w-40 h-40 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="5"
                      fill="transparent"
                      className="opacity-20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={`${scorePercentage * 2.51} 251`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">
                      {scorePercentage}%
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {score}/{quiz.questions.length}
                  </div>
                  <div className="text-xs text-gray-600">answers correct</div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                {/* Only show Retry Quiz and break line if not locked */}
                {!hasMaxedAttempts && (
                  <>
                    <Button
                      className="w-full rounded-full py-4 font-semibold text-lg border-2 bg-white hover:bg-green-50 text-green-600 border-green-600"
                      onClick={() => window.location.reload()}
                    >
                      Retry Quiz
                    </Button>
                    {/* Light green break line */}
                    <div className="w-full h-[2px] bg-green-300 my-6 rounded"></div>
                  </>
                )}
                <Button
                  className={`w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-4 font-semibold text-lg border-0 flex items-center justify-center`}
                  onClick={() => {
                    setShowChatbot(true);
                  }}
                >
                  Ask Kira
                </Button>

                <Button
                  className="w-full bg-white hover:bg-gray-50 text-green-600 rounded-full py-4 font-semibold text-lg border-2 border-green-600"
                  asChild
                >
                  <Link href="/dashboard">Exit to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar with white background */}
      <LessonNavbar
        current={currentQuestionIndex + 1}
        total={quiz.questions.length}
        showProgressBar={false}
        onExit={() => router.push("/dashboard")}
      />
      {/* Top section with green background - Question and Image */}
      <div
        className="flex-1 relative min-h-[60vh] sm:min-h-[60vh] md:min-h-[65vh]"
        style={{
          backgroundImage: "url('/assets/quiz/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Green overlay */}
        <div className="absolute inset-0 bg-green-200/60"></div>

        {/* Question content - question above image */}
        <div className="relative z-10 flex flex-col items-center justify-start px-2 sm:px-4 py-6 sm:py-6 space-y-4 sm:space-y-6 md:space-y-10 mt-20 sm:mt-[70px] md:mt-[80px]">
          {/* Question text in white card at top */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-4 md:p-6 max-w-4xl w-full mx-2 sm:mx-4">
            <div className="text-center">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 leading-snug">
                {currentQuestion.content}
              </h1>
            </div>
          </div>

          {/* Image directly on green background - responsive size with better mobile height */}
          {(currentQuestion.cloud_front_url || currentQuestion.image_url) && (
            <div className="mb-2 sm:mb-2 w-full px-2 sm:px-4 flex justify-center">
              <img
                src={
                  currentQuestion.cloud_front_url || currentQuestion.image_url
                }
                alt="Question image"
                className="rounded-lg sm:rounded-xl shadow-lg w-full max-w-[min(calc(100vw-2rem),600px)] h-[18rem] xs:h-[30rem] sm:h-[20rem] md:h-[22rem] lg:h-[24rem] object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom section with white background - Answer choices */}
      <div className="bg-white min-h-[18vh] sm:min-h-[20vh] flex flex-col">
        {/* Answer choices */}
        <div className="flex-1 py-3 sm:py-4 md:py-6 px-2 sm:px-4">
          {renderQuestion()}

          {/* Result display */}
          {showResult && <div className="max-w-xl mx-auto mt-4"></div>}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center p-3 sm:p-3 md:p-4 border-t border-gray-100 gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-3 sm:px-6 py-2 text-xs sm:text-sm md:text-base"
          >
            ← Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={
              !selectedAnswer.trim() ||
              (currentQuestion.question_type === "FITB" && !showResult)
            }
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3 sm:px-6 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm md:text-base"
          >
            {currentQuestionIndex === quiz.questions.length - 1
              ? "Finish Quiz"
              : "Next Question →"}
          </Button>
        </div>
      </div>

      {/* Remove the separate Chatbot Component since it's now integrated */}
    </div>
  );
}
