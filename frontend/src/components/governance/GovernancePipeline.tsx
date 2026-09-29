import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Terminal,
  Sliders,
  Shield,
  UserCheck,
  Database,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Cpu,
} from 'lucide-react';
import { StatusBeacon } from '../motion';

interface GovernanceGate {
  step: string;
  title: string;
  ruleName: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  border: string;
  desc: string;
  validationLogic: string[];
}

const GATES: GovernanceGate[] = [
  {
    step: '01',
    title: 'AI Swarm Output',
    ruleName: 'Untrusted Swarm Ingestion',
    tag: 'UNTRUSTED INPUT',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: <Terminal size={18} className="text-sky-400" />,
    border: 'border-sky-500/30',
    desc: 'Swarm agent hypotheses & proposed recovery options ingested as raw untrusted payloads.',
    validationLogic: [
      'Ingests raw output from 6 autonomous agents',
      'Assigns immutable UUID & execution timestamp',
      'Flags payload for zero-trust sandbox execution',
    ],
  },
  {
    step: '02',
    title: 'Schema Validation',
    ruleName: 'Pydantic Type Contract',
    tag: 'DETERMINISTIC',
    tagColor: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    icon: <Lock size={18} className="text-indigo-400" />,
    border: 'border-indigo-500/30',
    desc: 'Strict type validation against Pydantic models. Rejects unvalidated or malformed fields.',
    validationLogic: [
      'Enforces RecoveryStrategy Pydantic schema v1.0',
      'Validates bounds: Cost > $0, Feasibility <= 1.0',
      'Rejects speculative attributes or unparsed LLM tokens',
    ],
  },
  {
    step: '03',
    title: 'Business Rules Engine',
    ruleName: 'SAP BOM & Exposure Guard',
    tag: 'ERP INTEGRITY',
    tagColor: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    icon: <Sliders size={18} className="text-blue-400" />,
    border: 'border-blue-500/30',
    desc: 'Cross-checks Bill-of-Materials, minimum safety stock limits, and financial loss ceilings.',
    validationLogic: [
      'Verifies PCB Assembly inventory stockout thresholds',
      'Asserts maximum exposure <= $28.3M modeled ceiling',
      'Guarantees Frankfurt line-balancing constraints',
    ],
  },
  {
    step: '04',
    title: 'Role Authorization',
    ruleName: 'Tenant & RBAC Verification',
    tag: 'RBAC GUARD',
    tagColor: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
    icon: <Shield size={18} className="text-purple-400" />,
    border: 'border-purple-500/30',
    desc: 'Tenant isolation and RBAC checks. Requires OPERATIONS_DIRECTOR role for production mutations.',
    validationLogic: [
      'Requires JWT bearer with OPERATIONS_DIRECTOR claim',
      'Enforces tenant isolation for Acme Industrial GmbH',
      'Verifies SAP Learning Hub, student edition credentials (Sarah Chen · S-002948102)',
      'Restricts air freight budget release over $1.0M',
    ],
  },
  {
    step: '05',
    title: 'Human Sign-Off Gate',
    ruleName: 'Mandatory Human Authorization',
    tag: 'HUMAN MANDATORY',
    tagColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    icon: <UserCheck size={18} className="text-emerald-400" />,
    border: 'border-emerald-500/30',
    desc: 'Cryptographic 2-step verification. Autonomous agents strictly prohibited from self-approving.',
    validationLogic: [
      'Requires explicit human checkbox acknowledgment',
      'Cryptographically bound to verified SAP Learning Hub operator profile',
      'Records authorized officer identity (Sarah Chen - Operations Director)',
      'Blocks automated bypassing with 100% enforcement',
    ],
  },
  {
    step: '06',
    title: 'Ledger & ERP Commit',
    ruleName: 'Idempotent SAP RFC Commit',
    tag: 'AUDITED COMMIT',
    tagColor: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    icon: <Database size={18} className="text-cyan-400" />,
    border: 'border-cyan-500/30',
    desc: 'Commits to immutable audit log table and transmits authenticated purchase order requisition to SAP.',
    validationLogic: [
      'Writes immutable event to PostgreSQL/SQLite audit_events',
      'Transmits BAPI purchase requisition to SAP S/4HANA',
      'Generates verifiable plan document CP-2026-0920-001',
    ],
  },
];

