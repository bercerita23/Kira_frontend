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

type Question = {
  question_id: number;
  content: string;
  options: string[];
  question_type: "MCQ" | "FITB" | "SA" | "TRANS";
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
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Ask KIRA! I love questions about [topic that week]!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);

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
      selectedAnswer.toLowerCase().trim().replace(/\s+/g, " ") ===
      currentQuestion.answer.toLowerCase().trim().replace(/\s+/g, " ")
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
          answer.toLowerCase().trim().replace(/\s+/g, " ") ===
          quiz!.questions[index].answer
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
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
      selectedAnswer.toLowerCase().trim().replace(/\s+/g, " ") ===
      currentQuestion.answer.toLowerCase().trim().replace(/\s+/g, " ")
    ) {
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.question_type) {
      case "MCQ":
        return (
          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-3 rounded-full border-2 transition-all duration-200 font-medium text-xs ${
                  selectedAnswer === option
                    ? "border-orange-400 bg-orange-100 text-orange-800 shadow-md"
                    : "border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50 text-gray-700"
                }`}
              >
                <span className="flex items-center justify-center">
                  <span
                    className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center text-xs font-bold ${
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
          <div className="max-w-xl mx-auto relative">
            <div className="relative">
              <div className="absolute -top-5 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                My Answer:
              </div>
              <div className="flex gap-3 items-center">
                <textarea
                  value={
                    showResult &&
                    selectedAnswer.toLowerCase().trim().replace(/\s+/g, " ") !==
                      currentQuestion.answer
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, " ")
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
                  className={`flex-1 p-4 pt-6 border-2 rounded-full resize-none focus:border-orange-500 focus:outline-none text-sm ${
                    showResult
                      ? selectedAnswer
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, " ") ===
                        currentQuestion.answer
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, " ")
                        ? "border-green-400 bg-green-50 text-green-800"
                        : "border-red-400 bg-red-50 text-red-800"
                      : "border-orange-400 bg-white text-gray-700"
                  } placeholder-gray-400`}
                  rows={1}
                  style={{ minHeight: "50px" }}
                  readOnly={showResult}
                />
                {!showResult && selectedAnswer.trim() && (
                  <Button
                    onClick={handleSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap"
                    style={{ minHeight: "50px" }}
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
          <div className="max-w-xl mx-auto relative">
            <div className="relative">
              <div className="absolute -top-5 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                My Answer:
              </div>
              <div className="flex gap-3 items-center">
                <textarea
                  value={
                    showResult &&
                    selectedAnswer.toLowerCase().trim().replace(/\s+/g, " ") !==
                      currentQuestion.answer
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, " ")
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
                  className={`flex-1 p-4 pt-6 border-2 rounded-full resize-none focus:border-orange-500 focus:outline-none text-sm ${
                    showResult
                      ? selectedAnswer
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, " ") ===
                        currentQuestion.answer
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, " ")
                        ? "border-green-400 bg-green-50 text-green-800"
                        : "border-red-400 bg-red-50 text-red-800"
                      : "border-orange-400 bg-white text-gray-700"
                  } placeholder-gray-400`}
                  rows={1}
                  style={{ minHeight: "50px" }}
                  readOnly={showResult}
                />
                {!showResult && selectedAnswer.trim() && (
                  <Button
                    onClick={handleSubmit}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap"
                    style={{ minHeight: "50px" }}
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

  const handleChatSendMessage = () => {
    if (!chatMessage.trim()) return;

    // Add user message
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: chatMessage,
        isBot: false,
        timestamp: new Date(),
      },
    ]);

    setChatMessage("");

    // Simulate bot response (placeholder)
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Thanks for your question! I'm here to help with your learning.",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSendMessage();
    }
  };

  if (quizCompleted) {
    const scorePercentage = Math.round((score / quiz.questions.length) * 100);
    const isHighScore = scorePercentage >= 80;

    // Show chatbot if showChatbot is true
    if (showChatbot) {
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

          {/* Chatbot Interface */}
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4 relative">
                {/* Exit button top-right */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatbot(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                >
                  Exit <X className="h-4 w-4 ml-1" />
                </Button>

                {/* Centered Icon + Title */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Image
                      src="/assets/quiz/kiragpt.png"
                      alt="Kira Monkey"
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  </div>
                  <h2 className=" font-semibold text-gray-800 text-base">
                    Kira Monkey
                  </h2>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    {msg.isBot ? (
                      <div className="bg-white border-2 border-red-500 rounded-full px-6 py-3 max-w-[320px]">
                        <p className="text-sm text-gray-800">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="self-end bg-orange-500 border-2 border-orange-600 text-white rounded-full px-6 py-3 max-w-[280px]">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  {/* Input Field with Mic inside */}
                  <div className="flex-1 relative flex items-center border-2 border-red-400 rounded-full px-2 py-1 overflow-hidden">
                    <button className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <Mic className="h-5 w-5 text-black" />
                    </button>
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={handleChatKeyPress}
                      placeholder="Type Here..."
                      className="flex-1 px-4 py-3 focus:outline-none text-sm placeholder-gray-500"
                      style={{ minHeight: "44px" }}
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleChatSendMessage}
                    disabled={!chatMessage.trim()}
                    size="sm"
                    className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white p-0 flex-shrink-0 disabled:bg-gray-400"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
          <div className="mb-[-20px] z-20 ">
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

          {/* White card with content */}
          <div className="bg-white rounded-2xl p-8  shadow-xl max-w-[400px] mx-4">
            <div className="text-center space-y-6">
              {/* Title with line break */}
              <div>
                <h1 className="text-3xl font-bold text-green-600">
                  {isHighScore ? "Great Job!" : "Awesome effort!"}
                </h1>
                <div className="mt-2 h-px bg-gray-200 mx-8"></div>
              </div>

              {/* Score Circle and Text */}
              <div className="flex items-center justify-center space-x-6">
                {/* Circular Progress - Made even larger */}
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
                      strokeWidth="8"
                      fill="transparent"
                      className="opacity-20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${scorePercentage * 2.51} 251`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-800">
                      {scorePercentage}%
                    </span>
                  </div>
                </div>

                {/* Score Details - Made smaller */}
                <div className="text-left">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {score}/{quiz.questions.length}
                  </div>
                  <div className="text-xs text-gray-600">answers correct</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-4 font-semibold text-lg border-0"
                  onClick={() => setShowChatbot(true)}
                >
                  Talk to Kira Monkey
                </Button>

                <Button
                  className="w-full bg-white hover:bg-gray-50 text-green-600 rounded-full py-4 font-semibold text-lg border-2 border-green-600"
                  onClick={() => window.location.reload()}
                >
                  Retake Quiz
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
            className="text-gray-700  hover:text-gray-900 hover:bg-gray-100 rounded-full"
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
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 max-w-4xl w-full mx-4">
            <div className="text-center">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                {currentQuestion.content}
              </h1>
            </div>
          </div>

          {/* Image directly on green background - responsive size */}
          {currentQuestion.image_url && (
            <div className="mb-4">
              <img
                src={imgBlobUrl || currentQuestion.image_url}
                alt="Question image"
                className="rounded-xl mx-auto shadow-lg w-full max-w-[25rem] h-[20rem] sm:max-w-[30rem] sm:h-[20rem] md:max-w-[35rem] md:h-[24rem] lg:max-w-[38rem] lg:h-[25rem] object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom section with white background - Answer choices */}
      <div className="bg-white min-h-[24vh] flex flex-col">
        {/* Answer choices */}
        <div className="flex-1 py-6 px-4">
          {renderQuestion()}

          {/* Result display */}
          {showResult && <div className="max-w-xl mx-auto mt-4"></div>}
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

      {/* Remove the separate Chatbot Component since it's now integrated */}
    </div>
  );
}
