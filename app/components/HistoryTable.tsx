"use client";

import { MedicionPuente, ESTADO_META } from "@/lib/types";

export default function HistoryTable({ datos }: { datos: MedicionPuente[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted">
          Registros históricos
        </span>
        <span className="text-[11px] font-mono text-muted">{datos.length} muestras</span>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-surface text-muted">
            <tr className="border-b border-line font-mono">
              <th className="px-4 py-2 font-normal">Hora</th>
              <th className="px-3 py-2 font-normal text-right">RMS</th>
              <th className="px-3 py-2 font-normal text-right">Asent.</th>
              <th className="px-3 py-2 font-normal text-right">Temp</th>
              <th className="px-3 py-2 font-normal text-right">Hum</th>
              <th className="px-4 py-2 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {datos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Esperando datos del broker MQTT…
                </td>
              </tr>
            )}
            {datos.map((d, i) => {
              const meta = ESTADO_META[d.clasificacion.estado];
              return (
                <tr key={i} className="border-b border-line/40 hover:bg-elevated/50">
                  <td className="px-4 py-2 text-muted">{d.hora}</td>
                  <td className="px-3 py-2 text-right">{d.sensores.vibracion.rms.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{d.sensores.asentamiento_cm.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{d.sensores.temperatura.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{d.sensores.humedad.toFixed(1)}</td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px]"
                      style={{ background: `${meta.color}1A`, color: meta.color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}