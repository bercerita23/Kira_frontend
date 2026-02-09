"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatHistoryResponse {
  session_id: number;
  user_name?: string;
  started_at: string;
  ended_at?: string;
  messages: ChatMessage[];
}

interface Props {
  sessionId: number;
  onClose: () => void;
}

export default function ChatHistoryModal({ sessionId, onClose }: Props) {
  const [data, setData] = useState<ChatHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/admin/chat-history/${sessionId}`, {
          cache: "no-store",
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [sessionId]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-lg font-lato font-[600]">
              Chat History
            </CardTitle>
            {data && (
              <p className="text-sm text-muted-foreground font-lato font-[400]">
                Started{" "}
                {new Date(data.started_at).toLocaleString("en-US")}
              </p>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {loading && (
            <p className="text-center text-muted-foreground">
              Loading chat history…
            </p>
          )}

          {!loading && data?.messages?.length === 0 && (
            <p className="text-center text-muted-foreground">
              No messages in this session.
            </p>
          )}

          {data?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm font-lato font-[400] shadow-sm ${
                  msg.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-white text-black border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className="mt-1 text-xs opacity-70 text-right">
                  {new Date(msg.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
