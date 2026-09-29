import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { MOCK_ANOMALIES } from '../data/mockData';

export default function TransactionAnomaliesPage() {
  const openCount = MOCK_ANOMALIES.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              TRANSACTION TELEMETRY & FRAUD/DELAY HEURISTICS
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              ERP AUDIT CORRELATION
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Transaction Anomalies
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {openCount} Open Anomaly Signals
            </span>
          </h1>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Source: <span className="text-slate-200">SAP S/4HANA PO & Goods Receipt Stream</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Detected', value: MOCK_ANOMALIES.length.toString(), color: 'text-slate-100', sub: 'Correlated with Singapore congestion' },
          { label: 'High Severity', value: MOCK_ANOMALIES.filter((a) => a.severity === 'HIGH').length.toString(), color: 'text-rose-400', sub: 'Immediate PO variance' },
          { label: 'Open Investigations', value: openCount.toString(), color: 'text-amber-400', sub: 'Assigned to procurement audit' },
          { label: 'Under Active Audit', value: MOCK_ANOMALIES.filter((a) => a.status === 'INVESTIGATING').length.toString(), color: 'text-sky-400', sub: 'Carrier review underway' },
        ].map((k) => (
          <div
            key={k.label}
            className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between"
          >
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{k.label}</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${k.color}`}>{k.value}</div>
            <span className="text-[11px] text-slate-500 mt-1">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Anomaly Log Table */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-amber-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Autonomous ERP Anomaly Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            CORRELATED TO DISR-SG-2026-001
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                <th className="text-left py-2.5 px-3">Anomaly ID</th>
                <th className="text-left py-2.5 px-3">Classification</th>
                <th className="text-left py-2.5 px-3">Entity</th>
                <th className="text-left py-2.5 px-3">Observed Discrepancy</th>
                <th className="text-left py-2.5 px-3">Timestamp</th>
                <th className="text-left py-2.5 px-3">Value</th>
                <th className="text-left py-2.5 px-3">Severity</th>
                <th className="text-left py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {MOCK_ANOMALIES.map((a) => (
                <tr
                  key={a.id}
                  className={clsx(
                    'hover:bg-white/[0.02]',
                    a.severity === 'HIGH' && 'bg-rose-500/[0.02]'
                  )}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400">{a.id}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{a.type.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 px-3 text-slate-200 font-semibold">{a.supplierName}</td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-sm truncate" title={a.description}>
                    {a.description}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {format(new Date(a.detectedAt), 'MMM d, HH:mm')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    {a.valueUSD ? `$${(a.valueUSD / 1e6).toFixed(1)}M` : '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        a.severity === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : a.severity === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        a.status === 'OPEN'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : a.status === 'INVESTIGATING'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
