import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Cpu,
  Factory,
  Layers,
  Network,
  Play,
  Radio,
  RotateCcw,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { fetchSupplyChainGraph } from '../services/supplyChain';
import { MOCK_SUPPLY_CHAIN_GRAPH } from '../data/mockData';
import type { SupplyChainNode, SupplyChainGraph } from '../types/supply-chain';

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
};

import { WhyModal, WhyDetails } from '../components/ui/WhyModal';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import { StatusBeacon, LiveTelemetryBadge } from '../components/motion';
import { useDemo } from '../context/DemoContext';

const TIER_CONSEQUENCES: Record<string, string> = {
  FREIGHT_HUB: 'Corridor Blocked · +12d',
  SUPPLIER: 'Capacity Throttled · 4 Vendors',
  MATERIAL: 'Inventory Runway: 5-7d',
  FACTORY: 'Frankfurt Throttled to 70%',
  PRODUCT: 'Assembly Delay · 22 Orders',
  CUSTOMER: 'Orders at Risk · $28.3M',
};

function NodeShape({
  node,
  selected,
  isPropagated,
  isCurrentlyPulsing,
  isDimmed = false,
  onClick,
}: {
  node: SupplyChainNode;
  selected: boolean;
  isPropagated: boolean;
  isCurrentlyPulsing: boolean;
  isDimmed?: boolean;
  onClick: () => void;
}) {
  const color = STATUS_COLORS[node.status] ?? '#94a3b8';
  const cx = node.x ?? 0;
  const cy = node.y ?? 0;

  const isAffected = node.status === 'DISRUPTED' || node.status === 'AT_RISK';
  const consequence = isPropagated && isAffected ? TIER_CONSEQUENCES[node.type] : null;

  const shapeProps = {
    fill: selected ? `${color}40` : isAffected ? `${color}25` : '#0b1324',
    stroke: selected ? '#ffffff' : color,
    strokeWidth: selected ? 2.5 : isAffected ? 2 : 1.2,
    className: 'cursor-pointer transition-all duration-200',
    onClick,
  };

  const displayName = node.name || node.id || 'Node';

  return (
    <g
      className={`cursor-pointer group transition-opacity duration-300 ${
        isDimmed
          ? 'opacity-20'
          : isPropagated || !isAffected
          ? 'opacity-100'
          : 'opacity-40'
      }`}
      onClick={onClick}
    >
      {/* Outer halo when selected, pulsing or affected */}
      {(selected || isCurrentlyPulsing) && (
        <circle
          cx={cx}
          cy={cy}
          r={24}
          fill={color}
          opacity={0.3}
          className="animate-beacon"
        />
      )}

      {node.type === 'SUPPLIER' && <circle cx={cx} cy={cy} r={16} {...shapeProps} />}
      {node.type === 'MATERIAL' && (
        <polygon
          points={`${cx},${cy - 15} ${cx + 15},${cy} ${cx},${cy + 15} ${cx - 15},${cy}`}
          {...shapeProps}
        />
      )}
      {node.type === 'FACTORY' && (
        <rect x={cx - 16} y={cy - 16} width={32} height={32} rx={4} {...shapeProps} />
      )}
      {node.type === 'PRODUCT' && (
        <polygon
          points={`${cx},${cy - 17} ${cx + 16},${cy + 8} ${cx - 16},${cy + 8}`}
          {...shapeProps}
        />
      )}
      {node.type === 'CUSTOMER' && (
        <rect x={cx - 20} y={cy - 12} width={40} height={24} rx={5} {...shapeProps} />
      )}
      {node.type === 'FREIGHT_HUB' && (
        <polygon
          points={`${cx},${cy - 18} ${cx + 18},${cy} ${cx},${cy + 18} ${cx - 18},${cy}`}
          {...shapeProps}
        />
      )}

      {/* Floating Consequence Pill */}
      {consequence && (
        <g>
          <rect
            x={cx - 48}
            y={cy - 28}
            width={96}
            height={14}
            rx={3}
            fill="#090f1e"
            stroke={color}
            strokeWidth={0.8}
            opacity={0.9}
          />
          <text
            x={cx}
            y={cy - 18}
            textAnchor="middle"
            fill={color}
            fontSize={7}
            fontWeight="700"
            fontFamily="monospace"
            className="pointer-events-none select-none"
          >
            {consequence}
          </text>
        </g>
      )}

      {/* Node Label */}
      <text
        x={cx}
        y={cy + 26}
        textAnchor="middle"
        fill={selected ? '#38bdf8' : isAffected ? '#e2e8f0' : '#64748b'}
        fontSize={8.5}
        fontWeight={selected || isAffected ? '600' : '400'}
        fontFamily="Inter, sans-serif"
        className="pointer-events-none select-none"
      >
        {displayName.split(' ').slice(0, 2).join(' ')}
      </text>
    </g>
  );
}

