import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Filter,
  Globe,
  MapPin,
  Radio,
  Search,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { fetchDisruptions } from '../services/disruptions';
import { MOCK_DISRUPTIONS } from '../data/mockData';
import type { DisruptionEvent } from '../types/disruptions';
import {
  StatusBeacon,
  MetricCounter,
  LiveTelemetryBadge,
  DataCascade,
  SignalStream,
} from '../components/motion';
import { IncidentPropagationConsole } from '../components/disruptions/IncidentPropagationConsole';

type SeverityFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type CategoryFilter =
  | 'ALL'
  | 'PORT_DISRUPTION'
  | 'WEATHER'
  | 'GEOPOLITICAL'
  | 'SUPPLIER_FAILURE'
  | 'NATURAL_DISASTER';

function severityBadge(s: string) {
  if (s === 'CRITICAL' || s === 'HIGH') return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  if (s === 'MEDIUM') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
}

function categoryLabel(c: string) {
  const m: Record<string, string> = {
    PORT_DISRUPTION: 'Port Maritime',
    WEATHER: 'Weather Event',
    GEOPOLITICAL: 'Geopolitical Risk',
    SUPPLIER_FAILURE: 'Supplier Failure',
    NATURAL_DISASTER: 'Natural Disaster',
    LOGISTICS: 'Logistics Corridor',
  };
  return m[c] ?? c;
}

export default function DisruptionsPage() {
  const navigate = useNavigate();
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>(MOCK_DISRUPTIONS);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<SeverityFilter>('ALL');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('DISR-SG-2026-001');

  useEffect(() => {
    fetchDisruptions().then((data) => {
      if (data?.length) setDisruptions(data);
    });
  }, []);

  const filtered = disruptions.filter((d) => {
    if (severity !== 'ALL' && d.severity !== severity) return false;
    if (category !== 'ALL' && d.category !== category) return false;
    if (
      search &&
      !d.title.toLowerCase().includes(search.toLowerCase()) &&
      !(d.location?.city || '').toLowerCase().includes(search.toLowerCase()) &&
      !(d.location?.country || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const featured = disruptions.find((d) => d.id === 'DISR-SG-2026-001') || disruptions[0];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] w-full mx-auto animate-fade-in min-w-0">
      {/* Top Header & Incident Telemetry */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              EXTERNAL EVENT INGESTION MATRIX
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">LIVE INCIDENT STREAM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3 mt-1">
            Global Disruption Incidents
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="critical" size="sm" />
              1 Critical Active
            </span>
          </h1>
        </div>

        {/* Global Incident Telemetry Strip */}
        <div className="flex items-center gap-3 flex-wrap">
          <LiveTelemetryBadge label="AIS RADAR" statusText="SWEEP ACTIVE" variant="info" />
          <LiveTelemetryBadge label="S/4HANA SYNC" statusText="VERIFIED" variant="success" />
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search port, supplier, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#080d19] border border-white/[0.08] focus:border-sky-400/60 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Primary Featured Event: Singapore Port MPA Congestion (Command Console Hero) */}
      {featured && (
        <div className="relative rounded-2xl bg-gradient-to-r from-rose-950/25 via-[#090f1d] to-[#060a14] border border-rose-500/40 p-5 sm:p-6 shadow-[0_12px_40px_rgba(244,63,94,0.15)] space-y-5 overflow-hidden">
          {/* Subtle Ambient Scanline */}
          <div className="absolute inset-0 cp-telemetry-grid opacity-20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <StatusBeacon variant="critical" size="md" />
              <span className="text-xs font-mono uppercase tracking-widest text-rose-300 font-bold">
                CRITICAL ACTIVE DISRUPTION // PRIMARY HACKATHON BENCHMARK
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {featured.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                {categoryLabel(featured.category)}
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                DISR-SG-2026-001
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                {featured.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {featured.description}
              </p>

              <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-rose-400 shrink-0" />
                  <span>{featured.location.city}, {featured.location.country} (1.2644° N, 103.8185° E)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500 shrink-0" />
                  <span>{format(new Date(featured.detectedAt), 'MMM d, yyyy HH:mm')} SGT</span>
                </span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span>Exposure:</span>
                  <MetricCounter value={28.3} prefix="$" suffix="M MAX" decimals={1} />
                </span>
              </div>
            </div>

            {/* Action CTA & Fast Vector Triggers */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => navigate(`/impact/${featured.id}`)}
                className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_24px_rgba(244,63,94,0.45)] hover:scale-[1.02] cursor-pointer"
              >
                <span>[ TRACE IMPACT FLOW ]</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/supply-chain')}
                className="px-4 py-3 rounded-xl bg-[#091224] hover:bg-white/[0.08] border border-white/10 text-slate-200 font-mono text-xs transition-colors cursor-pointer"
              >
                View on Map
              </button>
            </div>
          </div>

          {/* Live Incident Command Console: Active Causal Propagation Pipeline */}
          <div className="relative z-10 pt-2 border-t border-white/[0.08]">
            <IncidentPropagationConsole onTraceImpact={() => navigate(`/impact/${featured.id}`)} />
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 min-w-0">
        <span className="text-xs font-mono text-slate-500 uppercase mr-1 shrink-0">Severity:</span>
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityFilter[]).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverity(sev)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0',
              severity === sev
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'bg-[#080d19] border border-white/[0.06] text-slate-400 hover:text-slate-200'
            )}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Disruption Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered
          .filter((d) => d.id !== 'DISR-SG-2026-001')
          .map((d) => {
            const isExpanded = expandedId === d.id;
            const isCritical = d.severity === 'CRITICAL' || d.severity === 'HIGH';

            return (
              <div
                key={d.id}
                className={`p-5 rounded-2xl bg-[#080d19] border transition-all space-y-3 flex flex-col justify-between ${
                  isCritical
                    ? 'border-amber-500/30 hover:border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.06)]'
                    : 'border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${severityBadge(
                          d.severity
                        )}`}
                      >
                        {d.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {categoryLabel(d.category)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <StatusBeacon
                        variant={isCritical ? 'warning' : 'neutral'}
                        size="sm"
                        ping={isCritical}
                      />
                      <span>{d.status}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 leading-snug">{d.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>

                  {/* Expandable Entity Breakdown */}
                  {isExpanded && (
                    <div className="p-3 rounded-xl bg-[#060a14] border border-white/[0.06] text-xs font-mono space-y-1.5 animate-fade-in">
                      <div className="flex justify-between text-slate-400">
                        <span>Incident Radius:</span>
                        <span className="text-slate-200 font-semibold">{d.affectedRadiusKm ?? (d.severity === 'CRITICAL' ? 500 : d.severity === 'HIGH' ? 250 : 100)} km</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Confidence Score:</span>
                        <span className="text-emerald-400 font-semibold">{Math.round((d.confidenceScore ?? 0.94) * 100)}% Verified</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Estimated Duration:</span>
                        <span className="text-amber-400 font-semibold">{d.estimatedDurationDays ?? (d.severity === 'HIGH' ? 21 : 14)} Days</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : d.id)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Inspect Telemetry'}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <button
                    onClick={() => navigate(`/impact/${d.id}`)}
                    className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Trace Vector</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
