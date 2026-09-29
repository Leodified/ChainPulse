import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  Radio,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';
import type { TransactionAnomaly } from '../../types/agents';

interface AnomalySignalConstellationProps {
  anomalies: TransactionAnomaly[];
  selectedId: string | null;
  onSelectAnomaly: (id: string) => void;
}

export function AnomalySignalConstellation({
  anomalies,
  selectedId,
  onSelectAnomaly,
}: AnomalySignalConstellationProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const signals = [
    {
      id: 'ANOM-2026-0920-001',
      type: 'PO DELIVERY DELAY',
      label: 'PO-MY-8841 (+14d Delay)',
      entity: 'MY-ELECTRONICS-01 (Penang)',
      impactUSD: '$1,200,000',
      correlation: '98% Causal Match',
      causalPath: 'Singapore Port Berth Congestion ──► Outbound Penang Feeder Block ──► PCB Assembly Delay',
      x: 16,
      y: 22,
      severity: 'HIGH',
    },
    {
      id: 'ANOM-2026-0919-002',
      type: 'FREIGHT SURCHARGE SPIKE',
      label: 'INV-SG-9021 (+$320K Demurrage)',
      entity: 'SG-LOGISTICS-01 (Singapore)',
      impactUSD: '$320,000',
      correlation: '99% Causal Match',
      causalPath: 'PSA Tanjong Pagar Vessel Queuing ──► Marine Demurrage Tariff Surcharge',
      x: 16,
      y: 42,
      severity: 'HIGH',
    },
    {
      id: 'ANOM-2026-0918-003',
      type: 'LEAD TIME DRIFT',
      label: 'PO-TW-4412 (+8d Lead Time)',
      entity: 'TW-CHIPS-01 (Taiwan)',
      impactUSD: '$850,000',
      correlation: '91% Causal Match',
      causalPath: 'Malacca Strait Sea Lane Reroute ──► Bunkering Delay via Port Klang',
      x: 16,
      y: 62,
      severity: 'MEDIUM',
    },
    {
      id: 'ANOM-2026-0917-004',
      type: 'CUSTOMER SLA COMPROMISE',
      label: 'SO-DT-1092 ($14.2M Delivery)',
      entity: 'Deutsche Telekom AG (Tier 1)',
      impactUSD: '$14,200,000',
      correlation: '95% Causal Match',
      causalPath: 'Frankfurt Line B Throttling ──► IntelliSense Pro Stockout ──► Contract SLA Breach',
      x: 16,
      y: 82,
      severity: 'HIGH',
    },
  ];

  const activeSignal = signals.find((s) => s.id === (hoveredId || selectedId)) || signals[0];

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#091122] via-[#050a16] to-[#03060e] border border-amber-500/25 p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                LIVE ERP SIGNAL CONSTELLATION // HEURISTIC CORRELATION ENGINE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                DISR-SG-2026-001 LINKED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Autonomous correlation of SAP purchase orders and invoices against maritime disruption telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>ACTIVE SIGNAL:</span>
          <span className="text-amber-400 font-bold">{activeSignal.type}</span>
        </div>
      </div>

      {/* Constellation SVG Diagram */}
      <div className="relative z-10 w-full h-[400px] sm:h-[440px] my-3 select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="anomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Vectors from Signals to Central Correlation Hub */}
          {signals.map((sig) => {
            const isSelected = selectedId === sig.id || hoveredId === sig.id;
            const pathData = `M 28 ${sig.y} C 40 ${sig.y}, 40 50, 50 50`;

            return (
              <g key={sig.id} opacity={selectedId ? (isSelected ? 1 : 0.15) : 0.7}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? '#f59e0b' : '#334155'}
                  strokeWidth={isSelected ? '2.4' : '1.2'}
                  strokeDasharray={isSelected ? '2 2' : '1 2'}
                />

                {isSelected && (
                  <circle r="0.9" fill="#f59e0b" opacity="0.95">
                    <animateMotion path={pathData} dur="1.3s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Vector from Central Engine to Root Disruption */}
          <path
            d="M 50 50 C 65 50, 65 50, 78 50"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeDasharray="2 2"
          />
          <circle r="1.1" fill="#f43f5e" opacity="0.95">
            <animateMotion path="M 50 50 L 78 50" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Left: 4 Incoming Signal Cards */}
        <div className="absolute left-2 sm:left-4 top-0 bottom-0 flex flex-col justify-around w-[180px] sm:w-[220px] md:w-[250px] z-20">
          {signals.map((sig) => {
            const isSelected = selectedId === sig.id || hoveredId === sig.id;
            const isHigh = sig.severity === 'HIGH';

            return (
              <div
                key={sig.id}
                onClick={() => onSelectAnomaly(sig.id)}
                onMouseEnter={() => setHoveredId(sig.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`cursor-pointer transition-all duration-200 p-2.5 sm:p-3 rounded-xl border backdrop-blur-md ${
                  isSelected
                    ? 'border-amber-400 bg-[#161106]/95 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.03]'
                    : 'border-white/10 bg-[#070e1a]/90 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[8px] font-mono font-bold tracking-wider text-amber-300 uppercase truncate">
                    {sig.type}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isHigh ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                </div>

                <div className="text-[11px] font-bold text-white font-mono truncate leading-tight">
                  {sig.label}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">
                  {sig.entity}
                </div>

                <div className="mt-1.5 pt-1 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 text-[8px] uppercase">IMPACT:</span>
                  <span className="font-bold text-rose-300">{sig.impactUSD}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Anomaly Correlation Engine */}
        <div
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-20 p-3 sm:p-4 rounded-2xl bg-[#091830] border border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.4)] text-center flex flex-col items-center min-w-[140px]"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-1.5">
            <Radio size={16} className="animate-spin" />
          </div>
          <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            ANOMALY ENGINE
          </span>
          <span className="text-xs font-black text-white font-mono mt-0.5">
            Heuristic Matcher
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1">
            {activeSignal.correlation}
          </span>
        </div>

        {/* Right: Root Disruption Attribution */}
        <div
          style={{ left: '85%', top: '50%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-20 p-3 sm:p-4 rounded-2xl bg-[#180509] border border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.45)] text-center flex flex-col items-center min-w-[150px] max-w-[190px]"
        >
          <StatusBeacon variant="critical" size="md" />
          <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-wider mt-1.5">
            CAUSAL ROOT
          </span>
          <span className="text-xs font-bold text-white font-mono mt-0.5 leading-tight">
            Singapore MPA Congestion
          </span>
          <span className="text-[9px] font-mono text-slate-400 mt-1">
            DISR-SG-2026-001
          </span>
        </div>
      </div>

      {/* Selected Signal Causal Attribution HUD */}
      <div className="relative z-10 p-3.5 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold">{activeSignal.type}:</span>
              <span className="font-bold text-white">{activeSignal.label}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activeSignal.correlation}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              <strong>Causal Propagation Path:</strong> {activeSignal.causalPath}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-slate-500 block text-[9px] uppercase">Financial Impact</span>
          <span className="text-rose-400 font-bold">{activeSignal.impactUSD}</span>
        </div>
      </div>
    </div>
  );
}
