"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Mic, ArrowRight } from "lucide-react";
import Image from "next/image";

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface KiraGptProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export default function KiraGpt({
  isOpen,
  onClose,
  initialTopic = "your learning",
}: KiraGptProps) {
  const [recording, setRecording] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: `Ask KIRA! I love questions about ${initialTopic}!`,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleMicClick = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    let chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = async () => {
      setRecording(false);
      const blob = new Blob(chunks, { type: "audio/webm" });
      const file = new File([blob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.job
            ? `🎤 Sent audio, started job: ${data.job.TranscriptionJobName}`
            : `⚠️ Error: ${data.error || "Could not start transcription job"}`,
          isBot: true,
          timestamp: new Date(),
        },
      ]);

      // Poll for transcript
      const jobName = data.job?.TranscriptionJobName;
      if (jobName) {
        const interval = setInterval(async () => {
          const pollRes = await fetch(`/api/transcribe/${jobName}`);
          const pollData = await pollRes.json();

          if (pollData.status === "COMPLETED") {
            clearInterval(interval);
            setChatMessage(pollData.text); // 👈 puts transcript into input field
          }
        }, 2000);
      }
    };

    mediaRecorder.start();
    setRecording(true);
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

    // Simulate bot response (placeholder - you can integrate with actual AI service)
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

  if (!isOpen) return null;

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
              onClick={onClose}
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
              <h2 className="font-semibold text-gray-800 text-base">
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
                <button
                  onClick={handleMicClick}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    recording ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                >
                  {recording ? (
                    <span className="w-3 h-3 bg-black"></span> // Stop square ⏹
                  ) : (
                    <Mic className="h-5 w-5 text-black" />
                  )}
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
