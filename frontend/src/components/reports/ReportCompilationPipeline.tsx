import React, { useState, useEffect } from 'react';
import {
  FileText,
  Database,
  Search,
  Activity,
  Cpu,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCw,
  Eye,
  Layers,
} from 'lucide-react';
import { StatusBeacon } from '../motion';

interface PipelineStage {
  id: string;
  name: string;
  category: string;
  source: string;
  latency: string;
  summary: string;
  metrics: { label: string; value: string }[];
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: 'ingestion',
    name: '01. Telemetry Ingestion',
    category: 'RAW FEEDS',
    source: 'SAP S/4HANA · MPA AIS · Lloyds',
    latency: '340ms',
    summary: 'Streamed 847 container vessel transponder records and 1,420 SAP order line-items.',
    metrics: [
      { label: 'Feeds Synchronized', value: '4 live feeds' },
      { label: 'Ingestion Integrity', value: '100% CRC' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'incident',
    name: '02. Incident Triangulation',
    category: 'DETECTION',
    source: 'Maritime & Port Authority SG',
    latency: '890ms',
    summary: 'Correlated Tanjong Pagar berth congestion to DISR-SG-2026-001 (High Severity).',
    metrics: [
      { label: 'Queued Vessels', value: '847 container ships' },
      { label: 'Confidence Score', value: '94% Triangulated' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'trace',
    name: '03. Multi-Tier Network Trace',
    category: 'TOPOLOGY',
    source: 'Supply Chain Digital Twin',
    latency: '1.2s',
    summary: 'Traced bottleneck: Singapore Port ──► Penang Electronics ──► PCB Assembly ──► Frankfurt Hub.',
    metrics: [
      { label: 'Tiers Traversed', value: '4 tiers deep' },
      { label: 'Critical Path Nodes', value: '7 nodes isolated' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'swarm',
    name: '04. Agent Swarm Reasoning',
    category: 'MULTI-AGENT AI',
    source: '6 Autonomous Agent Nodes',
    latency: '14.2s',
    summary: 'Cross-functional consensus formed on operational constraints and alternate routing.',
    metrics: [
      { label: 'Swarm Consensus', value: '93% agreement' },
      { label: 'Execution Time', value: '14.2 seconds' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'financial',
    name: '05. Balance Sheet Modeling',
    category: 'EXPOSURE',
    source: 'Treasury & Revenue Engine',
    latency: '1.8s',
    summary: 'Modeled total unmitigated enterprise exposure at $28.3M across 22 critical orders.',
    metrics: [
      { label: 'Modeled Exposure', value: '$28.3M Max' },
      { label: 'Orders At Risk', value: '22 Purchase Orders' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'recovery',
    name: '06. Strategy Formulation',
    category: 'OPTIMIZATION',
    source: 'Decision Trade-Off Matrix',
    latency: '2.1s',
    summary: 'Compared Strategy A ($1.2M), B ($3.8M Air Bridge), and C ($0.4M Reallocation).',
    metrics: [
      { label: 'Recommended Option', value: 'Strategy B (Air Bridge)' },
      { label: 'Lead Time Saved', value: '13 days earlier' },
    ],
    status: 'COMPLETED',
  },
  {
    id: 'brief',
    name: '07. Executive Dossier Seal',
    category: 'GOVERNANCE',
    source: 'ChainPulse Governance Core',
    latency: '450ms',
    summary: 'Generated cryptographically verifiable briefing CP-RPT-2026-0926-001.',
    metrics: [
      { label: 'Dossier ID', value: 'CP-RPT-2026-0926-001' },
      { label: 'Sign-Off Ready', value: 'Audit Hash Verified' },
    ],
    status: 'COMPLETED',
  },
];

export function ReportCompilationPipeline() {
  const [selectedStageId, setSelectedStageId] = useState<string>('swarm');
  const [compilingIndex, setCompilingIndex] = useState<number | null>(null);

  const selectedStage =
    DEFAULT_STAGES.find((s) => s.id === selectedStageId) || DEFAULT_STAGES[3];

  function runCompilation() {
    setCompilingIndex(0);
  }

  useEffect(() => {
    if (compilingIndex === null) return;
    if (compilingIndex >= DEFAULT_STAGES.length) {
      const timer = setTimeout(() => setCompilingIndex(null), 800);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setSelectedStageId(DEFAULT_STAGES[compilingIndex].id);
      setCompilingIndex((prev) => (prev !== null ? prev + 1 : null));
    }, 380);
    return () => clearTimeout(timer);
  }, [compilingIndex]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#091122] via-[#050a16] to-[#03060e] border border-sky-500/25 p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                INTELLIGENCE SYNTHESIS PIPELINE // 7-STAGE REPORT COMPILER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PROVENANCE VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Live multi-tier data compilation from raw maritime sensors through autonomous swarm consensus to audit seal
            </p>
          </div>
        </div>

        <button
          onClick={runCompilation}
          disabled={compilingIndex !== null}
          className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/40 hover:bg-sky-500/25 text-xs font-mono text-sky-300 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          {compilingIndex !== null ? (
            <>
              <RotateCw size={13} className="animate-spin text-sky-400" />
              <span>Compiling Stage 0{compilingIndex + 1}...</span>
            </>
          ) : (
            <>
              <Play size={13} className="text-sky-400 fill-sky-400" />
              <span>Re-Run Pipeline Verification</span>
            </>
          )}
        </button>
      </div>

      {/* Pipeline Stages Stepper */}
      <div className="relative z-10 my-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {DEFAULT_STAGES.map((stage, idx) => {
            const isSelected = selectedStage.id === stage.id;
            const isProcessing = compilingIndex === idx;
            const isPast = compilingIndex !== null ? idx < compilingIndex : true;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
                    : isProcessing
                    ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse'
                    : 'border-white/10 bg-[#070e1a]/80 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-mono text-slate-500 font-bold">
                    STAGE 0{idx + 1}
                  </span>
                  {isProcessing ? (
                    <StatusBeacon variant="warning" size="sm" ping />
                  ) : isPast ? (
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>

                <div className="text-[11px] font-bold text-slate-100 font-mono truncate leading-tight">
                  {stage.name.split('. ')[1]}
                </div>
                <div className="text-[9px] font-mono text-sky-400/80 mt-1 truncate">
                  {stage.category}
                </div>
                <div className="text-[8px] font-mono text-slate-500 mt-1">
                  {stage.latency}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Inspector Drawer */}
      <div className="relative z-10 p-4 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase">
              {selectedStage.name}:
            </span>
            <span className="text-xs font-mono text-slate-300">
              Source: <strong className="text-white">{selectedStage.source}</strong>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Latency: {selectedStage.latency}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {selectedStage.summary}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-white/[0.08] pt-3 md:pt-0 md:pl-4">
          {selectedStage.metrics.map((m, i) => (
            <div key={i} className="text-right">
              <span className="text-[9px] font-mono text-slate-500 block uppercase">
                {m.label}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
