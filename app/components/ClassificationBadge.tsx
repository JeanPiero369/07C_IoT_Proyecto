"use client";

import { ESTADO_META, EstadoClasificacion } from "@/lib/types";

export default function ClassificationBadge({
  estado,
  probabilidad,
}: {
  estado: EstadoClasificacion;
  probabilidad: number;
}) {
  const meta = ESTADO_META[estado];
  const pct = Math.round(probabilidad * 100);

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-5">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: meta.color }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted">
          Clasificación IA
        </span>
        <span className="text-[11px] font-mono text-muted">{pct}% confianza</span>
      </div>
      <div className="mt-4 flex items-end gap-3">
        <div
          className="h-14 w-14 rounded-lg flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${meta.color}1A`, color: meta.color }}
        >
          <span className="h-3 w-3 rounded-full" style={{ background: meta.color }} />
        </div>
        <div>
          <div className="text-3xl font-semibold tracking-tight" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="mt-1 h-1.5 w-44 overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}