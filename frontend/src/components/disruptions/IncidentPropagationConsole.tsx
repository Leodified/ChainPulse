import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Radio,
  RotateCcw,
  Zap,
  Box,
  Cpu,
  Factory,
  Users,
  DollarSign,
  Layers,
  Activity,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';

interface PipelineNode {
  id: string;
  stage: string;
  title: string;
  subtitle: string;
  metric: string;
  status: 'critical' | 'warning' | 'info';
  x: number;
  y: number;
  details: string;
}

const PIPELINE_NODES: PipelineNode[] = [
  {
    id: 'node-incident',
    stage: '01. INCIDENT',
    title: 'Singapore Port Congestion',
    subtitle: 'PSA Tanjong Pagar Terminal',
    metric: '847 Vessels Queued',
    status: 'critical',
    x: 50,
    y: 8,
    details: 'Typhoon aftermath and crane maintenance backlog reduced terminal throughput to 35%. ETA delays average 8-12 days across all Asia-Europe sea routes.',
  },
  {
    id: 'node-signal',
    stage: '02. SIGNAL DETECTED',
    title: 'AIS & Satellite Radar',
    subtitle: 'Verified Maritime Stream',
    metric: '94% Confidence',
    status: 'critical',
    x: 50,
    y: 26,
    details: 'Signal ingestion correlated via MPA Singapore VHF broadcast, Lloyd’s List vessel tracking, and Singapore port authority berth advisories.',
  },
  {
    id: 'node-logistics',
    stage: '03A. LOGISTICS',
    title: 'Malacca Strait Lane',
    subtitle: 'Primary Maritime Artery',
    metric: '+12.4 Days Delay',
    status: 'critical',
    x: 18,
    y: 46,
    details: 'Outbound container feeder departures suspended. Rerouting to Port Klang and Tanjung Pelepas adding 4-6 days bunkering congestion.',
  },
  {
    id: 'node-suppliers',
    stage: '03B. SUPPLIERS',
    title: 'Penang & Taiwan Tier 2',
    subtitle: 'PCB & Logic Partners',
    metric: '4 Suppliers At Risk',
    status: 'warning',
    x: 50,
    y: 46,
    details: 'Penang Electronics (MY) and Taiwan Semiconductor (TW) have completed component lots stuck at Singapore container terminal wharves.',
  },
  {
    id: 'node-materials',
    stage: '03C. MATERIALS',
    title: 'Critical SKU BOM',
    subtitle: 'PCB & 7nm Processors',
    metric: '5.2 Days Runway',
    status: 'warning',
    x: 82,
    y: 46,
    details: 'Safety stock buffers at European central store will exhaust on Day 7 without emergency air freight or alternate component sourcing.',
  },
  {
    id: 'node-factory',
    stage: '04. FACTORIES',
    title: 'Frankfurt Assembly Hub',
    subtitle: 'Main European Plant',
    metric: '70% Throttle Mode',
    status: 'warning',
    x: 50,
    y: 67,
    details: 'Assembly line B scheduled to throttle capacity to 70% to conserve silicon inventory. 68 downstream assembly plants impacted.',
  },
  {
    id: 'node-orders',
    stage: '05. CUSTOMER ORDERS',
    title: 'Committed Deliveries',
    subtitle: 'Enterprise SLA Commitments',
    metric: '22 Orders Impacted',
    status: 'warning',
    x: 50,
    y: 83,
    details: '22 critical purchase orders across Tier-1 enterprise clients (Deutsche Telekom, Siemens AG, Bosch) fall inside the unbuffered delivery window.',
  },
  {
    id: 'node-exposure',
    stage: '06. TERMINAL EXPOSURE',
    title: 'Max Modeled Exposure',
    subtitle: 'Deterministic Ceiling',
    metric: '$28.3M USD',
    status: 'critical',
    x: 50,
    y: 95,
    details: 'Modeled financial impact across 60-day horizon: $22.4M unfulfilled order book, $4.1M contractual SLA penalties, $1.8M logistics escalation.',
  },
];

interface EdgePath {
  from: string;
  to: string;
  isCritical?: boolean;
}

const PIPELINE_EDGES: EdgePath[] = [
  { from: 'node-incident', to: 'node-signal', isCritical: true },
  { from: 'node-signal', to: 'node-logistics', isCritical: true },
  { from: 'node-signal', to: 'node-suppliers', isCritical: true },
  { from: 'node-signal', to: 'node-materials', isCritical: false },
  { from: 'node-logistics', to: 'node-factory', isCritical: true },
  { from: 'node-suppliers', to: 'node-factory', isCritical: true },
  { from: 'node-materials', to: 'node-factory', isCritical: false },
  { from: 'node-factory', to: 'node-orders', isCritical: true },
  { from: 'node-orders', to: 'node-exposure', isCritical: true },
];

