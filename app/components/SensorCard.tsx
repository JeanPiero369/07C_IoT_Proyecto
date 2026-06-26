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
    <div className="rounded-xl border border-line bg-elevated p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: `${accent}0f`, color: accent }}
          >
            {icon}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
            {label}
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted/50">{id}</span>
      </div>

      <div className="mt-2.5 tabular-nums">
        <span className="text-2xl font-semibold tracking-tight text-gray-800" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="ml-0.5 text-xs text-muted">{unit}</span>}
      </div>

      <div className="mt-1.5 text-[11px] text-muted/80">{sub}</div>
    </div>
  );
}