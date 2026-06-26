"use client";

import { ConnectionState } from "@/lib/useMqttMonitor";

const ESTADO: Record<ConnectionState, { txt: string; color: string; dot: string }> = {
  conectando: { txt: "CONECTANDO", color: "text-warn", dot: "bg-warn" },
  conectado: { txt: "EN LÍNEA", color: "text-ok", dot: "bg-ok" },
  desconectado: { txt: "DESCONECTADO", color: "text-muted", dot: "bg-muted" },
  error: { txt: "ERROR", color: "text-bad", dot: "bg-bad" },
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
    <div className="flex items-center gap-4 text-xs font-mono tracking-wider">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${e.dot} ${estado === "conectado" ? "pulse-dot" : ""}`} />
        <span className={e.color}>{e.txt}</span>
      </div>
      <span className="text-muted hidden sm:inline">{host}</span>
      <span className="text-muted hidden md:inline">› {topic}</span>
    </div>
  );
}