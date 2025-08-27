"use client";

import React, { useState, useRef } from "react";
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
            {transcribing && (
              <div className="bg-white border-2 border-red-500 rounded-full px-6 py-3 max-w-[320px]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-gray-800">Transcribing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              {/* Input Field with Mic inside */}
              <div className="flex-1 relative flex items-center border-2 border-red-400 rounded-full px-2 py-1 overflow-hidden">
                <button
                  onClick={handleMicClick}
                  disabled={transcribing}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    transcribing
                      ? "bg-gray-400"
                      : recording
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                >
                  {transcribing ? (
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
                  placeholder={
                    transcribing ? "Transcribing..." : "Type Here..."
                  }
                  disabled={transcribing}
                  className="flex-1 px-4 py-3 focus:outline-none text-sm placeholder-gray-500 disabled:bg-gray-50"
                  style={{ minHeight: "44px" }}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleChatSendMessage}
                disabled={!chatMessage.trim() || transcribing}
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
