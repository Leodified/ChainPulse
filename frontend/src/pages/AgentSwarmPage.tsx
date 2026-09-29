import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle,
  Clock,
  Cpu,
  FileText,
  Network,
  Play,
  Radio,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { fetchAgentActivities } from '../services/agents';
import { MOCK_AGENT_ACTIVITIES } from '../data/mockData';
import { AgentSwarmCanvas } from '../components/agents/AgentSwarmCanvas';
import type { AgentType, AgentActivity } from '../types/agents';
import { useDemo } from '../context/DemoContext';

type AgentStatusStage = 'WAITING' | 'ANALYSING' | 'COMPLETE';

const AGENT_META: Record<
  AgentType,
  { label: string; icon: React.ReactNode; color: string; ringColor: string; summary: string }
> = {
  ORCHESTRATOR: {
    label: 'ChainPulse Orchestrator',
    icon: <Cpu size={20} className="text-sky-400" />,
    color: '#38bdf8',
    ringColor: 'border-sky-500/40 bg-sky-500/10',
    summary: 'Synthesizes multi-agent trade-offs into executive decision envelope.',
  },
  EVENT: {
    label: 'Event Intelligence',
    icon: <Radio size={18} className="text-rose-400" />,
    color: '#f43f5e',
    ringColor: 'border-rose-500/30 bg-rose-500/10',
    summary: 'High-severity port congestion detected from MPA & AIS tracking.',
  },
  RESEARCH: {
    label: 'Supply Chain Research',
    icon: <Search size={18} className="text-blue-400" />,
    color: '#60a5fa',
    ringColor: 'border-blue-500/30 bg-blue-500/10',
    summary: '4 suppliers depend on the affected Singapore transshipment corridor.',
  },
  IMPACT: {
    label: 'Impact Tracing',
    icon: <Network size={18} className="text-amber-400" />,
    color: '#f59e0b',
    ringColor: 'border-amber-500/30 bg-amber-500/10',
    summary: '7 materials and Frankfurt manufacturing plant (70% cap) exposed.',
  },
  FINANCE_ESG: {
    label: 'Finance & ESG Agent',
    icon: <TrendingDown size={18} className="text-indigo-400" />,
    color: '#818cf8',
    ringColor: 'border-indigo-500/30 bg-indigo-500/10',
    summary: 'Max modeled exposure: $28.3M. Air freight adds +340% Scope-3 CO2.',
  },
  RECOVERY: {
    label: 'Recovery Strategy',
    icon: <ShieldCheck size={18} className="text-emerald-400" />,
    color: '#34d399',
    ringColor: 'border-emerald-500/30 bg-emerald-500/10',
    summary: '3 feasible recovery strategies generated and ranked by SLA risk.',
  },
};

const SATELLITE_AGENTS: AgentType[] = [
  'EVENT',
  'RESEARCH',
  'IMPACT',
  'FINANCE_ESG',
  'RECOVERY',
];

