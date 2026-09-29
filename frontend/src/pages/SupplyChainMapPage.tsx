import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Cpu,
  Factory,
  HelpCircle,
  Layers,
  Network,
  Play,
  Radio,
  RotateCcw,
  ShieldCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import worldLandData from '../data/world-land-110m.json';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { fetchSupplyChainGraph } from '../services/supplyChain';
import { MOCK_SUPPLY_CHAIN_GRAPH } from '../data/mockData';
import type { SupplyChainNode, SupplyChainGraph, SupplyChainEdge } from '../types/supply-chain';
import { WhyModal, WhyDetails } from '../components/ui/WhyModal';
import { StatusBeacon, LiveTelemetryBadge } from '../components/motion';
import { useDemo } from '../context/DemoContext';

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLORS: Record<string, string> = {
  DISRUPTED: '#f43f5e',
  AT_RISK: '#f59e0b',
  NORMAL: '#38bdf8',
  CRITICAL: '#f43f5e',
  ALTERNATE: '#10b981',
};

const TIER_CONSEQUENCES: Record<string, string> = {
  FREIGHT_HUB: 'Port Blocked · +12d',
  SUPPLIER: 'Trapped at Wharf · 4 Vendors',
  MATERIAL: 'Runway: 5.2d',
  FACTORY: 'Frankfurt Line: 70%',
  PRODUCT: 'Assembly Delay · 22 Orders',
  CUSTOMER: 'At Risk · $28.3M Exp',
};

// Wide horizontal coordinate layout for 6-tier flow
const WIDE_NODE_POSITIONS: Record<string, { x: number; y: number; tierIndex: number }> = {
  // Tier 0: Disruption & Port Logistics Hub (x: 100)
  'SG-LOGISTICS-01': { x: 100, y: 220, tierIndex: 1 },

  // Tier 1: Suppliers (x: 300)
  'MY-ELECTRONICS-01': { x: 300, y: 90, tierIndex: 2 },
  'TW-CHIPS-01': { x: 300, y: 180, tierIndex: 2 },
  'JP-PRECISION-01': { x: 300, y: 270, tierIndex: 2 },
  'IN-ALTERNATE-01': { x: 300, y: 360, tierIndex: 2 },

  // Tier 2: Critical Materials (BOM) (x: 520)
  'MAT-PCB-001': { x: 520, y: 110, tierIndex: 3 },
  'MAT-CHIP-001': { x: 520, y: 210, tierIndex: 3 },
  'MAT-CONN-001': { x: 520, y: 310, tierIndex: 3 },

  // Tier 3: Manufacturing Assembly Plants (x: 740)
  'FACT-DE-001': { x: 740, y: 160, tierIndex: 4 },
  'FACT-SG-001': { x: 740, y: 280, tierIndex: 4 },

  // Tier 4: Finished Enterprise Products (x: 950)
  'PROD-ISP-X1': { x: 950, y: 160, tierIndex: 5 },
  'PROD-DLG-5G': { x: 950, y: 280, tierIndex: 5 },

  // Tier 5: Enterprise Customer Contracts (x: 1160)
  'CUST-DTE-001': { x: 1160, y: 80, tierIndex: 6 },
  'CUST-SIE-001': { x: 1160, y: 160, tierIndex: 6 },
  'CUST-BSH-001': { x: 1160, y: 240, tierIndex: 6 },
  'CUST-VOD-001': { x: 1160, y: 330, tierIndex: 6 },
};

