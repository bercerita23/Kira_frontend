// components/UploadContentSection.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  FileText,
} from "lucide-react";
import ReviewQuestions from "./ReviewQuestions";

interface Topic {
  topic_id: number;
  topic_name: string;
  week_number: number;
  state: string;
  updated_at: string;
  file_name: string;
}

type SortDir = "asc" | "desc";
type Step = 1 | 2;
type OnReviewArg = { topic_id: number; topic_name: string };
type Props = { onReview?: (topic: OnReviewArg) => void };

export default function UploadContentSection({ onReview }: Props) {
  const { toast } = useToast();

  // form
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [step, setStep] = useState<Step>(1);

  // data
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hashes, setHashes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // review states
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewTopicName, setReviewTopicName] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);

  // ✅ Add state for PDF.js
  const [pdfjs, setPdfjs] = useState<any>(null);

  // ✅ Load PDF.js dynamically (only in browser)
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        setPdfjs(pdfjsLib);
      });
    }
  }, []);

  // Extract fetch logic into a reusable function
  const fetchTopicsAndHashes = async () => {
    try {
      const [contentsRes, hashesRes] = await Promise.all([
        fetch("/api/admin/contents", { cache: "no-store" }),
        fetch("/api/admin/hash-values", { cache: "no-store" }),
      ]);
      if (!contentsRes.ok) throw new Error("Failed to fetch topics");
      const contents = await contentsRes.json();
      setTopics(Array.isArray(contents) ? contents : []);

      if (!hashesRes.ok) throw new Error("Failed to fetch hash values");
      const hashList = await hashesRes.json();
      setHashes(Array.isArray(hashList) ? hashList : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Only show toast on initial load, not on auto-refresh
      if (topics.length === 0) {
        console.log("Could not load existing topics or hash values.");
      }
    }
  };

  // fetch contents + hash values on mount
  useEffect(() => {
    fetchTopicsAndHashes();
  }, [toast]);

  // Auto-refresh every 60 seconds (1 minute)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing topics...");
      fetchTopicsAndHashes();
    }, 10000); // 60000ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // helpers
  const formatBytes = (bytes?: number) => {
    if (!bytes && bytes !== 0) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(0)} ${sizes[i]}`;
  };

  async function computeSHA256Hex(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // Handle file selection (simplified without compression)
  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB limit

    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 100MB.", // ✅ Fixed
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  // Get token from cookies
  const getToken = () => {
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  };

  // submit - call backend API directly
  const handleSubmit = async () => {
    if (!file || !title || !weekNumber) {
      toast({
        title: "Missing fields",
        description: "Fill out Topic, Week, and choose a file.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      // ✅ STEP 1: Hash ORIGINAL file FIRST
      const hash_value = await computeSHA256Hex(file);
      const exists = hashes.includes(hash_value);

      let fileToUpload = file;
      const FILE_SIZE_LIMIT = 6 * 1024 * 1024; // 6MB

      // STEP 2: Process large PDF files client-side
      if (file.size > FILE_SIZE_LIMIT && file.type === "application/pdf") {
        if (!pdfjs) {
          throw new Error(
            "PDF processing library not loaded. Please try again."
          );
        }

        toast({
          title: "Processing large file",
          description: "Extracting text to reduce file size...",
        });

        try {
          // Extract text from PDF using PDF.js
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

          let extractedText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            extractedText += pageText + "\n\n";
          }

          // Create a simple text file instead of PDF
          const textBlob = new Blob([extractedText], { type: "text/plain" });
          fileToUpload = new File(
            [textBlob],
            file.name.replace(".pdf", ".txt"),
            {
              type: "text/plain",
            }
          );

          console.log(
            `📉 File size reduced: ${formatBytes(file.size)} → ${formatBytes(
              fileToUpload.size
            )}`
          );

          // ✅ CHECK: Is processed file STILL too large?
          if (fileToUpload.size > FILE_SIZE_LIMIT) {
            throw new Error(
              `File still too large after processing (${formatBytes(
                fileToUpload.size
              )}). The PDF contains too much text. Please split it into smaller documents.`
            );
          }

          toast({
            title: "File processed",
            description: `Size reduced from ${formatBytes(
              file.size
            )} to ${formatBytes(fileToUpload.size)}`,
          });
        } catch (pdfError) {
          console.error("PDF processing error:", pdfError);
          throw new Error("Failed to process PDF. Please try a smaller file.");
        }
      }

      // ✅ hash_value already computed from ORIGINAL file above

      if (exists) {
        // Use upload-content-lite endpoint for existing files
        const form = new FormData();
        form.append("title", title.trim());
        form.append("week_number", weekNumber);
        form.append("hash_value", hash_value); // ✅ Original file's hash

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/upload-content-lite`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.detail || "Failed to link existing file");
        }

        toast({
          title: "Success",
          description: "Found an existing file, creating a content.",
        });
      } else {
        // Use content-upload endpoint for new files
        const form = new FormData();
        form.append("file", fileToUpload); // Upload processed file
        form.append("title", title.trim());
        form.append("week_number", weekNumber);
        form.append("hash_value", hash_value);

        console.log("📝 Uploading content directly to backend...");
        console.log("📑 Form data fields:", Array.from(form.keys()));

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/content-upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          }
        );

        console.log(`🔗 Backend response status: ${res.status}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.log("❌ Backend error:", errorData);
          throw new Error(errorData?.detail || "Failed to upload content");
        }

        const data = await res.json();
        console.log("✅ Content uploaded successfully:", data);

        toast({
          title: "Success",
          description: "Content uploaded successfully",
        });
        setHashes((prev) => [...prev, hash_value]);
      }

      // refresh list
      const refreshed = await fetch("/api/admin/contents", {
        cache: "no-store",
      }).then((r) => r.json());
      setTopics(Array.isArray(refreshed) ? refreshed : []);

      // reset the form & go back to step 1
      setFile(null);
      setTitle("");
      setWeekNumber("");
      setStep(1);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  // delete
  const handleDeleteClick = (topic: Topic) => {
    setTopicToDelete(topic);
    setShowDeleteConfirm(true);
  };
  const handleReviewClick = async (topic: Topic) => {
    console.log("=== HANDLE REVIEW CLICK START ===");
    console.log("handleReviewClick called with topic:", topic);
    console.log("Setting up review with topic ID:", topic.topic_id);

    // Set review data immediately to show ReviewQuestions component
    setReviewData({ topic_id: topic.topic_id }); // Just pass the topic_id
    setReviewTopicName(topic.topic_name);
    setShowReview(true);
  };
  const confirmDelete = async () => {
    if (!topicToDelete) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("topic_id", topicToDelete.topic_id.toString());
      const res = await fetch("/api/admin/remove-content", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.detail || "Failed to delete");

      toast({ title: "Content deleted", description: "Item removed" });

      // Refresh both topics AND hashes after deletion
      const [refreshedTopics, refreshedHashes] = await Promise.all([
        fetch("/api/admin/contents", { cache: "no-store" }).then((r) =>
          r.json()
        ),
        fetch("/api/admin/hash-values", { cache: "no-store" }).then((r) =>
          r.json()
        ),
      ]);

      setTopics(Array.isArray(refreshedTopics) ? refreshedTopics : []);
      setHashes(Array.isArray(refreshedHashes) ? refreshedHashes : []);
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setShowDeleteConfirm(false);
      setTopicToDelete(null);
    }
  };

  // list sorting
  const toggleSort = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  const sortedTopics = useMemo(() => {
    const arr = [...topics];
    arr.sort((a, b) => {
      const da = new Date(a.updated_at).getTime();
      const db = new Date(b.updated_at).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
    return arr;
  }, [topics, sortDir]);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  // validation for moving to preview
  const canContinue =
    title.trim().length > 0 && weekNumber.trim().length > 0 && !!file;

  const handleReviewApprove = () => {
    setShowReview(false);
    setReviewData(null);
    setReviewTopicName("");
    toast({
      title: "Questions Approved",
      description: "The questions have been approved successfully.",
    });
  };

  const handleReviewCancel = () => {
    setShowReview(false);
    setReviewData(null);
    setReviewTopicName("");
  };

  // Show review section if in review mode
  if (showReview && reviewData) {
    console.log("=== SHOWING REVIEW SECTION ===");
    console.log("showReview:", showReview);
    console.log("reviewData:", reviewData);
    console.log("Rendering ReviewQuestions with topicId:", reviewData.topic_id);
    return (
      <ReviewQuestions
        topicId={reviewData.topic_id}
        topicLabel={`${reviewTopicName}`}
        onApprove={handleReviewApprove}
        onCancel={handleReviewCancel}
      />
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      {/* Loading overlay for review */}
      {loadingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading questions...</p>
          </div>
        </div>
      )}

      {/* Upload a file (accordion) */}
      <Accordion type="single" collapsible defaultValue="upload">
        <AccordionItem
          value="upload"
          className="rounded-2xl border bg-white shadow-sm"
        >
          <AccordionTrigger className="px-6 py-5 text-lg font-semibold">
            Upload a file
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-8 pt-2">
            {/* Stepper */}
            <div className="mx-auto mb-6 mt-2 flex w-fit items-center gap-6 rounded-full bg-emerald-50 px-4 py-2">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                    step === n
                      ? "bg-white shadow-sm ring-1 ring-emerald-200"
                      : ""
                  }`}
                >
                  <div
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                      step >= (n as Step)
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {n}
                  </div>
                  <span className="text-xs text-emerald-700">
                    {n === 1 ? "Upload Content" : "Preview"}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: form */}
            {step === 1 && (
              <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Topic Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nouns"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Label htmlFor="week">Week Number</Label>
                  <Input
                    id="week"
                    type="number"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    placeholder="5"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="file">File (Max 100MB)</Label>{" "}
                  {/* ✅ Fixed */}
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-3 mt-2 flex items-center justify-end gap-3">
                  <Button
                    className="inline-flex items-center gap-2 bg-[#0FA958] hover:bg-[#0c8b4a]"
                    onClick={() =>
                      canContinue
                        ? setStep(2)
                        : toast({
                            title: "Complete the form",
                            description:
                              "Fill Topic, Week, and choose a file to continue.",
                            variant: "destructive",
                          })
                    }
                  >
                    <UploadCloud className="h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: preview */}
            {step === 2 && (
              <div className="mx-auto max-w-2xl">
                <p className="mb-4 text-sm text-gray-700">
                  Review your upload and confirm the information is correct.
                </p>

                <div className="overflow-hidden rounded-xl border">
                  {/* Topic Title */}
                  <div className="grid grid-cols-12 border-b px-4 py-3">
                    <div className="col-span-4 text-sm text-gray-500">
                      Topic Title
                    </div>
                    <div className="col-span-8 text-sm">{title || "-"}</div>
                  </div>
                  {/* Week Number */}
                  <div className="grid grid-cols-12 border-b px-4 py-3">
                    <div className="col-span-4 text-sm text-gray-500">
                      Week Number
                    </div>
                    <div className="col-span-8 text-sm">
                      {weekNumber || "-"}
                    </div>
                  </div>
                  {/* File */}
                  <div className="grid grid-cols-12 px-4 py-3">
                    <div className="col-span-4 text-sm text-gray-500">File</div>
                    <div className="col-span-8 text-sm">
                      <div>Name: {file?.name || "-"}</div>
                      <div className="text-gray-500">
                        Size: {formatBytes(file?.size)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="bg-[#0FA958] hover:bg-[#0c8b4a]"
                    onClick={handleSubmit}
                    disabled={busy}
                  >
                    {busy ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Existing Content Uploads (unchanged) */}
      <div className="mt-6 rounded-2xl border bg-white p-0 shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Existing Content Uploads</h3>
        </div>

        <div className="hidden grid-cols-12 gap-4 px-6 py-3 text-sm text-gray-600 md:grid">
          <div className="col-span-6">Topic Title</div>
          <div className="col-span-3">Status</div>
          <button
            className="col-span-3 flex items-center gap-1 text-left hover:opacity-80"
            onClick={toggleSort}
            aria-label="Sort by last updated"
          >
            <span>Last Updated</span>
            {sortDir === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="px-3 py-2">
          {sortedTopics.map((t) => (
            <div
              key={t.topic_id}
              className="mb-2 rounded-xl border px-4 py-4 shadow-sm hover:border-gray-300"
            >
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-12 md:col-span-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-1 hidden text-gray-500 md:block">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        Week {t.week_number} - {t.topic_name}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        File: {t.file_name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-3">
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    {t.state || "Ready for Generation"}
                  </span>
                </div>

                <div className="col-span-6 flex items-center justify-between md:col-span-3">
                  <span className="text-sm text-gray-600">
                    {formatDate(t.updated_at)}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Row actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      {(t.state === "READY_FOR_REVIEW" ||
                        t.state === "DONE") && (
                        <DropdownMenuItem
                          onClick={() => {
                            console.log("Review button clicked for topic:", t);
                            handleReviewClick(t);
                          }}
                        >
                          Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDeleteClick(t)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}

          {sortedTopics.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              No uploads yet. Add your first file above.
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>Confirm Delete</DialogHeader>
          <p className="mb-4 text-sm text-gray-700">
            Are you sure you want to delete "{topicToDelete?.topic_name}"? This
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={busy}
            >
              {busy ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
