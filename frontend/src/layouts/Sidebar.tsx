import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Globe,
  Network,
  Activity,
  TrendingDown,
  Bot,
  ShieldCheck,
  DollarSign,
  Leaf,
  Zap,
  FileText,
  Settings,
  Radio,
} from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBeacon } from '../components/motion';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'critical' | 'cyan' | 'violet';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE INTELLIGENCE',
    items: [
      { path: '/', label: 'Overview', icon: <LayoutDashboard size={15} /> },
      { path: '/disruptions', label: 'Disruptions', icon: <AlertTriangle size={15} />, badge: '1 CRITICAL', badgeVariant: 'critical' },
      { path: '/radar', label: 'Global Radar', icon: <Globe size={15} /> },
      { path: '/supply-chain', label: 'Supply Chain Map', icon: <Network size={15} /> },
    ],
  },
  {
    title: 'IMPACT & REASONING',
    items: [
      { path: '/impact', label: 'Impact Analysis', icon: <Activity size={15} /> },
      { path: '/simulations', label: 'Simulations', icon: <TrendingDown size={15} /> },
      { path: '/agents', label: 'Agent Swarm', icon: <Bot size={15} />, badge: '6 Active', badgeVariant: 'violet' },
    ],
  },
  {
    title: 'STRATEGIC RECOVERY',
    items: [
      { path: '/recovery', label: 'Recovery Plans', icon: <ShieldCheck size={15} /> },
      { path: '/financial', label: 'Financial Impact', icon: <DollarSign size={15} /> },
      { path: '/sustainability', label: 'Sustainability', icon: <Leaf size={15} /> },
    ],
  },
  {
    title: 'GOVERNANCE & AUDIT',
    items: [
      { path: '/anomalies', label: 'Tx Anomalies', icon: <Zap size={15} /> },
      { path: '/reports', label: 'Reports', icon: <FileText size={15} /> },
      { path: '/settings', label: 'Settings', icon: <Settings size={15} /> },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-full bg-[#060a14] border-r border-white/[0.08] flex flex-col z-50 select-none transition-transform duration-300 ease-in-out w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-beacon" />
            <Radio size={14} className="text-sky-400 absolute" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-100 font-semibold text-sm tracking-tight">ChainPulse</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/15 text-sky-400 font-mono font-medium">v2.6</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Disruption AI</div>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-slate-500 font-mono">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={clsx(
                      'relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-sky-500/10 text-sky-300 font-semibold shadow-[inset_0_0_12px_rgba(14,165,233,0.06)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                    )}
                  >
                    {/* Left Active Glow Beam */}
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-sky-400 rounded-r shadow-[0_0_8px_#38bdf8]" />
                    )}

                    <span
                      className={clsx(
                        'flex-shrink-0 transition-colors',
                        isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    >
                      {item.icon}
                    </span>

                    <span className="flex-1 truncate tracking-tight">{item.label}</span>

                    {item.badge && (
                      <span
                        className={clsx(
                          'text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold tracking-wider flex-shrink-0',
                          item.badgeVariant === 'critical' && 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
                          item.badgeVariant === 'cyan' && 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
                          item.badgeVariant === 'violet' && 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Intelligent Telemetry Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-[#050811] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <StatusBeacon variant="success" size="sm" />
            <span className="text-slate-300 font-mono text-[10px]">LIVE TELEMETRY</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">14ms</span>
        </div>

        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-white/[0.03]">
          <span className="font-mono">SAP S/4HANA LINK</span>
          <span className="text-amber-400/90 font-mono text-[9px] uppercase tracking-wider">DEMO CONTEXT</span>
        </div>
      </div>
    </aside>
  );
}
