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
    <div className="rounded-md border border-line bg-elevated px-2.5 py-1.5 text-[11px] font-mono shadow-xl">
      <div className="text-muted mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.stroke || p.fill }}>
          {p.dataKey}: {p.value?.toFixed(2)}{unit}
        </div>
      ))}
    </div>
  );
}

export function VibracionChart({ datos }: { datos: MedicionPuente[] }) {
  const data = histInv(datos);
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted">
          Vibración · RMS
        </span>
        <span className="text-[11px] font-mono text-accent">g</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="rms" stroke="#22D3EE" strokeWidth={1.6} fill="url(#gV)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AsentamientoChart({ datos }: { datos: MedicionPuente[] }) {
  const data = histInv(datos);
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted">
          Asentamiento
        </span>
        <span className="text-[11px] font-mono text-warn">cm</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="asentamiento" stroke="#FBBF24" strokeWidth={1.6} fill="url(#gA)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AmbientalChart({ datos }: { datos: MedicionPuente[] }) {
  const data = histInv(datos);
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted">
          Ambiental · Temp / Hum
        </span>
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="text-bad">● Temp °C</span>
          <span className="text-accent">● Hum %</span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#71717A", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="temperatura" stroke="#F87171" strokeWidth={1.6} dot={false} />
            <Line type="monotone" dataKey="humedad" stroke="#22D3EE" strokeWidth={1.6} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}