import React, { useState } from 'react';
import { ChevronRight, Radio } from 'lucide-react';
import { StatusBeacon } from './StatusBeacon';

export interface CascadeStep {
  id: string;
  stage: string;
  name: string;
  metric: string;
  severity: 'critical' | 'warning' | 'normal';
  detail?: string;
}

interface DataCascadeProps {
  steps?: CascadeStep[];
  activeStepIndex?: number;
  interactive?: boolean;
  onStepClick?: (step: CascadeStep, index: number) => void;
  className?: string;
}

const DEFAULT_CASCADE: CascadeStep[] = [
  {
    id: 'step-1',
    stage: '01. DISRUPTION',
    name: 'Singapore Port',
    metric: '-65% Throughput',
    severity: 'critical',
    detail: 'Typhoon aftermath · 847 vessels in queue',
  },
  {
    id: 'step-2',
    stage: '02. LOGISTICS',
    name: 'Malacca Strait',
    metric: '+12d Delay',
    severity: 'critical',
    detail: 'Feeder corridor transshipment blocked',
  },
  {
    id: 'step-3',
    stage: '03. SUPPLIERS',
    name: '4 Vendors Exposed',
    metric: 'Penang & TW',
    severity: 'warning',
    detail: 'Silicon component dispatch halted',
  },
  {
    id: 'step-4',
    stage: '04. MATERIALS',
    name: '7 Critical BOMs',
    metric: '5.2d Runway',
    severity: 'warning',
    detail: 'Safety stock buffer approaching exhaustion',
  },
  {
    id: 'step-5',
    stage: '05. FACTORIES',
    name: 'Frankfurt Hub',
    metric: '70% Assembly',
    severity: 'warning',
    detail: '68 global plants throttle operations',
  },
  {
    id: 'step-6',
    stage: '06. ORDERS',
    name: '22 Purchase Orders',
    metric: '3 Clients at Risk',
    severity: 'critical',
    detail: 'Deutsche Telekom, Siemens, Bosch',
  },
  {
    id: 'step-7',
    stage: '07. EXPOSURE',
    name: 'Max Financial Risk',
    metric: '$28.3M USD',
    severity: 'critical',
    detail: '60-day modeled revenue horizon',
  },
];

export function DataCascade({
  steps = DEFAULT_CASCADE,
  activeStepIndex,
  interactive = true,
  onStepClick,
  className = '',
}: DataCascadeProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className={`w-full overflow-x-auto pb-2 select-none ${className}`}>
      <div className="flex items-center gap-1.5 min-w-[780px]">
        {steps.map((step, idx) => {
          const isActive = activeStepIndex === idx;
          const isHovered = hoveredIdx === idx;
          const isCritical = step.severity === 'critical';
          const isWarning = step.severity === 'warning';

          const borderCol = isCritical
            ? 'border-rose-500/30 hover:border-rose-400'
            : isWarning
            ? 'border-amber-500/30 hover:border-amber-400'
            : 'border-sky-500/30 hover:border-sky-400';

          const bgCol = isActive
            ? isCritical
              ? 'bg-rose-500/15 ring-1 ring-rose-500/40'
              : 'bg-amber-500/15 ring-1 ring-amber-500/40'
            : isHovered
            ? 'bg-white/[0.06]'
            : 'bg-[#080e1c]/80';

          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => interactive && onStepClick?.(step, idx)}
                onMouseEnter={() => interactive && setHoveredIdx(idx)}
                onMouseLeave={() => interactive && setHoveredIdx(null)}
                className={`flex-1 p-2.5 rounded-xl border ${borderCol} ${bgCol} transition-all duration-200 cursor-pointer flex flex-col justify-between min-w-[105px] group`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                    {step.stage}
                  </span>
                  <StatusBeacon
                    variant={isCritical ? 'critical' : isWarning ? 'warning' : 'info'}
                    size="sm"
                    ping={isActive}
                  />
                </div>

                <div className="font-mono text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                  {step.name}
                </div>

                <div
                  className={`text-[10px] font-mono font-semibold mt-1 truncate ${
                    isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-sky-400'
                  }`}
                >
                  {step.metric}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <ChevronRight
                  size={12}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-rose-400 animate-pulse' : 'text-slate-600'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default DataCascade;
