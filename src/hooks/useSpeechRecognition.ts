'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  isRecognizing: boolean;
  startRecognition: () => void;
  stopRecognition: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);

        // Reset silence timeout on any speech activity
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Map error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          'network': 'Network error - check your internet connection',
          'not-allowed': 'Microphone access denied',
          'no-speech': '', // Ignore - expected during silence
          'audio-capture': 'No microphone found',
          'aborted': 'Speech recognition stopped',
        };

        const errorMsg = errorMessages[event.error] ?? event.error;

        if (errorMsg) {
          setError(errorMsg);
          console.error('Speech recognition error:', event.error);

          // Clear error after 5 seconds
          setTimeout(() => setError(null), 5000);
        }
      };

      recognition.onend = () => {
        setIsRecognizing(false);
        setInterimTranscript('');
      };

      recognition.onstart = () => {
        setIsRecognizing(true);
        setError(null);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const startRecognition = useCallback(() => {
    if (recognitionRef.current && !isRecognizing) {
      try {
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        // Recognition might already be started
        console.warn('Recognition start warning:', err);
      }
    }
  }, [isRecognizing]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isRecognizing) {
      recognitionRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  }, [isRecognizing]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    isRecognizing,
    startRecognition,
    stopRecognition,
    resetTranscript,
    error,
    isSupported,
  };
}
