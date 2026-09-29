import React from 'react';
import { X, HelpCircle, ShieldCheck, Database, Calculator, GitBranch, ExternalLink } from 'lucide-react';

export interface WhyDetails {
  title: string;
  metric: string;
  formula?: string;
  explanation: string;
  parameters?: { label: string; value: string; note?: string }[];
  sources: { name: string; type: 'ERP' | 'AIS' | 'SCENARIO_ENGINE' | 'TELEMETRY'; verified: boolean }[];
  governanceNote?: string;
}

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: WhyDetails | null;
}

export function WhyModal({ isOpen, onClose, details }: WhyModalProps) {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#070e1e] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-cyan-950/20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Calculator size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  DECISION PROVENANCE & EXPLAINABILITY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck size={11} /> DETERMINISTIC
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{details.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main Key Metric */}
          <div className="p-4 rounded-xl bg-[#091428] border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Observed Value / Impact Metric</div>
              <div className="text-2xl font-black font-mono text-cyan-300 mt-1">{details.metric}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 block">Calculation Mode</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">No Hallucination · Rule Engine</span>
            </div>
          </div>

          {/* Mathematical / Causal Derivation */}
          {details.formula && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">
                <GitBranch size={13} />
                <span>Deterministic Calculation Logic</span>
              </div>
              <div className="font-mono text-sm text-slate-200 bg-black/40 p-3 rounded-lg border border-white/5 break-all">
                {details.formula}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Causal Reasoning</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#060b18] p-3.5 rounded-xl border border-white/5">
              {details.explanation}
            </p>
          </div>

          {/* Parameters Table */}
          {details.parameters && details.parameters.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Model Parameters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {details.parameters.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/25 border border-white/5">
                    <div className="text-[11px] text-slate-400">{p.label}</div>
                    <div className="text-sm font-mono font-bold text-white mt-0.5">{p.value}</div>
                    {p.note && <div className="text-[10px] text-slate-400 mt-0.5">{p.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources & Provenance */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Verified Data Provenance</h4>
            <div className="space-y-1.5">
              {details.sources.map((src, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Database size={13} className="text-cyan-400" />
                    <span className="text-slate-300">{src.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {src.type}
                    </span>
                    {src.verified && (
                      <span className="text-emerald-400 text-[11px] flex items-center gap-0.5">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Footer */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-slate-300">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">AI Safety Boundary: </span>
              {details.governanceNote ||
                'Calculations are computed by the deterministic backend model and verified against enterprise SAP context. AI models only synthesize summaries and rank trade-offs; they never alter enterprise numbers.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#060a14] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
}
