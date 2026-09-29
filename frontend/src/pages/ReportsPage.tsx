import React from 'react';
import { format } from 'date-fns';
import { Download, FileText, Printer, Share2, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const sections = [
    {
      title: 'Executive Summary',
      content:
        'Singapore Port MPA Terminal Congestion detected on September 20, 2026. HIGH severity disruption affecting Tier-1 supplier Penang Electronics Sdn Bhd. Critical supply chain path identified through PCB Assembly → Frankfurt Factory → IntelliSense Pro X1 → Deutsche Telekom and Siemens Digital Industries. Total financial exposure: $28.3M across 22 orders. Autonomous AI agent swarm completed end-to-end multi-tier analysis in 14.2s. Recovery Strategy B (Air Freight Bridge) recommended for immediate Tier-1 SLA fulfillment.',
    },
    {
      title: 'Disruption Incident Details',
      items: [
        'Incident: Singapore Port MPA Terminal Congestion',
        'Detection Timestamp: September 20, 2026 at 04:15 UTC',
        'Classification: PORT_DISRUPTION | Severity: HIGH | Status: ACTIVE',
        'Geographic Coordinates: Singapore PSA Tanjong Pagar Terminal (1.2644° N, 103.8185° E)',
        'Congestion Scale: 847 vessels queued, 35% operational capacity (-65% throughput)',
        'Maritime Delay Horizon: 8–12 days average berth waiting time',
        'Carriers Impacted: MSC, Maersk, CMA CGM, Hapag-Lloyd, ONE + 7 regional lines',
      ],
    },
    {
      title: 'Multi-Tier Supply Chain Causal Reach',
      items: [
        'Tier-1 Transshipment Hub: Singapore Freight Hub (primary maritime gateway blocked)',
        'Tier-2 Manufacturing Vendor: Penang Electronics Sdn Bhd (PCB Assemblies, RF Modules)',
        'Manufacturing Plant Impact: Frankfurt Assembly Plant (Capacity constrained to 70%)',
        'Critical Materials: PCB Assemblies (5 days safety stock), RF Modules (7 days stock)',
        'Enterprise Orders Exposed: 22 purchase orders across Tier-1 clients',
        'Maximum Financial Exposure: $28.3M USD over 60-day modeled horizon',
      ],
    },
    {
      title: 'AI Multi-Agent Swarm Synthesis & Recommendation',
      items: [
        'Event Intelligence Agent: 94% confidence (2.3s) — Validated from MPA, Lloyds List, Port Authority SG',
        'Supply Chain Research Agent: 89% confidence (3.7s) — Identified Port Klang / Tanjong Pelepas alternates',
        'Impact Tracing Agent: 96% confidence (4.1s) — Traced 4-tier critical path, 22 exposed orders',
        'Finance & ESG Agent: 91% confidence (3.2s) — Modelled $28.3M exposure and Scope-3 CO2 deltas',
        'Recovery Strategy Agent: 88% confidence (2.9s) — Ranked 3 candidate recovery pathways',
        'Orchestrator Agent: 93% confidence (14.2s total) — Synthesized trade-offs for human authorization',
      ],
    },
    {
      title: 'Strategic Recovery Options & Authorized Mission Plan',
      items: [
        'Strategy A (Alternate Supplier): 18 days, $1.2M additional cost, +12% CO2, 78% Feasibility',
        'Strategy B (Emergency Air Freight): 8 days, $3.8M additional cost, +340% CO2, 92% Feasibility [AI HIGHLIGHT]',
        'Strategy C (Inventory Reallocation): 5 days, $0.4M additional cost, +2% CO2, 65% Feasibility',
        'Governance Commitment: Strategy B authorized by Operations Director Sarah Chen',
        'Generated Operational Plan ID: CP-2026-0920-001 (Ready for ERP Execution)',
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              EXECUTIVE INTELLIGENCE BRIEFING
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">AUDIT DOSSIER</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            ChainPulse Operational Intelligence Report
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Generated: {format(new Date(), 'MMMM d, yyyy HH:mm')} · Incident DISR-SG-2026-001
          </p>
        </div>

        {/* Export and Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-[#080d19] border border-white/[0.08] hover:border-white/20 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
          <button
            onClick={() => alert('Executive Brief PDF generation triggered for Jury Dossier.')}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            <Download size={13} />
            <span>Export PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Meta Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
          CRITICAL ACTIVE DISRUPTION
        </span>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
          $28.3M FINANCIAL EXPOSURE
        </span>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#080d19] text-slate-300 border border-white/[0.08]">
          Report ID: CP-RPT-2026-0926-001
        </span>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          Plan CP-2026-0920-001 Authorized
        </span>
      </div>

      {/* Report Sections Document Canvas */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-8">
        {sections.map((section, idx) => (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
              <span className="text-xs font-mono text-sky-400 font-bold">0{idx + 1}.</span>
              <h3 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>

            {section.content ? (
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-4xl">
                {section.content}
              </p>
            ) : (
              <ul className="space-y-2">
                {section.items?.map((item, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
