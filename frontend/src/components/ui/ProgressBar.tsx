interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const COLOR_CLASSES = {
  cyan: 'bg-cp-cyan',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
};

export function ProgressBar({ value, max = 100, color = 'cyan', size = 'md', showLabel, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div className={`flex-1 bg-white/5 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all ${COLOR_CLASSES[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-slate-400 w-10 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
