import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, FileText, Radio } from 'lucide-react';
import { format } from 'date-fns';
import { ExecutiveBriefModal } from '../components/ui/ExecutiveBriefModal';
import { LiveDemoControlBar } from '../components/demo/LiveDemoControlBar';
import { useDemo } from '../context/DemoContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const { rerouteState } = useDemo();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#040711] text-slate-200">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden lg:pl-64">
        {/* ROW 1: GLOBAL COMMAND BAR */}
        <header className="h-[46px] bg-[#060a14]/95 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 select-none">
          {/* LEFT: Mobile Toggle + Brand Mark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Radio size={12} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-xs tracking-tight">ChainPulse</span>
                <span className="hidden sm:inline text-[9px] font-mono tracking-widest text-slate-400 uppercase">
                  DISRUPTION INTELLIGENCE
                </span>
                <span className="hidden md:inline px-1 py-0.2 rounded bg-white/[0.05] text-[9px] font-mono text-slate-400 border border-white/[0.06]">
                  v2.6
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Contextual Command Center & Active Incident */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">
                COMMAND CENTER
              </span>
            </div>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <div className="flex items-center gap-1.5 text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.12)]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="font-mono text-[11px] font-medium truncate max-w-[170px] sm:max-w-none">
                DISR-SG-2026-001 · Singapore Port
              </span>
            </div>
          </div>

          {/* RIGHT: Executive Brief + Live Clock + Primary State Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            <button
              onClick={() => setBriefOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
            >
              <FileText size={12} className="text-cyan-400" />
              <span className="hidden md:inline">Executive Brief</span>
              <span className="md:hidden">Brief</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-semibold">LIVE</span>
              <span className="text-slate-600">·</span>
              <span>{format(time, 'HH:mm')} SGT</span>
            </div>

            <span className="hidden sm:inline h-3 w-px bg-white/10" />

            {/* Primary State Indicator */}
            {rerouteState === 'ACTIVE' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>REROUTE ACTIVE</span>
              </div>
            ) : rerouteState === 'PROPOSED' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>CANDIDATE ROUTE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>MARITIME BLOCKED</span>
              </div>
            )}
          </div>
        </header>

        {/* Global Grand Finale Showcase Control Bar */}
        <LiveDemoControlBar />

        {/* Dynamic Atmosphere Background */}
        <div className="absolute inset-0 cp-telemetry-grid pointer-events-none opacity-60 z-0" />
        <div className="absolute top-0 left-0 right-0 h-96 cp-ambient-glow pointer-events-none z-0" />

        {/* Main Content with Route Transition */}
        <main
          key={location.pathname}
          className="flex-1 flex flex-col overflow-y-auto relative z-10 animate-page-enter w-full min-w-0"
        >
          {children}
        </main>
      </div>

      {/* Executive Briefing Modal */}
      <ExecutiveBriefModal isOpen={briefOpen} onClose={() => setBriefOpen(false)} />
    </div>
  );
}
