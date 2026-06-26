"use client";

import { MedicionPuente, ESTADO_META } from "@/lib/types";

export default function HistoryTable({ datos }: { datos: MedicionPuente[] }) {
  return (
    <div className="rounded-xl border border-line bg-elevated">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
          Registros históricos
        </span>
        <span className="text-[10px] font-mono text-muted">{datos.length} muestras</span>
      </div>
      <div className="max-h-72 overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-elevated text-muted">
            <tr className="border-b border-line font-mono">
              <th className="px-4 py-2 font-normal text-[10px]">Hora</th>
              <th className="px-3 py-2 font-normal text-[10px] text-right">RMS</th>
              <th className="px-3 py-2 font-normal text-[10px] text-right">Asent.</th>
              <th className="px-3 py-2 font-normal text-[10px] text-right">Temp</th>
              <th className="px-3 py-2 font-normal text-[10px] text-right">Hum</th>
              <th className="px-4 py-2 font-normal text-[10px]">Estado</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {datos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted text-[11px]">
                  Esperando datos del broker MQTT…
                </td>
              </tr>
            )}
            {datos.map((d, i) => {
              const meta = ESTADO_META[d.clasificacion.estado];
              return (
                <tr key={i} className="border-b border-line/40 hover:bg-gray-50">
                  <td className="px-4 py-2 text-muted">{d.hora}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{d.sensores.vibracion.rms.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{d.sensores.asentamiento_cm.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{d.sensores.temperatura.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{d.sensores.humedad.toFixed(1)}</td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide"
                      style={{ background: `${meta.color}12`, color: meta.color }}
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