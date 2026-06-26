"use client";

import { ReactNode } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  unit?: string;
  sub?: ReactNode;
  accent: string;
  icon?: ReactNode;
  spark?: number;
}

export default function SensorCard({ id, label, value, unit, sub, accent, icon }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line/70">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: `${accent}14`, color: accent }}
          >
            {icon}
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted">
            {label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted/60">{id}</span>
      </div>

      <div className="mt-3 tabular-nums">
        <span className="text-3xl font-semibold tracking-tight" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="ml-1 text-sm text-muted">{unit}</span>}
      </div>

      <div className="mt-2 text-xs text-muted">{sub}</div>

      <div
        className="absolute -bottom-px left-0 h-px w-full opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
    </div>
  );
}