export default function SupplyChainMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mapLayersRef = useRef<L.LayerGroup | null>(null);

  const [graph, setGraph] = useState<SupplyChainGraph>(MOCK_SUPPLY_CHAIN_GRAPH);
  const [selectedNode, setSelectedNode] = useState<SupplyChainNode | null>(null);
  const [tierFilter, setTierFilter] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [affectedOnly, setAffectedOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sequential Causal Propagation State (1: Port -> 2: Suppliers -> 3: Materials -> 4: Factories -> 5: Products -> 6: Customers)
  const [propagationStep, setPropagationStep] = useState<number>(6);
  const [isTracingCausality, setIsTracingCausality] = useState(false);
  const { rerouteState } = useDemo();

  const [whyDetails, setWhyDetails] = useState<WhyDetails | null>(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  useEffect(() => {
    fetchSupplyChainGraph()
      .then((data) => {
        if (data?.nodes?.length) setGraph(data);
      })
      .catch(() => setGraph(MOCK_SUPPLY_CHAIN_GRAPH));
  }, []);

  // Sequential Causal Wave Animation
  function triggerCausalTrace() {
    setIsTracingCausality(true);
    setPropagationStep(1);

    const steps = [2, 3, 4, 5, 6];
    steps.forEach((st, idx) => {
      setTimeout(() => {
        setPropagationStep(st);
        if (idx === steps.length - 1) {
          setIsTracingCausality(false);
        }
      }, (idx + 1) * 450);
    });
  }

  // Assign horizontal coordinates to nodes
  const layoutNodes = useMemo(() => {
    return graph.nodes.map((n) => {
      const pos = WIDE_NODE_POSITIONS[n.id] || { x: n.x ?? 100, y: n.y ?? 200, tierIndex: 3 };
      return {
        ...n,
        x: pos.x,
        y: pos.y,
        tierIndex: pos.tierIndex,
      };
    });
  }, [graph.nodes]);

  // Compute connected causal nodes for isolation (Breadth-First-Search Upstream & Downstream)
  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return null;
    const connected = new Set<string>([selectedNode.id]);

    // Upstream traversal
    let queue = [selectedNode.id];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      graph.edges.forEach((e) => {
        if (e.to === curr && !connected.has(e.from)) {
          connected.add(e.from);
          queue.push(e.from);
        }
      });
    }

    // Downstream traversal
    queue = [selectedNode.id];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      graph.edges.forEach((e) => {
        if (e.from === curr && !connected.has(e.to)) {
          connected.add(e.to);
          queue.push(e.to);
        }
      });
    }

    return connected;
  }, [selectedNode, graph]);

  // Filtered nodes based on active filters
  const filteredNodes = useMemo(() => {
    return layoutNodes.filter((n) => {
      if (affectedOnly && n.status === 'NORMAL') return false;
      if (tierFilter !== 'ALL' && n.tier !== parseInt(tierFilter)) {
        if (
          n.type !== 'FACTORY' &&
          n.type !== 'FREIGHT_HUB' &&
          n.type !== 'PRODUCT' &&
          n.type !== 'CUSTOMER' &&
          n.type !== 'MATERIAL'
        ) {
          return false;
        }
      }
      return true;
    });
  }, [layoutNodes, affectedOnly, tierFilter]);

  // 2D Tactical Geographic Leaflet Map Initialization (with offline GeoJSON base layer)
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [22, 75],
        zoom: 2.7,
        minZoom: 1.5,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // 1. Rock-solid offline GeoJSON continent base layer
      const landLayer = L.geoJSON(worldLandData as any, {
        style: {
          fillColor: '#0a1222',
          fillOpacity: 0.95,
          color: '#1a2e4c',
          weight: 0.8,
        },
      });
      landLayer.addTo(map);

      // 2. Optional canvas tile layer with graceful fallback
      const tileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16, opacity: 0.65 }
      );
      tileLayer.on('tileerror', () => {});
      tileLayer.addTo(map);

      mapLayersRef.current = L.layerGroup().addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapLayersRef.current = null;
      }
    };
  }, []);

  // Update geographic map polylines & markers on state change
  useEffect(() => {
    const layers = mapLayersRef.current;
    if (!layers) return;
    layers.clearLayers();

    const isRouteActive = rerouteState === 'ACTIVE';
    const isRouteProposed = rerouteState === 'PROPOSED' || rerouteState === 'APPROVED';

    // 1. Draw geographic routes
    graph.edges.forEach((edge) => {
      const fromNode = graph.nodes.find((n) => n.id === edge.from);
      const toNode = graph.nodes.find((n) => n.id === edge.to);
      if (!fromNode?.coordinates || !toNode?.coordinates) return;

      const isDisrupted = edge.status === 'DISRUPTED';
      const isBypassed = isRouteActive && isDisrupted;
      const isEdgeInChain = connectedNodeIds
        ? connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to)
        : true;
      const isDimmed = connectedNodeIds ? !isEdgeInChain : false;

      const color = isBypassed
        ? '#475569'
        : isEdgeInChain && connectedNodeIds
        ? '#38bdf8'
        : isDisrupted
        ? '#f43f5e'
        : '#0ea5e9';

      L.polyline(
        [
          [fromNode.coordinates.lat, fromNode.coordinates.lng],
          [toNode.coordinates.lat, toNode.coordinates.lng],
        ],
        {
          color,
          weight: isBypassed ? 1.5 : isEdgeInChain && connectedNodeIds ? 3.5 : isDisrupted ? 2.5 : 1.2,
          opacity: isBypassed ? 0.25 : isDimmed ? 0.1 : isDisrupted ? 0.9 : 0.4,
          dashArray: isBypassed ? '4, 8' : isDisrupted ? '6, 6' : undefined,
        }
      ).addTo(layers);
    });

    // 2. Draw candidate / active reroute air bridge (Bangalore -> Frankfurt)
    if (isRouteProposed || isRouteActive) {
      const bangalore: [number, number] = [12.9716, 77.5946];
      const frankfurt: [number, number] = [50.1109, 8.6821];

      L.polyline([bangalore, frankfurt], {
        color: isRouteActive ? '#10b981' : '#f59e0b',
        weight: isRouteActive ? 4.5 : 3.0,
        opacity: isRouteActive ? 1.0 : 0.85,
        dashArray: isRouteActive ? undefined : '8, 6',
      }).addTo(layers);
    }

    // 3. Draw facility markers
    filteredNodes.forEach((node) => {
      if (!node.coordinates) return;
      const isSelected = selectedNode?.id === node.id;
      const isInChain = connectedNodeIds ? connectedNodeIds.has(node.id) : true;
      const isDimmed = connectedNodeIds ? !isInChain : false;
      const isFactory = node.type === 'FACTORY';
      const isDisrupted = node.status === 'DISRUPTED';
      const isAlt = node.id === 'IN-ALTERNATE-01';

      const color = isAlt && isRouteActive
        ? '#10b981'
        : isAlt && isRouteProposed
        ? '#f59e0b'
        : STATUS_COLORS[node.status] ?? '#38bdf8';

      const marker = L.circleMarker([node.coordinates.lat, node.coordinates.lng], {
        radius: isSelected ? 12 : isFactory ? 8 : 6,
        fillColor: color,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 2.5 : 1.5,
        opacity: isDimmed ? 0.2 : 0.95,
        fillOpacity: isDimmed ? 0.1 : isSelected ? 0.95 : 0.75,
      });

      marker.bindTooltip(
        `<div class="font-mono text-xs p-1"><strong>${node.name}</strong><br/><span class="text-slate-400">${node.type}</span></div>`,
        { direction: 'top', className: 'bg-[#060a14] border border-white/20 text-white rounded' }
      );

      marker.on('click', () => setSelectedNode(node));
      marker.addTo(layers);
    });
  }, [graph, filteredNodes, selectedNode, connectedNodeIds, rerouteState]);

  // Smooth flyTo on node selection
  useEffect(() => {
    if (selectedNode?.coordinates && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedNode.coordinates.lat, selectedNode.coordinates.lng],
        5,
        { duration: 1.0 }
      );
    }
  }, [selectedNode]);

  const explainNodeRisk = (node: SupplyChainNode) => {
    setWhyDetails({
      title: `Causal Analysis: ${node.name}`,
      metric: `${node.type} // Status: ${node.status}`,
      formula: 'Downstream Exposure = Transshipment Loss * BOM Multiplier * Order SLA Penalties',
      explanation: `Operational impact directly linked to the Singapore MPA Terminal congestion. Transshipment delays propagate through regional suppliers into the Frankfurt Assembly Hub.`,
      parameters: [
        { label: 'Node Entity ID', value: node.id, note: 'ERP Canonical identifier' },
        { label: 'Network Tier', value: `Tier 0${(node as any).tierIndex || node.tier || 1}`, note: 'Supply chain hierarchy position' },
        { label: 'Current Status', value: node.status, note: node.status === 'DISRUPTED' ? 'Active bottleneck' : 'Operational constraint' },
      ],
      sources: [
        { name: 'SAP S/4HANA Supply Chain Model', type: 'ERP', verified: true },
        { name: 'ChainPulse Topological Causal Engine', type: 'SCENARIO_ENGINE', verified: true },
      ],
      governanceNote: 'Deterministic state verified across ERP and physical AIS tracking.',
    });
    setWhyModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1800px] w-full mx-auto animate-fade-in min-w-0">
      {/* 1. Header & Control / Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              SUPPLY CHAIN NETWORK TOPOLOGY
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              CAUSAL PROPAGATION & DEPENDENCY GRAPH
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3 mt-1">
            Supply Chain Network
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="critical" size="sm" />
              Singapore Maritime Disruption
            </span>
          </h1>
        </div>

        {/* Tracing Controls & Filter Rail */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <LiveTelemetryBadge label="TOPOLOGY" statusText="6-TIER ACTIVE" variant="info" />

          {/* Primary Action: Trigger Causal Propagation Wave */}
          <button
            onClick={triggerCausalTrace}
            disabled={isTracingCausality}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.35)] cursor-pointer"
          >
            {isTracingCausality ? <Radio size={13} className="animate-spin text-slate-950" /> : <Play size={13} />}
            <span>{isTracingCausality ? `Tracing Wave (Tier 0${propagationStep})...` : 'TRIGGER CAUSAL TRACE'}</span>
          </button>

          {/* Tier Filters */}
          <div className="flex gap-1 bg-[#090f1d] border border-white/[0.08] rounded-xl p-1">
            {(['ALL', '1', '2', '3'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer',
                  tierFilter === t
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t === 'ALL' ? 'All Tiers' : `Tier ${t}`}
              </button>
            ))}
          </div>

          {/* Show Affected Only Toggle */}
          <button
            onClick={() => setAffectedOnly(!affectedOnly)}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer',
              affectedOnly
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                : 'border-white/[0.08] bg-[#090f1d] text-slate-400 hover:text-slate-200'
            )}
          >
            {affectedOnly ? 'Affected Only ✓' : 'Show Affected'}
          </button>

          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Clear selection and reset highlight"
            >
              <RotateCcw size={12} />
              <span>Reset Isolation</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO: FULL-WIDTH TOPOLOGICAL CAUSAL CANVAS (Dominant Visual - 70-80% Emphasis) */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#080e1d] via-[#050914] to-[#03060e] border border-sky-500/30 shadow-[0_16px_50px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Ambient Telemetry Grid */}
        <div className="absolute inset-0 cp-telemetry-grid opacity-25 pointer-events-none" />

        {/* Canvas Header Bar */}
        <div className="relative z-10 px-5 py-3 border-b border-white/[0.06] bg-[#070c18]/80 backdrop-blur-md flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Network size={16} className="text-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              TOPOLOGICAL CAUSAL CANVAS
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
              (Singapore Port ──► Freight Hub ──► Suppliers ──► BOM ──► Factory ──► Products ──► Customers)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {selectedNode ? (
              <span className="text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                Isolated: {selectedNode.name} (Upstream + Downstream Illuminated)
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">
                Click any node to trace upstream dependencies & downstream impact
              </span>
            )}
            <span className="text-[10px] text-amber-400 font-bold hidden sm:inline">
              {isTracingCausality ? `WAVE AT TIER 0${propagationStep}` : 'STEADY STATE'}
            </span>
          </div>
        </div>

        {/* SVG Viewport: Wide Horizontal Composition */}
        <div className="relative w-full overflow-x-auto p-4 select-none">
          <svg viewBox="0 0 1280 430" className="w-full h-auto min-w-[1000px] max-h-[460px]">
            <defs>
              <linearGradient id="curveDisrupted" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="curveNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="curveActiveReroute" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="1.0" />
              </linearGradient>
            </defs>

            {/* Column Tier Labels */}
            <g opacity={0.75} className="font-mono text-[10px] font-bold tracking-wider fill-slate-400">
              <text x={100} y={24} textAnchor="middle">TIER 01 · PORT / HUB</text>
              <text x={300} y={24} textAnchor="middle">TIER 02 · SUPPLIERS</text>
              <text x={520} y={24} textAnchor="middle">TIER 03 · MATERIALS (BOM)</text>
              <text x={740} y={24} textAnchor="middle">TIER 04 · FACTORIES</text>
              <text x={950} y={24} textAnchor="middle">TIER 05 · PRODUCTS</text>
              <text x={1160} y={24} textAnchor="middle">TIER 06 · CUSTOMERS</text>
              <line x1={40} y1={34} x2={1240} y2={34} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            </g>

            {/* Connecting Bezier Splines between Tiers */}
            {graph.edges.map((edge) => {
              const from = layoutNodes.find((n) => n.id === edge.from);
              const to = layoutNodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;

              const isDisrupted = edge.status === 'DISRUPTED';
              const isAtRisk = edge.status === 'AT_RISK';
              const isRouteActive = rerouteState === 'ACTIVE';

              // Disrupted route bypassed on activation
              const isBypassed = isRouteActive && isDisrupted;

              const isInChain = connectedNodeIds
                ? connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to)
                : true;
              const isDimmed = connectedNodeIds ? !isInChain : false;

              // Cubic bezier control points for wide horizontal flow
              const dx = to.x - from.x;
              const pathD = `M ${from.x} ${from.y} C ${from.x + dx * 0.5} ${from.y}, ${from.x + dx * 0.5} ${to.y}, ${to.x} ${to.y}`;

              const strokeColor = isBypassed
                ? '#475569'
                : isInChain && connectedNodeIds
                ? '#38bdf8'
                : isDisrupted
                ? 'url(#curveDisrupted)'
                : isAtRisk
                ? '#f59e0b'
                : 'url(#curveNormal)';

              return (
                <g key={edge.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isBypassed ? 1.5 : isInChain && connectedNodeIds ? 3 : isDisrupted ? 2.5 : 1.2}
                    strokeOpacity={isDimmed ? 0.06 : isBypassed ? 0.25 : isDisrupted ? 0.9 : 0.35}
                    strokeDasharray={isBypassed ? '4 6' : isDisrupted ? '6 6' : undefined}
                  />

                  {/* Traveling directional signal packets */}
                  {!isBypassed && !isDimmed && (isDisrupted || (isInChain && connectedNodeIds)) && (
                    <circle r={isDisrupted ? 3.5 : 2.5} fill={isDisrupted ? '#f43f5e' : '#38bdf8'}>
                      <animateMotion path={pathD} dur={isDisrupted ? '2.0s' : '3.0s'} repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Candidate / Active Reroute Arc: Bangalore (300, 360) -> PCB Assemblies (520, 110) -> Frankfurt (740, 160) */}
            {rerouteState !== 'BLOCKED' && (
              <g>
                <path
                  d="M 300 360 C 410 360, 410 110, 520 110"
                  fill="none"
                  stroke={rerouteState === 'ACTIVE' ? '#10b981' : '#f59e0b'}
                  strokeWidth={rerouteState === 'ACTIVE' ? 4.0 : 2.5}
                  strokeDasharray={rerouteState === 'ACTIVE' ? 'none' : '6 6'}
                  strokeOpacity={0.95}
                />
                <circle
                  r={rerouteState === 'ACTIVE' ? 4.5 : 3.5}
                  fill={rerouteState === 'ACTIVE' ? '#10b981' : '#f59e0b'}
                >
                  <animateMotion
                    path="M 300 360 C 410 360, 410 110, 520 110"
                    dur={rerouteState === 'ACTIVE' ? '1.4s' : '2.2s'}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Status Pill on Reroute Arc */}
                <rect
                  x={360}
                  y={225}
                  width={140}
                  height={20}
                  rx={5}
                  fill="#060c18"
                  stroke={rerouteState === 'ACTIVE' ? '#10b981' : '#f59e0b'}
                  strokeWidth={1.2}
                />
                <text
                  x={430}
                  y={238}
                  textAnchor="middle"
                  fill={rerouteState === 'ACTIVE' ? '#34d399' : '#fbbf24'}
                  fontSize={8.5}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {rerouteState === 'ACTIVE' ? '✓ AIR BRIDGE ACTIVE' : '⚡ CANDIDATE AIR BRIDGE'}
                </text>
              </g>
            )}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isInChain = connectedNodeIds ? connectedNodeIds.has(node.id) : true;
              const isDimmed = connectedNodeIds ? !isInChain : false;
              const isWavePulsing = isTracingCausality && node.tierIndex === propagationStep;
              const isAffected = node.status === 'DISRUPTED' || node.status === 'AT_RISK';
              const isAlt = node.id === 'IN-ALTERNATE-01';
              const isRouteActive = rerouteState === 'ACTIVE';

              const color = isAlt && isRouteActive
                ? '#10b981'
                : isAlt && (rerouteState === 'PROPOSED' || rerouteState === 'APPROVED')
                ? '#f59e0b'
                : STATUS_COLORS[node.status] ?? '#38bdf8';

              const consequence = isAffected ? TIER_CONSEQUENCES[node.type] : null;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={`cursor-pointer transition-opacity duration-300 ${
                    isDimmed ? 'opacity-20' : 'opacity-100'
                  }`}
                >
                  {/* Outer selection / wave halo */}
                  {(isSelected || isWavePulsing) && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={28}
                      fill={color}
                      opacity={0.3}
                      className="animate-beacon"
                    />
                  )}

                  {/* Node Shape */}
                  {node.type === 'SUPPLIER' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={18}
                      fill={isSelected ? `${color}40` : `${color}20`}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />
                  )}
                  {node.type === 'FREIGHT_HUB' && (
                    <rect
                      x={node.x - 22}
                      y={node.y - 18}
                      width={44}
                      height={36}
                      rx={6}
                      fill={isSelected ? `${color}40` : `${color}20`}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                  )}
                  {node.type === 'MATERIAL' && (
                    <polygon
                      points={`${node.x},${node.y - 18} ${node.x + 18},${node.y} ${node.x},${node.y + 18} ${node.x - 18},${node.y}`}
                      fill={isSelected ? `${color}40` : `${color}20`}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />
                  )}
                  {node.type === 'FACTORY' && (
                    <rect
                      x={node.x - 20}
                      y={node.y - 20}
                      width={40}
                      height={40}
                      rx={6}
                      fill={isSelected ? `${color}40` : `${color}20`}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                  )}
                  {node.type === 'PRODUCT' && (
                    <polygon
                      points={`${node.x},${node.y - 20} ${node.x + 20},${node.y + 10} ${node.x - 20},${node.y + 10}`}
                      fill={isSelected ? `${color}40` : `${color}20`}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />
                  )}
                  {node.type === 'CUSTOMER' && (
                    <rect
                      x={node.x - 24}
                      y={node.y - 15}
                      width={48}
                      height={30}
                      rx={6}
                      fill={isSelected ? `${color}40` : `${color}20`}
                      stroke={isSelected ? '#ffffff' : color}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                    />
                  )}

                  {/* Consequence Floating Pill */}
                  {consequence && (
                    <g>
                      <rect
                        x={node.x - 52}
                        y={node.y - 32}
                        width={104}
                        height={15}
                        rx={3}
                        fill="#070c18"
                        stroke={color}
                        strokeWidth={0.9}
                      />
                      <text
                        x={node.x}
                        y={node.y - 22}
                        textAnchor="middle"
                        fill={color}
                        fontSize={7.5}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {consequence}
                      </text>
                    </g>
                  )}

                  {/* Primary Node Label */}
                  <text
                    x={node.x}
                    y={node.y + 30}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : isAffected ? '#f1f5f9' : '#94a3b8'}
                    fontSize={9.5}
                    fontWeight={isSelected || isAffected ? 'bold' : 'normal'}
                    fontFamily="Inter, sans-serif"
                  >
                    {node.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 3. SUPPORTING BOTTOM SECTION: Geographic Supply Map + Node Inspection Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[360px]">
        {/* Supporting Geographic Route Map (60% / col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#080d19] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-sky-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Supporting Geographic Corridor Context
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Singapore ──► Malacca Strait ──► European Terminals
            </span>
          </div>

          <div
            ref={mapRef}
            className="w-full flex-1 min-h-[280px] rounded-xl overflow-hidden border border-white/[0.06] bg-[#060a14]"
          />
        </div>

        {/* Node Inspection & Diagnostic Dossier (40% / col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#080d19] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Box size={16} className="text-sky-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  {selectedNode ? selectedNode.name : 'Network Node Inspection'}
                </h3>
              </div>
              {selectedNode ? (
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                    selectedNode.status === 'DISRUPTED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : selectedNode.status === 'AT_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}
                >
                  {selectedNode.status}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">STANDBY INSPECTION</span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase block">Entity ID</span>
                    <span className="text-slate-200 font-bold">{selectedNode.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 uppercase block">Hierarchy Tier</span>
                    <span className="text-sky-400 font-bold">Tier 0{(selectedNode as any).tierIndex || selectedNode.tier || 1}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase block">Causal Disruption Impact</span>
                  <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                    {selectedNode.type === 'FREIGHT_HUB'
                      ? 'Singapore MPA Terminal container clearance down 65% with 847 vessels queued. Average berth waiting time is 8-12 days.'
                      : selectedNode.type === 'SUPPLIER'
                      ? 'Shipment stranded at port terminal. Lead time extended from 8 to 26 days.'
                      : selectedNode.type === 'MATERIAL'
                      ? 'Raw silicon and PCB stock drops below 7-day safety runway.'
                      : selectedNode.type === 'FACTORY'
                      ? 'Frankfurt Assembly lines throttled to 70% capacity to preserve components.'
                      : selectedNode.type === 'PRODUCT'
                      ? '22 enterprise purchase orders delayed totaling $28.1M contract value.'
                      : 'Contract delivery SLA at severe breach risk with penalty clauses.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                <Network size={32} className="text-slate-600 animate-pulse" />
                <p className="text-xs font-mono">Select any node on the canvas to inspect dependencies and impact</p>
              </div>
            )}
          </div>

          {selectedNode && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
              <button
                onClick={() => explainNodeRisk(selectedNode)}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle size={14} />
                <span>Explain Causal Formula</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Decision Provenance / Explainability Modal */}
      <WhyModal
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        details={whyDetails}
      />
    </div>
  );
}
