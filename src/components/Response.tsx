'use client';

import { useState, useEffect } from 'react';

interface ResponseProps {
  text: string;
  isTyping: boolean;
}

export function Response({ text, isTyping }: ResponseProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 30); // Typing speed

      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex]);

  useEffect(() => {
    // Reset when new text comes in
    setCurrentIndex(0);
    setDisplayedText('');
  }, [text]);

  if (!text && !isTyping) return null;

  return (
    <div className="absolute top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="flex-1">
            {isTyping && !text ? (
              <div className="flex gap-1 py-2">
                <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <p className="text-white/90 text-lg leading-relaxed">
                {displayedText}
                {currentIndex < text.length && (
                  <span className="inline-block w-0.5 h-5 bg-white/70 ml-0.5 animate-pulse" />
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
