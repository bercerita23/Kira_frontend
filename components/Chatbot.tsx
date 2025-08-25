"use client";
import { useState } from "react";
import { X, Mic, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  console.log("Chatbot rendered with isOpen:", isOpen);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Ask KIRA! I love questions about [topic that week]!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        isBot: false,
        timestamp: new Date(),
      },
    ]);

    setMessage("");

    // Simulate bot response (placeholder)
    setTimeout(() => {
      setMessages((prev) => [
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    console.log("Chatbot not rendering because isOpen is false");
    return null;
  }

  console.log("Chatbot should be visible now");

  // Temporary simple test version
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <h2>Chatbot Test</h2>
        <p>If you can see this, the chatbot is working!</p>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
