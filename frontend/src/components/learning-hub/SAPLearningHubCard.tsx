import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  Layers,
  Award,
  BookOpen,
  Key,
} from 'lucide-react';
import { SAP_LEARNING_HUB_METADATA } from '../../services/sapLearningHub';
import { StatusBeacon } from '../motion';

export function SAPLearningHubCard() {
  const data = SAP_LEARNING_HUB_METADATA;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#091122] via-[#050a16] to-[#03060e] border border-sky-500/30 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-300">
                SAP LEARNING HUB — STUDENT EDITION INTEGRATION BOUNDARY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                SAP UNIVERSITY ALLIANCES
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Operator competency verification & disruption learning journey integration for human-in-the-loop governance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
            <StatusBeacon variant="warning" size="sm" />
            DEMO / SIMULATED STUDENT CONTEXT
          </span>
        </div>
      </div>

      {/* Demo Student Operator Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-[#080e1c] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <Award size={13} className="text-amber-400" />
              Demo / Simulated Student Profile
            </span>
            <span className="text-[10px] text-amber-400 font-bold">SIMULATED CREDENTIAL (DEMO)</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Operator Name:</span>
              <strong className="text-white">{data.operatorProfile.studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Student ID:</span>
              <span className="text-sky-300 font-bold">{data.operatorProfile.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Academic Program:</span>
              <span className="text-slate-300">{data.operatorProfile.institution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Credential ID:</span>
              <span className="text-slate-300">{data.operatorProfile.certificationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Certification Exam:</span>
              <span className="text-emerald-400 font-bold">{data.operatorProfile.score}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-400/20 text-[11px] text-sky-200">
            <strong>Certified Competency:</strong> {data.operatorProfile.certificationTitle}
          </div>
        </div>

        {/* Learning Journey Linking & SOP Alignment */}
        <div className="p-4 rounded-xl bg-[#080e1c] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <BookOpen size={13} className="text-sky-400" />
              Associated SAP Learning Journey
            </span>
            <span className="text-[10px] text-sky-400 font-bold">Official Curriculum</span>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            When maritime disruptions like DISR-SG-2026-001 are detected, ChainPulse connects human operators to the corresponding SAP Learning Hub curriculum to review standard operating procedures for procurement rerouting and purchase requisition overrides.
          </p>

          <div className="p-3 rounded-lg bg-[#0c162c] border border-white/[0.05] space-y-1">
            <span className="text-[9px] text-slate-500 uppercase block">Curriculum Pathway:</span>
            <div className="text-xs font-bold text-white font-mono">{data.operatorProfile.learningJourneyTitle}</div>
            <a
              href={data.operatorProfile.learningJourneyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-1 font-mono"
            >
              <span>learning.sap.com/learning-journeys</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Integration Boundary / API Specification */}
      <div className="p-4 rounded-xl bg-[#060a14] border border-white/[0.06] space-y-3 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Key size={13} className="text-indigo-400" />
            Enterprise Architecture & Contract Specification
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-semibold">
            Status: ADAPTER CONTRACT DEFINED · CREDENTIAL HANDSHAKE READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          {data.requiredCredentials.map((c) => (
            <div
              key={c.key}
              className="p-2.5 rounded-lg bg-[#0a1020] border border-white/[0.04] flex items-center justify-between gap-2"
            >
              <div className="truncate">
                <span className="text-slate-300 font-bold block">{c.key}</span>
                <span className="text-[9px] text-slate-500 block truncate">{c.description}</span>
              </div>
              <span
                className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                  c.configured
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.05] text-slate-400 border border-white/10'
                }`}
              >
                {c.configured ? 'CONFIGURED' : 'PENDING CREDENTIAL'}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>
            Supported Protocols: <strong>SAP Identity Authentication Service (OIDC)</strong> · <strong>SuccessFactors OData API v2</strong>
          </span>
          <span className="text-slate-500">
            ChainPulse does not simulate artificial API round-trips without genuine SAP tenant certificates.
          </span>
        </div>
      </div>
    </div>
  );
}
