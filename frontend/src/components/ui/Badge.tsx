import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'neutral' | 'cyan';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  high: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  neutral: 'bg-white/5 text-slate-400 border-white/10',
  cyan: 'bg-cp-cyan/10 text-cp-cyan border-cp-cyan/30',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ children, variant = 'neutral', className, dot, pulse }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', pulse && 'animate-pulse',
          variant === 'critical' || variant === 'high' ? 'bg-rose-400' :
          variant === 'medium' ? 'bg-amber-400' :
          variant === 'low' || variant === 'success' ? 'bg-emerald-400' :
          variant === 'cyan' ? 'bg-cp-cyan' : 'bg-slate-400'
        )} />
      )}
      {children}
    </span>
  );
}
