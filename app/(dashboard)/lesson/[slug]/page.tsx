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

type Question = {
  question_id: number;
  content: string;
  options: string[];
  question_type: "MCQ" | "FITB" | "SA";
  points: number;
  answer: string;
  image_url?: string;
};

type Quiz = {
  quiz_id: number;
  name: string;
  description: string;
  questions: Question[];
};

export default function LessonPage() {
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

  useEffect(() => {
    let alive = true;
    async function load() {
      const url = quiz?.questions[currentQuestionIndex]?.image_url;
      if (!url) {
        setImgBlobUrl(null);
        return;
      }

      try {
        const key = toS3Key(url);
        const blobUrl = await getS3BlobUrl(key);
        if (alive) setImgBlobUrl(blobUrl);
      } catch (e) {
        console.error("S3 image fetch failed:", e);
        if (alive) setImgBlobUrl(url);
      }
    }
    load();
    return () => {
      alive = false;
    };
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
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [quizId]);

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
    if (!selectedAnswer.trim()) return;

    // Trigger confetti if current answer is correct before moving to next question
    if (
      selectedAnswer.toLowerCase().trim() ===
      currentQuestion.answer.toLowerCase().trim()
    ) {
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
          answer.toLowerCase().trim() ===
          quiz.questions[index].answer.toLowerCase().trim()
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
      const correctAnswers = userAnswers.filter(
        (answer, index) =>
          answer.toLowerCase().trim() ===
          quiz!.questions[index].answer.toLowerCase().trim()
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
        console.error("Failed to submit quiz results:", await response.json());
      } else {
        console.log("Quiz results submitted successfully");
      }
    } catch (error) {
      console.error("Error submitting quiz results:", error);
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

    if (
      selectedAnswer.toLowerCase().trim() ===
      currentQuestion.answer.toLowerCase().trim()
    ) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.question_type) {
      case "MCQ":
        return (
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-4 rounded-full border-2 transition-all duration-200 font-medium text-sm ${
                  selectedAnswer === option
                    ? "border-orange-400 bg-orange-100 text-orange-800 shadow-md"
                    : "border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50 text-gray-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  <span
                    className={`w-8 h-8 rounded-full border-2 mr-3 flex items-center justify-center text-xs font-bold ${
                      selectedAnswer === option
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-400 bg-white text-gray-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        );

      case "FITB":
        return (
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <div className="absolute -top-6 left-6 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                My Answer:
              </div>
              <textarea
                value={selectedAnswer}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                placeholder="Type Here..."
                className="w-full p-6 pt-8 border-2 border-orange-400 rounded-full resize-none focus:border-orange-500 focus:outline-none bg-white text-gray-700 placeholder-gray-400"
                rows={1}
                style={{ minHeight: "60px" }}
              />
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (quizCompleted) {
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
        <div className="relative z-10 bg-white rounded-2xl p-8 shadow-xl max-w-lg mx-4">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Quiz Completed!
            </h1>
            <div className="text-6xl">
              {score === quiz.questions.length
                ? "🎉"
                : score >= quiz.questions.length / 2
                ? "👍"
                : "📚"}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                Your Score
              </h3>
              <p className="text-4xl font-bold text-green-600">
                {score} / {quiz.questions.length}
              </p>
              <p className="text-gray-600">
                {Math.round((score / quiz.questions.length) * 100)}% Correct
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar with white background */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          {/* Help button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          >
            <Link href="/dashboard">
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Link>
          </Button>

          {/* Question number indicators */}
          <div className="flex space-x-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-full border-3 flex items-center justify-center text-sm font-bold ${
                  index < currentQuestionIndex
                    ? "bg-green-500 border-green-600 text-white"
                    : index === currentQuestionIndex
                    ? "bg-green-400 border-green-500 text-white"
                    : "bg-white border-gray-300 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Exit button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            onClick={() => router.push("/dashboard")}
          >
            Exit
            <X className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Top section with green background - Question and Image */}
      <div
        className="flex-1 relative min-h-[60vh]"
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
        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 space-y-14">
          {/* Question text in white card at top */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full mx-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {currentQuestion.content}
              </h1>
            </div>
          </div>

          {/* Image directly on green background - larger 16:9 size */}
          {currentQuestion.image_url && (
            <div className="mb-3">
              <img
                src={imgBlobUrl || currentQuestion.image_url}
                alt="Question image"
                className="rounded-xl mx-auto shadow-lg w-[40rem] h-[27rem] object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom section with white background - Answer choices */}
      <div className="bg-white min-h-[26vh] flex flex-col">
        {/* Answer choices */}
        <div className="flex-1 py-8 px-4">
          {renderQuestion()}

          {/* Result display */}
          {showResult && (
            <div className="max-w-2xl mx-auto mt-6">
              <div
                className={`p-4 rounded-2xl text-center ${
                  selectedAnswer.toLowerCase().trim() ===
                  currentQuestion.answer.toLowerCase().trim()
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-red-50 border-2 border-red-200"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  {selectedAnswer.toLowerCase().trim() ===
                  currentQuestion.answer.toLowerCase().trim() ? (
                    <>
                      <Check className="h-6 w-6 text-green-600 mr-2" />
                      <span className="font-bold text-green-800 text-lg">
                        Correct!
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-6 w-6 text-red-600 mr-2" />
                      <span className="font-bold text-red-800 text-lg">
                        Incorrect
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Correct answer:</strong> {currentQuestion.answer}
                </p>
              </div>
            </div>
          )}

          {/* Answer button for FITB or when showing results for MCQ */}
          {currentQuestion.question_type === "FITB" &&
            !showResult &&
            selectedAnswer.trim() && (
              <div className="text-center mt-6">
                <Button
                  onClick={handleSubmit}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium"
                >
                  My Answer
                </Button>
              </div>
            )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center p-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-2"
          >
            ← Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={
              !selectedAnswer.trim() ||
              (currentQuestion.question_type === "FITB" && !showResult)
            }
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === quiz.questions.length - 1
              ? "Finish Quiz"
              : "Next Question →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