export function IncidentPropagationConsole({
  onTraceImpact,
}: {
  onTraceImpact?: () => void;
}) {
  const [selectedNode, setSelectedNode] = useState<PipelineNode>(PIPELINE_NODES[0]);
  const [pulseStage, setPulseStage] = useState(0);
  const [isSimulatingWave, setIsSimulatingWave] = useState(false);

  // Automatic ambient propagation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseStage((prev) => (prev + 1) % 6);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const triggerManualWave = () => {
    setIsSimulatingWave(true);
    let step = 0;
    setPulseStage(0);
    const interval = setInterval(() => {
      step++;
      if (step >= 6) {
        clearInterval(interval);
        setIsSimulatingWave(false);
      } else {
        setPulseStage(step);
      }
    }, 300);
  };

  const getNodeCoords = (id: string) => {
    const node = PIPELINE_NODES.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#091122] via-[#050a16] to-[#03060e] border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden p-4 sm:p-6">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-500/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <StatusBeacon variant="critical" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                INCIDENT COMMAND CONSOLE // CAUSAL IMPACT PIPELINE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live causal vector processing: DISR-SG-2026-001 (Singapore Port MPA Congestion)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerManualWave}
            disabled={isSimulatingWave}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Radio size={12} className={isSimulatingWave ? 'animate-spin' : 'animate-pulse'} />
            <span>{isSimulatingWave ? `PROPAGATING STAGE 0${pulseStage + 1}...` : 'RE-RUN CAUSAL PULSE'}</span>
          </button>
          {onTraceImpact && (
            <button
              onClick={onTraceImpact}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <span>INSPECT IN IMPACT SOLVER</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* SVG Pipeline Canvas */}
      <div className="relative z-10 w-full h-[480px] sm:h-[520px] my-3 select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pipeGradCritical" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="pipeGradWarning" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Underlying Connecting Vectors */}
          {PIPELINE_EDGES.map((edge, idx) => {
            const from = getNodeCoords(edge.from);
            const to = getNodeCoords(edge.to);
            const isCrit = edge.isCritical;

            // Curved bezier or linear path
            const dx = to.x - from.x;
            const pathData =
              Math.abs(dx) > 2
                ? `M ${from.x} ${from.y} C ${from.x} ${from.y + (to.y - from.y) * 0.5}, ${to.x} ${from.y + (to.y - from.y) * 0.5}, ${to.x} ${to.y}`
                : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

            return (
              <g key={idx}>
                {/* Glow backline */}
                {isCrit && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.6"
                    strokeOpacity="0.25"
                  />
                )}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isCrit ? 'url(#pipeGradCritical)' : 'url(#pipeGradWarning)'}
                  strokeWidth={isCrit ? '1.2' : '0.9'}
                  strokeDasharray="2 2"
                />

                {/* Hardware-accelerated traveling SVG signal packet */}
                <circle r="0.75" fill={isCrit ? '#f43f5e' : '#fbbf24'} opacity="0.9">
                  <animateMotion
                    path={pathData}
                    dur={isCrit ? '1.8s' : '2.4s'}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Spatial Interactive Nodes */}
        {PIPELINE_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isCritical = node.status === 'critical';

          let borderStyle = 'border-white/10 bg-[#070e1c]/90 text-slate-300';
          if (isCritical) {
            borderStyle = 'border-rose-500/60 bg-[#16060c]/95 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
          } else {
            borderStyle = 'border-amber-500/50 bg-[#140e05]/95 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
          }

          if (isSelected) {
            borderStyle = 'border-cyan-400 bg-[#0a1a33] text-white shadow-[0_0_24px_rgba(6,182,212,0.5)] scale-[1.05] z-30';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-200 rounded-xl p-2 sm:p-2.5 border backdrop-blur-md flex flex-col justify-between w-[130px] sm:w-[155px] ${borderStyle}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[8px] sm:text-[9px] font-mono tracking-wider font-bold opacity-80">
                  {node.stage}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCritical ? 'bg-rose-400 animate-pulse shadow-[0_0_8px_#f43f5e]' : 'bg-amber-400'
                  }`}
                />
              </div>

              <div className="text-[11px] sm:text-xs font-bold font-mono tracking-tight truncate leading-tight">
                {node.title}
              </div>
              <div className="text-[9px] text-slate-400 truncate leading-tight mt-0.5">
                {node.subtitle}
              </div>

              <div className="mt-1.5 pt-1 border-t border-white/[0.08] flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
                <span className="text-slate-500 text-[8px] uppercase">METRIC:</span>
                <span className={`font-bold ${isCritical ? 'text-rose-300' : 'text-amber-300'}`}>
                  {node.metric}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspection Drawer */}
      <div className="relative z-10 p-3.5 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-300">{selectedNode.stage}:</span>
              <span className="text-sm font-bold text-white">{selectedNode.title}</span>
              <span className="text-xs font-mono px-2 py-0.2 rounded bg-white/[0.06] text-slate-300 border border-white/10">
                {selectedNode.metric}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
              {selectedNode.details}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
          <span className="text-rose-400 font-bold">$28.3M Max Modeled Exposure</span>
        </div>
      </div>
    </div>
  );
}
