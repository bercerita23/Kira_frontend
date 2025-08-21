"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Pencil,
  Plus,
  Trash2,
  Save,
  Undo2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Question = {
  question_id: number;
  content: string;
  options: string[];
  question_type: "MCQ" | "FITB" | "TRANS";
  points: number;
  answer: string;
  image_url?: string;
};

type QuizData = {
  quiz_name: string;
  quiz_description: string;
  questions: Question[];
};

export default function ReviewQuestions({
  topicId,
  topicLabel,
  onApprove,
  onCancel,
}: {
  topicId: number;
  topicLabel?: string;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Quiz metadata states
  const [quizName, setQuizName] = useState<string>("");
  const [quizDescription, setQuizDescription] = useState<string>("");

  // Editing states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Question | null>(null);

  console.log("ReviewQuestions component mounted with topicId:", topicId);

  // Fetch questions using useEffect like lesson page
  useEffect(() => {
    async function fetchQuestions() {
      if (!topicId) return;

      console.log("=== FETCHING QUESTIONS IN REVIEWQUESTIONS ===");
      console.log("Topic ID:", topicId);

      try {
        setLoading(true);
        const apiUrl = `/api/admin/review-questions/${topicId}`;
        console.log("API URL:", apiUrl);
        console.log("Making fetch request...");

        const response = await fetch(apiUrl, {
          cache: "no-store",
        });

        console.log("Response received:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        const data: QuizData = await response.json();
        console.log("Questions data received:", data);
        console.log("Quiz name:", data.quiz_name);
        console.log("Quiz description:", data.quiz_description);
        console.log("Questions count:", data.questions?.length || 0);

        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          console.log("Questions set successfully:", data.questions.length);
        } else {
          console.warn("No questions array in response");
          setQuestions([]);
        }

        // Set quiz metadata from API response, with fallback to topic-based defaults
        setQuizName(
          data.quiz_name ||
            topicLabel?.replace(/^Week \d+ - /, "") ||
            `Topic ${topicId}`
        );
        setQuizDescription(data.quiz_description || "");
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load questions"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [topicId, topicLabel]);

  const startEdit = (q: Question) => {
    setEditingId(q.question_id);
    // deep clone in case we add nested props later
    setDraft(JSON.parse(JSON.stringify(q)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    setQuestions((prev) =>
      prev.map((q) => (q.question_id === draft.question_id ? draft : q))
    );
    setEditingId(null);
    setDraft(null);
    toast({
      title: "Saved",
      description: "Question updated in the review list.",
    });
  };

  // ----- field change helpers -----
  const changeField = <K extends keyof Question>(
    key: K,
    value: Question[K]
  ) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  };

  const changeOption = (idx: number, value: string) => {
    if (!draft) return;
    const copy = [...draft.options];
    copy[idx] = value;
    setDraft({ ...draft, options: copy });
    // if we edited the correct option string, update answer too
    if (draft.answer === draft.options[idx]) {
      setDraft((d) => (d ? { ...d, answer: value } : d));
    }
  };

  const addOption = () => {
    if (!draft) return;
    setDraft({ ...draft, options: [...draft.options, ""] });
  };

  const removeOption = (idx: number) => {
    if (!draft) return;
    const removed = draft.options[idx];
    const copy = draft.options.filter((_, i) => i !== idx);
    // if removed one was the current answer, clear answer
    const newAnswer = draft.answer === removed ? "" : draft.answer;
    setDraft({ ...draft, options: copy, answer: newAnswer });
  };

  const setMcqAnswer = (opt: string) => {
    if (!draft) return;
    setDraft({ ...draft, answer: opt });
  };

  const approve = async () => {
    if (!quizName.trim()) {
      toast({
        title: "Error",
        description: "Quiz name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove image_url from questions before sending
      const questionsWithoutImageUrl = questions.map(
        ({ image_url, ...question }) => question
      );

      // Structure data to match the expected API format (quiz metadata first)
      const approvalData = {
        quiz_name: quizName.trim(),
        quiz_description: quizDescription.trim() || "",
        questions: questionsWithoutImageUrl,
      };

      console.log("=== APPROVE FUNCTION DEBUG ===");
      console.log("Current quiz name state:", quizName);
      console.log("Current quiz description state:", quizDescription);
      console.log("Quiz name after trim:", quizName.trim());
      console.log("Quiz description after trim:", quizDescription.trim());
      console.log(
        "Final quiz_description value:",
        quizDescription.trim() || ""
      );
      console.log("Number of questions:", questionsWithoutImageUrl.length);
      console.log(
        "Complete approval data being sent:",
        JSON.stringify(approvalData, null, 2)
      );
      console.log("Topic ID for API call:", topicId);

      const apiUrl = `/api/admin/approve/${topicId}`;
      console.log("Making POST request to:", apiUrl);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approvalData),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      if (!res.ok) {
        const errText = await res.text();
        console.error("API Error Response:", errText);
        throw new Error(errText || "Failed to approve questions");
      }

      const responseData = await res.json();
      console.log("Success response from API:", responseData);

      toast({
        title: "Approved",
        description: "Questions approved successfully.",
      });
      onApprove();
    } catch (err) {
      console.error("Error approving questions:", err);
      console.error("Error details:", {
        name: err instanceof Error ? err.name : "Unknown",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : "No stack trace",
      });
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to approve questions",
        variant: "destructive",
      });
    }
  };

  const cancel = () => {
    toast({ title: "Cancelled", description: "Review cancelled." });
    onCancel();
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Review Questions</h1>
          <Button variant="outline" onClick={cancel}>
            Back
          </Button>
        </div>
        <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Review Questions</h1>
          {topicLabel && (
            <p className="text-sm text-gray-600">Topic: {topicLabel}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Loaded {questions.length} question(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={cancel}>
            Back
          </Button>
          <Button className="bg-[#0FA958] hover:bg-[#0c8b4a]" onClick={approve}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button variant="destructive" onClick={cancel}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Quiz Metadata Section */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Quiz Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="quiz-name">Quiz Name *</Label>
            <Input
              id="quiz-name"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Enter quiz name"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="quiz-description">Quiz Description</Label>
            <Input
              id="quiz-description"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              placeholder="Enter quiz description (optional)"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions found for this topic.</p>
            <p className="text-xs text-gray-400 mt-2">
              Check console for debugging information.
            </p>
          </div>
        ) : (
          questions.map((q) => {
            console.log("Rendering question:", q.question_id, q.question_type);
            const isEditing = editingId === q.question_id;
            const view = isEditing && draft ? draft : q;

            return (
              <div
                key={q.question_id}
                className="mb-4 rounded-xl border px-4 py-4 shadow-sm hover:border-gray-300"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-sm text-gray-500">
                      ID #{q.question_id} • Points: {q.points}
                    </div>

                    {/* Question content */}
                    {isEditing ? (
                      <div className="grid gap-2">
                        <Label htmlFor={`content-${q.question_id}`}>
                          Question
                        </Label>
                        <Textarea
                          id={`content-${q.question_id}`}
                          value={view.content}
                          onChange={(e) =>
                            changeField("content", e.target.value)
                          }
                          className="min-h-[72px]"
                          placeholder="Enter the question text…"
                        />
                      </div>
                    ) : (
                      <h3 className="font-medium">{q.content}</h3>
                    )}
                  </div>

                  {/* Type chip + edit/save controls */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      {q.question_type}
                    </span>

                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(q)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={saveEdit}
                          aria-label="Save"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEdit}
                          aria-label="Cancel"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Image (view-only for now) */}
                {view.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={view.image_url}
                    alt={`q${q.question_id}`}
                    className="mb-3 h-48 w-92 max-w-[300px] rounded-lg border bg-gray-50 object-contain"
                  />
                )}

                {/* Answer/Options section */}
                {view.question_type === "MCQ" ? (
                  <div className="grid gap-2">
                    {view.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <input
                              type="radio"
                              name={`ans-${q.question_id}`}
                              checked={view.answer === opt}
                              onChange={() => setMcqAnswer(opt)}
                              className="mt-1"
                            />
                            <Input
                              value={opt}
                              onChange={(e) => changeOption(i, e.target.value)}
                              className={`flex-1 ${
                                view.answer === opt
                                  ? "ring-1 ring-emerald-300"
                                  : ""
                              }`}
                              placeholder={`Choice ${i + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(i)}
                              aria-label="Remove option"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <label
                            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                              opt === q.answer
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-gray-200"
                            }`}
                          >
                            <span className="truncate">{opt}</span>
                            {opt === q.answer && (
                              <span className="ml-3 text-xs text-emerald-700">
                                Correct
                              </span>
                            )}
                          </label>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <div className="mt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add choice
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border bg-gray-50 px-3 py-3 text-sm">
                    <div className="mb-1 text-gray-500">Expected Answer</div>
                    {isEditing ? (
                      <Input
                        value={view.answer}
                        onChange={(e) => changeField("answer", e.target.value)}
                        placeholder="Type the expected answer…"
                      />
                    ) : (
                      <div className="font-medium">{q.answer}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-4 -mb-4 mt-6 border-t bg-white p-4">
          <div className="flex justify-end gap-2">
            <Button variant="destructive" onClick={cancel}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="bg-[#0FA958] hover:bg-[#0c8b4a]"
              onClick={approve}
              disabled={!quizName.trim()}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
