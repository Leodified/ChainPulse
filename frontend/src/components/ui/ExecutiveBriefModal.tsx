import React, { useState } from 'react';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Printer, ArrowRight, Share2 } from 'lucide-react';

interface ExecutiveBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveBriefModal({ isOpen, onClose }: ExecutiveBriefModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = (format: 'pdf' | 'json' | 'csv') => {
    setDownloading(format);
    setTimeout(() => {
      if (format === 'json') {
        const data = {
          report_title: 'ChainPulse Executive Disruption Briefing',
          disruption_id: 'DISR-SG-2026-001',
          timestamp: new Date().toISOString(),
          situation: 'Singapore port MPA terminal congestion propagating across Malacca Strait corridor.',
          network_impact: {
            suppliers_exposed: 4,
            materials_affected: 7,
            factories_constrained: 68,
            orders_at_risk: 22,
            max_financial_exposure_usd: 28300000,
          },
          strategies: [
            { id: 'STRAT-B', name: 'Emergency Air Freight Bridge', days: 8, cost_usd: 3800000, co2_delta: '+340%', feasibility: 0.92, recommended: true },
            { id: 'STRAT-A', name: 'Alternate Supplier Activation', days: 18, cost_usd: 1200000, co2_delta: '+12%', feasibility: 0.78 },
            { id: 'STRAT-C', name: 'Inventory Reallocation', days: 5, cost_usd: 400000, co2_delta: '+2%', feasibility: 0.65 },
          ],
          governance: {
            status: 'PENDING_HUMAN_AUTHORIZATION',
            decision_owner: 'Operations Director',
            validation: 'Deterministic Backend Rule Engine + SAP ERP Context',
          }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chainpulse-briefing-${Date.now()}.json`;
        a.click();
      } else if (format === 'csv') {
        const csvContent = 
          'Entity,Type,Metric,Value,Risk Level\n' +
          'Singapore MPA Hub,Port,Throughput Loss,-65%,CRITICAL\n' +
          'Penang Electronics (MY-01),Supplier,Runway,5-7 Days,HIGH\n' +
          'Frankfurt Main Hub,Factory,Capacity,70%,MODERATE\n' +
          'IntelliSense Pro X1,Product,Orders At Risk,22,CRITICAL\n' +
          'Enterprise Total,Financial,Max Exposure,$28.3M,CRITICAL\n' +
          'Strategy B (Air Freight),Recovery,Lead Time,8 Days,RECOMMENDED\n';
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chainpulse-impact-data-${Date.now()}.csv`;
        a.click();
      } else {
        window.print();
      }
      setDownloading(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-[#060b18] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0a1226] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
                  NARRATIVE INTELLIGENCE BRIEF
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ● ACTIVE ALERT
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Disruption Briefing: Singapore Port Congestion
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Briefing Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Situation Section */}
          <div className="p-4 rounded-xl bg-[#091428] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                01 · SITUATION
              </span>
              <span className="text-[11px] font-mono text-slate-400">Detected: 2026-09-20 09:42 UTC</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Severe congestion at Singapore Tanjong Pagar Terminal following Typhoon Haikui has reduced container throughput by <strong className="text-white">65%</strong>. 
              Vessel waiting times now average <strong className="text-amber-400">8–12 days</strong> across the Malacca Strait corridor, triggering cascading upstream delays for key components.
            </p>
          </div>

          {/* Network & Business Impact Section */}
          <div className="p-4 rounded-xl bg-[#091428] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                02 · BUSINESS IMPACT & EXPOSURE
              </span>
              <span className="text-[11px] font-mono text-rose-400 font-semibold">$28.3M MAX EXPOSURE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-xs text-slate-400">Suppliers Exposed</div>
                <div className="text-lg font-black font-mono text-white mt-0.5">4</div>
                <div className="text-[10px] text-amber-400">MY, TW, JP, SG</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-xs text-slate-400">Materials In Buffer</div>
                <div className="text-lg font-black font-mono text-white mt-0.5">7</div>
                <div className="text-[10px] text-rose-400">Runway 5–7d</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-xs text-slate-400">Factories Affected</div>
                <div className="text-lg font-black font-mono text-white mt-0.5">68</div>
                <div className="text-[10px] text-amber-400">70% Cap Frankfurt</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-xs text-slate-400">Orders at Risk</div>
                <div className="text-lg font-black font-mono text-white mt-0.5">22</div>
                <div className="text-[10px] text-rose-400">$28.3M Exposure</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Primary production constrained at Frankfurt Hub for <strong>IntelliSense Pro X1</strong>. Unmitigated inventory runway reaches stockout within <strong>7 days</strong>, threatening Tier-1 customer SLA compliance (Deutsche Telekom, Siemens AG).
            </p>
          </div>

          {/* Evaluated Options Section */}
          <div className="p-4 rounded-xl bg-[#091428] border border-white/5 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              03 · EVALUATED RECOVERY OPTIONS
            </span>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">Strategy B: Emergency Air Freight</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">RECOMMENDED</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Air freight priority PCB assemblies · Lead time: 8 days · Cost: $3.8M · CO2: +340%</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-300 font-bold">92% Feasibility</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 font-mono">Strategy A: Alternate Supplier Activation</span>
                  <div className="text-xs text-slate-400 mt-0.5">Activate Bangalore Alt Hub · Lead time: 18 days · Cost: $1.2M · CO2: +12%</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">78% Feasibility</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-300 font-mono">Strategy C: Inventory Reallocation</span>
                  <div className="text-xs text-slate-400 mt-0.5">Prioritize Tier 1 customers · Lead time: 5 days · Cost: $0.4M · CO2: +2%</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-amber-400">65% Feasibility</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Governance Section */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
            <ShieldCheck size={20} className="text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                04 · DECISION GOVERNANCE
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Human authorization is legally and operationally required to release logistics funds ($3.8M) and notify SAP S/4HANA production scheduling. AI recommendations remain advisory until approved by the <strong>Operations Director</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0a1226] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400">
            Export formats: PDF, JSON, CSV
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download size={14} />
              <span>JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white transition-colors"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
