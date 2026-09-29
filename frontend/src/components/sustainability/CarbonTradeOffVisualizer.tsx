import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  Leaf,
  Plane,
  Ship,
  Truck,
  Train,
  Zap,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';

interface ModalPath {
  id: string;
  name: string;
  mode: string;
  icon: 'ship' | 'plane' | 'truck' | 'train';
  speed: string;
  days: number;
  cost: string;
  costUSD: number;
  co2Tons: number;
  co2Delta: string;
  co2Pct: number;
  status: 'baseline' | 'critical' | 'warning' | 'optimal';
  detail: string;
  color: string;
}

const MODAL_PATHS: ModalPath[] = [
  {
    id: 'path-baseline',
    name: 'BASELINE SEA FREIGHT',
    mode: 'Standard Maritime Transit (Malacca Strait)',
    icon: 'ship',
    speed: '28 Days',
    days: 28,
    cost: '$0.0M',
    costUSD: 0,
    co2Tons: 120,
    co2Delta: 'Baseline',
    co2Pct: 0,
    status: 'baseline',
    detail: 'Nominal container sea voyage from Southeast Asia to Hamburg/Rotterdam. High transit latency, lowest carbon intensity per TEU-km.',
    color: '#38bdf8',
  },
  {
    id: 'path-strat-b',
    name: 'STRATEGY B: EMERGENCY AIR FREIGHT',
    mode: 'Boeing 777F Direct Cargo Charter',
    icon: 'plane',
    speed: '8 Days',
    days: 8,
    cost: '$3.8M',
    costUSD: 3.8,
    co2Tons: 528,
    co2Delta: '+340% CO2',
    co2Pct: 340,
    status: 'critical',
    detail: 'Fastest operational recovery defending Tier-1 contract SLAs (Deutsche Telekom, Siemens AG). Extremely high carbon penalty (+340% Scope-3 emissions).',
    color: '#f43f5e',
  },
  {
    id: 'path-strat-a',
    name: 'STRATEGY A: ALTERNATE SUPPLIER',
    mode: 'Regional Air / Maritime (Bangalore Partner)',
    icon: 'truck',
    speed: '18 Days',
    days: 18,
    cost: '$1.2M',
    costUSD: 1.2,
    co2Tons: 134,
    co2Delta: '+12% CO2',
    co2Pct: 12,
    status: 'warning',
    detail: 'Activate IN-ALTERNATE-01 in Bangalore. Moderate carbon increase (+12%) with sustainable long-term multi-sourcing resilience.',
    color: '#f59e0b',
  },
  {
    id: 'path-strat-c',
    name: 'STRATEGY C: INVENTORY REALLOCATION',
    mode: 'Intra-Continental Road / Rail Expedited',
    icon: 'train',
    speed: '5 Days',
    days: 5,
    cost: '$0.4M',
    costUSD: 0.4,
    co2Tons: 122,
    co2Delta: '+2% CO2',
    co2Pct: 2,
    status: 'optimal',
    detail: 'Reallocate existing European safety buffers to Tier-1 customers. Near-zero carbon impact (+2%), but incurs high commercial relationship risk.',
    color: '#10b981',
  },
];

export function CarbonTradeOffVisualizer() {
  const [selectedPath, setSelectedPath] = useState<ModalPath>(MODAL_PATHS[1]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#091424] via-[#050b16] to-[#02050c] border border-emerald-500/25 p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Leaf size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                CARBON TRADE-OFF VISUALIZER // MODAL LOGISTICS COMPARISON
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SCOPE-3 CAT 4/9
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Evaluating Time vs. Cost vs. Carbon Footprint across the 3 canonical recovery pathways
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>ACTIVE PATH:</span>
          <span className="text-emerald-400 font-bold">{selectedPath.name}</span>
        </div>
      </div>

      {/* 4 Multi-Modal Flow Lanes */}
      <div className="relative z-10 my-4 space-y-3">
        {MODAL_PATHS.map((path) => {
          const isSelected = selectedPath.id === path.id;

          return (
            <div
              key={path.id}
              onClick={() => setSelectedPath(path)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isSelected
                  ? 'border-emerald-400/80 bg-[#081a18] shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.01]'
                  : 'border-white/[0.06] bg-[#070e1c]/80 hover:border-white/15'
              }`}
            >
              {/* Left Column: Mode & Title */}
              <div className="flex items-center gap-3.5 min-w-[280px]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${path.color}15`,
                    borderColor: `${path.color}40`,
                    color: path.color,
                  }}
                >
                  {path.icon === 'ship' && <Ship size={20} />}
                  {path.icon === 'plane' && <Plane size={20} />}
                  {path.icon === 'truck' && <Truck size={20} />}
                  {path.icon === 'train' && <Train size={20} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{path.name}</span>
                    {path.status === 'critical' && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        +340% EMISSIONS
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{path.mode}</div>
                </div>
              </div>

              {/* Middle: Visual Bar Comparison */}
              <div className="flex-1 min-w-[200px] max-w-md hidden lg:block">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Carbon Footprint:</span>
                  <span className="font-bold" style={{ color: path.color }}>
                    {path.co2Tons} Tons CO2 ({path.co2Delta})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(15, (path.co2Tons / 528) * 100))}%`,
                      backgroundColor: path.color,
                    }}
                  />
                </div>
              </div>

              {/* Right Column: 3 Critical Dimensions (Time / Cost / CO2) */}
              <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-slate-400 block uppercase">Transit Time</span>
                  <span className="font-bold text-slate-100 flex items-center gap-1">
                    <Clock size={11} className="text-sky-400" />
                    <span>{path.speed}</span>
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-slate-400 block uppercase">Expedited Cost</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <DollarSign size={11} className="text-amber-400" />
                    <span>{path.cost}</span>
                  </span>
                </div>

                <div className="text-left sm:text-right min-w-[85px]">
                  <span className="text-[9px] text-slate-400 block uppercase">Scope-3 CO2</span>
                  <span className="font-bold flex items-center gap-1" style={{ color: path.color }}>
                    <Leaf size={11} />
                    <span>{path.co2Delta}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Mode Provenance & Analysis HUD */}
      <div className="relative z-10 p-3.5 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{selectedPath.name}</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-300 font-semibold">{selectedPath.speed}</span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-300 font-semibold">{selectedPath.cost}</span>
              <span className="text-slate-400">·</span>
              <span className="font-bold" style={{ color: selectedPath.color }}>{selectedPath.co2Delta}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">{selectedPath.detail}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-slate-500 block text-[9px] uppercase">GHG Protocol Cat 4</span>
          <span className="text-emerald-400 font-semibold">{selectedPath.co2Tons} tCO2e Total</span>
        </div>
      </div>
    </div>
  );
}
