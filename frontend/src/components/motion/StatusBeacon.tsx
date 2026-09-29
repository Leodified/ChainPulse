import React from 'react';

export type BeaconVariant = 'critical' | 'warning' | 'info' | 'success' | 'ai' | 'neutral';

interface StatusBeaconProps {
  variant?: BeaconVariant;
  size?: 'sm' | 'md' | 'lg';
  ping?: boolean;
  label?: string;
  className?: string;
}

const COLOR_MAP: Record<BeaconVariant, { ping: string; core: string; glow: string; text: string }> = {
  critical: {
    ping: 'bg-rose-400',
    core: 'bg-rose-500',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
    text: 'text-rose-300',
  },
  warning: {
    ping: 'bg-amber-400',
    core: 'bg-amber-500',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    text: 'text-amber-300',
  },
  info: {
    ping: 'bg-cyan-400',
    core: 'bg-cyan-500',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    text: 'text-cyan-300',
  },
  success: {
    ping: 'bg-emerald-400',
    core: 'bg-emerald-500',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    text: 'text-emerald-300',
  },
  ai: {
    ping: 'bg-purple-400',
    core: 'bg-purple-500',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    text: 'text-purple-300',
  },
  neutral: {
    ping: 'bg-slate-400',
    core: 'bg-slate-500',
    glow: 'shadow-[0_0_8px_rgba(148,163,184,0.4)]',
    text: 'text-slate-400',
  },
};

const SIZE_MAP = {
  sm: { container: 'w-2 h-2', ping: 'h-2 w-2', core: 'h-1.5 w-1.5' },
  md: { container: 'w-2.5 h-2.5', ping: 'h-2.5 w-2.5', core: 'h-2 w-2' },
  lg: { container: 'w-3.5 h-3.5', ping: 'h-3.5 w-3.5', core: 'h-2.5 w-2.5' },
};

export function StatusBeacon({
  variant = 'info',
  size = 'md',
  ping = true,
  label,
  className = '',
}: StatusBeaconProps) {
  const colors = COLOR_MAP[variant];
  const sizes = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`relative flex items-center justify-center ${sizes.container}`}>
        {ping && (
          <span
            className={`animate-ping absolute inline-flex ${sizes.ping} rounded-full opacity-75 ${colors.ping}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${sizes.core} ${colors.core} ${colors.glow}`}
        />
      </span>
      {label && <span className={`text-xs font-mono font-medium ${colors.text}`}>{label}</span>}
    </span>
  );
}

export default StatusBeacon;
