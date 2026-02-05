'use client';

import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatReturn {
  messages: Message[];
  isProcessing: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

// Hardcoded responses for now - will be replaced with OpenAI API
const RESPONSES = [
  "That's an interesting thought. Could you tell me more about what led you to that?",
  "I understand. It sounds like this is something you've been thinking about. How does it make you feel?",
  "Thank you for sharing that with me. What would you like to explore further?",
  "That's a great question. From what you've described, it seems like there are multiple angles to consider here.",
  "I hear you. Sometimes it helps to break things down into smaller pieces. Where would you like to start?",
  "Fascinating perspective. Have you considered looking at it from a different angle?",
  "I appreciate you being open about this. What outcome are you hoping for?",
  "That makes sense. Let's think through this together. What are the key factors at play here?",
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getRandomResponse(): string {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate API delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;

    await new Promise(resolve => setTimeout(resolve, delay));

    // Add assistant response
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: getRandomResponse(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
  }, [isProcessing]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
  };
}
