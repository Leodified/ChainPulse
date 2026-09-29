import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  TrendingDown,
  Layers,
  Zap,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';

interface FlowStage {
  id: string;
  stage: string;
  label: string;
  cost: number; // in Millions USD
  costDisplay: string;
  account: string;
  detail: string;
  x: number; // percentage
  status: 'warning' | 'critical';
}

const FLOW_STAGES: FlowStage[] = [
  {
    id: 'f-logistics',
    stage: '01. LOGISTICS ESCALATION',
    label: 'Demurrage & Reroute',
    cost: 1.8,
    costDisplay: '+$1.8M',
    account: 'GL 621000 (Freight Inward)',
    detail: 'Port congestion berth demurrage + feeder diversion fees to Port Klang & Tanjung Pelepas.',
    x: 14,
    status: 'warning',
  },
  {
    id: 'f-inventory',
    stage: '02. BUFFER BURN',
    label: 'Safety Stock Depletion',
    cost: 3.2,
    costDisplay: '+$3.2M',
    account: 'GL 130100 (Raw Material Buffer)',
    detail: 'Depletion of raw component reserves at European central hub, requiring high-cost buffer replenishments.',
    x: 32,
    status: 'warning',
  },
  {
    id: 'f-production',
    stage: '03. PRODUCTION THROTTLING',
    label: '68 Plants at 70%',
    cost: 8.7,
    costDisplay: '+$8.7M',
    account: 'GL 510000 (Direct Labor & Overhead)',
    detail: 'Unabsorbed fixed plant overhead caused by assembly lines running at 30% reduced speed.',
    x: 50,
    status: 'warning',
  },
  {
    id: 'f-sla',
    stage: '04. SLA BREACH CLAUSES',
    label: 'Contractual Penalties',
    cost: 4.1,
    costDisplay: '+$4.1M',
    account: 'GL 680200 (Contract Non-Compliance)',
    detail: 'Guaranteed customer delivery SLA penalties triggered on Tier-1 enterprise accounts.',
    x: 68,
    status: 'critical',
  },
  {
    id: 'f-revenue',
    stage: '05. ORDER BOOK AT RISK',
    label: '22 Purchase Orders',
    cost: 22.4,
    costDisplay: '$22.4M',
    account: 'GL 400100 (Sales Revenue)',
    detail: 'Direct revenue exposure for committed purchase orders within the 30-day stockout window.',
    x: 84,
    status: 'critical',
  },
];

export function FinancialExposureFlow() {
  const [selectedStage, setSelectedStage] = useState<FlowStage>(FLOW_STAGES[4]);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#091122] via-[#050a16] to-[#03060e] border border-amber-500/25 p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                FINANCIAL EXPOSURE CASCADE // ACCUMULATION FLOW
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MAX: $28.3M
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Deterministic propagation of port delay into corporate balance sheet exposure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>TERMINAL CEILING:</span>
          <span className="text-rose-400 font-bold">$28,300,000 USD</span>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="relative z-10 w-full h-[280px] sm:h-[320px] my-3 select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="goldFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Continuous Money Flow Pipe */}
          <path
            d="M 5 50 C 25 50, 25 50, 50 50 C 75 50, 75 50, 95 50"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />

          {/* Traveling Golden Cashflow Particles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <circle key={i} r="1.1" fill="#fbbf24" opacity="0.95">
              <animateMotion
                path="M 5 50 L 95 50"
                dur={`${2.2 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>

        {/* Origin: Disruption Bottleneck */}
        <div
          style={{ left: '5%', top: '50%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-20 p-2.5 rounded-xl bg-[#14060c] border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] text-center flex flex-col items-center min-w-[90px]"
        >
          <span className="text-[8px] font-mono text-rose-400 font-bold uppercase">ORIGIN</span>
          <span className="text-[11px] font-bold text-white font-mono leading-tight mt-0.5">
            Singapore
          </span>
          <span className="text-[8px] font-mono text-rose-300">Congestion</span>
        </div>

        {/* Stages */}
        {FLOW_STAGES.map((st) => {
          const isSelected = selectedStage.id === st.id;
          const isHovered = hoveredStageId === st.id;

          return (
            <div
              key={st.id}
              onClick={() => setSelectedStage(st)}
              onMouseEnter={() => setHoveredStageId(st.id)}
              onMouseLeave={() => setHoveredStageId(null)}
              style={{ left: `${st.x}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
              className={`absolute cursor-pointer transition-all duration-200 p-2.5 sm:p-3 rounded-xl border backdrop-blur-md z-20 flex flex-col justify-between w-[125px] sm:w-[145px] ${
                isSelected || isHovered
                  ? 'border-amber-400 bg-[#161208]/95 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-[1.05]'
                  : 'border-white/10 bg-[#070e1a]/90 text-slate-300 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[8px] font-mono font-bold text-amber-400 truncate">
                  {st.stage}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>

              <div className="text-[11px] font-bold text-white font-mono truncate leading-tight">
                {st.label}
              </div>

              <div className="mt-2 pt-1 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500 text-[8px] uppercase">IMPACT:</span>
                <span className="font-bold text-amber-300">{st.costDisplay}</span>
              </div>
            </div>
          );
        })}

        {/* Terminal Exposure Cap */}
        <div
          style={{ left: '96%', top: '50%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-20 p-2.5 sm:p-3 rounded-xl bg-[#180509] border border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.45)] text-center flex flex-col items-center min-w-[95px]"
        >
          <span className="text-[8px] font-mono text-rose-400 font-bold uppercase">TERMINAL</span>
          <span className="text-sm font-black text-rose-300 font-mono leading-tight mt-0.5">
            $28.3M
          </span>
          <span className="text-[8px] font-mono text-slate-400">Max Exposure</span>
        </div>
      </div>

      {/* Selected Component Inspection HUD */}
      <div className="relative z-10 p-3.5 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{selectedStage.stage}: {selectedStage.label}</span>
              <span className="text-amber-300 font-bold">({selectedStage.costDisplay})</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">{selectedStage.detail}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-slate-500 block text-[9px] uppercase">SAP S/4HANA Ledger</span>
          <span className="text-cyan-400 font-semibold">{selectedStage.account}</span>
        </div>
      </div>
    </div>
  );
}
