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
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { fetchDisruptions } from '../services/disruptions';
import { MOCK_DISRUPTIONS } from '../data/mockData';
import type { DisruptionEvent } from '../types/disruptions';

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
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              EXTERNAL EVENT INGESTION MATRIX
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">INCIDENT FEED</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            Global Disruption Events
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {filtered.length} Monitored
            </span>
          </h1>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search port, supplier, region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080d19] border border-white/[0.08] focus:border-sky-400/60 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Primary Featured Event: Singapore Port MPA Congestion */}
      {featured && (
        <div className="relative rounded-2xl bg-gradient-to-r from-rose-950/20 via-[#090f1d] to-[#060a14] border border-rose-500/40 p-6 shadow-[0_12px_40px_rgba(244,63,94,0.12)] space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-rose-300 font-bold">
                CRITICAL ACTIVE DISRUPTION // PRIMARY HACKATHON BENCHMARK
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {featured.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                {categoryLabel(featured.category)}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-xl font-bold text-slate-100">{featured.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{featured.description}</p>
              <div className="flex items-center gap-5 text-xs font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-rose-400" />
                  {featured.location.city}, {featured.location.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500" />
                  {format(new Date(featured.detectedAt), 'MMM d, yyyy HH:mm')}
                </span>
                <span className="text-rose-400 font-bold">$28.3M Maximum Exposure</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/impact/${featured.id}`)}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex-shrink-0"
              >
                <span>Trace Impact Flow</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-slate-500 uppercase mr-1">Severity:</span>
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityFilter[]).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverity(sev)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all',
              severity === sev
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                : 'bg-[#080d19] border border-white/[0.06] text-slate-400 hover:text-slate-200'
            )}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Disruption Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered
          .filter((d) => d.id !== 'DISR-SG-2026-001')
          .map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-2xl bg-[#080d19] border border-white/[0.06] hover:border-white/15 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${severityBadge(d.severity)}`}>
                      {d.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {categoryLabel(d.category)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{d.status}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-200 leading-snug">{d.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{d.description}</p>
              </div>

              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  {d.location.city}, {d.location.country}
                </span>
                <button
                  onClick={() => navigate(`/impact/${d.id}`)}
                  className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
                >
                  <span>Trace</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
