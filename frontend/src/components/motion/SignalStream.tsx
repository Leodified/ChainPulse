import React from 'react';

interface SignalStreamProps {
  status?: 'critical' | 'warning' | 'normal' | 'ai';
  speed?: 'normal' | 'fast';
  label?: string;
  className?: string;
}

export function SignalStream({
  status = 'normal',
  speed = 'normal',
  label,
  className = '',
}: SignalStreamProps) {
  const colorMap = {
    critical: { line: '#f43f5e', text: 'text-rose-400' },
    warning: { line: '#f59e0b', text: 'text-amber-400' },
    normal: { line: '#38bdf8', text: 'text-sky-400' },
    ai: { line: '#c084fc', text: 'text-purple-400' },
  };

  const { line, text } = colorMap[status];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {label && <span className={`text-[10px] font-mono font-semibold uppercase ${text}`}>{label}</span>}
      <svg className="h-2 w-full max-w-[120px]" fill="none">
        <line
          x1="0"
          y1="4"
          x2="100%"
          y2="4"
          stroke={line}
          strokeWidth="2"
          strokeOpacity="0.8"
          strokeDasharray="4 4"
          className={speed === 'fast' ? 'animate-signal-flow-fast' : 'animate-signal-flow'}
        />
      </svg>
    </div>
  );
}

export default SignalStream;
