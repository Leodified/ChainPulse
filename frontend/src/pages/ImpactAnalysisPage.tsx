import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Factory,
  Globe,
  Leaf,
  Layers,
  Package,
  Radio,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { WhyModal, WhyDetails } from '../components/ui/WhyModal';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import { StatusBeacon, LiveTelemetryBadge, DataCascade, SignalStream } from '../components/motion';
import { ImpactCascadeGraph } from '../components/impact/ImpactCascadeGraph';
import { traceImpact } from '../services/impact';
import { fetchDisruptionById } from '../services/disruptions';
import {
  MOCK_IMPACT_TRACE,
  MOCK_DISRUPTIONS,
  MOCK_MATERIAL_SHORTAGES,
  MOCK_SUPPLIERS,
  MOCK_FACTORIES,
  MOCK_ORDERS,
  MOCK_FINANCIAL_SUMMARY,
  MOCK_SUSTAINABILITY,
} from '../data/mockData';
import type { ImpactTraceResult, DisruptionEvent } from '../types/disruptions';

const TRACE_NODE_COLORS: Record<string, string> = {
  DISRUPTION: '#f43f5e',
  FREIGHT_HUB: '#f43f5e',
  SUPPLIER: '#f59e0b',
  PRODUCT: '#38bdf8',
  FACTORY: '#f59e0b',
  CUSTOMER: '#a78bfa',
};

type TabId = 'operational' | 'financial' | 'sustainability' | 'orders';


