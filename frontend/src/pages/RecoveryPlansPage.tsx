import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Flame,
  Leaf,
  Radio,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MOCK_STRATEGIES } from '../data/mockData';
import type { RecoveryStrategy } from '../types/agents';
import { approveStrategy, fetchStrategies } from '../services/recovery';

function MetricPill({
  label,
  value,
  best,
  worst,
}: {
  label: string;
  value: string;
  best?: boolean;
  worst?: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between p-2 rounded-lg border text-xs font-mono',
        best
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : worst
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : 'bg-[#0c1424] border-white/[0.05] text-slate-300'
      )}
    >
      <span className="text-[10px] text-slate-400 uppercase">{label}</span>
      <span className="font-bold">
        {value}
        {best && ' ★'}
      </span>
    </div>
  );
}

export default function RecoveryPlansPage() {
  const [strategies, setStrategies] = useState<RecoveryStrategy[]>(MOCK_STRATEGIES);
  const [selectedId, setSelectedId] = useState<string | null>('STRAT-B-AIR-FREIGHT');
  const [confirmed, setConfirmed] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [planId, setPlanId] = useState('CP-2026-0920-001');
  const [approvedAt, setApprovedAt] = useState('');

  useEffect(() => {
    fetchStrategies('DISR-SG-2026-001').then((data) => {
      if (data?.length) {
        setStrategies(data);
        const existingApproved = data.find((s) => s.status === 'APPROVED');
        if (existingApproved) {
          setSelectedId(existingApproved.id);
          setPlanId(`CP-${existingApproved.id.replace('STRAT-', '')}-001`);
          setApprovedAt(existingApproved.approvedAt || new Date().toISOString());
          setApproved(true);
        }
      }
    });
  }, []);

  const selectedStrategy = selectedId
    ? strategies.find((s) => s.id === selectedId) || null
    : null;

  async function handleApprove() {
    if (!selectedId) return;
    setApproving(true);
    try {
      const result = await approveStrategy(selectedId, 'Sarah Chen (Operations Director)');
      setPlanId(result.planId || `CP-${selectedId.replace('STRAT-', '')}-001`);
      setApprovedAt(result.approvedAt || new Date().toISOString());
      setApproved(true);
      setStrategies((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, status: 'APPROVED' } : s))
      );
    } finally {
      setApproving(false);
    }
  }

  // Interactive execution plan step states
  const [executionSteps, setExecutionSteps] = useState([
    { id: 1, label: 'Decision authorized (Operations Director: Sarah Chen)', status: 'COMPLETED', time: 'T+00m', detail: 'Formal sign-off committed with digital signature token CP-AUTH-9021' },
    { id: 2, label: 'Inventory allocation initiated (ERP PO-EXP-8841)', status: 'COMPLETED', time: 'T+05m', detail: '4,500 PCB modules locked in SAP S/4HANA PO-EXP-8841' },
    { id: 3, label: 'Supplier confirmation (MY-ELECTRONICS-01)', status: 'IN_PROGRESS', time: 'T+22m', detail: 'Penang plant dispatching emergency logistics buffer to PEN airport' },
    { id: 4, label: 'Factory scheduling (Frankfurt Shift 2 ramp-up)', status: 'PENDING', time: 'Day 2', detail: 'Frankfurt Assembly Line B scheduled for dual-shift overtime' },
    { id: 5, label: 'Customer notification (Deutsche Telekom, Siemens AG SLA)', status: 'PENDING', time: 'Day 3', detail: 'Automated SLA preservation alerts dispatched to Tier-1 account managers' },
  ]);

  function toggleStep(id: number) {
    setExecutionSteps((prev) =>
      prev.map((step) => {
        if (step.id !== id) return step;
        const nextStatus =
          step.status === 'COMPLETED'
            ? 'PENDING'
            : step.status === 'PENDING'
            ? 'IN_PROGRESS'
            : 'COMPLETED';
        return { ...step, status: nextStatus };
      })
    );
  }

  // Approved Mission Plan View
  if (approved && selectedStrategy) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
        {/* Approved Plan Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
                  DECISION COMMITTED // OPERATIONAL MISSION PLAN
                </span>
                <span className="text-[10px] font-mono text-slate-500">·</span>
                <span className="text-[10px] font-mono text-slate-400">{planId}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                Recovery Plan Authorized: {selectedStrategy.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#090f1d] border border-white/[0.08] hover:border-white/20 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Export Executive Brief (PDF)</span>
            </button>
          </div>
        </div>

        {/* Plan Telemetry Overview Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#080d19] border border-emerald-500/20 flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Target Horizon</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {selectedStrategy.recoveryDays} Days
            </span>
            <span className="text-xs text-slate-500 mt-1">Full production recovery</span>
          </div>
          <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Committed Cost</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              ${(selectedStrategy.additionalCostUSD / 1e6).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-500 mt-1">Expedited air bridge logistics</span>
          </div>
          <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Scope-3 Emission Delta</span>
            <span className="text-2xl font-bold font-mono text-slate-200">
              +{selectedStrategy.co2ImpactPct}%
            </span>
            <span className="text-xs text-slate-500 mt-1">Temporary air transport variance</span>
          </div>
          <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Authorizing Executive</span>
            <span className="text-base font-bold text-slate-200 mt-1">Sarah Chen</span>
            <span className="text-xs font-mono text-slate-500">Operations Director (Verified)</span>
          </div>
        </div>

        {/* INTERACTIVE OPERATIONAL EXECUTION PLAN */}
        <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                Live Execution Workflow Directives (Interactive)
              </h3>
            </div>
            <span className="text-xs font-mono text-sky-400">
              {executionSteps.filter((s) => s.status === 'COMPLETED').length} / {executionSteps.length} Directives Executed
            </span>
          </div>

          <div className="space-y-2.5">
            {executionSteps.map((step) => {
              const isDone = step.status === 'COMPLETED';
              const isInProgress = step.status === 'IN_PROGRESS';

              return (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : isInProgress
                      ? 'bg-sky-500/10 border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                      : 'bg-[#0c1424] border-white/[0.05] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isInProgress
                          ? 'bg-sky-400 text-slate-950 animate-pulse'
                          : 'border border-white/20 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : step.id}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-sans flex items-center gap-2">
                        <span>{step.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">({step.time})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{step.detail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : isInProgress
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : 'bg-white/[0.05] text-slate-500 border-white/[0.08]'
                      }`}
                    >
                      {step.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Click to advance</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IMMUTABLE AUDIT TRAIL PROVENANCE STAMP */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#090f1e] via-[#080d19] to-[#0d1627] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
              <ShieldAlert size={16} />
            </div>
            <div>
              <div className="text-slate-200 font-bold">Immutable Ledger Audit Stamp: CP-AUD-2026-9021</div>
              <div className="text-[11px] text-slate-400">
                Committed at {approvedAt || '2026-09-20T10:14:00Z'} · Actor: Sarah Chen (Operations Director) · IP: 10.14.***.*** (Masked - SEC-RESTRICTED) · Tenant: tenant-acme-corp
              </div>
            </div>
          </div>
          <a
            href="/settings"
            className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 text-[11px] font-semibold"
          >
            <span>View Full Audit Log in Settings</span>
            <ArrowRight size={12} />
          </a>
        </div>
      </div>
    );
  }

  // Strategic Decision Room View
  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              STRATEGIC RECOVERY GOVERNANCE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              HUMAN-IN-THE-LOOP DECISION MATRIX
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Recovery Strategy Decision Room
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Operational Authority Required
            </span>
          </h1>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Disruption: <span className="text-rose-400 font-bold">DISR-SG-2026-001 (Singapore Port)</span>
        </div>
      </div>

      {/* AI Swarm Synthesis Insight Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/25 via-[#070d1a] to-sky-950/25 border border-indigo-500/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
            <Scale size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-semibold">
                AI SWARM RECOVERY SYNTHESIS
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-[10px] font-mono text-slate-400">TRADE-OFF ENVELOPE</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              <strong>Strategy B (Emergency Air Freight Bridge)</strong> provides the fastest recovery (8 days) defending critical Tier-1 customer contracts, but incurs a +340% transport-emissions trade-off. 
              <strong> Strategy A (Alternate Supplier)</strong> is the optimal structural recovery over 18 days at $1.2M. Final commitment remains strictly with the human operator.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-[#090f1d] border border-white/[0.08] text-right flex-shrink-0">
          <span className="text-[9px] font-mono text-slate-500 uppercase block">Decision Protocol</span>
          <span className="text-xs font-mono font-bold text-amber-400">Human Approval Mandatory</span>
        </div>
      </div>

      {/* 3 Strategic Pathways Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {strategies.map((strategy) => {
          const isSelected = selectedId === strategy.id;
          const isRecommended = strategy.recommended;

          return (
            <div
              key={strategy.id}
              onClick={() => setSelectedId(strategy.id)}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-400 shadow-[0_0_36px_rgba(56,189,248,0.25)] scale-[1.02] z-10'
                  : 'bg-[#080d19] border-white/[0.06] hover:border-white/20 opacity-75 hover:opacity-100 scale-[0.98]'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                        {strategy.type.replace(/_/g, ' ')}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          AI HIGHLIGHT
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{strategy.name}</h3>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      strategy.operationalRisk === 'LOW'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : strategy.operationalRisk === 'MEDIUM'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {strategy.operationalRisk} RISK
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[44px]">
                  {strategy.description}
                </p>

                {/* Scorecard Metric Pills */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <MetricPill
                    label="Recovery Horizon"
                    value={`${strategy.recoveryDays} Days`}
                    best={strategy.recoveryDays <= 5}
                    worst={strategy.recoveryDays >= 18}
                  />
                  <MetricPill
                    label="Additional Cost"
                    value={`$${(strategy.additionalCostUSD / 1e6).toFixed(1)}M`}
                    best={strategy.additionalCostUSD <= 400000}
                    worst={strategy.additionalCostUSD >= 3800000}
                  />
                  <MetricPill
                    label="Scope-3 CO2 Delta"
                    value={`+${strategy.co2ImpactPct}%`}
                    best={strategy.co2ImpactPct <= 5}
                    worst={strategy.co2ImpactPct >= 300}
                  />
                  <MetricPill
                    label="Feasibility Score"
                    value={`${strategy.feasibilityPct}%`}
                    best={strategy.feasibilityPct >= 90}
                    worst={strategy.feasibilityPct <= 65}
                  />
                </div>

                {/* Key Trade-off Callout */}
                <div className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1 text-xs">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block font-semibold">
                    PRIMARY TRADE-OFF
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    {strategy.tradeoffs[0] || 'Standard trade-off profile'}
                  </p>
                </div>
              </div>

              {/* Selection Status Button */}
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setSelectedId(strategy.id)}
                  className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]'
                  }`}
                >
                  {isSelected ? '✓ Strategic Option Selected' : 'Evaluate Strategy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Human Operational Authority Checkpoint Panel */}
      {selectedStrategy && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/20 via-[#080d19] to-indigo-950/20 border border-sky-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-fade-in space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                  EXECUTIVE GOVERNANCE CHECKPOINT
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-[10px] font-mono text-slate-400">TWO-STEP AUTHORIZATION</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">
                You are authorizing execution of:{' '}
                <span className="text-sky-400">{selectedStrategy.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Authorizes {selectedStrategy.recoveryDays}-day recovery protocol and commitments of $
                {(selectedStrategy.additionalCostUSD / 1e6).toFixed(1)}M USD into the ERP ledger.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={!confirmed || approving}
                onClick={handleApprove}
                className={`py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  confirmed && !approving
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.4)] cursor-pointer'
                    : 'bg-white/[0.06] text-slate-500 cursor-not-allowed border border-white/[0.08]'
                }`}
              >
                <span>{approving ? 'Authorizing in Ledger...' : 'Commit & Sign Operational Plan'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Decision Owner & ERP Context Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">DECISION OWNER</span>
              <span className="font-bold text-slate-200">Sarah Chen</span>
              <span className="text-[10px] text-slate-400 block">Operations Director // SAP S/4HANA Role: SCM_DIR</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">ERP REQUISITION MAPPING</span>
              <span className="font-bold text-amber-400">PO-EXP-8841</span>
              <span className="text-[10px] text-slate-400 block">Frankfurt Hub Cost Center 1010-4420</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">AUDIT PROTOCOL</span>
              <span className="font-bold text-emerald-400">IMMUTABLE LEDGER WRITE</span>
              <span className="text-[10px] text-slate-400 block">Digital signature token will be minted</span>
            </div>
          </div>

          {/* Two-step verification checklist */}
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#090f1d] border border-white/[0.06] cursor-pointer hover:border-white/15 transition-colors">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/40"
              />
              <span className="text-xs text-slate-300 leading-relaxed font-medium">
                <strong>Step 1: Impact & Feasibility Verification</strong> — I verify that I have evaluated the multi-tier impact propagation, Monte Carlo risk curves, and multi-agent trade-off envelope for {selectedStrategy.name}.
              </span>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#090f1d] border border-white/[0.06] cursor-pointer hover:border-white/15 transition-colors">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500/40"
              />
              <span className="text-xs text-slate-300 leading-relaxed font-medium">
                <strong>Step 2: Financial & Operational Authorization</strong> — As the designated operational authority, I authorize execution of ERP PO-EXP-8841 and commitments up to ${(selectedStrategy.additionalCostUSD / 1e6).toFixed(1)}M USD.
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
