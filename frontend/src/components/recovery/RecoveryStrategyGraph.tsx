import React from 'react';
import {
  CheckCircle,
  Clock,
  DollarSign,
  Flame,
  Leaf,
  Radio,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';
import type { RecoveryStrategy } from '../../types/agents';

interface RecoveryStrategyGraphProps {
  strategies: RecoveryStrategy[];
  selectedId: string | null;
  onSelectStrategy: (id: string) => void;
}

export function RecoveryStrategyGraph({
  strategies,
  selectedId,
  onSelectStrategy,
}: RecoveryStrategyGraphProps) {
  const stratA = strategies.find((s) => s.id.includes('A')) || strategies[0];
  const stratB = strategies.find((s) => s.id.includes('B')) || strategies[1];
  const stratC = strategies.find((s) => s.id.includes('C')) || strategies[2];

  const branches = [
    {
      id: stratA?.id || 'STRAT-A-ALTERNATE-SUPPLIER',
      name: 'STRATEGY A',
      title: 'Alternate Supplier Activation',
      partner: 'IN-ALTERNATE-01 (Bangalore, India)',
      speed: '18 Days',
      speedDays: 18,
      cost: '$1.2M',
      costUSD: 1.2,
      co2: '+12% CO2',
      co2Delta: 12,
      feasibility: '78%',
      feasibilityScore: 78,
      risk: 'MEDIUM',
      x: 18,
      color: '#38bdf8',
      accentBg: 'bg-sky-500/15 border-sky-400',
    },
    {
      id: stratB?.id || 'STRAT-B-AIR-FREIGHT',
      name: 'STRATEGY B (RECOMMENDED)',
      title: 'Emergency Air Freight Expedite',
      partner: 'Direct Air Bridge (Frankfurt Cargo)',
      speed: '8 Days',
      speedDays: 8,
      cost: '$3.8M',
      costUSD: 3.8,
      co2: '+340% CO2',
      co2Delta: 340,
      feasibility: '92%',
      feasibilityScore: 92,
      risk: 'LOW',
      x: 50,
      color: '#00d4ff',
      accentBg: 'bg-cyan-500/20 border-cyan-400',
    },
    {
      id: stratC?.id || 'STRAT-C-INVENTORY-REALLOC',
      name: 'STRATEGY C',
      title: 'Dynamic Inventory Reallocation',
      partner: 'Tier 1 Priority SKU Rebalance',
      speed: '5 Days',
      speedDays: 5,
      cost: '$0.4M',
      costUSD: 0.4,
      co2: '+2% CO2',
      co2Delta: 2,
      feasibility: '65%',
      feasibilityScore: 65,
      risk: 'HIGH',
      x: 82,
      color: '#f59e0b',
      accentBg: 'bg-amber-500/15 border-amber-400',
    },
  ];

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#080e1e] via-[#050914] to-[#03060d] border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden p-4 sm:p-6">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <StatusBeacon variant="warning" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                RECOVERY STRATEGY GRAPH // TRADE-OFF DECISION ENVELOPE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SOLVER READY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Click any path to isolate and authorize its multi-dimensional operational trajectory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>SELECTED DIRECTIVE:</span>
          <span className="text-cyan-400 font-bold">
            {branches.find((b) => b.id === selectedId)?.name || 'NONE'}
          </span>
        </div>
      </div>

      {/* SVG Multi-Branch Graph */}
      <div className="relative z-10 w-full h-[500px] sm:h-[540px] my-3 select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradStratA" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="gradStratB" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="gradStratC" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Root to Branches Vectors */}
          {branches.map((b) => {
            const isSelected = selectedId === b.id;
            const pathFromRoot = `M 50 10 C 50 18, ${b.x} 18, ${b.x} 26`;
            const pathToConvergence = `M ${b.x} 68 C ${b.x} 78, 50 78, 50 86`;

            return (
              <g key={b.id} opacity={selectedId ? (isSelected ? 1 : 0.15) : 0.8}>
                {/* Branching from Disruption root */}
                <path
                  d={pathFromRoot}
                  fill="none"
                  stroke={isSelected ? '#00d4ff' : '#475569'}
                  strokeWidth={isSelected ? '2.4' : '1.2'}
                  strokeDasharray={isSelected ? '2 2' : '1.5 2'}
                />

                {/* Vertical trade-off axis line */}
                <line
                  x1={b.x}
                  y1={26}
                  x2={b.x}
                  y2={68}
                  stroke={isSelected ? '#00d4ff' : '#334155'}
                  strokeWidth={isSelected ? '2' : '1'}
                  strokeDasharray="2 2"
                />

                {/* Convergence to Decision Envelope */}
                <path
                  d={pathToConvergence}
                  fill="none"
                  stroke={isSelected ? '#10b981' : '#475569'}
                  strokeWidth={isSelected ? '2.4' : '1.2'}
                  strokeDasharray={isSelected ? '2 2' : '1.5 2'}
                />

                {/* Traveling SVG energy packet on selected path */}
                {isSelected && (
                  <>
                    <circle r="0.9" fill="#00d4ff" opacity="0.95">
                      <animateMotion path={pathFromRoot} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="0.9" fill="#10b981" opacity="0.95">
                      <animateMotion path={pathToConvergence} dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Top Root Node: Disruption */}
        <div
          style={{ left: '50%', top: '8%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-20 px-4 py-2.5 rounded-xl bg-[#14060b] border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)] text-center flex items-center gap-2.5"
        >
          <StatusBeacon variant="critical" size="sm" />
          <div className="text-left">
            <div className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider">
              ROOT DISRUPTION
            </div>
            <div className="text-xs font-bold text-white font-mono">
              Singapore Port MPA Congestion (DISR-SG-2026-001)
            </div>
          </div>
        </div>

        {/* Strategy Decision Cards Along the 3 Branches */}
        {branches.map((b) => {
          const isSelected = selectedId === b.id;

          return (
            <div
              key={b.id}
              onClick={() => onSelectStrategy(b.id)}
              style={{
                left: `${b.x}%`,
                top: '47%',
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 rounded-2xl p-3 sm:p-4 border backdrop-blur-md w-[190px] sm:w-[220px] md:w-[250px] z-20 flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 bg-[#091a33]/95 shadow-[0_0_35px_rgba(6,182,212,0.45)] scale-[1.04]'
                  : 'border-white/10 bg-[#070d18]/90 text-slate-400 hover:border-white/20 opacity-40 hover:opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
                    {b.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                      b.risk === 'LOW'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : b.risk === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {b.risk} RISK
                  </span>
                </div>

                <div className="text-xs font-bold font-sans text-white leading-tight">
                  {b.title}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                  {b.partner}
                </div>
              </div>

              {/* 5-Dimensional Metric Radar Scorecard */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.08] space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={11} className="text-sky-400" />
                    <span>Speed:</span>
                  </span>
                  <span className="font-bold text-slate-200">{b.speed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DollarSign size={11} className="text-amber-400" />
                    <span>Cost:</span>
                  </span>
                  <span className="font-bold text-amber-300">{b.cost}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Leaf size={11} className="text-emerald-400" />
                    <span>Carbon:</span>
                  </span>
                  <span className={`font-bold ${b.co2Delta > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {b.co2}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-indigo-400" />
                    <span>Feasibility:</span>
                  </span>
                  <span className="font-bold text-cyan-300">{b.feasibility}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStrategy(b.id);
                }}
                className={`mt-3 w-full py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1]'
                }`}
              >
                {isSelected ? 'Directive Selected ✓' : 'Select Strategy'}
              </button>
            </div>
          );
        })}

        {/* Bottom Convergence: Decision Envelope */}
        <div
          style={{ left: '50%', top: '92%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-20 px-5 py-2.5 rounded-xl bg-[#061614] border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)] text-center flex items-center gap-3"
        >
          <StatusBeacon variant="success" size="sm" />
          <div className="text-left">
            <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              DECISION ENVELOPE // OPERATIONAL GOVERNANCE GATEWAY
            </div>
            <div className="text-xs font-bold text-white font-mono">
              Ready for Human Authorization · Operational Director Signature Required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
