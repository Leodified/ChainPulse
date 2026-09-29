import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Maximize2,
  Minimize2,
  Radio,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

export interface TwinNode {
  id: string;
  tier: number;
  tierName: string;
  label: string;
  sublabel: string;
  metric: string;
  status: 'critical' | 'warning' | 'normal' | 'alternate';
  isAffected: boolean;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  details: {
    runway?: string;
    capacity?: string;
    leadTime?: string;
    ordersCount?: number;
    financialExposure?: string;
    upstream?: string[];
    downstream?: string[];
  };
}

export interface TwinEdge {
  id: string;
  from: string;
  to: string;
  status: 'critical' | 'warning' | 'normal';
  speed: number;
}

const NODES: TwinNode[] = [
  // Tier 1: Event / Source
  {
    id: 'sg-port',
    tier: 1,
    tierName: '01. EVENT',
    label: 'Singapore Port',
    sublabel: 'MPA Tanjong Pagar Berth',
    metric: '35% Cap · 847 Vessels',
    status: 'critical',
    isAffected: true,
    x: 6,
    y: 48,
    details: {
      capacity: '35% (65% drop)',
      leadTime: '+12.4 Days queue',
      upstream: [],
      downstream: ['sg-hub'],
    },
  },
  // Tier 2: Logistics Corridor
  {
    id: 'sg-hub',
    tier: 2,
    tierName: '02. CORRIDOR',
    label: 'SG Freight Hub',
    sublabel: 'Malacca Strait Sea Lane',
    metric: '+12d Delay',
    status: 'critical',
    isAffected: true,
    x: 20,
    y: 48,
    details: {
      leadTime: '+12.0 Days transit delay',
      upstream: ['sg-port'],
      downstream: ['my-electronics', 'tw-chips'],
    },
  },
  // Tier 3: Suppliers
  {
    id: 'my-electronics',
    tier: 3,
    tierName: '03. SUPPLIERS',
    label: 'Penang Electronics',
    sublabel: 'Tier 2 PCB Partner (MY)',
    metric: 'Shipment Halted',
    status: 'warning',
    isAffected: true,
    x: 35,
    y: 28,
    details: {
      capacity: '0% outbound wharf dispatch',
      leadTime: 'Surged to 26 days',
      upstream: ['sg-hub'],
      downstream: ['mat-pcb'],
    },
  },
  {
    id: 'tw-chips',
    tier: 3,
    tierName: '03. SUPPLIERS',
    label: 'Taiwan Semiconductor',
    sublabel: 'Tier 2 Logic Chips (TW)',
    metric: 'At Risk · Buffer 7d',
    status: 'warning',
    isAffected: true,
    x: 35,
    y: 58,
    details: {
      capacity: 'Queue delay via Malacca',
      upstream: ['sg-hub'],
      downstream: ['mat-chips'],
    },
  },
  {
    id: 'jp-precision',
    tier: 3,
    tierName: '03. SUPPLIERS',
    label: 'Osaka Precision',
    sublabel: 'Tier 1 Connectors (JP)',
    metric: 'Stable · Normal Flow',
    status: 'normal',
    isAffected: false,
    x: 35,
    y: 82,
    details: {
      capacity: '98% operational',
      upstream: [],
      downstream: ['mat-connectors'],
    },
  },
  // Tier 4: Materials
  {
    id: 'mat-pcb',
    tier: 4,
    tierName: '04. MATERIALS',
    label: 'PCB Assemblies',
    sublabel: 'Critical Flagship SKU BOM',
    metric: 'Runway: 5.2 Days',
    status: 'warning',
    isAffected: true,
    x: 50,
    y: 30,
    details: {
      runway: '5.2 Days remaining',
      upstream: ['my-electronics'],
      downstream: ['fac-frankfurt'],
    },
  },
  {
    id: 'mat-chips',
    tier: 4,
    tierName: '04. MATERIALS',
    label: 'Logic Processors',
    sublabel: '7nm Edge Controller Unit',
    metric: 'Runway: 7 Days',
    status: 'warning',
    isAffected: true,
    x: 50,
    y: 58,
    details: {
      runway: '7.0 Days safety stock',
      upstream: ['tw-chips'],
      downstream: ['fac-frankfurt'],
    },
  },
  {
    id: 'mat-connectors',
    tier: 4,
    tierName: '04. MATERIALS',
    label: 'Precision Connectors',
    sublabel: 'Chassis Bus Harness',
    metric: 'Runway: 24 Days',
    status: 'normal',
    isAffected: false,
    x: 50,
    y: 82,
    details: {
      runway: '24.0 Days buffer',
      upstream: ['jp-precision'],
      downstream: ['fac-frankfurt'],
    },
  },
  // Tier 5: Factories
  {
    id: 'fac-frankfurt',
    tier: 5,
    tierName: '05. FACTORIES',
    label: 'Frankfurt Hub',
    sublabel: 'Main Facility · 68 Plants',
    metric: '70% Throttle Mode',
    status: 'warning',
    isAffected: true,
    x: 65,
    y: 44,
    details: {
      capacity: 'Throttled to 70% to conserve silicon',
      upstream: ['mat-pcb', 'mat-chips', 'mat-connectors'],
      downstream: ['prod-intellisense'],
    },
  },
  // Tier 6: Products
  {
    id: 'prod-intellisense',
    tier: 6,
    tierName: '06. PRODUCTS',
    label: 'IntelliSense Pro X1',
    sublabel: 'Flagship Enterprise IoT',
    metric: '22 Orders Impacted',
    status: 'warning',
    isAffected: true,
    x: 79,
    y: 44,
    details: {
      ordersCount: 22,
      financialExposure: '$28.3M Modeled Max',
      upstream: ['fac-frankfurt'],
      downstream: ['cust-telekom', 'cust-siemens', 'cust-bosch'],
    },
  },
  // Tier 7: Customers
  {
    id: 'cust-telekom',
    tier: 7,
    tierName: '07. CLIENTS',
    label: 'Deutsche Telekom AG',
    sublabel: 'Tier-1 Contract · 10 Orders',
    metric: '$14.2M Book Value',
    status: 'critical',
    isAffected: true,
    x: 93,
    y: 24,
    details: {
      ordersCount: 10,
      financialExposure: '$14.2M USD',
      upstream: ['prod-intellisense'],
      downstream: [],
    },
  },
  {
    id: 'cust-siemens',
    tier: 7,
    tierName: '07. CLIENTS',
    label: 'Siemens AG',
    sublabel: 'Tier-1 Contract · 7 Orders',
    metric: '$7.7M Book Value',
    status: 'critical',
    isAffected: true,
    x: 93,
    y: 50,
    details: {
      ordersCount: 7,
      financialExposure: '$7.7M USD',
      upstream: ['prod-intellisense'],
      downstream: [],
    },
  },
  {
    id: 'cust-bosch',
    tier: 7,
    tierName: '07. CLIENTS',
    label: 'Bosch Industrial',
    sublabel: 'Tier-1 Contract · 5 Orders',
    metric: '$6.4M Book Value',
    status: 'warning',
    isAffected: true,
    x: 93,
    y: 76,
    details: {
      ordersCount: 5,
      financialExposure: '$6.4M USD',
      upstream: ['prod-intellisense'],
      downstream: [],
    },
  },
];

