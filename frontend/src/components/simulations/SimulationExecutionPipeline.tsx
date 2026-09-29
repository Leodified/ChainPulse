import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Cpu,
  Flame,
  Layers,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';

interface PipelineStep {
  id: string;
  stage: string;
  title: string;
  metric: string;
  sublabel: string;
  status: 'critical' | 'warning' | 'info' | 'success';
}

const STEPS: PipelineStep[] = [
  {
    id: 'step-input',
    stage: '01. INPUT STATE',
    title: 'Disruption Vector',
    metric: '35% Cap · 847 Ships',
    sublabel: 'Singapore MPA Telemetry',
    status: 'critical',
  },
  {
    id: 'step-scenarios',
    stage: '02. SCENARIOS',
    title: 'Temporal Horizons',
    metric: '7D · 30D · 60D',
    sublabel: 'Multi-Horizon Branching',
    status: 'info',
  },
  {
    id: 'step-montecarlo',
    stage: '03. MONTE CARLO',
    title: 'Stochastic Solver',
    metric: '10,000 Iterations',
    sublabel: 'Lead-Time Variance Model',
    status: 'warning',
  },
  {
    id: 'step-constraints',
    stage: '04. CONSTRAINTS',
    title: 'BOM Stockout',
    metric: 'Day 7 Exhaustion',
    sublabel: 'Frankfurt Throttled 70%',
    status: 'critical',
  },
  {
    id: 'step-recovery',
    stage: '05. OPTIMIZATION',
    title: 'Strategy Engine',
    metric: '3 Competing Paths',
    sublabel: 'Cost / Time / Carbon Solver',
    status: 'info',
  },
  {
    id: 'step-distribution',
    stage: '06. CONVERGENCE',
    title: 'Exposure Envelope',
    metric: '$28.3M Modeled Max',
    sublabel: 'Deterministic Ceiling',
    status: 'critical',
  },
  {
    id: 'step-decision',
    stage: '07. DECISION',
    title: 'Recommendation',
    metric: 'Human Approval Req.',
    sublabel: 'Strategy B Air Expedite',
    status: 'success',
  },
];

export function SimulationExecutionPipeline({
  onRunSimulation,
}: {
  onRunSimulation?: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [iterations, setIterations] = useState(10000);
  const [convergencePct, setConvergencePct] = useState(100);

  const startSimulation = () => {
    setIsRunning(true);
    setActiveStep(0);
    setIterations(0);
    setConvergencePct(12);

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep >= STEPS.length) {
        clearInterval(stepInterval);
        setIsRunning(false);
        setIterations(10000);
        setConvergencePct(100);
        if (onRunSimulation) onRunSimulation();
      } else {
        setActiveStep(currentStep);
        setIterations(Math.min(10000, Math.round((currentStep / 6) * 10000)));
        setConvergencePct(Math.min(100, Math.round((currentStep / 6) * 100)));
      }
    }, 280);
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#080f20] via-[#050914] to-[#03060d] border border-cyan-500/25 p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu size={16} className={isRunning ? 'animate-spin' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                SIMULATION ENGINE // COUNTERFACTUAL EXECUTION PIPELINE
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  isRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isRunning ? 'EXECUTING MONTE CARLO...' : 'CONVERGED (10,000 RUNS)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Evaluating component buffer run-out against 3 alternative mitigation vectors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#070d1a] border border-white/[0.08] text-xs font-mono">
            <span className="text-slate-400 text-[10px] uppercase">Iterations:</span>
            <span className="text-cyan-400 font-bold">{iterations.toLocaleString()}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[10px] uppercase">Convergence:</span>
            <span className="text-emerald-400 font-bold">{convergencePct}%</span>
          </div>

          <button
            onClick={startSimulation}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <Play size={13} className={isRunning ? 'animate-spin' : ''} />
            <span>{isRunning ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Stepped Interactive Visual Flow */}
      <div className="relative z-10 pt-4 overflow-x-auto pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 min-w-[700px]">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            const isCompleted = activeStep > idx || (!isRunning && convergencePct === 100);

            let borderClass = 'border-white/10 bg-[#070d18] text-slate-400';
            if (isActive) {
              borderClass = 'border-cyan-400 bg-[#0c1f38] text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]';
            } else if (isCompleted) {
              borderClass = 'border-emerald-500/40 bg-[#061414] text-slate-200';
            }

            return (
              <div
                key={step.id}
                className={`relative rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between ${borderClass}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[9px] font-mono font-bold tracking-wider opacity-75">
                    {step.stage}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-cyan-400 animate-ping'
                        : isCompleted
                        ? 'bg-emerald-400'
                        : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div className="text-xs font-bold font-mono tracking-tight truncate leading-snug">
                  {step.title}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 font-mono">
                  {step.sublabel}
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 text-[8px] uppercase">VALUE:</span>
                  <span
                    className={`font-bold ${
                      step.status === 'critical'
                        ? 'text-rose-400'
                        : step.status === 'warning'
                        ? 'text-amber-400'
                        : step.status === 'success'
                        ? 'text-emerald-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {step.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
