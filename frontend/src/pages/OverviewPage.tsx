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
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { LiveSupplyNetworkTwin } from '../components/digital-twin/LiveSupplyNetworkTwin';
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

  // Cinematic In-Place Initialization Sequence States (no black modal screen)
  const [isInitialized, setIsInitialized] = useState(() => !!sessionStorage.getItem('cp_initialized'));
  const [initStage, setInitStage] = useState(isInitialized ? 4 : 0); // 0: ambient grid, 1: nodes illuminate, 2: disruption alert, 3: metric countup, 4: settled
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isolatedNodeId, setIsolatedNodeId] = useState<string | null>(null);
  const [isManualPulsing, setIsManualPulsing] = useState(false);

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
  }, []);

  // Sequential Causal Wave propagation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseStep((prev) => (prev + 1) % CAUSAL_CHAIN.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Run in-place initialization sequence (~900-1400ms) without full-screen blackout
  useEffect(() => {
    if (isInitialized) return;

    const t1 = setTimeout(() => setInitStage(1), 220); // Shell + nodes materialize
    const t2 = setTimeout(() => setInitStage(2), 550); // Disruption alert triggers
    const t3 = setTimeout(() => setInitStage(3), 850); // Animated numbers count up
    const t4 = setTimeout(() => {
      setInitStage(4);
      setIsInitialized(true);
      sessionStorage.setItem('cp_initialized', 'true');
    }, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isInitialized]);

  // Re-trigger causal propagation wave manually across all 7 tiers
  const triggerPropagationWave = () => {
    setIsManualPulsing(true);
    let step = 0;
    setPulseStep(0);
    const interval = setInterval(() => {
      step++;
      if (step >= CAUSAL_CHAIN.length) {
        clearInterval(interval);
        setIsManualPulsing(false);
      } else {
        setPulseStep(step);
      }
    }, 160);
  };

  function replayInitialization() {
    setInitStage(0);
    setIsInitialized(false);
    triggerPropagationWave();
    setTimeout(() => setInitStage(1), 200);
    setTimeout(() => setInitStage(2), 500);
    setTimeout(() => setInitStage(3), 800);
    setTimeout(() => {
      setInitStage(4);
      setIsInitialized(true);
    }, 1200);
  }

  return (
    <div
      className={`p-6 space-y-6 max-w-[1700px] mx-auto relative transition-opacity duration-700 ${
        initStage === 0 ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {/* Top Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 font-black uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              CHAINPULSE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              GLOBAL SUPPLY CHAIN INTELLIGENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex flex-wrap items-center gap-3">
            Command Center
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              ● CRITICAL DISRUPTION DETECTED
            </span>
          </h1>
        </div>

        {/* Global Floating Metric Strip with Why provenance triggers & Animated Numbers */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[115px] relative group hover:border-rose-500/30 transition-colors">
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
              <span className="text-base font-bold font-mono text-rose-400">
                <AnimatedNumber value={28.3} prefix="$" suffix="M" decimals={1} durationMs={800} />
              </span>
              <span className="text-[10px] font-mono text-slate-500">max</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[110px] hover:border-amber-500/30 transition-colors">
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
              <AnimatedNumber value={overview.ordersExposed ?? 22} suffix=" Orders" durationMs={700} />
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[100px] hover:border-sky-500/30 transition-colors">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Exposed Nodes</span>
            <span className="text-base font-bold font-mono text-sky-400 mt-0.5">
              <AnimatedNumber value={26} suffix=" Total" durationMs={600} />
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0a1122] border border-white/[0.08] flex flex-col min-w-[110px] hover:border-emerald-500/30 transition-colors">
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

      {/* Disruption Alert Strip with Coral Breathing Glow */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0d172e] to-[#0a1226] border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_35px_rgba(244,63,94,0.12)] animate-coral-breath">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black font-mono text-white tracking-tight">SINGAPORE PORT DISRUPTION</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/25 text-rose-200 border border-rose-500/40 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                ● CRITICAL
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                PROPAGATING
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1.5 flex flex-wrap items-center gap-x-2">
              <span className="text-slate-400">Detected 09:42 UTC</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-200 font-semibold">22 orders exposed</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold">$28.3M max exposure</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-300">4 suppliers</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">7 materials</span>
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
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-[1.02]"
          >
            <FileText size={14} />
            <span>EXECUTIVE BRIEF</span>
          </button>
        </div>
      </div>

      {/* HERO STAGE: LIVE SUPPLY NETWORK (Living Animated Digital Twin) */}
      <LiveSupplyNetworkTwin
        onTraceImpact={() => navigate('/impact/DISR-SG-2026-001')}
        onSimulate={() => navigate('/simulations')}
        onStrategicRecovery={() => navigate('/recovery')}
      />

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

