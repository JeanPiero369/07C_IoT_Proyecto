"use client";

import { ConnectionState } from "@/lib/useMqttMonitor";

const ESTADO: Record<ConnectionState, { txt: string; color: string; dot: string }> = {
  conectando: { txt: "CONECTANDO", color: "text-warn/80", dot: "bg-warn" },
  conectado: { txt: "EN LÍNEA", color: "text-ok/80", dot: "bg-ok" },
  desconectado: { txt: "DESCONECTADO", color: "text-muted", dot: "bg-muted" },
  error: { txt: "ERROR", color: "text-bad/80", dot: "bg-bad" },
};

export default function ConnectionIndicator({
  estado,
  host,
  topic,
}: {
  estado: ConnectionState;
  host: string;
  topic: string;
}) {
  const e = ESTADO[estado];
  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${e.dot} ${estado === "conectado" ? "pulse-dot" : ""}`} />
        <span className={e.color}>{e.txt}</span>
      </div>
      <span className="text-muted/70 hidden sm:inline text-[11px]">{host}</span>
      <span className="text-muted/70 hidden md:inline text-[11px]">· {topic}</span>
    </div>
  );
}