// components/UploadContentSection.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface Topic {
  topic_id: number;
  topic_name: string;
  week_number: number;
  state: string;
  updated_at: string;
  file_name: string;
}

export default function UploadContentSection() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hashes, setHashes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  // fetch contents + hash values on mount
  useEffect(() => {
    (async () => {
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
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not load existing topics or hash values.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  // compute SHA-256 hex
  async function computeSHA256Hex(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handleSubmit = async () => {
    if (!file || !title || !weekNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    try {
      // 1) compute hash
      const hash_value = await computeSHA256Hex(file);

      // 2) check if hash already exists
      const exists = hashes.includes(hash_value);

      if (exists) {
        // 3a) existing → increase ref count
        const form = new FormData();
        form.append("title", title.trim());
        form.append("week_number", weekNumber); // FastAPI will coerce to int
        form.append("hash_value", hash_value);

        const res = await fetch("/api/admin/upload-content-lite", {
          method: "POST",
          body: form, // ⚠️ do NOT set Content-Type yourself
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.detail || "Failed to increase ref count");
        }

        toast({
          title: "Linked Existing File",
          description: "Content uploaded successfully",
        });
      } else {
        // 3b) new content → upload file with hash
        const form = new FormData();
        form.append("file", file);
        form.append("title", title.trim());
        form.append("week_number", weekNumber);
        form.append("hash_value", hash_value);

        const res = await fetch("/api/admin/content-upload", {
          method: "POST",
          body: form,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data?.detail || "Failed to upload content");

        toast({
          title: "Uploaded",
          description: "Content uploaded successfully",
        });

        // keep the in-session hash list up to date
        setHashes((prev) => [...prev, hash_value]);
      }

      // refresh contents
      try {
        const refreshed = await fetch("/api/admin/contents", {
          cache: "no-store",
        }).then((r) => r.json());
        setTopics(Array.isArray(refreshed) ? refreshed : []);
      } catch {}

      // reset inputs
      setFile(null);
      setTitle("");
      setWeekNumber("");
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = (topic: Topic) => {
    setTopicToDelete(topic);
    setShowDeleteConfirm(true);
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
      if (!res.ok) {
        throw new Error(data?.detail || "Failed to delete content");
      }

      toast({
        title: "Content Deleted",
        description: "Content has been successfully deleted",
      });

      // refresh contents
      try {
        const refreshed = await fetch("/api/admin/contents", {
          cache: "no-store",
        }).then((r) => r.json());
        setTopics(Array.isArray(refreshed) ? refreshed : []);
      } catch {}
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setShowDeleteConfirm(false);
      setTopicToDelete(null);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Upload Quiz Content</h2>

      <div className="space-y-4 max-w-lg">
        <div>
          <Label>Week Number</Label>
          <Input
            type="number"
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        <div>
          <Label>Topic Title</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Animals in the Wild"
          />
        </div>

        <div className="">
          <Label>Upload File</Label>
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="flex gap-2 ">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? "Processing..." : "Upload Content"}
          </Button>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">
            Existing Topics ({topics.length})
          </h3>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li
                key={topic.topic_id}
                className="flex justify-between items-center border px-4 py-2 rounded bg-white shadow-sm"
              >
                <div className="flex-shrink-0 min-w-0">
                  <p className="font-medium truncate">
                    Week {topic.week_number}: {topic.topic_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    File: {topic.file_name}
                  </p>
                  <p className="text-xs text-gray-500">Status: {topic.state}</p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(topic.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(topic)}
                    disabled={busy}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>⚠️ Confirm Delete</DialogHeader>
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to delete "{topicToDelete?.topic_name}"? This
            action will completely erase other content stored and cannot be
            undone.
          </p>
          <div className="flex justify-end gap-4">
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
