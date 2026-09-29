import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Radio } from 'lucide-react';
import { StatusBeacon } from './StatusBeacon';

interface ComputationSequenceProps {
  isRunning: boolean;
  stages?: string[];
  durationMs?: number;
  onComplete?: () => void;
  title?: string;
  className?: string;
}

const DEFAULT_STAGES = [
  'Ingesting SAP S/4HANA Purchase Orders & AIS Maritime Feeds...',
  'Executing Multi-Tier Stochastic Buffer Constraint Model...',
  'Calculating Monte Carlo Exposure & Scope-3 Carbon Curves...',
  'Synthesizing Optimal Trade-Off Frontier...',
  'Simulation Converged · Deterministic Scenario Ready.',
];

export function ComputationSequence({
  isRunning,
  stages = DEFAULT_STAGES,
  durationMs = 2400,
  onComplete,
  title = 'Computational Intelligence Engine',
  className = '',
}: ComputationSequenceProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      setProgress(100);
      setCurrentStageIdx(stages.length - 1);
      return;
    }

    setProgress(0);
    setCurrentStageIdx(0);

    const stepInterval = durationMs / stages.length;
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepInterval);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          onComplete?.();
          return 100;
        }
        return prev + 4;
      });
    }, durationMs / 25);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isRunning, durationMs, stages.length, onComplete]);

  return (
    <div
      className={`p-4 rounded-xl bg-[#070d1a] border border-cyan-500/30 shadow-[0_0_24px_rgba(6,182,212,0.15)] space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Radio size={14} className="text-cyan-400 animate-spin" />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400" />
          )}
          <span className="font-bold text-slate-100 uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBeacon variant={isRunning ? 'ai' : 'success'} size="sm" />
          <span className={`font-mono ${isRunning ? 'text-cyan-300' : 'text-emerald-300'}`}>
            {isRunning ? `${Math.min(progress, 99)}% COMPUTING` : 'COMPLETE'}
          </span>
        </div>
      </div>

      {/* Progress Bar with Moving Scan Glow */}
      <div className="relative w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-purple-500 transition-all duration-150 rounded-full"
          style={{ width: `${progress}%` }}
        />
        {isRunning && (
          <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Current Stage Telemetry Log */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="truncate text-cyan-200">
          ● {stages[currentStageIdx] || stages[stages.length - 1]}
        </span>
        <span className="text-slate-500 shrink-0 ml-2">
          Stage {currentStageIdx + 1}/{stages.length}
        </span>
      </div>
    </div>
  );
}

export default ComputationSequence;
