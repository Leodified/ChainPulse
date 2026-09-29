import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Clock, Menu, FileText, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ExecutiveBriefModal } from '../components/ui/ExecutiveBriefModal';
import { StatusBeacon } from '../components/motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

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
        {/* Top Intelligence Telemetry Bar */}
        <header className="h-[48px] bg-[#060a14]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              <Menu size={18} />
            </button>

            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              COMMAND MATRIX
            </span>
            <span className="hidden sm:inline h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full truncate max-w-[200px] sm:max-w-none shadow-[0_0_10px_rgba(244,63,94,0.15)]">
              <StatusBeacon variant="critical" size="sm" />
              <span className="font-mono text-[11px] font-medium truncate">DISR-SG-2026-001: Singapore Port</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-400">
            {/* 1-Click Executive Briefing Trigger */}
            <button
              onClick={() => setBriefOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <FileText size={12} />
              <span className="hidden md:inline">EXECUTIVE BRIEF</span>
              <span className="md:hidden">BRIEF</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5">
              <Clock size={13} className="text-slate-500" />
              <span>SGT {format(time, 'HH:mm:ss')}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">UTC {format(new Date(time.getTime() - (8 * 3600 * 1000) + (new Date().getTimezoneOffset() * 60 * 1000)), 'HH:mm')}</span>
            </div>
            <span className="hidden md:inline h-3 w-px bg-white/10" />
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <StatusBeacon variant="success" size="sm" />
              <span className="font-medium">DEFENSE READY</span>
            </div>
          </div>
        </header>

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
