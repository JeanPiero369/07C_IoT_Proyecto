"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";
import { MedicionPuente } from "@/lib/types";

function histInv(datos: MedicionPuente[]) {
  return [...datos].reverse().map((d, i) => ({
    i,
    label: d.hora.slice(0, 5),
    rms: d.sensores.vibracion.rms,
    asentamiento: d.sensores.asentamiento_cm,
    temperatura: d.sensores.temperatura,
    humedad: d.sensores.humedad,
  }));
}

function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-mono shadow-md">
      <div className="text-muted mb-0.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="tabular-nums" style={{ color: p.stroke || p.fill }}>
          {p.dataKey}: {p.value?.toFixed(2)}{unit}
        </div>
      ))}
    </div>
  );
}

export function VibracionChart({ datos }: { datos: MedicionPuente[] }) {
  const data = histInv(datos);
  return (
    <div className="rounded-xl border border-line bg-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
          Vibración · RMS
        </span>
        <span className="text-[10px] font-mono text-accent/70">g</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="rms" stroke="#0d9488" strokeWidth={1.6} fill="url(#gV)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AsentamientoChart({ datos }: { datos: MedicionPuente[] }) {
  const data = histInv(datos);
  return (
    <div className="rounded-xl border border-line bg-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
          Asentamiento
        </span>
        <span className="text-[10px] font-mono text-warn/70">cm</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ca8a04" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ca8a04" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="asentamiento" stroke="#ca8a04" strokeWidth={1.6} fill="url(#gA)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AmbientalChart({ datos }: { datos: MedicionPuente[] }) {
  const data = histInv(datos);
  return (
    <div className="rounded-xl border border-line bg-elevated p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
          Ambiental · Temp / Hum
        </span>
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="text-bad/80">&#9679; Temp °C</span>
          <span className="text-accent/80">&#9679; Hum %</span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="temperatura" stroke="#dc2626" strokeWidth={1.6} dot={false} />
            <Line type="monotone" dataKey="humedad" stroke="#0d9488" strokeWidth={1.6} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}