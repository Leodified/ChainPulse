import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  Scale,
  ShieldAlert,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { fetchFinancialSummary } from '../services/financial';
import { MOCK_FINANCIAL_SUMMARY } from '../data/mockData';
import type { FinancialSummary } from '../types/agents';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { StatusBeacon, LiveTelemetryBadge, MetricCounter } from '../components/motion';
import { FinancialExposureFlow } from '../components/financial/FinancialExposureFlow';

export default function FinancialImpactPage() {
  const [f, setF] = useState<FinancialSummary>(MOCK_FINANCIAL_SUMMARY);

  useEffect(() => {
    fetchFinancialSummary().then((data) => {
      if (data) setF(data);
    });
  }, []);

  const kpis = [
    {
      label: 'Revenue Exposure',
      value: `$${(f.revenueExposureUSD / 1e6).toFixed(1)}M`,
      sub: '60-day maximum horizon',
      color: 'text-rose-400',
    },
    {
      label: 'Working Capital Impact',
      value: `$${(f.workingCapitalImpactUSD / 1e6).toFixed(1)}M`,
      sub: 'Buffer inventory burn',
      color: 'text-amber-400',
    },
    {
      label: 'Min Recovery Cost',
      value: `$${(f.recoveryCostRangeMin / 1e6).toFixed(1)}M`,
      sub: 'Reallocation handling',
      color: 'text-emerald-400',
    },
    {
      label: 'Max Expedited Cost',
      value: `$${(f.recoveryCostRangeMax / 1e6).toFixed(1)}M`,
      sub: 'Emergency Air Freight',
      color: 'text-amber-400',
    },
  ];

  const displayDaily = f.dailyExposure.filter((_, i) => i % 5 === 0).slice(0, 12);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] w-full mx-auto animate-fade-in min-w-0">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
              EXECUTIVE TREASURY & EXPOSURE ANALYTICS
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">P&L RISK MATRIX</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3 mt-1">
            Financial Impact Quantification
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="critical" size="sm" />
              $28.3M Maximum Exposure
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <LiveTelemetryBadge label="TREASURY TERMINAL" statusText="S/4HANA LEDGER SYNC" variant="info" />
          <div className="text-xs font-mono text-slate-400">
            Audit Model: <span className="text-slate-200">SAP S/4HANA FI/CO Ledger</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Strip with MetricCounter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#080d19] border border-rose-500/20 flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Revenue Exposure
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            <MetricCounter value={f.revenueExposureUSD / 1e6} prefix="$" suffix="M" decimals={1} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">60-day maximum horizon</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d19] border border-amber-500/20 flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Working Capital Impact
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            <MetricCounter value={f.workingCapitalImpactUSD / 1e6} prefix="$" suffix="M" decimals={1} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Buffer inventory burn</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d19] border border-emerald-500/20 flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Min Recovery Cost
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            <MetricCounter value={f.recoveryCostRangeMin / 1e6} prefix="$" suffix="M" decimals={1} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Reallocation handling</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d19] border border-amber-500/20 flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Max Expedited Cost
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            <MetricCounter value={f.recoveryCostRangeMax / 1e6} prefix="$" suffix="M" decimals={1} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">Emergency Air Freight</span>
        </div>
      </div>

      {/* Financial Exposure Flow: Deterministic Balance Sheet Accumulation */}
      <FinancialExposureFlow />

      {/* Charts Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              EXPOSURE BY CUSTOMER ACCOUNT TIER
            </span>
            <span className="text-[10px] font-mono text-slate-500">MILLIONS USD</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={f.exposureByCustomerTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
              <XAxis dataKey="tier" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8, 13, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
                formatter={(v: any) => [`$${(Number(v || 0) / 1e6).toFixed(1)}M`, 'Exposure']}
              />
              <Bar dataKey="exposureUSD" radius={[4, 4, 0, 0]}>
                {f.exposureByCustomerTier.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#f43f5e' : i === 1 ? '#f59e0b' : '#38bdf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              CUMULATIVE EXPOSURE OVER TIME
            </span>
            <span className="text-[10px] font-mono text-slate-500">30-DAY DAILY TRAJECTORY</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={displayDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8, 13, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
              />
              <Line type="monotone" dataKey="exposureUSD" stroke="#f43f5e" strokeWidth={2} dot={false} name="Daily Exposure" />
              <Line type="monotone" dataKey="cumulativeUSD" stroke="#f59e0b" strokeWidth={2} dot={false} name="Cumulative" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Working Capital Balance Sheet Exposure */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
          Working Capital Exposure Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                <th className="text-left py-2.5 px-3">Balance Sheet Line Item</th>
                <th className="text-left py-2.5 px-3">Impact ($M)</th>
                <th className="text-left py-2.5 px-3">Timeline</th>
                <th className="text-left py-2.5 px-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {[
                { item: 'Revenue at Risk (Tier-1 Accounts)', impact: 24.0, timeline: 'Oct–Nov 2026', risk: 'HIGH' },
                { item: 'Revenue at Risk (Tier-2/3 Accounts)', impact: 4.3, timeline: 'Oct–Dec 2026', risk: 'MEDIUM' },
                { item: 'Expedited Inbound Freight Allocation', impact: 3.8, timeline: 'Immediate (T+24h)', risk: 'CONTROLLED' },
                { item: 'Safety Buffer Depletion Working Capital', impact: 4.2, timeline: '30-Day Run-rate', risk: 'HIGH' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 text-slate-200 font-medium">{row.item}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">${row.impact.toFixed(1)}M</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{row.timeline}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        row.risk === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : row.risk === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      }`}
                    >
                      {row.risk}
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
