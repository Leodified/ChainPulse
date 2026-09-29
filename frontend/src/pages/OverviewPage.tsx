import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Activity,
  Bot,
  Box,
  ChevronRight,
  Cpu,
  DollarSign,
  Factory,
  Globe,
  Radio,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchOverview } from '../services/overview';
import { MOCK_OVERVIEW } from '../data/mockData';
import { WhyModal, WhyDetails } from '../components/ui/WhyModal';
import { ExecutiveBriefModal } from '../components/ui/ExecutiveBriefModal';
import { HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

interface NodeTelemetry {
  id: string;
  stage: string;
  title: string;
  detail: string;
  metric: string;
  status: 'critical' | 'warning' | 'normal';
}

const CAUSAL_CHAIN: NodeTelemetry[] = [
  {
    id: 'node-disr',
    stage: '01. EVENT',
    title: 'Singapore Port',
    detail: 'MPA Terminal Congestion · 847 Vessels',
    metric: '35% Cap',
    status: 'critical',
  },
  {
    id: 'node-hub',
    stage: '02. LOGISTICS CORRIDOR',
    title: 'SG Freight Hub',
    detail: 'Malacca Strait corridor transshipment blocked',
    metric: '+12d Delay',
    status: 'critical',
  },
  {
    id: 'node-supplier',
    stage: '03. SUPPLIERS',
    title: 'Penang Electronics',
    detail: 'Silicon micro-assembly shipment halted',
    metric: '4 Suppliers',
    status: 'warning',
  },
  {
    id: 'node-material',
    stage: '04. MATERIALS',
    title: 'PCB Assemblies',
    detail: 'Lead time surged from 8 to 26 days',
    metric: '7 Days Stock',
    status: 'warning',
  },
  {
    id: 'node-factory',
    stage: '05. FACTORIES',
    title: 'Frankfurt Hub',
    detail: 'Assembly Line B throttle to 70%',
    metric: '70% Cap',
    status: 'warning',
  },
  {
    id: 'node-product',
    stage: '06. PRODUCTS',
    title: 'IntelliSense Pro',
    detail: 'Enterprise IoT Gateway Flagship',
    metric: '22 Orders',
    status: 'warning',
  },
  {
    id: 'node-customer',
    stage: '07. CUSTOMERS',
    title: 'Enterprise Clients',
    detail: 'Deutsche Telekom, Siemens AG, Bosch',
    metric: '$28.3M Exp.',
    status: 'critical',
  },
];

export default function OverviewPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(MOCK_OVERVIEW);
  const [selectedNode, setSelectedNode] = useState<NodeTelemetry>(CAUSAL_CHAIN[0]);
  const [pulseStep, setPulseStep] = useState(0);

  // Cinematic Initialization Sequence States
  const [isInitializing, setIsInitializing] = useState(() => {
    return !sessionStorage.getItem('cp_initialized');
  });
  const [initStage, setInitStage] = useState(0); // 0: sweep, 1: detected, 2: revealed, 3: settled

  const [whyDetails, setWhyDetails] = useState<WhyDetails | null>(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  const openWhyExposure = () => {
    setWhyDetails({
      title: 'Financial Exposure Derivation ($28.3M)',
      metric: '$28,300,000 USD (Modeled Maximum)',
      formula: '∑ (22 Exposed Customer Orders Value [$28.1M] + Emergency Port Clearance Penalties [$0.2M]) over 60-day horizon',
      explanation: 'Calculated from 22 unfulfilled purchase orders across Tier-1 and Tier-2 customers whose primary assemblies depend on Singapore Tanjong Pagar berth clearance. Without mitigation, component buffer depletes on Day 7, throttling Frankfurt assembly lines.',
      parameters: [
        { label: 'Exposed Orders Count', value: '22 Orders', note: 'Deutsche Telekom, Siemens AG, Orange SA, etc.' },
        { label: 'Primary SKU Impacted', value: 'IntelliSense Pro X1', note: 'Enterprise IoT Gateway Flagship' },
        { label: 'Inventory Stockout Horizon', value: 'Day 7', note: 'Raw safety stock runway' },
        { label: 'Total Order Book at Risk', value: '$28,100,000 USD', note: 'Out of $47.2M total corporate order book' },
      ],
      sources: [
        { name: 'SAP S/4HANA Sales Order Book (VBAK/VBAP)', type: 'ERP', verified: true },
        { name: 'Port Authority of Singapore (MPA) Berth Delay Advisories', type: 'AIS', verified: true },
        { name: 'ChainPulse Deterministic Multi-Tier Propagation Model', type: 'SCENARIO_ENGINE', verified: true },
      ],
      governanceNote: 'Deterministic figure verified against SAP ERP. AI agents provide trade-off rankings only.',
    });
    setWhyModalOpen(true);
  };

  const openWhyOrders = () => {
    setWhyDetails({
      title: 'Customer Orders at Risk (22 Orders)',
      metric: '22 Critical Purchase Orders ($28.1M)',
      formula: 'Count of active SAP ERP orders with delivery due dates < Day 45 whose BOM references PCB Assemblies or Logic Chips routed via Singapore',
      explanation: 'Orders are flagged as AT RISK when component replenishment lead-time exceeds the customer delivery commitment date. Tier-1 enterprise customers represent 78% of this exposure.',
      parameters: [
        { label: 'Tier-1 Orders', value: '14 Orders ($21.9M)', note: 'Strict SLA penalty clauses active' },
        { label: 'Tier-2 Orders', value: '8 Orders ($6.2M)', note: 'Flexible delivery window buffer' },
        { label: 'Average Lead Time Delay', value: '+12.4 Days', note: 'Vessel queuing in Malacca Strait' },
      ],
      sources: [
        { name: 'SAP S/4HANA Sales Orders & Delivery Schedules', type: 'ERP', verified: true },
        { name: 'MPA Singapore Berth Clearance Telemetry', type: 'AIS', verified: true },
      ],
    });
    setWhyModalOpen(true);
  };

  useEffect(() => {
    fetchOverview().then((data) => {
      if (data) setOverview(data);
    });

    const interval = setInterval(() => {
      setPulseStep((prev) => (prev + 1) % CAUSAL_CHAIN.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Run initial cinematic sequence (700-1100ms total)
  useEffect(() => {
    if (!isInitializing) return;

    const t1 = setTimeout(() => setInitStage(1), 320);
    const t2 = setTimeout(() => setInitStage(2), 650);
    const t3 = setTimeout(() => {
      setInitStage(3);
      setIsInitializing(false);
      sessionStorage.setItem('cp_initialized', 'true');
    }, 1050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isInitializing]);

  function replayInitialization() {
    setIsInitializing(true);
    setInitStage(0);
    setTimeout(() => setInitStage(1), 320);
    setTimeout(() => setInitStage(2), 650);
    setTimeout(() => {
      setInitStage(3);
      setIsInitializing(false);
    }, 1050);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Cinematic Initialization Overlay */}
      {isInitializing && (
        <div className="fixed inset-0 z-50 bg-[#040711]/95 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="space-y-4 text-center max-w-lg px-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-sky-400 font-mono text-xs uppercase tracking-widest font-semibold">
              <Radio size={16} className="animate-pulse" />
              <span>CHAINPULSE // GLOBAL SUPPLY NETWORK</span>
            </div>

            <div className="text-xl font-bold font-mono text-slate-100 tracking-tight">
              {initStage === 0 && 'INITIALIZING NETWORK TELEMETRY...'}
              {initStage === 1 && 'CRITICAL SIGNAL DETECTED: SINGAPORE PORT'}
              {initStage >= 2 && 'NETWORK CAUSALITY MATRIX SYNTHESIZED'}
            </div>

            {/* Progressive Impact Tally */}
            <div
              className={`transition-all duration-300 flex items-center justify-center gap-3 flex-wrap font-mono text-xs ${
                initStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                4 SUPPLIERS EXPOSED
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                7 MATERIALS
              </span>
              <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                68 FACTORIES
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                22 ORDERS
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold">
                $28.3M MAX EXPOSURE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 font-black uppercase">
              CHAINPULSE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              GLOBAL SUPPLY CHAIN INTELLIGENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex flex-wrap items-center gap-3">
            Command Center
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              ● CRITICAL DISRUPTION DETECTED
            </span>
          </h1>
        </div>

        {/* Global Floating Metric Strip with Why provenance triggers */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[110px] relative group">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Total Exposure</span>
              <button
                onClick={openWhyExposure}
                className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5"
                title="Explain why $28.3M"
              >
                <HelpCircle size={11} />
              </button>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold font-mono text-rose-400">$28.3M</span>
              <span className="text-[10px] font-mono text-slate-500">max</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[105px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">At-Risk Orders</span>
              <button
                onClick={openWhyOrders}
                className="text-cyan-400 hover:text-cyan-300 transition-colors p-0.5"
                title="Explain why 22 orders"
              >
                <HelpCircle size={11} />
              </button>
            </div>
            <span className="text-base font-bold font-mono text-amber-400 mt-0.5">
              {overview.ordersExposed ?? 22} Orders
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[95px]">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Exposed Nodes</span>
            <span className="text-base font-bold font-mono text-sky-400 mt-0.5">26 Total</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[110px]">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Recovery Time</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5">8–18 Days</span>
          </div>

          <button
            onClick={replayInitialization}
            title="Replay Telemetry Sweep"
            className="p-2 rounded-xl bg-[#090f1d] border border-white/[0.08] text-slate-400 hover:text-sky-300 hover:bg-white/[0.04] transition-colors shrink-0"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Disruption Alert Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 via-[#0d172e] to-[#0a1226] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(244,63,94,0.08)]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-white tracking-tight">SINGAPORE PORT DISRUPTION</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                ● CRITICAL
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1 flex flex-wrap items-center gap-x-2">
              <span>Detected 09:42 UTC</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-semibold">Propagating</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-200">22 orders exposed</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold">$28.3M max exposure</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openWhyExposure}
            className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle size={13} />
            <span>WHY $28.3M?</span>
          </button>
          <button
            onClick={() => setBriefOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <FileText size={14} />
            <span>EXECUTIVE BRIEF</span>
          </button>
        </div>
      </div>

      {/* HERO STAGE: LIVE SUPPLY NETWORK (Subtle Breathing Digital Twin) */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#090f1f] via-[#070b16] to-[#040711] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 cp-telemetry-grid opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-rose-300 font-semibold">
                LIVE SUPPLY NETWORK · DIGITAL TWIN
              </span>
              <span className="hidden md:inline text-xs font-mono text-slate-500">|</span>
              <span className="hidden md:inline text-xs font-mono text-slate-400">
                Events ──► Singapore ──► Suppliers ──► Materials ──► Factories ──► Products ──► Clients
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>CAUSALITY VECTOR STREAM ACTIVE</span>
            </div>
          </div>

          {/* Interactive Multi-Tier Propagation Chain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 py-2">
            {CAUSAL_CHAIN.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              const isPulsing = pulseStep === index;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`relative flex flex-col justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.15)] -translate-y-1'
                      : isPulsing
                      ? 'bg-white/[0.04] border-white/20 -translate-y-0.5'
                      : 'bg-[#0b1222]/80 border-white/[0.06] hover:border-white/15 hover:bg-[#0e172a]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] font-mono text-slate-400 font-semibold tracking-wider">
                      {node.stage}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        node.status === 'critical'
                          ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
                          : node.status === 'warning'
                          ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  <div className="min-h-[46px]">
                    <div className="text-xs font-bold text-slate-100 tracking-tight truncate">{node.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                      {node.detail}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Impact</span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        node.status === 'critical' ? 'text-rose-300' : 'text-amber-300'
                      }`}
                    >
                      {node.metric}
                    </span>
                  </div>

                  {index < CAUSAL_CHAIN.length - 1 && (
                    <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-4 h-4 rounded-full bg-[#080d19] border border-white/10 items-center justify-center">
                      <ChevronRight size={10} className="text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Node Telemetry HUD & Primary Actions */}
          <div className="mt-2 p-4 rounded-xl bg-[#090f1d] border border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 flex-shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-sky-300">{selectedNode.stage} DETAIL:</span>
                  <span className="text-sm font-bold text-slate-100">{selectedNode.title}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{selectedNode.detail}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/impact/DISR-SG-2026-001')}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 group"
              >
                <span>Trace Full Impact</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => navigate('/simulations')}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <span>Simulate Future</span>
              </button>
              <button
                onClick={() => navigate('/recovery')}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <span>Strategic Recovery</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Telemetry Stream: Real-time Maritime & Disruption Feed + Agent Attention Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-[#080d19] border border-white/[0.06] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
                Live Disruption Signal Stream
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">AUTO-REFRESHING · AIS & SATELLITE</span>
          </div>

          <div className="space-y-2.5">
            {overview.recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] hover:border-white/10 transition-colors flex items-start gap-3"
              >
                <span
                  className={`mt-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${
                    ev.level === 'CRITICAL' || ev.level === 'HIGH'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {ev.level}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-snug font-medium">{ev.message}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    {format(new Date(ev.timestamp), 'HH:mm:ss')} · Port Authority & Lloyds AIS verified
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-[#080d19] border border-white/[0.06] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Bot size={15} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200 tracking-tight">
                  Autonomous Attention Priorities
                </h2>
              </div>
              <span className="text-[10px] font-mono text-indigo-400">SWARM CONSENSUS</span>
            </div>

            <div className="space-y-2.5">
              {overview.aiAttentionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                        item.severity === 'HIGH' || item.severity === 'CRITICAL'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#080d19] border border-white/[0.06] p-4 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>FASTAPI CORE</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>ORCHESTRATOR SWARM</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>SAP BRIDGE (DEMO)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Provenance & Explainability Modal */}
      <WhyModal
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        details={whyDetails}
      />

      {/* Executive Briefing Modal */}
      <ExecutiveBriefModal
        isOpen={briefOpen}
        onClose={() => setBriefOpen(false)}
      />
    </div>
  );
}

