import React, { useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert, Zap, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { clsx } from 'clsx';
import { MOCK_ANOMALIES } from '../data/mockData';
import { StatusBeacon, LiveTelemetryBadge, MetricCounter, SignalStream } from '../components/motion';

export default function TransactionAnomaliesPage() {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const openCount = MOCK_ANOMALIES.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] w-full mx-auto animate-fade-in min-w-0">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3 mt-1">
            Transaction Anomalies & Heuristics
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="critical" size="sm" />
              {openCount} Open Anomaly Signals
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <LiveTelemetryBadge label="ANOMALY ENGINE" statusText="STREAMING HEURISTICS" variant="warning" />
          <LiveTelemetryBadge label="ERP INGESTION" statusText="PO-EKKO ACTIVE" variant="info" />
          <div className="text-xs font-mono text-slate-400">
            Source: <span className="text-slate-200">SAP S/4HANA PO & Goods Receipt Stream</span>
          </div>
        </div>
      </div>

      {/* Realtime Waveform & Signal Ingestion Ticker */}
      <div className="p-3.5 rounded-2xl bg-[#070b16] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">Signal Intelligence Stream</span>
            <div className="text-xs font-bold font-mono text-slate-200">
              Correlated Against Disruption DISR-SG-2026-001 (Singapore Port)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SignalStream status="warning" speed="fast" label="PO STREAM" />
          <span className="text-xs font-mono text-slate-400">
            Latency: <span className="text-emerald-400 font-bold">120ms</span>
          </span>
        </div>
      </div>

      {/* Metric Cards with MetricCounter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Detected', value: MOCK_ANOMALIES.length, color: 'text-slate-100', sub: 'Correlated with Singapore congestion' },
          { label: 'High Severity', value: MOCK_ANOMALIES.filter((a) => a.severity === 'HIGH').length, color: 'text-rose-400', sub: 'Immediate PO variance' },
          { label: 'Open Investigations', value: openCount, color: 'text-amber-400', sub: 'Assigned to procurement audit' },
          { label: 'Under Active Audit', value: MOCK_ANOMALIES.filter((a) => a.status === 'INVESTIGATING').length, color: 'text-sky-400', sub: 'Carrier review underway' },
        ].map((k) => (
          <div
            key={k.label}
            className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between cp-card-interactive"
          >
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{k.label}</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${k.color}`}>
              <MetricCounter value={k.value} />
            </div>
            <span className="text-[11px] text-slate-500 mt-1">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Anomaly Log Table */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
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

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                <th className="text-left py-2.5 px-3">Status</th>
                <th className="text-left py-2.5 px-3">Anomaly ID</th>
                <th className="text-left py-2.5 px-3">Classification</th>
                <th className="text-left py-2.5 px-3">Entity</th>
                <th className="text-left py-2.5 px-3">Observed Discrepancy</th>
                <th className="text-left py-2.5 px-3">Timestamp</th>
                <th className="text-left py-2.5 px-3">Value</th>
                <th className="text-left py-2.5 px-3">Severity</th>
                <th className="text-right py-2.5 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {MOCK_ANOMALIES.map((a) => {
                const isSelected = selectedAnomalyId === a.id;
                const isHigh = a.severity === 'HIGH';

                return (
                  <React.Fragment key={a.id}>
                    <tr
                      onClick={() => setSelectedAnomalyId(isSelected ? null : a.id)}
                      className={clsx(
                        'hover:bg-white/[0.03] cursor-pointer transition-colors',
                        isHigh && 'bg-rose-500/[0.02]',
                        isSelected && 'bg-sky-500/[0.08]'
                      )}
                    >
                      <td className="py-2.5 px-3">
                        <StatusBeacon
                          variant={isHigh ? 'critical' : a.severity === 'MEDIUM' ? 'warning' : 'info'}
                          size="sm"
                          ping={isHigh}
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300 font-bold">{a.id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{a.type.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3 text-slate-200 font-semibold">{a.supplierName}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-sm truncate" title={a.description}>
                        {a.description}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {format(new Date(a.detectedAt), 'MMM d, HH:mm')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {a.valueUSD ? `$${(a.valueUSD / 1e6).toFixed(1)}M` : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                            isHigh
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : a.severity === 'MEDIUM'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          }`}
                        >
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-slate-400 text-xs inline-flex items-center gap-1 font-mono">
                          {isSelected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable Anomaly Detail Inspection Drawer */}
                    {isSelected && (
                      <tr className="bg-[#060a14] border-b border-white/[0.06]">
                        <td colSpan={9} className="p-4">
                          <div className="p-3.5 rounded-xl bg-[#091224] border border-white/[0.08] space-y-2 animate-fade-in font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-sky-400 font-bold uppercase">Heuristic Correlation Proof:</span>
                              <span className="text-slate-400">Detected: {format(new Date(a.detectedAt), 'yyyy-MM-dd HH:mm:ss')} UTC</span>
                            </div>
                            <p className="text-slate-300 font-sans text-xs">{a.description}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/[0.05] text-[11px]">
                              <div>
                                <span className="text-slate-500 block">Affected Vendor:</span>
                                <span className="text-slate-200">{a.supplierName}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Current Status:</span>
                                <span className="text-amber-400 font-bold">{a.status}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Associated Exposure:</span>
                                <span className="text-rose-400 font-bold">{a.valueUSD ? `$${(a.valueUSD / 1e6).toFixed(2)}M USD` : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