export default function ImpactAnalysisPage() {
  const { disruptionId } = useParams<{ disruptionId?: string }>();
  const activeDisruptionId = disruptionId || 'DISR-SG-2026-001';
  const navigate = useNavigate();
  const [tracing, setTracing] = useState(false);
  const [traced, setTraced] = useState(false);
  const [visibleNodes, setVisibleNodes] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<TabId>('operational');
  const [whyDetails, setWhyDetails] = useState<WhyDetails | null>(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  const [disruption, setDisruption] = useState<DisruptionEvent>(
    MOCK_DISRUPTIONS.find((d) => d.id === activeDisruptionId) ?? MOCK_DISRUPTIONS[0]
  );
  const [trace, setTrace] = useState<ImpactTraceResult>(MOCK_IMPACT_TRACE);

  useEffect(() => {
    fetchDisruptionById(activeDisruptionId).then((d) => {
      if (d) setDisruption(d);
    });
    handleTrace();
  }, [activeDisruptionId]);

  async function handleTrace() {
    setTracing(true);
    setVisibleNodes(0);
    try {
      const traceResult = await traceImpact(activeDisruptionId);
      setTrace(traceResult);
      setTraced(true);
      const totalNodes = traceResult.nodes?.length || traceResult.criticalPath?.length || 6;
      for (let i = 1; i <= totalNodes; i++) {
        await new Promise((r) => setTimeout(r, 160));
        setVisibleNodes(i);
      }
    } finally {
      setTracing(false);
    }
  }

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'operational', label: 'Operational Impact', icon: <Factory size={13} /> },
    { id: 'financial', label: 'Financial Exposure', icon: <DollarSign size={13} /> },
    { id: 'sustainability', label: 'Scope-3 / ESG', icon: <Leaf size={13} /> },
    { id: 'orders', label: 'Exposed Orders', icon: <Package size={13} /> },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              DOWNSTREAM PROPAGATION ANALYSIS
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">CAUSALITY DOSSIER</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Multi-Tier Impact Investigation
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="critical" size="sm" />
              DISR-SG-2026-001
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <LiveTelemetryBadge label="CONSEQUENCE ENGINE" statusText="ACTIVE SOLVER" variant="ai" />
          <button
            onClick={handleTrace}
            disabled={tracing}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.3)] flex-shrink-0 cursor-pointer"
          >
            {tracing ? <LoadingSpinner size="sm" /> : <Activity size={14} />}
            <span>{tracing ? 'Tracing Network...' : 'Re-Execute Trace'}</span>
          </button>
        </div>
      </div>

      {/* Incident + Key Exposure Strip */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                CRITICAL DISRUPTION
              </span>
              <span className="text-sm font-bold text-slate-100">{disruption.title}</span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Detected: {format(new Date(disruption.detectedAt), 'MMM d, yyyy HH:mm')} · Source: Maritime Port Authority Singapore & Lloyds List AIS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono flex-wrap lg:flex-nowrap border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-3 lg:pt-0 lg:pl-5">
          <div className="text-left lg:text-right">
            <span className="text-slate-500 block text-[9px] uppercase">Throughput Loss</span>
            <span className="text-rose-400 font-bold">-65% (35% Cap)</span>
          </div>
          <div className="text-left lg:text-right">
            <span className="text-slate-500 block text-[9px] uppercase">Queue Delay</span>
            <span className="text-slate-200 font-bold">847 Vessels · 8–12d</span>
          </div>
          <div className="text-left lg:text-right bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
            <span className="text-slate-400 block text-[9px] uppercase">Maximum Exposure</span>
            <span className="text-rose-400 font-black text-sm">$28.3M USD</span>
          </div>
        </div>
      </div>

      {/* Impact Cascade Graph: Interactive Multi-Tier Causal Accumulation Engine */}
      {traced && (
        <ImpactCascadeGraph />
      )}

      {/* 4 Core Quantitative Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Inventory Depletion</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1">
            <AnimatedNumber value={45} suffix="% Remaining" durationMs={600} />
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">7-Day safety buffer forecast</span>
        </div>
        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Production Utilization</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1">
            <AnimatedNumber value={70} suffix="% Operational" durationMs={600} />
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">Frankfurt Assembly Hub</span>
        </div>
        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Exposed Customer Orders</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1">
            <AnimatedNumber value={22} suffix=" Orders" durationMs={600} />
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5">$28.3M maximum financial risk</span>
        </div>
        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated Recovery Window</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1">8–18 Days</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Dependent on strategic intervention</span>
        </div>
      </div>


      {/* Visual Causal Investigation Breadcrumb */}
      <div className="p-3 rounded-xl bg-[#080d19] border border-white/[0.06] flex items-center justify-between overflow-x-auto text-xs font-mono">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-slate-400 font-semibold uppercase text-[10px]">INVESTIGATION CAUSALITY:</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-bold">01. CAUSE (PORT)</span>
          <ArrowRight size={11} className="text-slate-600" />
          <button
            onClick={() => setActiveTab('operational')}
            className={clsx(
              'px-2 py-0.5 rounded cursor-pointer transition-colors',
              activeTab === 'operational'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            02. OPERATIONAL IMPACT
          </button>
          <ArrowRight size={11} className="text-slate-600" />
          <button
            onClick={() => setActiveTab('financial')}
            className={clsx(
              'px-2 py-0.5 rounded cursor-pointer transition-colors',
              activeTab === 'financial'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            03. FINANCIAL IMPACT
          </button>
          <ArrowRight size={11} className="text-slate-600" />
          <button
            onClick={() => setActiveTab('orders')}
            className={clsx(
              'px-2 py-0.5 rounded cursor-pointer transition-colors',
              activeTab === 'orders'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            04. CUSTOMER ORDERS
          </button>
          <ArrowRight size={11} className="text-slate-600" />
          <button
            onClick={() => setActiveTab('sustainability')}
            className={clsx(
              'px-2 py-0.5 rounded cursor-pointer transition-colors',
              activeTab === 'sustainability'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            05. SUSTAINABILITY (ESG)
          </button>
        </div>
      </div>

      {/* Narrative Investigation Tab Switcher */}
      <div className="flex gap-1 bg-[#080d19] border border-white/[0.06] rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all',
              activeTab === tab.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Operational Impact */}
      {activeTab === 'operational' && (
        <div className="space-y-5 animate-fade-in">
          {/* Supplier Impact */}
          <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Supplier Exposure & Lead-Time Variance
              </h3>
              <span className="text-[10px] font-mono text-slate-500">TIER 1 & 2 VENDORS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                    <th className="text-left py-2.5 px-3">Supplier Name</th>
                    <th className="text-left py-2.5 px-3">Tier</th>
                    <th className="text-left py-2.5 px-3">Status</th>
                    <th className="text-left py-2.5 px-3">Materials Affected</th>
                    <th className="text-left py-2.5 px-3">Lead Time</th>
                    <th className="text-left py-2.5 px-3">Reliability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {MOCK_SUPPLIERS.slice(0, 4).map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{s.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">Tier {s.tier}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                            s.status === 'DISRUPTED'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : s.status === 'AT_RISK'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{s.materials.slice(0, 2).join(', ')}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{s.leadTimeDays}d</td>
                      <td className="py-2.5 px-3 font-mono text-sky-400">{s.reliabilityScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Material Shortages */}
          <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Bill of Materials (BOM) Depletion Tracker
              </h3>
              <span className="text-[10px] font-mono text-slate-500">DAYS OF SUPPLY</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                    <th className="text-left py-2.5 px-3">Material BOM</th>
                    <th className="text-left py-2.5 px-3">Current Stock</th>
                    <th className="text-left py-2.5 px-3">Critical Threshold</th>
                    <th className="text-left py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {MOCK_MATERIAL_SHORTAGES.map((m) => (
                    <tr key={m.material} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-slate-200 font-medium">{m.material}</td>
                      <td className="py-2.5 px-3 font-mono text-rose-300 font-bold">{m.currentStockDays} Days</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{m.criticalThreshold} Days</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                            m.status === 'CRITICAL'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Financial Exposure */}
      {activeTab === 'financial' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Revenue at Risk</span>
              <span className="text-2xl font-bold font-mono text-rose-400 block mt-1">$28.3M</span>
            </div>
            <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Working Capital Pressure</span>
              <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">$4.2M</span>
            </div>
            <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Min Recovery Cost</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">$0.4M</span>
            </div>
            <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06]">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Max Expedited Cost</span>
              <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">$3.8M</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Financial Exposure Distributed by Customer Tier
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={MOCK_FINANCIAL_SUMMARY.exposureByCustomerTier}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
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
                  {MOCK_FINANCIAL_SUMMARY.exposureByCustomerTier.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#f43f5e' : i === 1 ? '#f59e0b' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Scope-3 / ESG */}
      {activeTab === 'sustainability' && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Scope-3 Carbon Emissions by Recovery Pathway
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                BASELINE: {MOCK_SUSTAINABILITY.currentRouteCO2Tons} TONS (SEA FREIGHT)
              </span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={[
                  { name: 'Baseline (Sea)', co2: MOCK_SUSTAINABILITY.currentRouteCO2Tons },
                  ...MOCK_SUSTAINABILITY.strategies.map((s) => ({ name: s.strategyName, co2: s.co2Tons })),
                ]}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}t`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(8, 13, 25, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#e2e8f0',
                  }}
                  formatter={(v: any) => [`${v} Tons`, 'CO2']}
                />
                <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
                  {[null, ...MOCK_SUSTAINABILITY.strategies].map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#38bdf8' : i === 1 ? '#f59e0b' : i === 2 ? '#f43f5e' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 4: Order Exposure */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Exposed Customer Purchase Orders
            </h3>
            <span className="text-[10px] font-mono text-rose-400 font-bold">{MOCK_ORDERS.length} ORDERS AT RISK</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="font-mono text-slate-400 border-b border-white/[0.04]">
                  <th className="text-left py-2.5 px-3">Order ID</th>
                  <th className="text-left py-2.5 px-3">Enterprise Client</th>
                  <th className="text-left py-2.5 px-3">Product</th>
                  <th className="text-left py-2.5 px-3">Units</th>
                  <th className="text-left py-2.5 px-3">Total Value</th>
                  <th className="text-left py-2.5 px-3">Due Date</th>
                  <th className="text-left py-2.5 px-3">Status</th>
                  <th className="text-left py-2.5 px-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {MOCK_ORDERS.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{o.id}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{o.productName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{o.quantity.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-rose-300 font-bold">${(o.valueUSD / 1e6).toFixed(1)}M</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{format(new Date(o.dueDateISO), 'MMM d')}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] font-mono font-bold ${
                          o.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {o.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct Flow CTA to Simulations */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/20 via-[#080d19] to-indigo-950/20 border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Ready to Model Future Scenarios?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Advance to the Simulation Laboratory to model 7, 30, and 60-day horizon trajectories.
          </p>
        </div>
        <button
          onClick={() => navigate('/simulations')}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] flex-shrink-0"
        >
          <span>Run Simulation Laboratory</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Decision Provenance & Explainability Modal */}
      <WhyModal
        isOpen={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        details={whyDetails}
      />
    </div>
  );
}

