"use client";

import { useMqttMonitor } from "@/lib/useMqttMonitor";
import { ESTADO_META } from "@/lib/types";
import ConnectionIndicator from "@/components/ConnectionIndicator";
import ClassificationBadge from "@/components/ClassificationBadge";
import SensorCard from "@/components/SensorCard";
import HistoryTable from "@/components/HistoryTable";
import { VibracionChart, AsentamientoChart, AmbientalChart } from "@/components/Charts";

function IconV() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12c2-5 3 5 5 0s3 5 5 0 3 5 5 0 3 5 5 0" />
    </svg>
  );
}
function IconD() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v8m0 0-4-4m4 4 4-4M4 15h16M4 19h16" />
    </svg>
  );
}
function IconT() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
    </svg>
  );
}
function IconH() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2.5S5 10 5 14a7 7 0 0 0 14 0c0-4-7-11.5-7-11.5Z" />
    </svg>
  );
}

export default function Page() {
  const { conexion, actual, historial, ultimoUpdate, limpiar } = useMqttMonitor();

  const host =
    process.env.NEXT_PUBLIC_MQTT_HOST || process.env.MQTT_HOST || "localhost";
  const topic =
    process.env.NEXT_PUBLIC_MQTT_TOPIC || process.env.MQTT_TOPIC || "puente/monitoreo";

  const vibracion = actual?.sensores.vibracion;
  const estadoActual = actual?.clasificacion;
  const meta = estadoActual ? ESTADO_META[estadoActual.estado] : null;

  const ahora = ultimoUpdate
    ? new Date(ultimoUpdate).toLocaleTimeString("es-PE", { hour12: false })
    : "—";

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-line bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/autopista.png" alt="Puente Monitor" className="h-7 w-7 object-contain" />
              <div className="leading-tight">
                <span className="text-sm font-semibold tracking-tight text-gray-800">Puente Monitor</span>
                <span className="block text-[9px] font-mono uppercase tracking-[0.12em] text-muted">Structural Assessment</span>
              </div>
            </div>
            <ConnectionIndicator estado={conexion} host={host} topic={topic} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {/* HERO */}
        <section className="mb-5 rounded-xl border border-line bg-elevated px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-muted">
                Estructura · Sector A
              </span>
              <h1 className="mt-0.5 text-xl font-semibold text-gray-800 sm:text-2xl">
                Monitoreo estructural en tiempo real
              </h1>
              <p className="mt-0.5 text-xs text-muted">
                Raspberry Pi 4 · MPU6050 / HC-SR04 / DHT22 · Clasificación IA
              </p>
            </div>
            <button
              onClick={limpiar}
              className="self-start rounded-md border border-gray-200 px-3 py-1.5 text-[10px] font-mono text-muted transition-colors hover:border-gray-300 hover:text-gray-700"
            >
              LIMPIAR
            </button>
          </div>

          {/* Risk bar */}
          <div className="mt-4 flex items-center gap-2">
            {estadoActual && meta ? (
              <div className="flex w-full items-center gap-3">
                <span className="text-[9px] font-mono uppercase tracking-wider text-muted">
                  Riesgo
                </span>
                <div className="flex flex-1 gap-1">
                  {(["muy seguro", "seguro", "precaucion", "critico", "emergencia"] as const).map(
                    (k) => {
                      const m = ESTADO_META[k];
                      const activo = meta.level >= m.level;
                      return (
                        <div
                          key={k}
                          className="h-1.5 flex-1 rounded-full transition-all"
                          style={{
                            background: activo ? m.color : "#e5e7eb",
                            opacity: activo ? 1 : 0.5,
                          }}
                          title={m.label}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-[10px] font-mono font-medium" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            ) : (
              <div className="flex w-full gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-200" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SENSOR CARDS */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SensorCard
            id="MPU6050"
            label="Vibración"
            value={vibracion ? vibracion.rms.toFixed(2) : "—"}
            unit="g"
            accent="#0d9488"
            icon={<IconV />}
            sub={
              vibracion ? (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted">Frecuencia dominante</span>
                    <span className="text-xs font-mono font-semibold tabular-nums text-gray-700">
                      {vibracion.frecuencia_dominante_hz} <span className="font-normal text-muted">Hz</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted">Vibración en puente</span>
                    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold font-mono tracking-wide uppercase"
                      style={{
                        background: vibracion.estado?.includes("activa") ? "#16a34a18" : "#6b728018",
                        color: vibracion.estado?.includes("activa") ? "#16a34a" : "#6b7280"
                      }}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${vibracion.estado?.includes("activa") ? "bg-[#16a34a]" : "bg-[#6b7280]"}`} />
                      {vibracion.estado?.includes("activa") ? "ACTIVA" : "INACTIVA"}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-muted/50">sin datos</span>
              )
            }
          />
          <SensorCard
            id="HC-SR04"
            label="Asentamiento"
            value={actual ? actual.sensores.asentamiento_cm?.toFixed(2) ?? "—" : "—"}
            unit="cm"
            accent="#ca8a04"
            icon={<IconD />}
            sub={
              actual ? (
                <span>{(actual.sensores.asentamiento_cm ?? 0) >= 0 ? "elevación" : "hundimiento"}</span>
              ) : (
                <span className="text-muted/50">sin datos</span>
              )
            }
          />
          <SensorCard
            id="DHT22-T"
            label="Temperatura"
            value={actual ? actual.sensores.temperatura?.toFixed(1) ?? "—" : "—"}
            unit="°C"
            accent="#dc2626"
            icon={<IconT />}
            sub={actual ? <span>ambiente</span> : <span className="text-muted/50">sin datos</span>}
          />
          <SensorCard
            id="DHT22-H"
            label="Humedad"
            value={actual ? actual.sensores.humedad?.toFixed(1) ?? "—" : "—"}
            unit="%"
            accent="#0d9488"
            icon={<IconH />}
            sub={actual ? <span>relativa</span> : <span className="text-muted/50">sin datos</span>}
          />
        </section>

        {/* CLASIFICACIÓN + METADATA */}
        <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {estadoActual ? (
            <ClassificationBadge
              estado={estadoActual.estado}
              probabilidad={estadoActual.probabilidad}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-elevated p-5 flex items-center justify-center text-sm text-muted">
              Esperando clasificación…
            </div>
          )}

          <div className="rounded-xl border border-line bg-elevated p-5 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label="Últ. muestra" value={ahora} />
              <Metric label="Fecha" value={actual?.fecha ?? "—"} />
              <Metric
                label="Probabilidad"
                value={estadoActual ? `${(estadoActual.probabilidad * 100).toFixed(1)}%` : "—"}
              />
              <Metric label="Muestras" value={String(historial.length)} />
            </div>

            {/* JSON payload */}
            <div className="mt-5">
              <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-muted">
                Payload actual
              </span>
              <pre className="mt-2 max-h-32 overflow-auto scrollbar-thin rounded-lg border border-gray-200 bg-gray-50 p-3 text-[10px] leading-relaxed text-gray-600">
{actual ? JSON.stringify(actual, null, 2) : "// esperando mensaje MQTT…"}
              </pre>
            </div>
          </div>
        </section>

        {/* CHARTS + TABLE */}
        <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <VibracionChart datos={historial} />
          <AsentamientoChart datos={historial} />
          <AmbientalChart datos={historial} />
          <HistoryTable datos={historial} />
        </section>

        {/* FOOTER */}
        <footer className="mt-8 flex flex-col items-center gap-1 border-t border-gray-200 pt-4 text-[9px] font-mono uppercase tracking-[0.15em] text-muted/50">
          <span>Puente IoT · Raspberry Pi 4 · Next.js · MQTT</span>
          <span>Sktech · 07C · 2026</span>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className="mt-0.5 text-base font-semibold tracking-tight tabular-nums text-gray-800">{value}</div>
    </div>
  );
}