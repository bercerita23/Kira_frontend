"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // if you don't have this, use <Input> instead
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

// ---- MOCK DATA (visuals only) ----
const MOCK: { questions: Question[] } = {
  questions: [
    {
      question_id: 116,
      content: "What is the first step to set up the Virtual Lab Linux VM?",
      options: [
        "Installing antivirus software",
        "Downloading SEED Lab VM zip file",
        "Starting VirtualBox",
        "Creating a new VM",
      ],
      question_type: "MCQ",
      points: 1,
      answer: "Downloading SEED Lab VM zip file",
      image_url:
        "https://kira-school-content.s3.amazonaws.com/visuals/SCH001/22/t55/q116.png",
    },
    {
      question_id: 117,
      content: "The shell is an interface to the ___ (1 word).",
      options: [],
      question_type: "FITB",
      points: 1,
      answer: "kernel",
      image_url:
        "https://kira-school-content.s3.amazonaws.com/visuals/SCH001/22/t55/q117.png",
    },
    {
      question_id: 118,
      content: "What does the word jaringan translate in English? (1 word)",
      options: [],
      question_type: "TRANS",
      points: 1,
      answer: "network",
      image_url:
        "https://kira-school-content.s3.amazonaws.com/visuals/SCH001/22/t55/q118.png",
    },
    {
      question_id: 119,
      content: "Which command is used to check the current working directory?",
      options: ["ls", "pwd", "cd", "echo"],
      question_type: "MCQ",
      points: 1,
      answer: "pwd",
      image_url:
        "https://kira-school-content.s3.amazonaws.com/visuals/SCH001/22/t55/q119.png",
    },
    {
      question_id: 120,
      content:
        "To change the working directory to the root directory, use the command ___ (2 words).",
      options: [],
      question_type: "FITB",
      points: 1,
      answer: "cd /",
      image_url:
        "https://kira-school-content.s3.amazonaws.com/visuals/SCH001/22/t55/q120.png",
    },
  ],
};

export default function ReviewQuestions({
  topicLabel,
  onApprove,
  onCancel,
}: {
  topicLabel?: string;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();

  // state for the list we render
  const [questions, setQuestions] = useState<Question[]>(MOCK.questions);

  // which question (by id) is being edited, and its draft copy
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Question | null>(null);

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

  const approve = () => {
    toast({ title: "Approved", description: "Questions approved." });
    onApprove();
  };

  const cancel = () => {
    toast({ title: "Cancelled", description: "Review cancelled." });
    onCancel();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Review Questions</h1>
          {topicLabel && (
            <p className="text-sm text-gray-600">Topic: {topicLabel}</p>
          )}
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

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {questions.map((q) => {
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
                        onChange={(e) => changeField("content", e.target.value)}
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
                  className="mb-3 h-48 w-96 rounded-lg border bg-gray-50 object-contain"
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
                      <Button variant="secondary" size="sm" onClick={addOption}>
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
        })}

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
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