const EDGES: TwinEdge[] = [
  { id: 'e-1', from: 'sg-port', to: 'sg-hub', status: 'critical', speed: 1.2 },
  { id: 'e-2', from: 'sg-hub', to: 'my-electronics', status: 'critical', speed: 1.0 },
  { id: 'e-3', from: 'sg-hub', to: 'tw-chips', status: 'warning', speed: 0.8 },
  { id: 'e-4', from: 'my-electronics', to: 'mat-pcb', status: 'warning', speed: 0.9 },
  { id: 'e-5', from: 'tw-chips', to: 'mat-chips', status: 'warning', speed: 0.7 },
  { id: 'e-6', from: 'jp-precision', to: 'mat-connectors', status: 'normal', speed: 0.4 },
  { id: 'e-7', from: 'mat-pcb', to: 'fac-frankfurt', status: 'warning', speed: 0.8 },
  { id: 'e-8', from: 'mat-chips', to: 'fac-frankfurt', status: 'warning', speed: 0.7 },
  { id: 'e-9', from: 'mat-connectors', to: 'fac-frankfurt', status: 'normal', speed: 0.4 },
  { id: 'e-10', from: 'fac-frankfurt', to: 'prod-intellisense', status: 'warning', speed: 0.8 },
  { id: 'e-11', from: 'prod-intellisense', to: 'cust-telekom', status: 'critical', speed: 1.1 },
  { id: 'e-12', from: 'prod-intellisense', to: 'cust-siemens', status: 'critical', speed: 1.0 },
  { id: 'e-13', from: 'prod-intellisense', to: 'cust-bosch', status: 'warning', speed: 0.8 },
];

