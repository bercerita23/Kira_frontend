"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Mic, ArrowRight, Loader2 } from "lucide-react";
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
  const [transcribing, setTranscribing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Fix: Use useRef instead of let variable
  const audioChunksRef = useRef<ArrayBuffer[]>([]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: `Ask KIRA! I love questions about ${initialTopic}!`,
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const createWAVFile = (audioData: Float32Array, sampleRate: number) => {
    const length = audioData.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      let sample = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }

    return buffer;
  };

  const handleMicClick = async () => {
    if (recording) {
      // ⏹ STOP recording
      const recordingDuration = Date.now() - recordingStartTime;

      // Stop the audio context and worklet properly
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setRecording(false);

      if (recordingDuration < 1000) {
        alert("Please record for at least 1 second");
        audioChunksRef.current = [];
        return;
      }

      setTranscribing(true);

      console.log("Audio chunks count:", audioChunksRef.current.length);
      if (audioChunksRef.current.length === 0) {
        alert(
          "No audio data recorded. Please check your microphone permissions and try again."
        );
        setTranscribing(false);
        return;
      }

      try {
        // Convert all chunks to a single Float32Array
        const totalSamples = audioChunksRef.current.reduce(
          (sum, buf) => sum + buf.byteLength / 4, // Divide by 4 for Float32Array
          0
        );

        if (totalSamples === 0) {
          alert("No audio samples recorded. Please try again.");
          setTranscribing(false);
          return;
        }

        console.log("Total audio samples:", totalSamples);

        // Combine all audio chunks into a single Float32Array
        const combinedAudio = new Float32Array(totalSamples);
        let offset = 0;

        for (const chunk of audioChunksRef.current) {
          const float32Chunk = new Float32Array(chunk);
          combinedAudio.set(float32Chunk, offset);
          offset += float32Chunk.length;
        }

        console.log("Combined audio length:", combinedAudio.length);

        // Create proper WAV file with reduced sample rate to make it smaller
        const wavBuffer = createWAVFile(combinedAudio, 16000); // Reduced from 44100 to 16000

        console.log("Sending audio to transcribe, size:", wavBuffer.byteLength);

        const res = await fetch("/api/transcribe/stream", {
          method: "POST",
          body: wavBuffer,
          headers: {
            "Content-Type": "audio/wav",
          },
        });

        const data = await res.json();
        console.log("Transcription response:", data);

        if (data.transcript) {
          // Remove duplicate words/phrases
          const cleanTranscript = removeDuplicateWords(data.transcript);
          setChatMessage(cleanTranscript);
        } else if (data.error) {
          console.error("Transcription error:", data.error);
          alert(`Transcription failed: ${data.error}`);
        } else {
          console.log("No transcript received");
          alert(
            "No speech detected. Please try speaking louder or closer to the microphone."
          );
        }
      } catch (err) {
        console.error("Transcription request failed:", err);
        alert("Transcription failed. Please try again.");
      }

      audioChunksRef.current = [];
      setTranscribing(false);
      return;
    }

    // 🎤 START recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Reduced from 44100 to 16000
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const audioContext = new AudioContext({ sampleRate: 16000 }); // Reduced sample rate

      // Resume audio context if it's suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule("/audio-processor.js");
      const workletNode = new AudioWorkletNode(audioContext, "audio-processor");
      workletNodeRef.current = workletNode;

      const source = audioContext.createMediaStreamSource(stream);

      // Connect the source to the worklet
      source.connect(workletNode);

      // IMPORTANT: Connect worklet to destination to ensure processing
      workletNode.connect(audioContext.destination);

      audioChunksRef.current = [];

      workletNode.port.onmessage = (event) => {
        console.log("Received audio chunk, size:", event.data.byteLength);
        audioChunksRef.current.push(event.data as ArrayBuffer);
      };

      setRecording(true);
      setRecordingStartTime(Date.now());
      console.log(
        "Recording started, audio context state:",
        audioContext.state
      );
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error accessing microphone. Please check permissions.");
    }
  };

  // Start a chat session when the component opens
  useEffect(() => {
    const startSession = async () => {
      try {
        console.log("Starting chat session with initialTopic:", initialTopic);

        // Extract quiz ID from initialTopic, e.g. "Quiz 98 topics"
        const match = initialTopic.match(/Quiz (\d+)/);
        const quizId = match ? parseInt(match[1], 10) : null;

        if (!quizId) {
          console.error(
            "Could not extract quiz_id from initialTopic:",
            initialTopic
          );
          return;
        }

        const requestBody = { quiz_id: quizId };
        console.log(
          "Request body being sent to /start API:",
          JSON.stringify(requestBody, null, 2)
        );

        const res = await fetch("/api/users/chat/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        console.log("Frontend: Response status:", res.status);
        console.log("Frontend: Response data:", data);

        if (res.ok) {
          setSessionId(data.session_id);
          console.log("Chat session started successfully:", data);
        } else {
          console.error("Failed to start chat:", data);
        }
      } catch (err) {
        console.error("Error starting chat session:", err);
      }
    };

    if (isOpen) {
      startSession();
    }
  }, [isOpen, initialTopic]);

  const [typingBotMessage, setTypingBotMessage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleChatSendMessage = async () => {
    if (!chatMessage.trim() || !sessionId) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: chatMessage,
        isBot: false,
        timestamp: new Date(),
      },
    ]);

    const userMessage = chatMessage;
    setChatMessage("");

    try {
      const res = await fetch("/api/users/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId, message: userMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        // Typer animation for bot reply
        setIsTyping(true);
        setTypingBotMessage("");
        const reply = data.reply || "";
        let i = 0;
        const typeInterval = 18; // ms per character
        const type = () => {
          setTypingBotMessage(reply.slice(0, i + 1));
          i++;
          if (i < reply.length) {
            setTimeout(type, typeInterval);
          } else {
            setIsTyping(false);
            setTypingBotMessage(null);
            setChatMessages((prev) => [
              ...prev,
              {
                id: Date.now() + 1,
                text: reply,
                isBot: true,
                timestamp: new Date(),
              },
            ]);
          }
        };
        type();
      } else {
        console.error("Chat send error:", data);
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Sorry, I encountered an error. Please try again.",
            isBot: true,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error sending chat:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting. Please try again.",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const endChatSession = async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/users/chat/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      console.log("Chat session ended.");
    } catch (err) {
      console.error("Error ending chat session:", err);
    }
  };
  const handleExit = async () => {
    await endChatSession();
    onClose();
  };
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSendMessage();
    }
  };

  const TIMER_DURATION = 5 * 60; // 5 minutes in seconds
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [locked, setLocked] = useState(false);

  // Helper to format seconds as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isOpen) return;
    setTimer(TIMER_DURATION); // reset timer when opened
    setLocked(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setLocked(true);
          endChatSession(); // End session when timer locks
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

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
            {/* Timer top-left */}
            <div className="absolute top-6 left-4 flex items-center">
              <span className="text-sm font-semibold text-orange-600">
                {formatTime(timer)}
              </span>
            </div>
            {/* Exit button top-right */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
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
                  width={42}
                  height={42}
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
            {chatMessages.map((msg, idx) => (
              <div key={msg.id} className="flex flex-col">
                {msg.isBot ? (
                  <div className="bg-white border-2 border-red-500 rounded-full px-6 py-3 max-w-[320px]">
                    <p className="text-sm text-gray-800">
                      {/* Show typer animation for the last bot message if typing */}
                      {isTyping && idx === chatMessages.length - 1 && typingBotMessage !== null
                        ? typingBotMessage
                        : msg.text}
                      {/* Blinking cursor */}
                      {isTyping && idx === chatMessages.length - 1 && typingBotMessage !== null && (
                        <span className="animate-pulse">|</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="self-end bg-orange-500 border-2 border-orange-600 text-white rounded-full px-6 py-3 max-w-[280px]">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                )}
              </div>
            ))}
            {/* If typing and no bot message yet, show the typing message separately */}
            {isTyping && typingBotMessage !== null && chatMessages.length > 0 &&
              chatMessages[chatMessages.length - 1].isBot === false && (
                <div className="flex flex-col">
                  <div className="bg-white border-2 border-red-500 rounded-full px-6 py-3 max-w-[320px]">
                    <p className="text-sm text-gray-800">
                      {typingBotMessage}
                      <span className="animate-pulse">|</span>
                    </p>
                  </div>
                </div>
              )
            }
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              {/* Input Field with Mic inside */}
              <div className="flex-1 relative flex items-center border-2 border-red-400 rounded-full px-2 py-1 overflow-hidden">
                <button
                  onClick={handleMicClick}
                  disabled={transcribing || locked}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    locked
                      ? "bg-gray-400"
                      : transcribing
                      ? "bg-gray-400"
                      : recording
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                >
                  {locked ? (
                    <X className="h-5 w-5 text-white" />
                  ) : transcribing ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : recording ? (
                    <span className="w-3 h-3 bg-white"></span>
                  ) : (
                    <Mic className="h-5 w-5 text-black" />
                  )}
                </button>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder={locked ? "Session locked" : "Type Here..."}
                  disabled={transcribing || locked}
                  className="flex-1 px-4 py-3 focus:outline-none text-sm placeholder-gray-500 disabled:bg-gray-50"
                  style={{ minHeight: "44px" }}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleChatSendMessage}
                disabled={!chatMessage.trim() || transcribing || locked}
                size="sm"
                className={`w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white p-0 flex-shrink-0 ${
                  !chatMessage.trim() || transcribing || locked
                    ? "disabled:bg-gray-400"
                    : ""
                }`}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            {locked && (
              <div className="mt-2 text-center text-sm text-red-600 font-semibold">
                Session locked. Please refresh to start again.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this helper function before the handleMicClick function
const removeDuplicateWords = (transcript: string): string => {
  if (!transcript || transcript.trim() === "") return "";

  const words = transcript.trim().split(/\s+/);

  // Step 1: Remove consecutive duplicate words
  const deduplicatedWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      deduplicatedWords.push(words[i]);
    }
  }

  // Step 2: Remove repeating phrases
  // For "How's How's your day How's your day" -> should become "How's your day"

  // Try different phrase lengths (from longest to shortest for better results)
  let result = deduplicatedWords.join(" ");

  // Look for patterns like "A B A B" where A and B can be multiple words
  for (
    let phraseLength = Math.floor(deduplicatedWords.length / 2);
    phraseLength >= 1;
    phraseLength--
  ) {
    let foundPattern = false;

    // Check if we can split the text into two identical halves
    const totalWords = deduplicatedWords.length;
    if (totalWords % 2 === 0 && phraseLength === totalWords / 2) {
      const firstHalf = deduplicatedWords.slice(0, phraseLength);
      const secondHalf = deduplicatedWords.slice(
        phraseLength,
        phraseLength * 2
      );

      // Check if both halves are identical
      const firstHalfStr = firstHalf.join(" ").toLowerCase();
      const secondHalfStr = secondHalf.join(" ").toLowerCase();

      if (firstHalfStr === secondHalfStr) {
        result = firstHalf.join(" ");
        foundPattern = true;
        break;
      }
    }

    // Check for repeating patterns within the text
    if (!foundPattern) {
      for (
        let start = 0;
        start <= deduplicatedWords.length - phraseLength * 2;
        start++
      ) {
        const phrase1 = deduplicatedWords.slice(start, start + phraseLength);
        const phrase2 = deduplicatedWords.slice(
          start + phraseLength,
          start + phraseLength * 2
        );

        const phrase1Str = phrase1.join(" ").toLowerCase();
        const phrase2Str = phrase2.join(" ").toLowerCase();

        if (phrase1Str === phrase2Str && phrase1Str.length > 0) {
          // Found a repeating pattern, remove the duplicate
          const before = deduplicatedWords.slice(0, start + phraseLength);
          const after = deduplicatedWords.slice(start + phraseLength * 2);
          result = [...before, ...after].join(" ");
          foundPattern = true;
          break;
        }
      }
    }

    if (foundPattern) {
      // Re-parse the result for another iteration
      deduplicatedWords.length = 0;
      deduplicatedWords.push(
        ...result.split(/\s+/).filter((word) => word.length > 0)
      );
    }
  }

  // Final cleanup
  return result.replace(/\s+/g, " ").trim();
};