export function GovernancePipeline() {
  const [selectedGateIndex, setSelectedGateIndex] = useState<number>(4); // Default to Human Sign-Off
  const [packetIndex, setPacketIndex] = useState<number | null>(null);

  const selectedGate = GATES[selectedGateIndex];

  function runPacketTest() {
    setPacketIndex(0);
  }

  useEffect(() => {
    if (packetIndex === null) return;
    if (packetIndex >= GATES.length) {
      const timer = setTimeout(() => setPacketIndex(null), 1000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setSelectedGateIndex(packetIndex);
      setPacketIndex((prev) => (prev !== null ? prev + 1 : null));
    }, 450);
    return () => clearTimeout(timer);
  }, [packetIndex]);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#091122] via-[#050a16] to-[#03060e] border border-sky-500/25 p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background Telemetry Grid */}
      <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                AI SAFETY FIREWALL // 6-GATE DETERMINISTIC GOVERNANCE PIPELINE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ZERO UNCHECKED ERP WRITES
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Non-bypassable validation pipeline ensuring autonomous swarm suggestions require strict schema, business rule, and human sign-off before ERP commit
            </p>
          </div>
        </div>

        <button
          onClick={runPacketTest}
          disabled={packetIndex !== null}
          className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/40 hover:bg-sky-500/25 text-xs font-mono text-sky-300 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          {packetIndex !== null ? (
            <>
              <RotateCw size={13} className="animate-spin text-sky-400" />
              <span>Verifying Gate 0{packetIndex + 1}...</span>
            </>
          ) : (
            <>
              <Play size={13} className="text-sky-400 fill-sky-400" />
              <span>Test Governance Flow</span>
            </>
          )}
        </button>
      </div>

      {/* 6-Gate Visual Track */}
      <div className="relative z-10 my-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {GATES.map((g, idx) => {
            const isSelected = selectedGateIndex === idx;
            const isProcessing = packetIndex === idx;
            const isPast = packetIndex !== null ? idx < packetIndex : true;

            return (
              <button
                key={g.step}
                onClick={() => setSelectedGateIndex(idx)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 shadow-[0_0_24px_rgba(56,189,248,0.3)] scale-[1.02]'
                    : isProcessing
                    ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_24px_rgba(245,158,11,0.35)] animate-pulse'
                    : 'border-white/10 bg-[#070e1a]/85 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300">{g.icon}</div>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-bold ${g.tagColor}`}>
                      {g.tag}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 font-bold">
                    GATE {g.step}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 font-mono mt-0.5 leading-tight">
                    {g.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {g.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-500">STATE:</span>
                  {isProcessing ? (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <StatusBeacon variant="warning" size="sm" ping />
                      VERIFYING
                    </span>
                  ) : isPast ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      PASSED
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold">STANDBY</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Gate Detailed Rule Breakdown */}
      <div className="relative z-10 p-4 rounded-xl bg-[#060b17] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase">
              GATE {selectedGate.step} INSPECTION:
            </span>
            <span className="text-xs font-bold text-white font-mono">{selectedGate.title}</span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${selectedGate.tagColor}`}>
              {selectedGate.ruleName}
            </span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {selectedGate.desc}
          </p>
        </div>

        <div className="space-y-1 shrink-0 border-t md:border-t-0 md:border-l border-white/[0.08] pt-3 md:pt-0 md:pl-4 text-xs font-mono">
          <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">
            Enforced Invariants
          </span>
          {selectedGate.validationLogic.map((logic, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
              <span>{logic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
