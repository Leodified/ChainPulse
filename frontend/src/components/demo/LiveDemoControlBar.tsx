import React from 'react';
import {
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';

interface LifecycleStage {
  id: string;
  label: string;
}

const LIFECYCLE_STAGES: LifecycleStage[] = [
  { id: 'DETECTED', label: 'DETECTED' },
  { id: 'IMPACT', label: 'IMPACT' },
  { id: 'ALTERNATIVES', label: 'ALTERNATIVES' },
  { id: 'PROPOSAL', label: 'PROPOSAL' },
  { id: 'HUMAN_GATE', label: 'HUMAN GATE' },
  { id: 'APPROVED', label: 'APPROVED' },
  { id: 'ACTIVE', label: 'ACTIVE' },
];

function getStageState(stageIdx: number, stepIndex: number): 'completed' | 'current' | 'future' {
  // Mapping stepIndex (1..10) to active lifecycle stage index (0..6):
  // 1, 2 -> 0 (DETECTED)
  // 3 -> 1 (IMPACT)
  // 4 -> 2 (ALTERNATIVES)
  // 5, 6 -> 3 (PROPOSAL)
  // 7 -> 4 (HUMAN GATE)
  // 8 -> 5 (APPROVED)
  // 9, 10 -> 6 (ACTIVE)
  let activeIdx = 0;
  if (stepIndex >= 9) activeIdx = 6;
  else if (stepIndex === 8) activeIdx = 5;
  else if (stepIndex === 7) activeIdx = 4;
  else if (stepIndex >= 5) activeIdx = 3;
  else if (stepIndex === 4) activeIdx = 2;
  else if (stepIndex === 3) activeIdx = 1;
  else activeIdx = 0;

  if (stageIdx < activeIdx) return 'completed';
  if (stageIdx === activeIdx) return 'current';
  return 'future';
}

export function LiveDemoControlBar() {
  const {
    currentStep,
    stepIndex,
    isRunningDemo,
    learningHubProfile,
    runFullDemo,
    approveReroute,
    resetDemo,
  } = useDemo();

  const isHumanGate = currentStep === 'STEP_07_AWAITING_APPROVAL';

  return (
    <div className="bg-[#050813]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 h-[42px] flex items-center justify-between z-20 sticky top-[46px] select-none text-xs font-mono">
      {/* LEFT: Compact Unified Lifecycle Rail */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1 min-w-0">
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider hidden lg:inline mr-1 flex-shrink-0">
          LIFECYCLE:
        </span>

        {LIFECYCLE_STAGES.map((stage, idx) => {
          const status = getStageState(idx, stepIndex);
          const isLast = idx === LIFECYCLE_STAGES.length - 1;
          const isHumanGateCurrent = status === 'current' && stage.id === 'HUMAN_GATE';
          const isActiveCurrent = status === 'current' && stage.id === 'ACTIVE';

          return (
            <div key={stage.id} className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <div
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  status === 'completed'
                    ? 'text-emerald-400 font-semibold'
                    : status === 'current'
                    ? isHumanGateCurrent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      : isActiveCurrent
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                      : 'bg-sky-500/20 text-sky-200 border border-sky-400/40 font-bold shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                    : 'text-slate-600 font-normal'
                }`}
              >
                {status === 'completed' ? (
                  <Check size={10} className="text-emerald-400 stroke-[2.5]" />
                ) : status === 'current' ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHumanGateCurrent
                        ? 'bg-amber-400 animate-pulse'
                        : isActiveCurrent
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-sky-400 animate-pulse'
                    }`}
                  />
                ) : null}
                <span className="tracking-wide text-[9px] sm:text-[10px]">{stage.label}</span>
              </div>

              {!isLast && (
                <span
                  className={`text-[9px] font-mono select-none ${
                    status === 'completed' ? 'text-emerald-500/60' : 'text-slate-700'
                  }`}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* RIGHT: Compact Demo Controls & Secondary SAP Context */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pl-2">
        {/* Action Button: Run Demo vs Authorize */}
        {isHumanGate ? (
          <button
            onClick={approveReroute}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-[10px] sm:text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_14px_rgba(245,158,11,0.35)] cursor-pointer"
          >
            <Zap size={11} className="fill-slate-950" />
            <span>APPROVE REROUTE</span>
          </button>
        ) : (
          <button
            onClick={runFullDemo}
            disabled={isRunningDemo}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isRunningDemo
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 cursor-wait'
                : 'bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300'
            }`}
          >
            {isRunningDemo ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>STEP 0{stepIndex}...</span>
              </>
            ) : (
              <>
                <Play size={10} className="fill-sky-400 text-sky-400" />
                <span>RUN DEMO</span>
              </>
            )}
          </button>
        )}

        {/* Reset Control */}
        <button
          onClick={resetDemo}
          title="Reset Disruption Demo Sequence"
          className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors border border-white/[0.06] cursor-pointer"
        >
          <RotateCcw size={12} />
        </button>

        {/* SAP Learning Hub Demo Context indicator */}
        <div
          className="hidden xl:flex items-center gap-1.5 text-[9px] font-mono border-l border-white/[0.08] pl-2.5 py-0.5 text-slate-500"
          title={`Operator: ${learningHubProfile.studentName} (${learningHubProfile.institution}) · Simulated Credential`}
        >
          <ShieldCheck size={11} className="text-slate-400" />
          <span className="text-slate-400">SAP LEARNING HUB</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400/90 font-medium">DEMO CONTEXT</span>
        </div>
      </div>
    </div>
  );
}
