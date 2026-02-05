'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useChat } from '@/hooks/useChat';
import { Transcript } from '@/components/Transcript';
import { Response } from '@/components/Response';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ThemeName } from '@/lib/shaders';

// Dynamic import for Three.js scene to avoid SSR issues
const BlobScene = dynamic(
  () => import('@/components/BlobScene').then(mod => ({ default: mod.BlobScene })),
  { ssr: false }
);

type AppStatus = 'idle' | 'listening' | 'processing' | 'error';

export default function Home() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [lastResponse, setLastResponse] = useState('');
  const [theme, setTheme] = useState<ThemeName>('krea');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef('');

  const {
    audioIntensity,
    isListening: isAudioListening,
    startListening: startAudio,
    stopListening: stopAudio,
    error: audioError,
  } = useAudioAnalyzer();

  const {
    transcript,
    interimTranscript,
    isRecognizing,
    startRecognition,
    stopRecognition,
    resetTranscript,
    error: speechError,
    isSupported: speechSupported,
  } = useSpeechRecognition();

  const { messages, isProcessing, sendMessage } = useChat();

  // Get the latest assistant response
  useEffect(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length > 0) {
      setLastResponse(assistantMessages[assistantMessages.length - 1].content);
    }
  }, [messages]);

  // Update status based on state
  useEffect(() => {
    if (audioError || speechError) {
      setStatus('error');
    } else if (isProcessing) {
      setStatus('processing');
    } else if (isRecognizing && isAudioListening) {
      setStatus('listening');
    } else {
      setStatus('idle');
    }
  }, [isProcessing, isRecognizing, isAudioListening, audioError, speechError]);

  // Voice Activity Detection - detect silence and send message
  useEffect(() => {
    // Clear existing timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    // If we have a transcript and audio is quiet, start silence timer
    const currentTranscript = transcript + interimTranscript;

    if (currentTranscript && isRecognizing && audioIntensity < 0.05) {
      silenceTimeoutRef.current = setTimeout(() => {
        // Only send if transcript has changed
        if (transcript && transcript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = transcript;
          stopRecognition();
          sendMessage(transcript);
          resetTranscript();
        }
      }, 1500); // 1.5 second silence threshold
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [transcript, interimTranscript, audioIntensity, isRecognizing, sendMessage, stopRecognition, resetTranscript]);

  // Auto-restart recognition after response is shown
  useEffect(() => {
    if (!isProcessing && status === 'idle' && isAudioListening && !isRecognizing) {
      // Small delay before restarting recognition
      const timeout = setTimeout(() => {
        startRecognition();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isProcessing, status, isAudioListening, isRecognizing, startRecognition]);

  const handleStart = useCallback(async () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    await startAudio();
    startRecognition();
    setLastResponse('');
    lastTranscriptRef.current = '';
  }, [startAudio, startRecognition, speechSupported]);

  const handleStop = useCallback(() => {
    stopAudio();
    stopRecognition();
    setStatus('idle');
  }, [stopAudio, stopRecognition]);

  const handleClick = useCallback(() => {
    if (status === 'idle' && !isAudioListening) {
      handleStart();
    } else if (status !== 'processing') {
      handleStop();
    }
  }, [status, isAudioListening, handleStart, handleStop]);

  const errorMessage = audioError || speechError || undefined;

  return (
    <main
      className="relative w-full h-screen cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Theme toggle button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTheme(theme === 'krea' ? 'bonobo' : 'krea');
          }}
          className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium hover:bg-white/20 transition-colors border border-white/20"
        >
          {theme === 'krea' ? 'Krea' : 'Bonobo'}
        </button>
      </div>

      {/* Glow behind blob */}
      <div className={`absolute inset-0 ${theme === 'krea' ? 'krea-glow' : 'bonobo-glow'} pointer-events-none z-0`} />

      {/* Three.js Background */}
      <div className="absolute inset-0 z-10">
        <BlobScene audioIntensity={audioIntensity} theme={theme} />
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 gradient-overlay pointer-events-none z-20" />

      {/* AI Response at top */}
      <Response text={lastResponse} isTyping={isProcessing} />

      {/* User transcript at bottom */}
      <Transcript
        text={transcript}
        interimText={interimTranscript}
        isVisible={isRecognizing}
      />

      {/* Status indicator */}
      <StatusIndicator status={status} errorMessage={errorMessage} />

      {/* Instructions overlay when idle */}
      {status === 'idle' && !isAudioListening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-white/30 text-lg mb-2">Click anywhere to start</p>
            <p className="text-white/20 text-sm">Speak and the blob will react to your voice</p>
          </div>
        </div>
      )}
    </main>
  );
}
