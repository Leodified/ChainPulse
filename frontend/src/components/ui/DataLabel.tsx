interface DataLabelProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  mono?: boolean;
}

import React from 'react';

export function DataLabel({ label, value, sub, mono }: DataLabelProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={`text-slate-200 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
