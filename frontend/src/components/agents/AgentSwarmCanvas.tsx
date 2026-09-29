import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle,
  Cpu,
  FileText,
  Network,
  Play,
  Radio,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react';
import type { AgentType, AgentActivity } from '../../types/agents';

export interface SwarmAgentNode {
  type: AgentType;
  label: string;
  role: string;
  angle: number; // in degrees
  color: string;
  glowColor: string;
  status: 'IDLE' | 'ANALYSING' | 'PROCESSING' | 'WAITING' | 'COMPLETE';
  input: string;
  output: string;
  confidence: string;
  runtime: string;
  evidence: string[];
}

const INITIAL_AGENTS: SwarmAgentNode[] = [
  {
    type: 'EVENT',
    label: 'Event Intelligence',
    role: 'Real-time Signal Ingestion',
    angle: 200,
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    status: 'COMPLETE',
    input: 'MPA Berth Delay Telemetry, Lloyds List AIS data',
    output: 'Validated HIGH severity PORT_DISRUPTION event at Tanjong Pagar berth',
    confidence: '94% (AIS Verified)',
    runtime: '2.1s',
    evidence: [
      'MPA Singapore Advisory: Tanjong Pagar berth queuing average 8-12 days',
      'AIS vessel tracking confirms 847 container carriers awaiting berth',
      'Port throughput reduced by 65% following Typhoon Haikui',
    ],
  },
  {
    type: 'RESEARCH',
    label: 'Supply Chain Research',
    role: 'Multi-Tier Network Discovery',
    angle: 280,
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.4)',
    status: 'COMPLETE',
    input: 'DISR-SG-2026-001 Location Coordinates + SAP S/4HANA Vendor Register',
    output: 'Identified 4 at-risk Tier-1 & Tier-2 suppliers routed via Malacca Strait',
    confidence: '92% (ERP Correlated)',
    runtime: '3.4s',
    evidence: [
      'Penang Electronics (MY) transships 100% of silicon micro-assemblies via SG',
      'Taiwan Semiconductor (TW) feeder lines experiencing 12-day queue',
      'Port Klang and Tanjong Pelepas identified as viable regional diversions',
    ],
  },
  {
    type: 'IMPACT',
    label: 'Impact Tracing Agent',
    role: 'Deterministic BOM Propagation',
    angle: 0,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    status: 'COMPLETE',
    input: 'Vendor Disruption Feeds + Frankfurt Assembly BOMs',
    output: 'Traced critical bottleneck: PCB Assemblies safety stock stockout on Day 7',
    confidence: '95% (MES Validated)',
    runtime: '2.8s',
    evidence: [
      'Frankfurt Assembly Hub capacity throttled to 70% to conserve silicon buffer',
      '22 customer purchase orders flagged with delivery dates < Day 45',
      '68 manufacturing facilities in European network constrained',
    ],
  },
  {
    type: 'FINANCE_ESG',
    label: 'Finance & ESG Agent',
    role: 'Exposure & Scope-3 Modeling',
    angle: 70,
    color: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.4)',
    status: 'COMPLETE',
    input: 'SAP S/4HANA VBAK Order Book + GHG Protocol Freight Emission Factors',
    output: '$28.3M Modeled Max Exposure; Emergency Air Freight adds +340% Scope-3 CO2',
    confidence: '96% (Audit Certified)',
    runtime: '3.1s',
    evidence: [
      '22 at-risk orders account for $28.1M committed value + $0.2M penalties',
      'Tier-1 customers (Deutsche Telekom, Siemens AG) represent 78% of balance sheet risk',
      'Sea-to-air mode shift increases freight carbon intensity by 340%',
    ],
  },
  {
    type: 'RECOVERY',
    label: 'Recovery Strategy Agent',
    role: 'Multi-Objective Strategy Synthesis',
    angle: 135,
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    status: 'COMPLETE',
    input: 'Impact Matrix + Multi-Modal Route Registry',
    output: 'Generated 3 ranked strategies: Air Freight (8d, $3.8M) vs Alt Supplier (18d, $1.2M)',
    confidence: '90% (Optimization Score)',
    runtime: '2.8s',
    evidence: [
      'Strategy B (Air Freight) achieves SLA preservation in 8 days (Feasibility: 92%)',
      'Strategy A (Bangalore Alt Partner) restores structural supply in 18 days at $1.2M',
      'Strategy C (Inventory Reallocation) incurs severe customer relationship penalty',
    ],
  },
];

interface AnimatedDataPacket {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
}

interface AgentSwarmCanvasProps {
  onAgentSelect?: (agent: SwarmAgentNode) => void;
  onOrchestratorConverged?: () => void;
}

