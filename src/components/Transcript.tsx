'use client';

interface TranscriptProps {
  text: string;
  interimText: string;
  isVisible: boolean;
}

export function Transcript({ text, interimText, isVisible }: TranscriptProps) {
  const displayText = text + (interimText ? interimText : '');

  if (!isVisible && !displayText) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <p
        className="text-white/80 text-2xl md:text-3xl leading-relaxed text-center max-w-3xl px-8"
        style={{ fontFamily: 'var(--font-jacquarda), serif' }}
      >
        {text}
        {interimText && (
          <span className="text-white/50">{interimText}</span>
        )}
        {!displayText && isVisible && (
          <span className="text-white/30">Listening...</span>
        )}
      </p>
    </div>
  );
}
