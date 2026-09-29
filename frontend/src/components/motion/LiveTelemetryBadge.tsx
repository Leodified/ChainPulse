import React from 'react';
import { StatusBeacon, BeaconVariant } from './StatusBeacon';

interface LiveTelemetryBadgeProps {
  label: string;
  statusText?: string;
  variant?: BeaconVariant;
  icon?: React.ReactNode;
  className?: string;
}

export function LiveTelemetryBadge({
  label,
  statusText,
  variant = 'info',
  icon,
  className = '',
}: LiveTelemetryBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#070d1a]/90 border border-white/[0.08] backdrop-blur-md text-xs font-mono select-none ${className}`}
    >
      <StatusBeacon variant={variant} size="sm" />
      {icon && <span className="text-slate-400">{icon}</span>}
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
      {statusText && (
        <>
          <span className="text-slate-600">/</span>
          <span className="text-[10px] font-bold text-slate-200">{statusText}</span>
        </>
      )}
    </div>
  );
}

export default LiveTelemetryBadge;
