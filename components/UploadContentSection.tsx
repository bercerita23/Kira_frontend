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
}

export default function UploadContentSection() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [existingTopicId, setExistingTopicId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/admin/contents", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch topics");
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not load existing topics.",
          variant: "destructive",
        });
      }
    }
    fetchTopics();
  }, [toast]);

  const handleSubmit = async () => {
    if (!file || !title || !weekNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("week_number", weekNumber);
    if (existingTopicId) formData.append("topic_id", existingTopicId);

    try {
      const response = await fetch(
        existingTopicId
          ? "/api/admin/content-reupload"
          : "/api/admin/content-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail);

      toast({ title: "Success", description: data.message });
      setFile(null);
      setTitle("");
      setWeekNumber("");
      setExistingTopicId(null);
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleReuploadAttempt = () => {
    setShowConfirm(true);
  };

  const confirmReupload = () => {
    setShowConfirm(false);
    handleSubmit();
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
            onClick={() => {
              if (existingTopicId) {
                handleReuploadAttempt();
              } else {
                handleSubmit();
              }
            }}
          >
            {existingTopicId ? "Re-upload File" : "Upload File"}
          </Button>
          {existingTopicId && (
            <Button variant="outline" onClick={() => setExistingTopicId(null)}>
              Cancel Re-upload
            </Button>
          )}
        </div>
      </div>

      {topics.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Existing Topics</h3>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li
                key={topic.topic_id}
                className="flex justify-between items-center border px-4 py-2 rounded"
              >
                <div>
                  <p className="font-medium">
                    Week {topic.week_number}: {topic.topic_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(topic.updated_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={() => {
                    setExistingTopicId(String(topic.topic_id));
                    setTitle(topic.topic_name);
                    setWeekNumber(String(topic.week_number));
                    toast({
                      title: "Ready to Re-upload",
                      description: `Now replacing content for Week ${topic.week_number}`,
                    });
                  }}
                >
                  Re-upload
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>⚠️ Confirm Re-upload</DialogHeader>
          <p className="text-sm text-gray-700 mb-4">
            Uploading a new file will completely erase previously stored content
            for this topic. Are you sure you want to proceed?
          </p>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmReupload}
            >
              Yes, Replace Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
