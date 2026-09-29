import { clsx } from 'clsx';

type StatusType = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN';

const STATUS_CLASSES: Record<StatusType, string> = {
  ONLINE: 'bg-emerald-400',
  OFFLINE: 'bg-rose-400',
  DEGRADED: 'bg-amber-400',
  UNKNOWN: 'bg-slate-400',
};

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
  pulse?: boolean;
}

export function StatusIndicator({ status, label, className, pulse = true }: StatusIndicatorProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', STATUS_CLASSES[status], pulse && status === 'ONLINE' && 'animate-pulse')} />
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
}
