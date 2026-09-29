import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Database,
  DollarSign,
  Factory,
  Layers,
  Radio,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { StatusBeacon, MetricCounter } from '../motion';

interface CascadeNode {
  id: string;
  category: 'DISRUPTION' | 'SUPPLIER' | 'MATERIAL' | 'FACTORY' | 'ORDERS' | 'CUSTOMERS' | 'EXPOSURE';
  title: string;
  subtitle: string;
  metric: string;
  status: 'critical' | 'warning' | 'normal';
  x: number; // percentage
  y: number; // percentage
  upstream: string[];
  downstream: string[];
  formula: string;
  source: string;
}

const CASCADE_NODES: CascadeNode[] = [
  // Disruption Root
  {
    id: 'c-disr',
    category: 'DISRUPTION',
    title: 'Singapore Port MPA Congestion',
    subtitle: 'PSA Tanjong Pagar Berth (847 Vessels)',
    metric: '35% Cap · -65% Throughput',
    status: 'critical',
    x: 50,
    y: 8,
    upstream: [],
    downstream: ['c-sup-my', 'c-sup-tw', 'c-sup-sg'],
    formula: 'Throughput Loss = (100% - 35%) = -65% Berth Capacity',
    source: 'Port Authority of Singapore (MPA) & Lloyd’s List AIS Telemetry',
  },
  // Suppliers
  {
    id: 'c-sup-sg',
    category: 'SUPPLIER',
    title: 'Singapore Freight Hub',
    subtitle: 'Tier 1 Logistics Corridor',
    metric: '+12.4d Transit Delay',
    status: 'critical',
    x: 20,
    y: 26,
    upstream: ['c-disr'],
    downstream: ['c-mat-pcb', 'c-mat-chips'],
    formula: 'Transit Delay = Current Berth Wait (10.2d) + Rerouting Delta (2.2d) = 12.4 Days',
    source: 'AIS Satellite Feeder Tracking',
  },
  {
    id: 'c-sup-my',
    category: 'SUPPLIER',
    title: 'Penang Electronics (MY)',
    subtitle: 'Tier 2 PCB Manufacturing',
    metric: '0% Outbound Wharf Dispatch',
    status: 'critical',
    x: 50,
    y: 26,
    upstream: ['c-disr'],
    downstream: ['c-mat-pcb'],
    formula: 'Component Delivery Backlog = 18 Days Wharf Quota',
    source: 'SAP S/4HANA Vendor Dispatch Feeds (EKKO/EKPO)',
  },
  {
    id: 'c-sup-tw',
    category: 'SUPPLIER',
    title: 'Taiwan Semiconductor (TW)',
    subtitle: 'Tier 2 Logic Chips',
    metric: 'At Risk · Buffer 7d',
    status: 'warning',
    x: 80,
    y: 26,
    upstream: ['c-disr'],
    downstream: ['c-mat-chips'],
    formula: 'Buffer Runway = Safety Stock (7d) - Delay (12d) = -5d Deficit',
    source: 'Taiwan High-Tech Export Control Declarations',
  },
  // Materials
  {
    id: 'c-mat-pcb',
    category: 'MATERIAL',
    title: 'PCB Assemblies',
    subtitle: 'IntelliSense Flagship BOM',
    metric: 'Runway: 5.2 Days',
    status: 'critical',
    x: 35,
    y: 45,
    upstream: ['c-sup-sg', 'c-sup-my'],
    downstream: ['c-factory'],
    formula: 'Stockout Horizon = Current Stock (1,450 units) / Consumption (280/day) = 5.2 Days',
    source: 'SAP Material Management (MARD/MARC Tables)',
  },
  {
    id: 'c-mat-chips',
    category: 'MATERIAL',
    title: '7nm Logic Processors',
    subtitle: 'Edge Compute Core SKU',
    metric: 'Runway: 7.0 Days',
    status: 'warning',
    x: 65,
    y: 45,
    upstream: ['c-sup-sg', 'c-sup-tw'],
    downstream: ['c-factory'],
    formula: 'Stockout Horizon = Current Stock (820 units) / Consumption (115/day) = 7.1 Days',
    source: 'SAP S/4HANA MRP Live Replenishment Engine',
  },
  // Factories
  {
    id: 'c-factory',
    category: 'FACTORY',
    title: 'Frankfurt Assembly Hub',
    subtitle: '68 European Plants Impacted',
    metric: '70% Throttle Mode',
    status: 'warning',
    x: 50,
    y: 63,
    upstream: ['c-mat-pcb', 'c-mat-chips'],
    downstream: ['c-orders'],
    formula: 'Factory Output = Nominal (100%) - Throttle (30%) = 70% Operating Capacity',
    source: 'MES Factory Floor Production Schedules',
  },
  // Orders
  {
    id: 'c-orders',
    category: 'ORDERS',
    title: '22 Purchase Orders',
    subtitle: 'Committed Enterprise Deliveries',
    metric: '$28.1M Order Book Value',
    status: 'critical',
    x: 50,
    y: 79,
    upstream: ['c-factory'],
    downstream: ['c-cust-telekom', 'c-cust-siemens', 'c-cust-bosch', 'c-exposure'],
    formula: 'Orders at Risk = Count(Committed Orders with Delivery Due Date < Stockout Recovery)',
    source: 'SAP Sales & Distribution Order Book (VBAK/VBAP)',
  },
  // Customers
  {
    id: 'c-cust-telekom',
    category: 'CUSTOMERS',
    title: 'Deutsche Telekom AG',
    subtitle: 'Tier 1 Enterprise Client',
    metric: '10 Orders · $14.2M',
    status: 'critical',
    x: 20,
    y: 93,
    upstream: ['c-orders'],
    downstream: [],
    formula: 'SLA Breach Clause = $14.2M Order Value + 5% Weekly Penalty Provision',
    source: 'SAP S/4HANA Master Service Agreements',
  },
  {
    id: 'c-cust-siemens',
    category: 'CUSTOMERS',
    title: 'Siemens AG',
    subtitle: 'Tier 1 Enterprise Client',
    metric: '7 Orders · $7.7M',
    status: 'critical',
    x: 50,
    y: 93,
    upstream: ['c-orders'],
    downstream: [],
    formula: 'SLA Breach Clause = $7.7M Order Value + Tier-1 Penalty Provisions',
    source: 'SAP S/4HANA Master Service Agreements',
  },
  {
    id: 'c-exposure',
    category: 'EXPOSURE',
    title: 'Total Maximum Exposure',
    subtitle: 'Deterministic 60-Day Ceiling',
    metric: '$28.3M USD',
    status: 'critical',
    x: 80,
    y: 93,
    upstream: ['c-orders'],
    downstream: [],
    formula: '∑ (22 Orders [$28.1M] + Expedited Clearance [$0.2M]) = $28.3M USD',
    source: 'ChainPulse Deterministic Multi-Tier Financial Solver',
  },
];

