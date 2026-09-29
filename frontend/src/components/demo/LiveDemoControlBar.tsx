import React from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Zap,
  ArrowRight,
  Radio,
  FileCheck,
  Check,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { StatusBeacon } from '../motion';

const STEPS = [
  { key: 'STEP_01_DISRUPTION_DETECTED', num: '01', label: 'Disruption' },
  { key: 'STEP_02_SWARM_ANALYZING', num: '02', label: 'Swarm' },
  { key: 'STEP_03_IMPACT_PROPAGATED', num: '03', label: 'Impact' },
  { key: 'STEP_04_ALTERNATIVES_GENERATED', num: '04', label: 'Alternates' },
  { key: 'STEP_05_REROUTE_PROPOSED', num: '05', label: 'Proposal (Amber)' },
  { key: 'STEP_06_AUDIT_LOGGED', num: '06', label: 'Audit Log' },
  { key: 'STEP_07_AWAITING_APPROVAL', num: '07', label: 'Human Gate' },
  { key: 'STEP_08_APPROVAL_GRANTED', num: '08', label: 'Approved' },
  { key: 'STEP_09_ROUTE_ACTIVATED', num: '09', label: 'Active (Green)' },
  { key: 'STEP_10_AUDIT_SEALED', num: '10', label: 'Sealed' },
];

export function LiveDemoControlBar() {
  const {
    currentStep,
    stepIndex,
    rerouteState,
    isRunningDemo,
    learningHubProfile,
    runFullDemo,
    approveReroute,
    resetDemo,
  } = useDemo();

  const isHumanGate = currentStep === 'STEP_07_AWAITING_APPROVAL';
  const isActive = rerouteState === 'ACTIVE';
  const isProposed = rerouteState === 'PROPOSED';

  return (
    <div className="bg-[#050914] border-b border-white/[0.08] px-3 sm:px-6 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] z-20 sticky top-[48px] select-none">
      <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Showcase Title & Current State Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              ROUND 2 GRAND FINALE
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] font-mono font-bold text-slate-200">
              AUTONOMOUS REROUTING & GOVERNANCE
            </span>
          </div>

          {/* Current Reroute State Pill */}
          <div className="flex items-center gap-1.5">
            {rerouteState === 'BLOCKED' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                <StatusBeacon variant="critical" size="sm" />
                MARITIME CORRIDOR BLOCKED
              </span>
            )}
            {rerouteState === 'PROPOSED' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse">
                <StatusBeacon variant="warning" size="sm" ping />
                AI PROPOSAL: AMBER (CANDIDATE)
              </span>
            )}
            {rerouteState === 'APPROVED' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1">
                <StatusBeacon variant="info" size="sm" />
                OPERATOR AUTHORIZED
              </span>
            )}
            {rerouteState === 'ACTIVE' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <StatusBeacon variant="success" size="sm" ping />
                REROUTE ACTIVE: GREEN (AIR BRIDGE)
              </span>
            )}
          </div>
        </div>

        {/* Center: 10-Step Visual Flow Progress Rail */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {STEPS.map((s, idx) => {
            const stepNum = idx + 1;
            const isCurrent = stepIndex === stepNum;
            const isCompleted = stepIndex > stepNum;

            return (
              <div key={s.key} className="flex items-center gap-1">
                <div
                  className={`px-2 py-1 rounded text-[9px] font-mono flex items-center gap-1 transition-all ${
                    isCurrent
                      ? isHumanGate
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse'
                        : isActive
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-sky-500/25 text-sky-200 border border-sky-400 font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                      : isCompleted
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/[0.04]'
                  }`}
                >
                  <span>{s.num}</span>
                  <span className="hidden xl:inline">{s.label}</span>
                  {isCompleted && <Check size={10} className="text-emerald-400" />}
                </div>
                {idx < STEPS.length - 1 && (
                  <span className="text-slate-700 text-[10px]">›</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Primary Interactive Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* SAP Learning Hub Verified Operator Badge */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/40 border border-sky-500/20 text-[10px] font-mono text-slate-300">
            <ShieldCheck size={12} className="text-sky-400" />
            <span>SAP Learning Hub:</span>
            <span className="text-sky-300 font-bold">{learningHubProfile.studentName}</span>
            <span className="text-emerald-400 text-[9px]">✓ Certified</span>
          </div>

          {/* Action Button: Run Demo vs Authorize vs Active */}
          {isHumanGate ? (
            <button
              onClick={approveReroute}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.6)] animate-bounce cursor-pointer"
            >
              <Zap size={14} className="fill-slate-950" />
              <span>APPROVE & ACTIVATE REROUTE (HUMAN GATE)</span>
            </button>
          ) : (
            <button
              onClick={runFullDemo}
              disabled={isRunningDemo}
              className={`px-4 py-1.5 rounded-xl text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.4)] cursor-pointer ${
                isRunningDemo
                  ? 'bg-sky-400/80 cursor-wait'
                  : 'bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400'
              }`}
            >
              {isRunningDemo ? (
                <>
                  <Radio size={13} className="animate-spin text-slate-950" />
                  <span>STEP 0{stepIndex} IN PROGRESS...</span>
                </>
              ) : (
                <>
                  <Play size={13} className="fill-slate-950" />
                  <span>RUN LIVE DISRUPTION DEMO</span>
                </>
              )}
            </button>
          )}

          {/* Reset Control */}
          <button
            onClick={resetDemo}
            title="Reset Disruption Demo Sequence"
            className="p-1.5 rounded-xl bg-[#090f1e] border border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
