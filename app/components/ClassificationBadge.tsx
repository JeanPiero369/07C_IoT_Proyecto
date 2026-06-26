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
    <div className="rounded-xl border border-line bg-elevated p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
          Clasificación IA
        </span>
        <span className="text-[10px] font-mono text-muted">{pct}% confianza</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${meta.color}12` }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
        </div>
        <div>
          <div className="text-xl font-semibold" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="mt-2 h-1 w-36 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}