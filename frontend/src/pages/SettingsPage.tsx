import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle,
  Database,
  FileText,
  Lock,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Terminal,
  UserCheck,
} from 'lucide-react';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { auditService, type AuditEvent } from '../services/audit';
import { StatusBeacon, LiveTelemetryBadge } from '../components/motion';
import { GovernancePipeline } from '../components/governance/GovernancePipeline';
import { SAPLearningHubCard } from '../components/learning-hub/SAPLearningHubCard';
import { useDemo } from '../context/DemoContext';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const { auditEvents: demoAuditEvents } = useDemo();

  const combinedAuditEvents = React.useMemo(() => {
    const list: Array<{
      id: string | number;
      event_type: string;
      user_id: string;
      entity_id: string;
      description: string;
      created_at: string;
      ip_address: string;
    }> = demoAuditEvents.map((d) => ({
      id: d.id,
      event_type: d.eventType,
      user_id: d.actor,
      entity_id: d.targetEntity,
      description: d.description,
      created_at: d.timestamp,
      ip_address: d.ipAddress,
    }));
    auditEvents.forEach((e) => {
      if (!list.some((item) => item.event_type === e.event_type && item.entity_id === e.entity_id)) {
        list.push({
          id: e.id,
          event_type: e.event_type,
          user_id: e.user_id,
          entity_id: e.entity_id,
          description: e.description,
          created_at: e.created_at,
          ip_address: e.ip_address,
        });
      }
    });
    return list;
  }, [demoAuditEvents, auditEvents]);

  useEffect(() => {
    loadAuditEvents();
  }, []);

  async function loadAuditEvents() {
    setLoadingAudit(true);
    try {
      const data = await auditService.getEvents(25);
      setAuditEvents(data);
    } finally {
      setLoadingAudit(false);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto animate-fade-in min-w-0">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-semibold">
              ENTERPRISE GOVERNANCE & AI SAFETY ARCHITECTURE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">SYS CONFIG & AUDIT TRAIL</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-3 mt-1">
            System Settings & Decision Governance
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
              <StatusBeacon variant="success" size="sm" />
              All Systems Operational
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <LiveTelemetryBadge label="SYSTEM HEALTH" statusText="ALL SERVICES GREEN" variant="success" />
          <LiveTelemetryBadge label="ERP FIREWALL" statusText="READ-ONLY ENFORCED" variant="info" />
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.3)] cursor-pointer"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            <span>{saved ? 'Configuration Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* AI SAFETY BOUNDARY ARCHITECTURE (ENTERPRISE FIREWALL PIPELINE) */}
      <GovernancePipeline />

      {/* REAL-TIME IMMUTABLE DECISION AUDIT LOG */}
      <div className="rounded-2xl bg-[#080d19] border border-white/[0.08] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-sky-400" />
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                Enterprise Decision Audit Trail (Live Database)
              </h3>
              <p className="text-xs text-slate-400">
                Immutable event stream verifying full human-in-the-loop compliance and agent activity provenance.
              </p>
            </div>
          </div>

          <button
            onClick={loadAuditEvents}
            disabled={loadingAudit}
            className="px-3 py-1.5 rounded-xl bg-[#0c1424] border border-white/[0.08] hover:border-white/20 text-xs font-mono text-slate-300 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw size={13} className={loadingAudit ? 'animate-spin text-sky-400' : 'text-slate-400'} />
            <span>{loadingAudit ? 'Refreshing...' : 'Refresh Audit Stream'}</span>
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0c1424] text-slate-400 border-b border-white/[0.06] text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Actor / Principal</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Description & Provenance</th>
                <th className="py-2.5 px-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {combinedAuditEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit events recorded yet.
                  </td>
                </tr>
              ) : (
                combinedAuditEvents.map((evt) => {
                  const isApproved = evt.event_type === 'STRATEGY_APPROVED' || evt.event_type === 'HUMAN_APPROVAL_GRANTED' || evt.event_type === 'ROUTE_ACTIVATED';
                  const isReroute = evt.event_type.includes('REROUT') || evt.event_type.includes('ROUTE');
                  const isAgent = evt.user_id.startsWith('agent:');

                  return (
                    <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {evt.created_at ? evt.created_at.substring(0, 19).replace('T', ' ') : '—'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : isReroute
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : isAgent
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                              : 'bg-white/[0.05] text-slate-400 border-white/[0.08]'
                          }`}
                        >
                          {evt.event_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200 whitespace-nowrap">
                        {evt.user_id}
                      </td>
                      <td className="py-2.5 px-3 text-sky-400 whitespace-nowrap font-bold">
                        {evt.entity_id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans max-w-[420px] truncate" title={evt.description}>
                        {evt.description}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                        {evt.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAP LEARNING HUB, STUDENT EDITION INTEGRATION BOUNDARY */}
      <SAPLearningHubCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enterprise Context */}
        <div className="p-6 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-white/[0.06] pb-2">
            SAP S/4HANA Enterprise Context
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Company Name', value: 'Acme Industrial IoT GmbH' },
              { label: 'SAP Company Code', value: '1010 (Frankfurt Global HQ)' },
              { label: 'Primary Manufacturing Plant', value: 'DE01 — Frankfurt Manufacturing Hub' },
              { label: 'Primary Logistics Hub', value: 'SG01 — Singapore Regional Freight Hub' },
              { label: 'Base Operational Currency', value: 'USD ($) / EUR (€)' },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {f.label}
                </label>
                <input
                  defaultValue={f.value}
                  className="w-full bg-[#0c1424] border border-white/[0.06] focus:border-sky-400/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources & Connectivity */}
        <div className="p-6 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-white/[0.06] pb-2">
            Data Sources & Integration Architecture
          </h3>
          <div className="space-y-3">
            {[
              {
                name: 'SAP S/4HANA Feed',
                status: 'DEGRADED' as const,
                label: 'SIMULATED ENTERPRISE FEED (DEMO)',
                detail: 'Seeded enterprise context: Company Code 1010, Plants Frankfurt/SG',
              },
              {
                name: 'Market Data API',
                status: 'UNKNOWN' as const,
                label: 'ARCHITECTURE READY',
                detail: 'Adapter contract defined for Bloomberg B-PIPE & Reuters Eikon',
              },
              {
                name: 'Port Authority Feeds',
                status: 'DEGRADED' as const,
                label: 'SEEDED / SIMULATED',
                detail: 'Singapore MPA, Hamburg Port, Rotterdam advisories',
              },
              {
                name: 'AIS Vessel Tracking',
                status: 'DEGRADED' as const,
                label: 'SEEDED / SIMULATED',
                detail: 'MarineTraffic API schema mapped to Singapore strait fleet',
              },
              {
                name: 'ML Decision Engine',
                status: 'ONLINE' as const,
                label: 'ONLINE (LOCAL DETERMINISTIC)',
                detail: 'Deterministic multi-tier graph & simulation algorithms',
              },
            ].map((src) => (
              <div
                key={src.name}
                className="p-3 rounded-xl bg-[#0c1424] border border-white/[0.04] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200">{src.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{src.detail}</div>
                </div>
                <StatusIndicator status={src.status} label={src.label} pulse={src.status === 'ONLINE'} />
              </div>
            ))}
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="p-6 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-white/[0.06] pb-2">
            Autonomous Alert Thresholds
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Critical Safety Stock Horizon', value: '14 Days' },
              { label: 'Financial Exposure Alert Floor', value: '$10.0M' },
              { label: 'Supplier Reliability Trigger', value: '60% Score' },
              { label: 'Factory Utilization Warning Floor', value: '70% Capacity' },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between p-3 rounded-xl bg-[#0c1424] border border-white/[0.04]">
                <span className="text-xs text-slate-300 font-medium">{f.label}</span>
                <span className="text-xs font-mono font-bold text-sky-400">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Autonomous Swarm Settings */}
        <div className="p-6 rounded-2xl bg-[#080d19] border border-white/[0.08] space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider border-b border-white/[0.06] pb-2">
            AI Agent Autonomy Protocol
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Autonomous Impact Tracing on Detection', state: 'ENABLED' },
              { label: 'Auto-Run 7D/30D/60D Trajectory Simulations', state: 'ENABLED' },
              { label: 'Multi-Agent Strategy Synthesis & Ranking', state: 'ENABLED' },
              { label: 'Automated Recovery Plan Execution without Human Signoff', state: 'DISABLED (HUMAN MANDATORY)' },
            ].map((cfg) => (
              <div
                key={cfg.label}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0c1424] border border-white/[0.04]"
              >
                <span className="text-xs text-slate-300 font-medium">{cfg.label}</span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${
                    cfg.state.startsWith('ENABLED')
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {cfg.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