interface Edge {
  from: string;
  to: string;
}

const EDGES: Edge[] = [
  { from: 'c-disr', to: 'c-sup-sg' },
  { from: 'c-disr', to: 'c-sup-my' },
  { from: 'c-disr', to: 'c-sup-tw' },
  { from: 'c-sup-sg', to: 'c-mat-pcb' },
  { from: 'c-sup-sg', to: 'c-mat-chips' },
  { from: 'c-sup-my', to: 'c-mat-pcb' },
  { from: 'c-sup-tw', to: 'c-mat-chips' },
  { from: 'c-mat-pcb', to: 'c-factory' },
  { from: 'c-mat-chips', to: 'c-factory' },
  { from: 'c-factory', to: 'c-orders' },
  { from: 'c-orders', to: 'c-cust-telekom' },
  { from: 'c-orders', to: 'c-cust-siemens' },
  { from: 'c-orders', to: 'c-exposure' },
];

export function ImpactCascadeGraph() {
  const [selectedNode, setSelectedNode] = useState<CascadeNode>(CASCADE_NODES[0]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Compute connected causal nodes for isolation
  const activeChainIds = React.useMemo(() => {
    const activeTarget = hoveredNodeId || selectedNode.id;
    const connected = new Set<string>([activeTarget]);

    // Upstream traversal
    const upQueue = [activeTarget];
    while (upQueue.length > 0) {
      const curr = upQueue.shift()!;
      const node = CASCADE_NODES.find((n) => n.id === curr);
      if (node) {
        node.upstream.forEach((parentId) => {
          if (!connected.has(parentId)) {
            connected.add(parentId);
            upQueue.push(parentId);
          }
        });
      }
    }

    // Downstream traversal
    const downQueue = [activeTarget];
    while (downQueue.length > 0) {
      const curr = downQueue.shift()!;
      const node = CASCADE_NODES.find((n) => n.id === curr);
      if (node) {
        node.downstream.forEach((childId) => {
          if (!connected.has(childId)) {
            connected.add(childId);
            downQueue.push(childId);
          }
        });
      }
    }

    return connected;
  }, [selectedNode, hoveredNodeId]);

  const getNodeCoords = (id: string) => {
    const n = CASCADE_NODES.find((item) => item.id === id);
    return n ? { x: n.x, y: n.y } : { x: 50, y: 50 };
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#080e1e] via-[#050914] to-[#03060d] border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden p-4 sm:p-6">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <StatusBeacon variant="critical" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                IMPACT CASCADE GRAPH // DETERMINISTIC MULTI-TIER ACCUMULATION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                CAUSAL SOLVER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Hover or click any entity to isolate its upstream cause and downstream financial exposure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">ISOLATION MODE:</span>
          <span className="text-cyan-400 font-semibold">{selectedNode.title}</span>
        </div>
      </div>

      {/* Main SVG Visualization Canvas */}
      <div className="relative z-10 w-full h-[520px] sm:h-[560px] my-3 select-none">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cascadeCritGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="cascadeCyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Causal Edges */}
          {EDGES.map((edge, idx) => {
            const from = getNodeCoords(edge.from);
            const to = getNodeCoords(edge.to);
            const isInActiveChain = activeChainIds.has(edge.from) && activeChainIds.has(edge.to);

            // Cubic bezier formula for smooth branching curves
            const pathData = `M ${from.x} ${from.y} C ${from.x} ${from.y + (to.y - from.y) * 0.5}, ${to.x} ${from.y + (to.y - from.y) * 0.5}, ${to.x} ${to.y}`;

            return (
              <g key={idx} opacity={isInActiveChain ? 1 : 0.12}>
                {isInActiveChain && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.2"
                    strokeOpacity="0.3"
                  />
                )}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isInActiveChain ? 'url(#cascadeCritGrad)' : 'url(#cascadeCyanGrad)'}
                  strokeWidth={isInActiveChain ? '1.5' : '0.8'}
                  strokeDasharray={isInActiveChain ? '2 2' : '1 2'}
                />

                {/* Traveling SVG energy packet along active chain */}
                {isInActiveChain && (
                  <circle r="0.85" fill="#f43f5e" opacity="0.95">
                    <animateMotion
                      path={pathData}
                      dur="1.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Spatial Interactive Nodes */}
        {CASCADE_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isInChain = activeChainIds.has(node.id);
          const isCritical = node.status === 'critical';

          let borderStyle = 'border-white/10 bg-[#070e1c]/90 text-slate-300';
          if (isCritical) {
            borderStyle = 'border-rose-500/60 bg-[#16060c]/95 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
          } else {
            borderStyle = 'border-amber-500/50 bg-[#140e05]/95 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
          }

          if (isSelected || isHovered) {
            borderStyle = 'border-cyan-400 bg-[#0a1a33] text-white shadow-[0_0_24px_rgba(6,182,212,0.5)] scale-[1.06] z-30';
          } else if (!isInChain) {
            borderStyle = 'border-white/5 bg-[#03060c]/40 text-slate-600 opacity-25';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-200 rounded-xl p-2 sm:p-2.5 border backdrop-blur-md flex flex-col justify-between w-[124px] sm:w-[140px] ${borderStyle}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[8px] sm:text-[9px] font-mono tracking-wider font-bold opacity-80 truncate">
                  {node.category}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCritical ? 'bg-rose-400 animate-pulse shadow-[0_0_8px_#f43f5e]' : 'bg-amber-400'
                  }`}
                />
              </div>

              <div className="text-[10px] sm:text-xs font-bold font-mono tracking-tight truncate leading-tight">
                {node.title}
              </div>
              <div className="text-[8px] sm:text-[9px] text-slate-400 truncate leading-tight mt-0.5">
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

      {/* Selected Node Provenance & Evidence HUD */}
      <div className="relative z-10 p-4 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-300">
                {selectedNode.category} CAUSAL ISOLATION:
              </span>
              <span className="text-sm font-bold text-white">{selectedNode.title}</span>
              <span className="text-xs font-mono px-2 py-0.2 rounded bg-white/[0.06] text-slate-300 border border-white/10">
                {selectedNode.metric}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1 space-y-0.5">
              <p className="text-cyan-200/90 font-semibold">Formula: {selectedNode.formula}</p>
              <p className="text-slate-400 text-[11px]">Provenance Source: {selectedNode.source}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <div className="text-right">
            <span className="text-slate-500 block text-[9px] uppercase">Upstream Inputs</span>
            <span className="text-slate-200 font-semibold">{selectedNode.upstream.length} Vector(s)</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[9px] uppercase">Downstream Propagation</span>
            <span className="text-rose-400 font-semibold">{selectedNode.downstream.length} Vector(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
