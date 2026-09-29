import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Cpu,
  Flame,
  Layers,
  LineChart as LineChartIcon,
  Radio,
  Sliders,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
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
  Legend,
} from 'recharts';
import { fetchScenarios } from '../services/simulations';
import { MOCK_SCENARIOS } from '../data/mockData';
import { WhyModal, WhyDetails } from '../components/ui/WhyModal';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { StatusBeacon, LiveTelemetryBadge, ComputationSequence } from '../components/motion';
import type { ScenarioDuration, Scenario } from '../types/simulations';

const RISK_BADGE: Record<string, string> = {
  CRITICAL: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  HIGH: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export default function SimulationsPage() {
  const navigate = useNavigate();
  const { disruptionId } = useParams<{ disruptionId?: string }>();
  const activeDisruptionId = disruptionId || 'DISR-SG-2026-001';
  const [scenarios, setScenarios] = useState<Scenario[]>(MOCK_SCENARIOS);
  const [activeDuration, setActiveDuration] = useState<ScenarioDuration>('7D');
  const [isSimulating, setIsSimulating] = useState(false);
  const [whyDetails, setWhyDetails] = useState<WhyDetails | null>(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  useEffect(() => {
    fetchScenarios(activeDisruptionId).then((data) => {
      if (data?.length) setScenarios(data);
    });
  }, [activeDisruptionId]);

  function handleSelectHorizon(dur: ScenarioDuration) {
    if (dur === activeDuration) return;
    setIsSimulating(true);
    setActiveDuration(dur);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1000);
  }

  const TABS: { duration: ScenarioDuration; label: string; desc: string }[] = [
    { duration: '7D', label: '7-Day Horizon', desc: 'Immediate Buffer Run-out' },
    { duration: '30D', label: '30-Day Horizon', desc: 'Safety Stock Breach' },
    { duration: '60D', label: '60-Day Horizon', desc: 'Residual Unmitigated Backlog' },
  ];

  const scenario =
    scenarios.find((sc) => sc.duration === activeDuration) ?? scenarios[0] ?? MOCK_SCENARIOS[0];
  const s = scenario.summary;

  const chartData = (scenario.snapshots || []).map((snap) => {
    const inv = Number(snap.inventoryPct ?? (snap as any).inventory_level_percent ?? 0);
    const cap = Number(snap.productionCapacityPct ?? (snap as any).production_capacity_percent ?? 0);
    const exp = Number(snap.financialExposureUSD ?? (snap as any).financial_exposure_usd ?? 0);
    return {
      day: `D${snap.day}`,
      inventory: Math.round(inv),
      capacity: Math.round(cap),
      exposure: +(exp / 1e6).toFixed(2),
    };
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] w-full mx-auto animate-fade-in min-w-0">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              PREDICTIVE SCENARIO LABORATORY
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              MONTE CARLO TRAJECTORY ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3 mt-1">
            Impact Trajectory Simulations
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="info" size="sm" />
              Singapore Port Baseline
            </span>
          </h1>
        </div>

        {/* Transient Computing Status & Telemetry */}
        <div className="flex items-center gap-3 flex-wrap">
          <LiveTelemetryBadge label="STOCHASTIC ENGINE" statusText="10,000 ITERATIONS" variant="ai" />
          <LiveTelemetryBadge
            label="STATUS"
            statusText={isSimulating ? 'COMPUTING...' : 'CONVERGED'}
            variant={isSimulating ? 'warning' : 'success'}
          />
        </div>
      </div>

      {/* 🧪 FUTURE STATE SIMULATOR: Interactive Timeline Rail */}
      <div className="rounded-2xl bg-[#080d19] border border-cyan-500/30 p-5 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
              FUTURE STATE SIMULATOR
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-300 font-mono">
              Deterministic Temporal Trajectory & Counterfactual Engine
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MODEL: SINGAPORE PORT BUFFER BREAKDOWN</span>
          </div>
        </div>

        {/* Active Computation Progression Banner */}
        {isSimulating && (
          <ComputationSequence
            isRunning={isSimulating}
            title="Monte Carlo Trajectory Engine"
            durationMs={950}
          />
        )}

        {/* Timeline Horizon Nodes: TODAY ────► 7D ────► 30D ────► 60D */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-white/5 bg-black/20 text-left opacity-75">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 font-bold">TODAY (T+0)</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                NORMAL
              </span>
            </div>
            <div className="text-base font-bold font-mono text-slate-200 mt-1">100% Buffer</div>
            <div className="text-[10px] text-slate-500 mt-0.5">0 Exposed Orders · $0M Impact</div>
          </div>

          <button
            onClick={() => handleSelectHorizon('7D')}
            className={`p-3.5 rounded-xl border transition-all text-left ${
              activeDuration === '7D'
                ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] -translate-y-0.5'
                : 'bg-[#080d19] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-400 font-bold">DAY 7 (T+7)</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                WARNING
              </span>
            </div>
            <div className="text-base font-bold font-mono text-amber-300 mt-1">45% Buffer</div>
            <div className="text-[10px] text-slate-400 mt-0.5">8 Orders at Risk · $4.2M Exposure</div>
          </button>

          <button
            onClick={() => handleSelectHorizon('30D')}
            className={`p-3.5 rounded-xl border transition-all text-left ${
              activeDuration === '30D'
                ? 'bg-rose-500/15 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)] -translate-y-0.5'
                : 'bg-[#080d19] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-rose-400 font-bold">DAY 30 (T+30)</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                CRITICAL
              </span>
            </div>
            <div className="text-base font-bold font-mono text-rose-300 mt-1">18% Buffer</div>
            <div className="text-[10px] text-slate-400 mt-0.5">22 Orders at Risk · $18.7M Exposure</div>
          </button>

          <button
            onClick={() => handleSelectHorizon('60D')}
            className={`p-3.5 rounded-xl border transition-all text-left ${
              activeDuration === '60D'
                ? 'bg-rose-950/40 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] -translate-y-0.5'
                : 'bg-[#080d19] border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-rose-400 font-black">DAY 60 (T+60)</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold">
                MAX EXPOSURE
              </span>
            </div>
            <div className="text-base font-bold font-mono text-rose-400 mt-1">5% Buffer</div>
            <div className="text-[10px] text-rose-300 mt-0.5">22 Orders Exposed · $28.3M MAX</div>
          </button>
        </div>
      </div>

      {/* Scenario Assumptions Banner */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              {scenario.label} PARAMETERS & MODELED ASSUMPTIONS
            </span>
            {activeDuration === '60D' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                Cumulative / Residual Backlog under Modeled Horizon
              </span>
            )}
          </div>
          <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded border font-bold uppercase ${RISK_BADGE[scenario.riskLevel]}`}>
            {scenario.riskLevel} RISK PROFILE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {scenario.assumptions.map((a, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] text-xs text-slate-300 flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Modeled State Telemetry Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Min Inventory Level
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            <AnimatedNumber value={s.peakInventoryRisk} suffix="%" durationMs={500} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {activeDuration === '7D'
              ? 'Buffer depleted (45%)'
              : activeDuration === '30D'
              ? 'Safety stock breached (18%)'
              : 'Critical stockout (5%)'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Min Production Capacity
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            <AnimatedNumber value={s.minProductionCapacity} suffix="%" durationMs={500} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {activeDuration === '7D'
              ? '70% operational'
              : activeDuration === '30D'
              ? '45% operational'
              : '20% operational'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {activeDuration === '7D'
              ? 'Orders Due Within 7 Days'
              : activeDuration === '30D'
              ? 'Orders Exposed at 30 Days'
              : 'Orders in 60-Day Unmitigated Backlog'}
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            <AnimatedNumber value={s.totalOrdersAtRisk} durationMs={500} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {activeDuration === '7D'
              ? '8 immediate buffer orders'
              : activeDuration === '30D'
              ? '22 critical exposed orders'
              : '25 total exposed orders'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#080d19] border border-white/[0.06] flex flex-col justify-between cp-card-interactive">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {activeDuration === '60D'
              ? 'Residual Financial Exposure'
              : 'Financial Exposure (Horizon)'}
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            <AnimatedNumber value={+(s.totalFinancialExposureUSD / 1e6).toFixed(1)} prefix="$" suffix="M" decimals={1} durationMs={500} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1">
            {activeDuration === '7D'
              ? '$4.2M 7-day revenue risk'
              : activeDuration === '30D'
              ? '$18.7M direct / $28.3M total'
              : 'Residual exposure / backlog under modeled scenario'}
          </span>
        </div>
      </div>

      {/* Dual Trajectory Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              INVENTORY & PRODUCTION TRAJECTORY
            </span>
            <span className="text-[10px] font-mono text-slate-500">PERCENTAGE METRICS</span>
          </div>

          <ResponsiveContainer key={`resp-line-${activeDuration}`} width="100%" height={260}>
            <LineChart
              key={`line-${activeDuration}`}
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8, 13, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
                formatter={(v: any, name: any) => [`${v}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Line
                type="monotone"
                dataKey="inventory"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
                name="Inventory %"
              />
              <Line
                type="monotone"
                dataKey="capacity"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#38bdf8' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
                name="Production %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              FINANCIAL EXPOSURE OVER TIME
            </span>
            <span className="text-[10px] font-mono text-slate-500">MILLIONS USD</span>
          </div>

          <ResponsiveContainer key={`resp-bar-${activeDuration}`} width="100%" height={260}>
            <BarChart
              key={`bar-${activeDuration}`}
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(8, 13, 25, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
                formatter={(v: any) => [`$${v}M`, 'Exposure USD']}
              />
              <Bar
                dataKey="exposure"
                fill="#f43f5e"
                opacity={0.85}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                name="Exposure $M"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ⚖️ Visual Counterfactual: Without Mitigation vs With Recovery Strategy */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/20 via-[#070b16] to-emerald-950/20 border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              COUNTERFACTUAL IMPACT EVALUATION
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-cyan-400">
              Baseline Shock vs. Strategic Recovery Intervention
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              +$24.5M VALUE PRESERVED
            </span>
            <button
              onClick={() => {
                setWhyDetails({
                  title: 'Counterfactual Model Derivation',
                  metric: '+$24,500,000 USD Value Saved',
                  formula: 'Unmitigated Exposure ($28.3M) - Strategy B Implementation Cost ($3.8M) = $24.5M Net Protected Balance Sheet',
                  explanation: 'Without strategic intervention, production starvation on Day 7 cascades into SLA breach across 22 enterprise contracts. Emergency Air Freight Bridge caps losses at $3.8M, preserving customer contracts with zero delivery cancellations.',
                  parameters: [
                    { label: 'Unmitigated Loss', value: '$28,300,000 USD' },
                    { label: 'Air Bridge Cost', value: '$3,800,000 USD' },
                    { label: 'Fulfillment Rate', value: '100% (22/22 Orders)' },
                    { label: 'Uptime Restored', value: '96% Assembly Continuity' },
                  ],
                  sources: [
                    { name: 'SAP S/4HANA Sales & Distribution Order Commitments', type: 'ERP', verified: true },
                    { name: 'ChainPulse Monte Carlo Simulation Engine (10,000 runs)', type: 'SCENARIO_ENGINE', verified: true },
                  ],
                });
                setWhyModalOpen(true);
              }}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 p-1"
            >
              <HelpCircle size={12} />
              <span>WHY?</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Unmitigated Drift */}
          <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                WITHOUT MITIGATION (INERTIA DRIFT)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                UNMITIGATED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Factory Capacity</span>
                <span className="text-sm font-bold text-rose-400">20% Utilization</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Inventory State</span>
                <span className="text-sm font-bold text-rose-400">5% (Stockout)</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Customer Orders</span>
                <span className="text-sm font-bold text-rose-400">22 Orders Breached</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Financial Exposure</span>
                <span className="text-base font-black text-rose-400">$28.3M Loss</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Without active rerouting, the Frankfurt hub exhausts component buffer on Day 7. Full order book breach occurs by Day 45, triggering enterprise customer churn.
            </p>
          </div>

          {/* With Recovery Strategy */}
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                WITH RECOVERY STRATEGY (STRATEGY B AIR BRIDGE)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OPTIMIZED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Factory Capacity</span>
                <span className="text-sm font-bold text-emerald-400">96% Normalized</span>
                <span className="text-[9px] text-emerald-500/80 block">[ MODELED PROJECTION ]</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Recovery Lead-Time</span>
                <span className="text-sm font-bold text-emerald-400">8 Days Return</span>
                <span className="text-[9px] text-slate-500 block">[ CANONICAL TARGET ]</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Customer Fulfillment</span>
                <span className="text-sm font-bold text-emerald-400">100% (22/22 Saved)</span>
                <span className="text-[9px] text-emerald-500/80 block">[ MODELED PROJECTION ]</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Total Investment</span>
                <span className="text-base font-black text-emerald-400">$3.8M Capped</span>
                <span className="text-[9px] text-slate-500 block">[ CANONICAL COST ]</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Emergency air freight bridge delivers critical PCB assemblies in 8 days. Frankfurt line maintains continuity, saving a modeled <strong>$24.5M net revenue</strong> ($28.3M unmitigated exposure − $3.8M expediting cost) with zero Tier-1 SLA breach.
            </p>
            <div className="p-2 rounded bg-black/50 border border-white/5 text-[10px] font-mono text-slate-400 space-y-0.5">
              <span className="text-slate-500 uppercase block font-semibold">SCENARIO ASSUMPTIONS:</span>
              <span>1. Strategy B air charter clears Frankfurt CargoCity customs within 72h.</span>
              <span>2. Line B initiates dual-shift overtime to absorb backlog.</span>
              <span>3. Net protected value = $28.3M max exposure − $3.8M air bridge cost = $24.5M.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swarm Handoff CTA */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/20 via-[#080d19] to-indigo-950/20 border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Simulated Unmitigated Exposure: ${(s.totalFinancialExposureUSD / 1e6).toFixed(1)}M
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Engage the autonomous Multi-Agent Swarm to synthesize optimized recovery pathways.
          </p>
        </div>
        <button
          onClick={() => navigate('/agents')}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] flex-shrink-0"
        >
          <span>Engage Agent Swarm</span>
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