export default function AgentSwarmPage() {
  const navigate = useNavigate();
  const { disruptionId } = useParams<{ disruptionId?: string }>();
  const activeDisruptionId = disruptionId || 'DISR-SG-2026-001';
  const { rerouteState, approveReroute, learningHubProfile } = useDemo();
  const [activities, setActivities] = useState<AgentActivity[]>(MOCK_AGENT_ACTIVITIES);
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType>('ORCHESTRATOR');

  // Sequential Orchestration Simulation State
  const [isSimulatingSequence, setIsSimulatingSequence] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentType, AgentStatusStage>>({
    ORCHESTRATOR: 'COMPLETE',
    EVENT: 'COMPLETE',
    RESEARCH: 'COMPLETE',
    IMPACT: 'COMPLETE',
    FINANCE_ESG: 'COMPLETE',
    RECOVERY: 'COMPLETE',
  });
  const [orchestratorConverged, setOrchestratorConverged] = useState(true);

  useEffect(() => {
    fetchAgentActivities(activeDisruptionId).then((data) => {
      if (data?.length) {
        setActivities(data);
      }
    });
  }, [activeDisruptionId]);

  function runSequentialOrchestration() {
    setIsSimulatingSequence(true);
    setOrchestratorConverged(false);

    // Initial state: Event analysing, others waiting
    setAgentStatuses({
      EVENT: 'ANALYSING',
      RESEARCH: 'WAITING',
      IMPACT: 'WAITING',
      FINANCE_ESG: 'WAITING',
      RECOVERY: 'WAITING',
      ORCHESTRATOR: 'WAITING',
    });
    setSelectedAgentType('EVENT');

    // Step 1: Event complete -> Research analysing
    setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, EVENT: 'COMPLETE', RESEARCH: 'ANALYSING' }));
      setSelectedAgentType('RESEARCH');
    }, 900);

    // Step 2: Research complete -> Impact analysing
    setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, RESEARCH: 'COMPLETE', IMPACT: 'ANALYSING' }));
      setSelectedAgentType('IMPACT');
    }, 1800);

    // Step 3: Impact complete -> Finance analysing
    setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, IMPACT: 'COMPLETE', FINANCE_ESG: 'ANALYSING' }));
      setSelectedAgentType('FINANCE_ESG');
    }, 2700);

    // Step 4: Finance complete -> Recovery analysing
    setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, FINANCE_ESG: 'COMPLETE', RECOVERY: 'ANALYSING' }));
      setSelectedAgentType('RECOVERY');
    }, 3600);

    // Step 5: Recovery complete -> Orchestrator converging
    setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, RECOVERY: 'COMPLETE', ORCHESTRATOR: 'ANALYSING' }));
      setSelectedAgentType('ORCHESTRATOR');
    }, 4500);

    // Step 6: Full Convergence into Decision Room
    setTimeout(() => {
      setAgentStatuses({
        EVENT: 'COMPLETE',
        RESEARCH: 'COMPLETE',
        IMPACT: 'COMPLETE',
        FINANCE_ESG: 'COMPLETE',
        RECOVERY: 'COMPLETE',
        ORCHESTRATOR: 'COMPLETE',
      });
      setOrchestratorConverged(true);
      setIsSimulatingSequence(false);
    }, 5400);
  }

  const currentAgentActivity =
    activities.find((a) => a.agentType === selectedAgentType) || activities[0];

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
              CHAINPULSE DECISION ROOM
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">SWARM REASONING GRAPH</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Multi-Agent Swarm Intelligence
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              6 Specialized Agents Orchestrated
            </span>
          </h1>
        </div>

      </div>

      {/* LIVING MULTI-AGENT SWARM CANVAS (Orbital Physics & Packet Transmission) */}
      <AgentSwarmCanvas
        onOrchestratorConverged={() => setOrchestratorConverged(true)}
      />

      {/* FINAL DECISION ROOM CONVERGENCE (Visual Payoff) */}
      {orchestratorConverged && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/25 via-[#080d19] to-indigo-950/25 border border-sky-400/50 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Scale size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                    CHAINPULSE DECISION ROOM
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-[10px] font-mono text-slate-400">FINAL SYNTHESIS</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Executive Recovery Decision Envelope
                </h2>
              </div>
            </div>

            <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-amber-breath">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              HUMAN DECISION REQUIRED
            </span>
          </div>

          {/* Convergence Metric Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Critical Disruption</span>
              <span className="font-bold text-slate-200 mt-1 block">Singapore Port Congestion</span>
              <span className="text-[10px] text-slate-500">847 vessels · 35% cap</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Network Impact</span>
              <span className="font-bold text-amber-400 mt-1 block">4 Suppliers · 7 Materials</span>
              <span className="text-[10px] text-slate-500">22 orders · 68 factories</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Business Exposure</span>
              <span className="font-bold text-rose-400 mt-1 block">$28.3M Modeled Max</span>
              <span className="text-[10px] text-slate-500">Tier-1 contract risk</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase block">Recommended Trade-Off</span>
              <span className="font-bold text-emerald-400 mt-1 block">Strategy B: Air Freight</span>
              <span className="text-[10px] text-slate-500">8d · $3.8M · +340% CO2</span>
            </div>
          </div>

          {/* TRADE-OFF ENVELOPE: SPEED vs COST vs CARBON vs FEASIBILITY */}
          <div className="p-4 rounded-xl bg-[#090f1d] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sky-400 uppercase tracking-wider font-semibold">
                MULTI-ATTRIBUTE TRADE-OFF ENVELOPE
              </span>
              <span className="text-slate-400 text-[11px]">
                Trade-off Balance: <strong className="text-slate-200">Speed (Tier-1 SLA) vs Financial Outlay vs Scope-3 Footprint</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              {/* Option A */}
              <div className="p-3 rounded-lg bg-[#0c1424] border border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Strategy A: Alternate Supplier</span>
                  <span className="text-[10px] text-amber-400">STRUCTURAL</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Speed:</span><span className="text-slate-200 font-bold">18 Days</span></div>
                  <div className="flex justify-between"><span>Cost:</span><span className="text-emerald-400 font-bold">$1.2M</span></div>
                  <div className="flex justify-between"><span>Carbon:</span><span className="text-emerald-400 font-bold">+12% CO2</span></div>
                  <div className="flex justify-between"><span>Feasibility:</span><span className="text-slate-200 font-bold">78%</span></div>
                </div>
              </div>

              {/* Option B */}
              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-400/40 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">Strategy B: Air Freight Bridge</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-400 text-slate-950 font-bold">FASTEST</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Speed:</span><span className="text-emerald-400 font-bold">8 Days (★)</span></div>
                  <div className="flex justify-between"><span>Cost:</span><span className="text-rose-400 font-bold">$3.8M (High)</span></div>
                  <div className="flex justify-between"><span>Carbon:</span><span className="text-rose-400 font-bold">+340% CO2</span></div>
                  <div className="flex justify-between"><span>Feasibility:</span><span className="text-emerald-400 font-bold">92% (High)</span></div>
                </div>
              </div>

              {/* Option C */}
              <div className="p-3 rounded-lg bg-[#0c1424] border border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Strategy C: Reallocation</span>
                  <span className="text-[10px] text-rose-400">RELATIONSHIP RISK</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Speed:</span><span className="text-emerald-400 font-bold">5 Days (★)</span></div>
                  <div className="flex justify-between"><span>Cost:</span><span className="text-emerald-400 font-bold">$0.4M (Low)</span></div>
                  <div className="flex justify-between"><span>Carbon:</span><span className="text-emerald-400 font-bold">+2% CO2</span></div>
                  <div className="flex justify-between"><span>Feasibility:</span><span className="text-amber-400 font-bold">65% (Risk)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Synthesized Executive Summary */}
          <div className="p-4 rounded-xl bg-[#090f1d] border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
              ORCHESTRATOR REASONING SYNTHESIS
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              "Emergency Air Freight provides the fastest modeled recovery under current constraints (8 days for Tier-1 customer commitments), while introducing the highest cost ($3.8M) and transport-emissions trade-off (+340% Scope-3). Alternate Supplier Activation (Strategy A) provides lower structural cost ($1.2M) over an 18-day horizon. Operations leadership must commit the authorized strategy."
            </p>
          </div>

          {/* Operational Rerouting Handoff Pipeline */}
          <div className="p-3.5 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-slate-500 uppercase font-bold">OPERATIONAL PIPELINE:</span>
              <span className="text-emerald-400 font-bold">Recovery Agent</span>
              <span className="text-slate-600">──►</span>
              <span className="text-sky-400 font-bold">Route Optimizer</span>
              <span className="text-slate-600">──►</span>
              <span className={rerouteState === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {rerouteState === 'ACTIVE' ? 'Air Bridge (Active)' : 'Candidate Route (Amber)'}
              </span>
              <span className="text-slate-600">──►</span>
              <span className="text-purple-400 font-bold">Orchestrator</span>
              <span className="text-slate-600">──►</span>
              <span className="text-rose-400 font-bold">Human Gate</span>
            </div>

            <div className="text-[10px] text-slate-400">
              Operator Sign-off: <strong className="text-slate-200">{learningHubProfile.studentName}</strong> (Demo Student Profile)
            </div>
          </div>

          {/* Audit Verification Checklist */}
          <div className="p-3.5 rounded-xl bg-[#060b17] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span className="text-slate-300">Swarm Cross-Validation (6/6)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span className="text-slate-300">Exposure Bound ($28.3M max)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span className="text-slate-300">Route Candidate (Air Bridge)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                rerouteState === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
              }`}>
                {rerouteState === 'ACTIVE' ? '✓' : '!'}
              </span>
              <span className={rerouteState === 'ACTIVE' ? 'text-slate-300' : 'text-amber-300 font-bold'}>
                {rerouteState === 'ACTIVE' ? 'Human Gate Sealed' : 'Human Approval Required'}
              </span>
            </div>
          </div>

          {/* Decision Payoff CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs font-mono text-slate-400">
              Governance Gate:{' '}
              {rerouteState === 'ACTIVE' ? (
                <span className="text-emerald-400 font-semibold">✓ Cryptographic Sign-Off Verified</span>
              ) : (
                <span className="text-amber-400 font-semibold">Awaiting Operations Authorization</span>
              )}
            </span>

            <div className="flex items-center gap-3 flex-wrap">
              {rerouteState !== 'ACTIVE' ? (
                <button
                  onClick={approveReroute}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
                >
                  <Zap size={14} className="fill-slate-950" />
                  <span>AUTHORIZE & ACTIVATE REROUTE (HUMAN GATE)</span>
                </button>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.3)]">
                  <Check size={14} className="text-emerald-400" />
                  <span>ROUTE ACTIVATED & COMMITTED TO SAP</span>
                </span>
              )}

              <button
                onClick={() => navigate('/recovery')}
                className="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Full Recovery Dossier</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Agent Telemetry Dossier */}
      {currentAgentActivity && (
        <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-sky-400" />
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                {currentAgentActivity.agentName} Dossier
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {currentAgentActivity.confidencePct}% Confidence Rating
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Reasoning Summary</span>
              <p className="text-slate-300 leading-relaxed font-sans">{currentAgentActivity.reasoning}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Verified Evidence Citations</span>
              <ul className="space-y-1 text-slate-300">
                {currentAgentActivity.evidenceUsed.map((ev, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