type TierFilter = 'ALL' | '1' | '2' | '3';

export default function SupplyChainMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mapLayersRef = useRef<L.LayerGroup | null>(null);

  const [graph, setGraph] = useState<SupplyChainGraph>(MOCK_SUPPLY_CHAIN_GRAPH);
  const [selectedNode, setSelectedNode] = useState<SupplyChainNode | null>(null);
  const [tierFilter, setTierFilter] = useState<TierFilter>('ALL');
  const [affectedOnly, setAffectedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sequential Causal Propagation State
  // 1: FREIGHT_HUB -> 2: SUPPLIER -> 3: MATERIAL -> 4: FACTORY -> 5: PRODUCT -> 6: CUSTOMER
  const [propagationStep, setPropagationStep] = useState<number>(6);
  const [isTracingCausality, setIsTracingCausality] = useState(false);
  const { rerouteState } = useDemo();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSupplyChainGraph()
      .then((data) => {
        if (!mounted) return;
        if (data?.nodes?.length) {
          setGraph(data);
          setLoadError(null);
        } else {
          setGraph(MOCK_SUPPLY_CHAIN_GRAPH);
        }
      })
      .catch((err) => {
        console.warn('Using fallback supply chain graph due to:', err);
        if (mounted) setGraph(MOCK_SUPPLY_CHAIN_GRAPH);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
      }, (idx + 1) * 600);
    });
  }

  const [whyDetails, setWhyDetails] = useState<WhyDetails | null>(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  // Compute connected causal nodes for isolation
  const connectedNodeIds = React.useMemo(() => {
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

  const getNodeRiskExplanation = (node: SupplyChainNode): { summary: string; detail: string; formula: string } => {
    switch (node.type) {
      case 'FREIGHT_HUB':
        return {
          summary: 'Singapore Port MPA terminal congestion post-typhoon',
          detail: 'Container throughput down 65% with 847 vessels queued. Average berth waiting time is 8-12 days, stalling export containers for upstream Asian suppliers.',
          formula: 'Throughput Loss = (Nominal 100% - Current 35%) = -65% Capacity Constraint',
        };
      case 'SUPPLIER':
        return {
          summary: `${node.name} cannot ship components due to port delays`,
          detail: 'Export containers are stranded at Tanjong Pagar berth. Raw silicon buffer drops below safety threshold within 5 days, throttling output delivery.',
          formula: 'Buffer Depletion = Initial Safety Stock (14d) - Delay (12d) = 2 Days Remaining Runway',
        };
      case 'MATERIAL':
        return {
          summary: `${node.name} warehouse stock drops below critical replenishment horizon`,
          detail: 'Replenishment lead time jumped from 8 days to 26 days. Current plant inventory provides only 5.2 days of manufacturing buffer.',
          formula: 'Deficit Gap = Promised Lead Time (26d) - Runway Stock (5.2d) = 20.8 Days Stockout Risk',
        };
      case 'FACTORY':
        return {
          summary: 'Frankfurt Hub assembly lines throttled to 70% capacity',
          detail: 'Consumes constrained PCB Assemblies and Logic Chips. Assembly line speed reduced to stretch remaining raw component buffer until emergency supply arrives.',
          formula: 'Capacity Throttling = 70% Operation Mode (Saves 4.8 days of component buffer)',
        };
      case 'PRODUCT':
        return {
          summary: 'IntelliSense Pro X1 assembly delayed for 22 customer purchase orders',
          detail: 'Enterprise flagship SKU requires PCB micro-assemblies from Penang. Delayed production directly impacts scheduled deliveries for Tier-1 enterprise clients.',
          formula: 'Committed Orders At Risk = 22 Orders totaling $28.1M contract value',
        };
      case 'CUSTOMER':
        return {
          summary: `${node.name} order fulfillment deadline falls inside stockout window`,
          detail: 'Contracted SLA terms impose severe breach penalties for unfulfilled purchase orders. Modeled financial risk contributes to enterprise $28.3M maximum exposure.',
          formula: 'Customer Exposure = ∑ Order Values + Contractual SLA Penalty Clauses',
        };
      default:
        return {
          summary: 'Node impacted by cascading supply disruption',
          detail: 'Causal dependency connected to the Singapore maritime bottleneck.',
          formula: 'Impact Propagation Factor = 0.88',
        };
    }
  };

  const filteredNodes = graph.nodes.filter((n) => {
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

  function isNodePropagated(nodeType: string): boolean {
    const order = ['FREIGHT_HUB', 'SUPPLIER', 'MATERIAL', 'FACTORY', 'PRODUCT', 'CUSTOMER'];
    const nodeIndex = order.indexOf(nodeType) + 1;
    return nodeIndex <= propagationStep;
  }

  function isNodePulsing(nodeType: string): boolean {
    const order = ['FREIGHT_HUB', 'SUPPLIER', 'MATERIAL', 'FACTORY', 'PRODUCT', 'CUSTOMER'];
    const nodeIndex = order.indexOf(nodeType) + 1;
    return nodeIndex === propagationStep;
  }

  // Map initialization
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [22, 65],
        zoom: 2.6,
        minZoom: 1.5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      const tileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        }
      );
      tileLayer.on('tileerror', () => {
        // Silently tolerate missing tiles
      });
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

  // Update map layers with synchronized causal path highlighting
  useEffect(() => {
    const layers = mapLayersRef.current;
    if (!layers) return;
    layers.clearLayers();

    // 1. Draw geographic routes with causal path illumination
    graph.edges.forEach((edge) => {
      const fromNode = graph.nodes.find((n) => n.id === edge.from);
      const toNode = graph.nodes.find((n) => n.id === edge.to);
      if (!fromNode?.coordinates || !toNode?.coordinates) return;

      const isDisrupted = edge.status === 'DISRUPTED';
      const isAtRisk = edge.status === 'AT_RISK';
      const isEdgeInCausalChain =
        connectedNodeIds
          ? connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to)
          : true;
      const isDimmed = connectedNodeIds ? !isEdgeInCausalChain : false;

      // When reroute is active, the disrupted sea route from Singapore is bypassed
      const isBypassed = rerouteState === 'ACTIVE' && isDisrupted;

      const color = isBypassed
        ? '#475569'
        : isEdgeInCausalChain && connectedNodeIds
        ? '#38bdf8'
        : isDisrupted
        ? '#f43f5e'
        : isAtRisk
        ? '#f59e0b'
        : '#0ea5e9';

      L.polyline(
        [
          [fromNode.coordinates.lat, fromNode.coordinates.lng],
          [toNode.coordinates.lat, toNode.coordinates.lng],
        ],
        {
          color,
          weight: isBypassed ? 1.5 : isEdgeInCausalChain && connectedNodeIds ? 3.5 : isDisrupted ? 2.5 : 1.2,
          opacity: isBypassed ? 0.2 : isDimmed ? 0.08 : isDisrupted ? 0.9 : isEdgeInCausalChain ? 0.8 : 0.35,
          dashArray: isBypassed ? '4, 8' : isDisrupted ? '6, 4' : undefined,
        }
      ).addTo(layers);
    });

    // 1b. If reroute is PROPOSED, APPROVED, or ACTIVE, draw the Candidate / Authorized Reroute!
    if (rerouteState === 'PROPOSED' || rerouteState === 'APPROVED' || rerouteState === 'ACTIVE') {
      const isRouteActive = rerouteState === 'ACTIVE';
      const bangalore: [number, number] = [12.9716, 77.5946];
      const frankfurt: [number, number] = [50.1109, 8.6821];

      // Draw Reroute Polyline
      const rerouteLine = L.polyline([bangalore, frankfurt], {
        color: isRouteActive ? '#10b981' : '#f59e0b',
        weight: isRouteActive ? 4.5 : 3.0,
        opacity: isRouteActive ? 1.0 : 0.85,
        dashArray: isRouteActive ? undefined : '8, 6',
      }).addTo(layers);

      rerouteLine.bindPopup(
        isRouteActive
          ? `<div class="p-2 font-mono text-xs">
              <strong class="text-emerald-400 font-bold">✓ AUTHORIZED REROUTE ACTIVE</strong><br/>
              <span>Corridor: Bangalore / Air Bridge ──► Frankfurt Hub</span><br/>
              <span class="text-slate-400">Transit: 8 Days · Strategy B Engaged</span>
            </div>`
          : `<div class="p-2 font-mono text-xs">
              <strong class="text-amber-400 font-bold">⚡ AI PROPOSED CANDIDATE REROUTE</strong><br/>
              <span>Corridor: Bangalore / Air Bridge ──► Frankfurt Hub</span><br/>
              <span class="text-slate-400">Awaiting Human Authorization</span>
            </div>`
      );

      // Add special animated Reroute corridor marker at Bangalore
      const rerouteIcon = L.divIcon({
        className: 'relative flex items-center justify-center',
        iconSize: [24, 24],
        html: `<div class="relative flex items-center justify-center w-6 h-6">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${isRouteActive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${isRouteActive ? 'bg-emerald-500' : 'bg-amber-500'} border-2 border-white shadow-[0_0_14px_${isRouteActive ? '#10b981' : '#f59e0b'}]"></span>
        </div>`,
      });
      L.marker(bangalore, { icon: rerouteIcon }).addTo(layers);
    }

    // 2. Draw geographic node markers
    filteredNodes.forEach((node) => {
      if (!node.coordinates) return;
      const color = STATUS_COLORS[node.status] ?? '#94a3b8';
      const isSelected = selectedNode?.id === node.id;
      const isInCausalChain = connectedNodeIds ? connectedNodeIds.has(node.id) : true;
      const isDimmed = connectedNodeIds ? !isInCausalChain : false;

      // Special pulsing beacon for Singapore Port Disruption
      if (node.id.includes('SG') || node.type === 'FREIGHT_HUB') {
        const pulseIcon = L.divIcon({
          className: 'relative flex items-center justify-center',
          iconSize: [24, 24],
          html: `<div class="relative flex items-center justify-center w-6 h-6">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white shadow-[0_0_12px_#f43f5e]"></span>
          </div>`,
        });
        const pulseMarker = L.marker([node.coordinates.lat, node.coordinates.lng], {
          icon: pulseIcon,
          opacity: isDimmed ? 0.2 : 1,
        });
        pulseMarker.on('click', () => setSelectedNode(node));
        pulseMarker.addTo(layers);
        return;
      }

      const marker = L.circleMarker([node.coordinates.lat, node.coordinates.lng], {
        radius: isSelected ? 12 : node.type === 'FACTORY' ? 8 : 6,
        fillColor: color,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 2.5 : 1,
        opacity: isDimmed ? 0.2 : 0.95,
        fillOpacity: isDimmed ? 0.1 : isSelected ? 0.9 : 0.65,
      });

      marker.on('click', () => {
        setSelectedNode(node);
      });

      marker.addTo(layers);
    });
  }, [graph, filteredNodes, selectedNode, connectedNodeIds, rerouteState]);

  // Smooth camera flyTo when a node is selected
  useEffect(() => {
    if (selectedNode?.coordinates && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedNode.coordinates.lat, selectedNode.coordinates.lng],
        5,
        { duration: 1.0 }
      );
    }
  }, [selectedNode]);

  const TIERS: { key: TierFilter; label: string }[] = [
    { key: 'ALL', label: 'All Tiers' },
    { key: '1', label: 'Tier 1' },
    { key: '2', label: 'Tier 2' },
    { key: '3', label: 'Tier 3' },
  ];

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto animate-fade-in flex flex-col h-[calc(100vh-var(--header-height))]">
      {/* Header & Filter Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              NETWORK TOPOLOGY & GEOSPATIAL CORRIDORS
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">CAUSAL PROPAGATION ENGINE</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Supply Chain Network Graph
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="critical" size="sm" />
              Singapore Impact Active
            </span>
          </h1>
        </div>

        {/* Tracing Controls and Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <LiveTelemetryBadge label="TOPOLOGY" statusText="5-TIER ACTIVE" variant="info" className="hidden xl:inline-flex" />
          <button
            onClick={triggerCausalTrace}
            disabled={isTracingCausality}
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            {isTracingCausality ? <Radio size={12} className="animate-spin" /> : <Play size={12} />}
            <span>{isTracingCausality ? `Propagating (T+${propagationStep})` : 'Simulate Propagation'}</span>
          </button>

          <div className="flex gap-1 bg-[#090f1d] border border-white/[0.08] rounded-lg p-1">
            {TIERS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTierFilter(t.key)}
                className={clsx(
                  'px-2.5 py-1 rounded text-xs font-mono transition-all',
                  tierFilter === t.key
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setAffectedOnly(!affectedOnly)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-mono border transition-all',
              affectedOnly
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                : 'border-white/[0.08] bg-[#090f1d] text-slate-400 hover:text-slate-200'
            )}
          >
            {affectedOnly ? 'Affected Only ✓' : 'Show Affected'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#080d19] border border-white/[0.06] rounded-2xl">
          <LoadingSpinner size="lg" />
          <p className="text-xs font-mono text-slate-400">Synthesizing 5-tier dependency graph...</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* SVG Dependency Graph: 58% (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#070b16] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="py-2.5 px-4 bg-[#090f1e] border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={14} className="text-sky-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  TOPOLOGICAL CAUSAL CANVAS
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  (Port ──► Supplier ──► BOM ──► Factory ──► Customer)
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400">
                {isTracingCausality ? `WAVE AT STAGE 0${propagationStep}` : 'WAVE PROPAGATED'}
              </span>
            </div>

            <div className="relative flex-1 overflow-auto p-2 bg-[#050812]">
              <svg viewBox="0 0 650 740" className="w-full h-auto min-h-[540px] max-h-[740px] select-none">
                {/* Column Headers */}
                <g opacity={0.85}>
                  <text x={70} y={22} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight="700" letterSpacing="0.08em" fontFamily="monospace">
                    SUPPLIERS
                  </text>
                  <text x={190} y={22} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight="700" letterSpacing="0.08em" fontFamily="monospace">
                    MATERIALS
                  </text>
                  <text x={320} y={22} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight="700" letterSpacing="0.08em" fontFamily="monospace">
                    PLANTS
                  </text>
                  <text x={440} y={22} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight="700" letterSpacing="0.08em" fontFamily="monospace">
                    PRODUCTS
                  </text>
                  <text x={560} y={22} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight="700" letterSpacing="0.08em" fontFamily="monospace">
                    CLIENTS
                  </text>
                  <line x1={20} y1={30} x2={620} y2={30} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                </g>

                {/* Edges with Moving Energy Packets */}
                {graph.edges.map((edge) => {
                  const from = graph.nodes.find((n) => n.id === edge.from);
                  const to = graph.nodes.find((n) => n.id === edge.to);
                  if (!from?.x || !to?.x) return null;
                  const isDisrupted = edge.status === 'DISRUPTED';
                  const isAtRisk = edge.status === 'AT_RISK';
                  const color = isDisrupted ? '#f43f5e' : isAtRisk ? '#f59e0b' : '#1e293b';

                  const isEdgeInChain = connectedNodeIds
                    ? connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to)
                    : true;
                  const isDimmedEdge = connectedNodeIds ? !isEdgeInChain : false;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={isEdgeInChain && connectedNodeIds ? '#38bdf8' : color}
                        strokeWidth={isEdgeInChain && connectedNodeIds ? 2.5 : isDisrupted ? 2 : 1}
                        strokeOpacity={isDimmedEdge ? 0.08 : isDisrupted ? 0.9 : isAtRisk ? 0.7 : 0.3}
                        className={isDisrupted || (isEdgeInChain && connectedNodeIds) ? 'animate-signal-flow' : undefined}
                      />
                      {/* Hardware-accelerated traveling SVG energy packet along active/disrupted routes */}
                      {(isDisrupted || (isEdgeInChain && connectedNodeIds)) && (
                        <circle r="3" fill={isDisrupted ? '#f43f5e' : '#38bdf8'} opacity="0.9">
                          <animateMotion
                            path={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                            dur={isDisrupted ? '1.8s' : '2.6s'}
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Dynamic Autonomous Reroute SVG Vector (Candidate or Active) */}
                {rerouteState !== 'BLOCKED' && (
                  <g>
                    <path
                      d="M 70 310 C 180 310, 180 100, 320 100"
                      fill="none"
                      stroke={rerouteState === 'ACTIVE' ? '#10b981' : '#f59e0b'}
                      strokeWidth={rerouteState === 'ACTIVE' ? 3.5 : 2.2}
                      strokeDasharray={rerouteState === 'ACTIVE' ? 'none' : '4 4'}
                      strokeOpacity={0.95}
                    />
                    <circle r="4" fill={rerouteState === 'ACTIVE' ? '#10b981' : '#f59e0b'} filter="drop-shadow(0 0 6px rgba(16,185,129,0.8))">
                      <animateMotion
                        path="M 70 310 C 180 310, 180 100, 320 100"
                        dur={rerouteState === 'ACTIVE' ? '1.2s' : '2.0s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                    <rect
                      x={165}
                      y={180}
                      width={130}
                      height={18}
                      rx={4}
                      fill="#060d1a"
                      stroke={rerouteState === 'ACTIVE' ? '#10b981' : '#f59e0b'}
                      strokeWidth={1}
                    />
                    <text
                      x={230}
                      y={192}
                      textAnchor="middle"
                      fill={rerouteState === 'ACTIVE' ? '#34d399' : '#fbbf24'}
                      fontSize={8}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {rerouteState === 'ACTIVE' ? '✓ AIR BRIDGE ACTIVE' : '⚡ CANDIDATE REROUTE'}
                    </text>
                  </g>
                )}

                {/* Nodes with Progressive Consequence Reveal and Causal Dimming */}
                {filteredNodes.map((node) => (
                  <NodeShape
                    key={node.id}
                    node={node}
                    selected={selectedNode?.id === node.id}
                    isPropagated={isNodePropagated(node.type)}
                    isCurrentlyPulsing={isNodePulsing(node.type)}
                    isDimmed={connectedNodeIds ? !connectedNodeIds.has(node.id) : false}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Right Panel: Synchronized Geo-Map + Entity HUD (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-3 min-h-0">
            {/* Map Frame */}
            <div className="flex-1 rounded-2xl bg-[#070b16] border border-white/[0.08] overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div ref={mapRef} className="w-full h-full min-h-[300px]" />
              <div className="absolute top-3 left-3 z-[1000] bg-[#070c18]/90 backdrop-blur-md border border-white/[0.08] px-2.5 py-1 rounded text-[10px] font-mono text-slate-400">
                GEOGRAPHIC ROUTE SYNCHRONIZATION
              </div>
            </div>

            {/* Selected Node HUD */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              {selectedNode ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                        ENTITY INSPECTION HUD
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-0.5">
                        {selectedNode.name || selectedNode.id}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-[#0c1424] border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">Status</span>
                      <span
                        className={`font-bold ${
                          selectedNode.status === 'DISRUPTED'
                            ? 'text-rose-400'
                            : selectedNode.status === 'AT_RISK'
                            ? 'text-amber-400'
                            : 'text-sky-400'
                        }`}
                      >
                        {selectedNode.status}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0c1424] border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">Type</span>
                      <span className="font-bold text-slate-200">{selectedNode.type}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0c1424] border border-white/[0.04]">
                      <span className="text-[9px] text-slate-500 uppercase block">Hierarchy</span>
                      <span className="font-bold text-slate-200">
                        {selectedNode.tier ? `Tier ${selectedNode.tier}` : 'Core Node'}
                      </span>
                    </div>
                  </div>

                  {/* WHY IS THIS NODE AT RISK? Panel */}
                  <div className="p-3 rounded-xl bg-[#091428] border border-cyan-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
                        <AlertTriangle size={13} className="text-amber-400" />
                        <span>WHY IS THIS NODE AT RISK?</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-0.5">
                        <ShieldCheck size={11} /> CAUSAL LINK
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-semibold">
                      {getNodeRiskExplanation(selectedNode).summary}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {getNodeRiskExplanation(selectedNode).detail}
                    </p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                        {getNodeRiskExplanation(selectedNode).formula}
                      </span>
                      <button
                        onClick={() => {
                          const exp = getNodeRiskExplanation(selectedNode);
                          setWhyDetails({
                            title: `Causal Analysis: ${selectedNode.name || selectedNode.id}`,
                            metric: `${selectedNode.type} · Status: ${selectedNode.status}`,
                            formula: exp.formula,
                            explanation: exp.detail,
                            parameters: [
                              { label: 'Entity Type', value: selectedNode.type },
                              { label: 'Causal Chain', value: 'Singapore Port ──► ' + (selectedNode.name || selectedNode.id) },
                              { label: 'Risk Status', value: selectedNode.status },
                            ],
                            sources: [
                              { name: 'SAP S/4HANA Enterprise Context', type: 'ERP', verified: true },
                              { name: 'Port Authority of Singapore (MPA) Berth Delay Advisories', type: 'AIS', verified: true },
                            ],
                          });
                          setWhyModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono flex items-center gap-1 border border-cyan-500/20 transition-colors"
                      >
                        <HelpCircle size={11} />
                        <span>WHY THIS NUMBER?</span>
                      </button>
                    </div>
                  </div>

                  {selectedNode.coordinates && (
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      Geographic: {selectedNode.coordinates.lat.toFixed(4)}°, {selectedNode.coordinates.lng.toFixed(4)}°
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs font-mono text-slate-500">
                  Click any entity in the 5-tier topology or geographic marker to isolate its causal path
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decision Provenance & Explainability Modal */}
      <WhyModal
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        details={whyDetails}
      />
    </div>
  );
}