interface Particle {
  id: number;
  edgeId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
  size: number;
  glow: boolean;
}

interface PropagationPulse {
  activeTier: number; // 1 to 7
  startTime: number;
}

interface LiveSupplyNetworkTwinProps {
  onNodeSelect?: (node: TwinNode) => void;
  onTraceImpact?: () => void;
  onSimulate?: () => void;
  onStrategicRecovery?: () => void;
  onMetricProgress?: (progress: number) => void; // 0 to 1
}

export function LiveSupplyNetworkTwin({
  onNodeSelect,
  onTraceImpact,
  onSimulate,
  onStrategicRecovery,
  onMetricProgress,
}: LiveSupplyNetworkTwinProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [traceNodeId, setTraceNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TwinNode>(NODES[0]);
  const [isWaveRunning, setIsWaveRunning] = useState(false);
  const [waveTier, setWaveTier] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Telemetry metric counters in sync with propagation
  const [activeExposedOrders, setActiveExposedOrders] = useState(22);
  const [activeExposureUSD, setActiveExposureUSD] = useState(28.3);

  // Map nodes by ID for fast lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, TwinNode>();
    NODES.forEach((n) => map.set(n.id, n));
    return map;
  }, []);

  // Compute downstream and upstream dependencies for hovered or trace node
  const activeDependencies = useMemo(() => {
    const activeId = traceNodeId || hoveredNodeId;
    if (!activeId) return null;

    const visited = new Set<string>();
    visited.add(activeId);

    // BFS Downstream
    const queueDown = [activeId];
    while (queueDown.length > 0) {
      const curr = queueDown.shift()!;
      const node = nodeMap.get(curr);
      if (node && node.details.downstream) {
        node.details.downstream.forEach((nextId) => {
          if (!visited.has(nextId)) {
            visited.add(nextId);
            queueDown.push(nextId);
          }
        });
      }
    }

    // BFS Upstream
    const queueUp = [activeId];
    while (queueUp.length > 0) {
      const curr = queueUp.shift()!;
      const node = nodeMap.get(curr);
      if (node && node.details.upstream) {
        node.details.upstream.forEach((prevId) => {
          if (!visited.has(prevId)) {
            visited.add(prevId);
            queueUp.push(prevId);
          }
        });
      }
    }

    return visited;
  }, [traceNodeId, hoveredNodeId, nodeMap]);

  // Trigger continuous resting-state particles + causal wave
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    // Initialize 24 resting ambient particles distributed along edges
    const initParticles: Particle[] = EDGES.map((edge, i) => ({
      id: i,
      edgeId: edge.id,
      progress: (i * 0.17) % 1,
      speed: 0.12 * edge.speed,
      color:
        edge.status === 'critical'
          ? '#f43f5e'
          : edge.status === 'warning'
          ? '#f59e0b'
          : '#38bdf8',
      size: edge.status === 'critical' ? 3.5 : 2.5,
      glow: edge.status === 'critical',
    }));
    setParticles(initParticles);

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      setParticles((prev) =>
        prev.map((p) => {
          let nextProg = p.progress + p.speed * dt;
          if (nextProg > 1) nextProg = 0;
          return { ...p, progress: nextProg };
        })
      );

      animFrame = requestAnimationFrame(updateLoop);
    };

    animFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Trigger 7-Tier Causal Propagation Wave
  const triggerPropagationWave = () => {
    if (isWaveRunning) return;
    setIsWaveRunning(true);
    setWaveTier(1);
    setActiveExposedOrders(0);
    setActiveExposureUSD(0);

    const tierSequence = [
      { tier: 1, delay: 0, orders: 0, usd: 0.2 },
      { tier: 2, delay: 500, orders: 4, usd: 2.1 },
      { tier: 3, delay: 1100, orders: 8, usd: 5.6 },
      { tier: 4, delay: 1700, orders: 12, usd: 11.4 },
      { tier: 5, delay: 2300, orders: 18, usd: 18.7 },
      { tier: 6, delay: 2900, orders: 20, usd: 24.5 },
      { tier: 7, delay: 3500, orders: 22, usd: 28.3 },
    ];

    tierSequence.forEach((step) => {
      setTimeout(() => {
        setWaveTier(step.tier);
        setActiveExposedOrders(step.orders);
        setActiveExposureUSD(step.usd);
        if (onMetricProgress) {
          onMetricProgress(step.tier / 7);
        }
      }, step.delay);
    });

    setTimeout(() => {
      setIsWaveRunning(false);
      setWaveTier(0);
    }, 4200);
  };

  // Run initial wave on mount if not ran recently
  useEffect(() => {
    const t = setTimeout(() => {
      triggerPropagationWave();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Render SVG Path Curvatures between nodes
  const renderEdgePath = (edge: TwinEdge) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return '';

    const x1 = fromNode.x;
    const y1 = fromNode.y;
    const x2 = toNode.x;
    const y2 = toNode.y;

    // Smooth horizontal cubic bezier curve
    const dx = x2 - x1;
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.5;
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  // Calculate Particle Coordinate along SVG Bezier Path
  const getParticleCoords = (edge: TwinEdge, progress: number) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return { x: 0, y: 0 };

    const t = Math.max(0, Math.min(1, progress));
    const p0 = { x: fromNode.x, y: fromNode.y };
    const p3 = { x: toNode.x, y: toNode.y };
    const dx = p3.x - p0.x;
    const p1 = { x: p0.x + dx * 0.5, y: p0.y };
    const p2 = { x: p0.x + dx * 0.5, y: p3.y };

    // Cubic bezier formula: B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
    const mt = 1 - t;
    const x =
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x;
    const y =
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y;

    return { x, y };
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#080e1d] via-[#050914] to-[#03060d] border border-white/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden p-5 sm:p-7">
      {/* Background Telemetry Grid & Depth Atmosphere */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-35 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
              LIVE SUPPLY NETWORK · DIGITAL TWIN
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-slate-400 hidden xl:inline">
            Deterministic Multi-Tier Propagation Graph (Palantir Causal Model)
          </span>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {traceNodeId && (
            <button
              onClick={() => setTraceNodeId(null)}
              className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <X size={12} />
              <span>EXIT TRACE MODE</span>
            </button>
          )}

          <button
            onClick={triggerPropagationWave}
            disabled={isWaveRunning}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)] disabled:opacity-50"
            title="Re-run physical 7-tier causal disruption propagation wave"
          >
            <Radio
              size={13}
              className={isWaveRunning ? 'animate-spin text-rose-400' : 'animate-pulse'}
            />
            <span>{isWaveRunning ? `PROPAGATING TIER 0${waveTier}...` : 'TRIGGER PROPAGATION PULSE'}</span>
          </button>

          {/* Quick Dynamic Telemetry Indicators */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#091122] border border-white/[0.08] text-xs font-mono">
            <span className="text-slate-400 text-[10px] uppercase">Orders Exposed:</span>
            <span className="text-amber-400 font-bold">{activeExposedOrders}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-[10px] uppercase">Max Exp:</span>
            <span className="text-rose-400 font-bold">${activeExposureUSD.toFixed(1)}M</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Spatial Network Viewport */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-[400px] sm:h-[460px] my-3 select-none overflow-hidden"
      >
        {/* Tier Vertical Division Guidelines */}
        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none opacity-20">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className={`border-r border-dashed border-white/20 relative flex flex-col justify-between py-2 px-1 text-[9px] font-mono text-slate-500 ${
                waveTier === idx + 1 ? 'bg-rose-500/10 transition-colors duration-300' : ''
              }`}
            >
              <span className="truncate">TIER 0{idx + 1}</span>
            </div>
          ))}
        </div>

        {/* SVG Bezier Routing Curves & Flowing Signal Beams */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradCritical" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="gradWarning" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gradNormal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Underlying Route Lines */}
          {EDGES.map((edge) => {
            const isCritical = edge.status === 'critical';
            const isWarning = edge.status === 'warning';
            const isActive =
              !activeDependencies ||
              (activeDependencies.has(edge.from) && activeDependencies.has(edge.to));

            const strokeColor = isCritical
              ? 'url(#gradCritical)'
              : isWarning
              ? 'url(#gradWarning)'
              : 'url(#gradNormal)';

            return (
              <g key={edge.id} opacity={isActive ? 1 : 0.15}>
                {/* Glow underlay on critical routes */}
                {isCritical && (
                  <path
                    d={renderEdgePath(edge)}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.8"
                    strokeOpacity="0.35"
                    filter="url(#glowFilter)"
                  />
                )}
                <path
                  d={renderEdgePath(edge)}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isCritical ? '1.2' : isWarning ? '0.9' : '0.6'}
                  strokeDasharray={isCritical ? '2 2' : '1.5 2'}
                />
              </g>
            );
          })}

          {/* 2. Flowing Animated Signal Particles */}
          {particles.map((p) => {
            const edge = EDGES.find((e) => e.id === p.edgeId);
            if (!edge) return null;

            const isActive =
              !activeDependencies ||
              (activeDependencies.has(edge.from) && activeDependencies.has(edge.to));
            if (!isActive) return null;

            const { x, y } = getParticleCoords(edge, p.progress);

            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={p.size * 0.35}
                fill={p.color}
                filter={p.glow ? 'url(#glowFilter)' : undefined}
                opacity={0.95}
              />
            );
          })}
        </svg>

        {/* Spatial Interactive Nodes */}
        {NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isTraceTarget = traceNodeId === node.id;
          const isInActiveChain = !activeDependencies || activeDependencies.has(node.id);
          const isTierWaveActive = waveTier === node.tier;

          let borderClass = 'border-white/10 bg-[#070d1a]/90 text-slate-300';
          let shadowClass = '';
          if (node.status === 'critical') {
            borderClass = 'border-rose-500/70 bg-[#16060c]/95 text-rose-200';
            shadowClass = 'shadow-[0_0_20px_rgba(244,63,94,0.35)]';
          } else if (node.status === 'warning') {
            borderClass = 'border-amber-500/60 bg-[#140f06]/95 text-amber-200';
            shadowClass = 'shadow-[0_0_18px_rgba(245,158,11,0.25)]';
          } else if (node.status === 'alternate') {
            borderClass = 'border-emerald-500/60 bg-[#05140e]/95 text-emerald-200';
            shadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.25)]';
          }

          if (isTraceTarget || isHovered) {
            borderClass = 'border-cyan-400 bg-[#091830] text-white';
            shadowClass = 'shadow-[0_0_30px_rgba(6,182,212,0.5)] scale-[1.08] z-30';
          } else if (!isInActiveChain) {
            borderClass = 'border-white/5 bg-[#040710]/40 text-slate-600 opacity-20';
            shadowClass = '';
          }

          return (
            <div
              key={node.id}
              onClick={() => {
                setSelectedNode(node);
                setTraceNodeId(traceNodeId === node.id ? null : node.id);
                if (onNodeSelect) onNodeSelect(node);
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 rounded-xl p-2.5 sm:p-3 border backdrop-blur-md flex flex-col justify-between min-w-[120px] max-w-[170px] ${borderClass} ${shadowClass}`}
            >
              {/* Causal wave ripple shockwave */}
              {isTierWaveActive && (
                <span className="absolute -inset-1 rounded-xl border border-rose-400 animate-ping pointer-events-none opacity-80" />
              )}

              {/* Node Header */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[9px] font-mono tracking-wider font-semibold opacity-75">
                  {node.tierName}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    node.status === 'critical'
                      ? 'bg-rose-400 animate-pulse shadow-[0_0_8px_#f43f5e]'
                      : node.status === 'warning'
                      ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                      : 'bg-sky-400'
                  }`}
                />
              </div>

              {/* Node Title & Detail */}
              <div className="text-xs font-bold font-mono tracking-tight truncate leading-tight">
                {node.label}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate leading-tight">
                {node.sublabel}
              </div>

              {/* Node Primary Metric */}
              <div className="mt-2 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 uppercase text-[8px]">METRIC</span>
                <span
                  className={`font-bold ${
                    node.status === 'critical'
                      ? 'text-rose-300'
                      : node.status === 'warning'
                      ? 'text-amber-300'
                      : 'text-sky-300'
                  }`}
                >
                  {node.metric}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Telemetry HUD Bar */}
      <div className="relative z-10 p-4 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-cyan-300">
                {selectedNode.tierName} INSPECTION:
              </span>
              <span className="text-sm font-bold text-white">{selectedNode.label}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                  selectedNode.status === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : selectedNode.status === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1 flex flex-wrap items-center gap-x-3">
              <span>{selectedNode.sublabel}</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-300 font-semibold">{selectedNode.metric}</span>
              {selectedNode.details.leadTime && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">Lead Time: {selectedNode.details.leadTime}</span>
                </>
              )}
              {selectedNode.details.financialExposure && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-rose-400 font-bold">
                    Exposure: {selectedNode.details.financialExposure}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {onTraceImpact && (
            <button
              onClick={onTraceImpact}
              className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
            >
              <span>Trace Impact</span>
              <ArrowRight size={13} />
            </button>
          )}
          {onSimulate && (
            <button
              onClick={onSimulate}
              className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-200 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <span>Simulate Future</span>
            </button>
          )}
          {onStrategicRecovery && (
            <button
              onClick={onStrategicRecovery}
              className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              <span>Recovery Plans</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
