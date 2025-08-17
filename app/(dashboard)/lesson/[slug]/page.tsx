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
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  useEffect(() => {
    let alive = true;
    async function load() {
      const url = quiz?.questions[currentQuestionIndex]?.image_url;
      if (!url) {
        setImgBlobUrl(null);
        return;
      }

      try {
        const key = toS3Key(url); // handles full S3 URL or raw key
        const blobUrl = await getS3BlobUrl(key);
        if (alive) setImgBlobUrl(blobUrl);
      } catch (e) {
        console.error("S3 image fetch failed:", e);
        // fallback to original URL (will work only if object is public)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access the quiz.
          </p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <MobileMenuContext.Provider
        value={{ isMobileMenuOpen, setIsMobileMenuOpen }}
      >
        <div className="min-h-screen bg-white dark:bg-gray-950">
          <DashboardHeader />
          <div className="flex flex-col md:flex-row">
            <DashboardSidebar />
            <main className="flex-1 pt-12 px-6 md:px-8 md:pt-12 md:pl-64">
              <div className="max-w-4xl mx-auto py-8">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error || "The quiz you're looking for doesn't exist."}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </MobileMenuContext.Provider>
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

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || "");
      setShowResult(false);
    } else {
      // Quiz completed
      const finalScore = userAnswers.reduce(
        (acc, answer, index) =>
          answer.toLowerCase().trim() ===
            quiz.questions[index].answer.toLowerCase().trim()
            ? acc + 1
            : acc,
        0
      );
      setScore(finalScore);
      setQuizCompleted(true);
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
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedAnswer === option
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
              >
                <span className="flex items-center">
                  <span className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center">
                    {selectedAnswer === option && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        );

      case "FITB":
        return (
          <div>
            <textarea
              value={selectedAnswer}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:border-blue-500 focus:outline-none"
              rows={4}
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (quizCompleted) {
    return (
      <MobileMenuContext.Provider
        value={{ isMobileMenuOpen, setIsMobileMenuOpen }}
      >
        <div className="min-h-screen bg-white dark:bg-gray-950">
          <DashboardHeader />
          <div className="flex flex-col md:flex-row">
            <DashboardSidebar />
            <main className="flex-1 pt-12 px-6 md:px-8 md:pt-12 md:pl-64">
              <div className="max-w-2xl mx-auto py-8">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="text-6xl">
                      {score === quiz.questions.length
                        ? "🎉"
                        : score >= quiz.questions.length / 2
                          ? "👏"
                          : "📚"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Your Score</h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {score} / {quiz.questions.length}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {Math.round((score / quiz.questions.length) * 100)}%
                        Correct
                      </p>
                    </div>
                    <div className="space-x-4">
                      <Button asChild>
                        <Link href="/dashboard">Back to Dashboard</Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        Retake Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </MobileMenuContext.Provider>
    );
  }

  return (
    <MobileMenuContext.Provider
      value={{ isMobileMenuOpen, setIsMobileMenuOpen }}
    >
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <DashboardHeader />
        <div className="flex flex-col md:flex-row">
          <DashboardSidebar />
          <main className="flex-1 pt-12 px-6 md:px-8 md:pt-12 md:pl-64">
            <div className="max-w-4xl mx-auto py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {currentQuestion.content}
                  </CardTitle>
                  {currentQuestion.image_url && (
                    <div className="mt-4">
                      <img
                        src={currentQuestion.image_url} // e.g. https://kira-school-content.s3.amazonaws.com/visuals/...
                        alt="Question image"
                        className="rounded-lg mx-auto max-w-full h-auto"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {renderQuestion()}

                  {showResult && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${selectedAnswer.toLowerCase().trim() ===
                        currentQuestion.answer.toLowerCase().trim()
                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200"
                        : "bg-red-50 dark:bg-red-900/20 border border-red-200"
                        }`}
                    >
                      <div className="flex items-center mb-2">
                        {selectedAnswer.toLowerCase().trim() ===
                          currentQuestion.answer.toLowerCase().trim() ? (
                          <>
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800 dark:text-green-200">
                              Correct!
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-5 w-5 text-red-600 mr-2" />
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Incorrect
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm">
                        <strong>Correct answer:</strong>{" "}
                        {currentQuestion.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="space-x-2">
                  {!showResult && selectedAnswer.trim() && (
                    <Button variant="outline" onClick={handleSubmit}>
                      Check Answer
                    </Button>
                  )}
                  {(showResult || !selectedAnswer.trim()) && (
                    <Button
                      onClick={handleNext}
                      disabled={!selectedAnswer.trim()}
                    >
                      {currentQuestionIndex === quiz.questions.length - 1
                        ? "Finish Quiz"
                        : "Next"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