export function AgentSwarmCanvas({
  onAgentSelect,
  onOrchestratorConverged,
}: AgentSwarmCanvasProps) {
  const [agents, setAgents] = useState<SwarmAgentNode[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgentNode>(INITIAL_AGENTS[0]);
  const [orchestratorStatus, setOrchestratorStatus] = useState<'IDLE' | 'ANALYSING' | 'SYNTHESIZING' | 'DECISION READY'>('DECISION READY');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activePackets, setActivePackets] = useState<AnimatedDataPacket[]>([]);
  const [orchestratorRingAngle, setOrchestratorRingAngle] = useState(0);

  // Radius for orbital satellite positioning (in percentage)
  const ORBIT_RADIUS = 34;
  const CENTER_X = 50;
  const CENTER_Y = 50;

  // Continuous subtle ring rotation + ambient data pulses
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Slow elegant ring rotation
      setOrchestratorRingAngle((prev) => (prev + dt * 18) % 360);

      // Advance moving packets
      setActivePackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + dt * 1.4 }))
          .filter((p) => p.progress <= 1)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute position of an agent node in percentage
  const getAgentPos = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CENTER_X + Math.cos(rad) * ORBIT_RADIUS,
      y: CENTER_Y + Math.sin(rad) * ORBIT_RADIUS,
    };
  };

  // Launch a visible glowing data packet between two coordinates
  const launchPacket = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    setActivePackets((prev) => [
      ...prev,
      {
        id: Math.random(),
        fromX,
        fromY,
        toX,
        toY,
        progress: 0,
        color,
      },
    ]);
  };

  // Run the full multi-agent sequential orchestration visualization
  const runSwarmOrchestration = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setOrchestratorStatus('ANALYSING');

    // Reset all agents to WAITING
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: a.type === 'EVENT' ? 'ANALYSING' : 'WAITING',
      }))
    );
    setSelectedAgent(INITIAL_AGENTS[0]);

    // Sequence timing
    // 0ms: EVENT analysing
    // 800ms: EVENT complete -> launches packet to ORCHESTRATOR
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[0].angle);
      launchPacket(pos.x, pos.y, CENTER_X, CENTER_Y, INITIAL_AGENTS[0].color);

      setAgents((prev) =>
        prev.map((a) => (a.type === 'EVENT' ? { ...a, status: 'COMPLETE' } : a))
      );
    }, 900);

    // 1400ms: ORCHESTRATOR forwards to RESEARCH
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[1].angle);
      launchPacket(CENTER_X, CENTER_Y, pos.x, pos.y, INITIAL_AGENTS[1].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'RESEARCH' ? { ...a, status: 'ANALYSING' } : a))
      );
      setSelectedAgent(INITIAL_AGENTS[1]);
    }, 1500);

    // 2200ms: RESEARCH completes -> packet to ORCHESTRATOR
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[1].angle);
      launchPacket(pos.x, pos.y, CENTER_X, CENTER_Y, INITIAL_AGENTS[1].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'RESEARCH' ? { ...a, status: 'COMPLETE' } : a))
      );
    }, 2300);

    // 2800ms: ORCHESTRATOR forwards to IMPACT TRACE
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[2].angle);
      launchPacket(CENTER_X, CENTER_Y, pos.x, pos.y, INITIAL_AGENTS[2].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'IMPACT' ? { ...a, status: 'ANALYSING' } : a))
      );
      setSelectedAgent(INITIAL_AGENTS[2]);
    }, 2900);

    // 3600ms: IMPACT completes -> packet to ORCHESTRATOR
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[2].angle);
      launchPacket(pos.x, pos.y, CENTER_X, CENTER_Y, INITIAL_AGENTS[2].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'IMPACT' ? { ...a, status: 'COMPLETE' } : a))
      );
    }, 3700);

    // 4200ms: ORCHESTRATOR forwards to FINANCE & ESG
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[3].angle);
      launchPacket(CENTER_X, CENTER_Y, pos.x, pos.y, INITIAL_AGENTS[3].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'FINANCE_ESG' ? { ...a, status: 'ANALYSING' } : a))
      );
      setSelectedAgent(INITIAL_AGENTS[3]);
    }, 4300);

    // 5000ms: FINANCE completes -> packet to ORCHESTRATOR
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[3].angle);
      launchPacket(pos.x, pos.y, CENTER_X, CENTER_Y, INITIAL_AGENTS[3].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'FINANCE_ESG' ? { ...a, status: 'COMPLETE' } : a))
      );
    }, 5100);

    // 5600ms: ORCHESTRATOR forwards to RECOVERY STRATEGY
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[4].angle);
      launchPacket(CENTER_X, CENTER_Y, pos.x, pos.y, INITIAL_AGENTS[4].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'RECOVERY' ? { ...a, status: 'ANALYSING' } : a))
      );
      setSelectedAgent(INITIAL_AGENTS[4]);
    }, 5700);

    // 6400ms: RECOVERY completes -> packet to ORCHESTRATOR
    setTimeout(() => {
      const pos = getAgentPos(INITIAL_AGENTS[4].angle);
      launchPacket(pos.x, pos.y, CENTER_X, CENTER_Y, INITIAL_AGENTS[4].color);
      setAgents((prev) =>
        prev.map((a) => (a.type === 'RECOVERY' ? { ...a, status: 'COMPLETE' } : a))
      );
    }, 6500);

    // 7200ms: ALL AGENTS CONVERGE SIMULTANEOUSLY ON ORCHESTRATOR
    setTimeout(() => {
      setOrchestratorStatus('SYNTHESIZING');
      INITIAL_AGENTS.forEach((agent) => {
        const pos = getAgentPos(agent.angle);
        launchPacket(pos.x, pos.y, CENTER_X, CENTER_Y, agent.color);
      });
    }, 7200);

    // 8200ms: ORCHESTRATOR SYNTHESIZED -> DECISION READY
    setTimeout(() => {
      setOrchestratorStatus('DECISION READY');
      setIsSimulating(false);
      if (onOrchestratorConverged) {
        onOrchestratorConverged();
      }
    }, 8300);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Swarm Telemetry Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#080d19] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
                AUTONOMOUS MULTI-AGENT SWARM
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-300 font-mono">6 Orchestrated Specialized Models</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Reasoning Graph & Information Transmission Engine
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runSwarmOrchestration}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? <Radio size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isSimulating ? 'SYNTHESIZING REASONING...' : 'RUN SWARM SEQUENCE'}</span>
          </button>
        </div>
      </div>

      {/* Living Spatial Orbital Stage */}
      <div className="relative w-full h-[540px] rounded-2xl bg-gradient-to-b from-[#090f1f] via-[#060a14] to-[#03060d] border border-white/[0.08] shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden p-6 select-none">
        <div className="absolute inset-0 cp-telemetry-grid opacity-30 pointer-events-none" />

        {/* Live Swarm Telemetry Metrics (4 Corners) */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-[#091122]/90 border border-white/10 text-[11px] font-mono">
          <span className="text-slate-400 text-[9px] uppercase block">EVENTS ANALYSED</span>
          <span className="text-rose-400 font-bold">47 Signals</span>
        </div>

        <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-[#091122]/90 border border-white/10 text-[11px] font-mono text-right">
          <span className="text-slate-400 text-[9px] uppercase block">SWARM CONSENSUS</span>
          <span className="text-emerald-400 font-bold">94% Confidence</span>
        </div>

        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-[#091122]/90 border border-white/10 text-[11px] font-mono">
          <span className="text-slate-400 text-[9px] uppercase block">SUPPLIERS TRACED</span>
          <span className="text-amber-400 font-bold">18 Nodes</span>
        </div>

        <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-[#091122]/90 border border-white/10 text-[11px] font-mono text-right">
          <span className="text-slate-400 text-[9px] uppercase block">SCENARIOS TESTED</span>
          <span className="text-sky-400 font-bold">12 Horizons</span>
        </div>

        {/* SVG Orbital Geometry & Communication Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric Orbital Rings */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={ORBIT_RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="0.3"
            strokeDasharray="1.5 2"
          />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={ORBIT_RADIUS * 0.65}
            fill="none"
            stroke="rgba(56, 189, 248, 0.08)"
            strokeWidth="0.2"
          />

          {/* Connection Lines from Orchestrator to Each Satellite */}
          {agents.map((agent) => {
            const pos = getAgentPos(agent.angle);
            const isAnalyzing = agent.status === 'ANALYSING';
            const isSelected = selectedAgent.type === agent.type;

            return (
              <g key={agent.type}>
                <line
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={agent.color}
                  strokeWidth={isAnalyzing || isSelected ? '0.7' : '0.3'}
                  strokeOpacity={isAnalyzing || isSelected ? 0.8 : 0.25}
                  strokeDasharray={isAnalyzing ? '2 2' : 'none'}
                />
              </g>
            );
          })}

          {/* Moving Data Packets */}
          {activePackets.map((pkt) => {
            const currentX = pkt.fromX + (pkt.toX - pkt.fromX) * pkt.progress;
            const currentY = pkt.fromY + (pkt.toY - pkt.fromY) * pkt.progress;

            return (
              <circle
                key={pkt.id}
                cx={currentX}
                cy={currentY}
                r="1.2"
                fill={pkt.color}
                filter="url(#packetGlow)"
              />
            );
          })}
        </svg>

        {/* Central Orchestrator Hub */}
        <div
          style={{
            left: `${CENTER_X}%`,
            top: `${CENTER_Y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute z-20 flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => setSelectedAgent(INITIAL_AGENTS[0])}
        >
          {/* Animated Outer Concentric Ring */}
          <div
            style={{
              transform: `rotate(${orchestratorRingAngle}deg)`,
            }}
            className="w-32 h-32 rounded-full border border-dashed border-sky-400/40 pointer-events-none absolute"
          />
          <div
            style={{
              transform: `rotate(-${orchestratorRingAngle * 1.5}deg)`,
            }}
            className="w-24 h-24 rounded-full border border-indigo-500/50 pointer-events-none absolute"
          />

          {/* Core Sphere */}
          <div
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center p-2 backdrop-blur-md transition-all duration-300 border ${
              orchestratorStatus === 'SYNTHESIZING'
                ? 'bg-sky-400 text-slate-950 scale-110 shadow-[0_0_40px_rgba(56,189,248,0.8)] border-white'
                : orchestratorStatus === 'DECISION READY'
                ? 'bg-[#09152b] border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.4)] text-sky-300'
                : 'bg-[#080d19] border-white/20 text-slate-300'
            }`}
          >
            <Cpu size={26} className={isSimulating ? 'animate-spin' : ''} />
            <span className="text-[9px] font-mono font-bold uppercase mt-1 tracking-tight text-center">
              ORCHESTRATOR
            </span>
          </div>

          {/* Dynamic Status Badge */}
          <div className="mt-2 px-2.5 py-0.5 rounded-full bg-[#050a14] border border-sky-400/50 text-[10px] font-mono font-bold text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            {orchestratorStatus}
          </div>
        </div>

        {/* 5 Orbiting Satellite Agents */}
        {agents.map((agent) => {
          const pos = getAgentPos(agent.angle);
          const isSelected = selectedAgent.type === agent.type;
          const isAnalyzing = agent.status === 'ANALYSING';

          return (
            <div
              key={agent.type}
              onClick={() => {
                setSelectedAgent(agent);
                if (onAgentSelect) onAgentSelect(agent);
              }}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-20 cursor-pointer p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between min-w-[140px] max-w-[180px] ${
                isSelected
                  ? 'bg-[#0c162c] border-white text-white shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-105 z-30'
                  : isAnalyzing
                  ? 'bg-sky-500/15 border-sky-400 text-sky-200 shadow-[0_0_25px_rgba(56,189,248,0.4)] scale-105'
                  : 'bg-[#060b17]/90 border-white/10 text-slate-300 hover:border-white/25 hover:bg-[#091224]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{ color: agent.color }}
                  className="text-[9px] font-mono uppercase tracking-wider font-bold"
                >
                  {agent.type}
                </span>
                <span
                  style={{ backgroundColor: agent.color }}
                  className={`w-2 h-2 rounded-full ${
                    isAnalyzing ? 'animate-ping' : ''
                  }`}
                />
              </div>

              <div className="text-xs font-bold text-slate-100 truncate">{agent.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{agent.role}</div>

              <div className="mt-2 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500">STATUS:</span>
                <span
                  className={`font-bold ${
                    agent.status === 'COMPLETE'
                      ? 'text-emerald-400'
                      : agent.status === 'ANALYSING'
                      ? 'text-amber-400 animate-pulse'
                      : 'text-slate-400'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Dossier / Inspection HUD */}
      <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${selectedAgent.color}20`, borderColor: `${selectedAgent.color}50` }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center text-white"
            >
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{ color: selectedAgent.color }}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider"
                >
                  {selectedAgent.type} DOSSIER
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs font-bold text-slate-100">{selectedAgent.label}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedAgent.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500">Runtime: <strong className="text-slate-200">{selectedAgent.runtime}</strong></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">Confidence: <strong className="text-emerald-400">{selectedAgent.confidence}</strong></span>
          </div>
        </div>

        {/* Inputs, Outputs & Evidence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">INPUT DATA STREAM</span>
            <p className="text-slate-300 leading-relaxed">{selectedAgent.input}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1.5">
            <span className="text-[10px] text-sky-400 uppercase block font-bold">OUTPUT SYNTHESIS</span>
            <p className="text-slate-200 font-semibold leading-relaxed">{selectedAgent.output}</p>
          </div>
        </div>

        {/* Verified Evidence List */}
        <div className="p-3.5 rounded-xl bg-[#060a14] border border-white/[0.04] space-y-2 text-xs font-mono">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">VERIFIED EVIDENCE & AUDIT TRACE</span>
          <div className="space-y-1">
            {selectedAgent.evidence.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300">
                <CheckCircle size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
