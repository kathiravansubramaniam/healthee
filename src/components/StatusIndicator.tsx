'use client';

type Status = 'idle' | 'listening' | 'processing' | 'error';

interface StatusIndicatorProps {
  status: Status;
  errorMessage?: string;
}

const statusConfig: Record<Status, { label: string; color: string; bgColor: string }> = {
  idle: {
    label: 'Click to start',
    color: 'text-white/50',
    bgColor: 'bg-white/20',
  },
  listening: {
    label: 'Listening...',
    color: 'text-green-400',
    bgColor: 'bg-green-500/30',
  },
  processing: {
    label: 'Processing...',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/30',
  },
  error: {
    label: 'Error',
    color: 'text-red-400',
    bgColor: 'bg-red-500/30',
  },
};

export function StatusIndicator({ status, errorMessage }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} backdrop-blur-sm`}>
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'listening' ? 'bg-green-400 animate-pulse' :
            status === 'processing' ? 'bg-purple-400 animate-pulse' :
            status === 'error' ? 'bg-red-400' :
            'bg-white/40'
          }`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {errorMessage || config.label}
        </span>
      </div>
    </div>
  );
}
