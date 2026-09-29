import React, { useState, useEffect } from 'react';
import { Leaf, ShieldCheck, Truck, Plane, Ship, AlertCircle } from 'lucide-react';
import { fetchSustainability } from '../services/sustainability';
import { MOCK_SUSTAINABILITY } from '../data/mockData';
import type { SustainabilityData } from '../types/agents';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

export default function SustainabilityPage() {
  const [s, setS] = useState<SustainabilityData>(MOCK_SUSTAINABILITY);

  useEffect(() => {
    fetchSustainability().then((data) => {
      if (data) setS(data);
    });
  }, []);

  const chartData = [
    { name: 'Baseline (Sea)', co2: s.currentRouteCO2Tons, type: 'baseline' },
    ...s.strategies.map((str) => ({
      name: str.strategyName,
      co2: str.co2Tons,
      type: str.strategyId,
      mode: str.mode,
    })),
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              SCOPE-3 EMISSIONS & ESG GOVERNANCE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              TRANSPORT EMISSIONS VARIANCE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Sustainability & Carbon Trade-Offs
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Scope-3 Active Tracking
            </span>
          </h1>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Standard: <span className="text-slate-200">GHG Protocol Corporate Value Chain</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Baseline Maritime Route</span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{s.currentRouteCO2Tons} Tons CO2</div>
          <span className="text-xs text-slate-500 mt-1">Standard sea freight cycle</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d19] border border-rose-500/20 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-rose-300 uppercase">Peak Transport Variance</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {s.strategies[1].co2Tons} Tons (+{s.strategies[1].co2ChangePct}%)
          </div>
          <span className="text-xs text-slate-500 mt-1">Strategy B: Emergency Air Freight</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#080d19] border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-emerald-300 uppercase">Minimal Carbon Variance</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {s.strategies[2].co2Tons} Tons (+{s.strategies[2].co2ChangePct}%)
          </div>
          <span className="text-xs text-slate-500 mt-1">Strategy C: Customer Reallocation</span>
        </div>
      </div>

      {/* CO2 Chart */}
      <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            SCOPE-3 CARBON EMISSIONS BY RECOVERY PATHWAY
          </span>
          <span className="text-[10px] font-mono text-slate-500">TONS CO2 PER CYCLE</span>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${v}t`} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(8, 13, 25, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#e2e8f0',
              }}
              formatter={(v: any) => [`${v} Tons`, 'CO2']}
            />
            <ReferenceLine
              y={s.currentRouteCO2Tons}
              stroke="#38bdf8"
              strokeDasharray="4 4"
              label={{ value: 'Sea Baseline', fill: '#38bdf8', fontSize: 10, position: 'top' }}
            />
            <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.type === 'baseline'
                      ? '#38bdf8'
                      : entry.co2 > 500
                      ? '#f43f5e'
                      : entry.co2 > 200
                      ? '#f59e0b'
                      : '#34d399'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trade-off Breakdown Table */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
          Transport Mode Environmental & Speed Trade-Off Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                <th className="text-left py-2.5 px-3">Logistics Mode</th>
                <th className="text-left py-2.5 px-3">CO2 Output</th>
                <th className="text-left py-2.5 px-3">Variance vs Sea Baseline</th>
                <th className="text-left py-2.5 px-3">Transit Speed</th>
                <th className="text-left py-2.5 px-3">Cost Multiplier</th>
                <th className="text-left py-2.5 px-3">Governance Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {[
                {
                  mode: 'Standard Maritime (Port of Singapore)',
                  co2: '120t',
                  var: 'Baseline (0%)',
                  speed: '21–28 Days',
                  cost: '1.0x (Standard)',
                  status: 'DISRUPTED // BLOCKED',
                  color: 'text-rose-400',
                },
                {
                  mode: 'Emergency Air Freight (Penang to Frankfurt)',
                  co2: '528t',
                  var: '+340%',
                  speed: '2–3 Days',
                  cost: '3.8x (Expedited)',
                  status: 'FASTEST RECOVERY // ESG PENALTY',
                  color: 'text-amber-400',
                },
                {
                  mode: 'Alternate Supplier Road/Rail (Bangalore)',
                  co2: '134t',
                  var: '+12%',
                  speed: '14–18 Days',
                  cost: '1.2x (Controlled)',
                  status: 'BALANCED LONG-TERM ROUTE',
                  color: 'text-emerald-400',
                },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 text-slate-200 font-medium">{row.mode}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{row.co2}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{row.var}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{row.speed}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{row.cost}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-mono font-bold ${row.color}`}>
                      {row.status}
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
