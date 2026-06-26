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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12c2-5 3 5 5 0s3 5 5 0 3 5 5 0 3 5 5 0" />
    </svg>
  );
}
function IconD() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v8m0 0-4-4m4 4 4-4M4 15h16M4 19h16" />
    </svg>
  );
}
function IconT() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
    </svg>
  );
}
function IconH() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <main className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-line bg-ink/85 backdrop-blur supports-[backdrop-filter]:bg-ink/65">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-line">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="1.6">
                  <path d="M3 17h18M6 17V9l6-5 6 5v8M10 17v-4h4v4" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">PUENTE.MONITOR</div>
                <div className="hidden text-[10px] font-mono uppercase tracking-[0.2em] text-muted sm:block">
                  Condition Assessment System
                </div>
              </div>
            </div>
            <ConnectionIndicator estado={conexion} host={host} topic={topic} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* GRID BG SECTION */}
        <section className="grid-bg relative -mx-4 -mt-2 mb-6 overflow-hidden rounded-xl border border-line px-4 py-5 sm:-mx-6 sm:px-6 scan-line">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
                Estructura · Sector A
              </span>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Monitoreo estructural en tiempo real
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Adquisición Raspberry Pi 4 · MPU6050 / HC-SR04 / DHT22 · MQTT · IA de clasificación
              </p>
            </div>
            <button
              onClick={limpiar}
              className="self-start rounded-md border border-line px-3 py-1.5 text-xs font-mono text-muted transition-colors hover:text-white hover:border-line/70"
            >
              LIMPIAR
            </button>
          </div>

          {/* barra de nivel */}
          <div className="mt-5 flex items-center gap-2">
            {estadoActual && meta ? (
              <div className="flex w-full items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Nivel de riesgo
                </span>
                <div className="flex flex-1 gap-1">
                  {(["muy seguro", "seguro", "precaucion", "critico", "emergencia"] as const).map(
                    (k, idx) => {
                      const m = ESTADO_META[k];
                      const activo = meta.level >= m.level;
                      return (
                        <div
                          key={k}
                          className="h-1.5 flex-1 rounded-full transition-all"
                          style={{
                            background: activo ? m.color : "#27272A",
                            opacity: activo ? 1 : 0.55,
                          }}
                          title={m.label}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-[10px] font-mono" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
            ) : (
              <div className="flex w-full gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full bg-line" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CARDS sensores */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SensorCard
            id="MPU6050"
            label="Vibración"
            value={vibracion ? vibracion.rms.toFixed(2) : "—"}
            unit="g"
            accent="#22D3EE"
            icon={<IconV />}
            sub={
              vibracion ? (
                <span>
                  {vibracion.frecuencia_dominante_hz} Hz · {vibracion.estado}
                </span>
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
            accent="#FBBF24"
            icon={<IconD />}
            sub={
              actual ? (
                <span>
                  {(actual.sensores.asentamiento_cm ?? 0) >= 0 ? "elevación" : "hundimiento"}
                </span>
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
            accent="#F87171"
            icon={<IconT />}
            sub={actual ? <span>ambiente</span> : <span className="text-muted/50">sin datos</span>}
          />
          <SensorCard
            id="DHT22-H"
            label="Humedad"
            value={actual ? actual.sensores.humedad?.toFixed(1) ?? "—" : "—"}
            unit="%"
            accent="#4ADE80"
            icon={<IconH />}
            sub={actual ? <span>relativa</span> : <span className="text-muted/50">sin datos</span>}
          />
        </section>

        {/* CLASIFICACIÓN + INFO */}
        <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {estadoActual ? (
            <ClassificationBadge
              estado={estadoActual.estado}
              probabilidad={estadoActual.probabilidad}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-surface p-5 flex items-center justify-center text-sm text-muted">
              Esperando clasificación…
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label="Últ. muestra" value={ahora} />
              <Metric
                label="Fecha"
                value={actual?.fecha ?? "—"}
              />
              <Metric
                label="Probabilidad"
                value={estadoActual ? `${(estadoActual.probabilidad * 100).toFixed(1)}%` : "—"}
              />
              <Metric
                label="Total muestras"
                value={String(historial.length)}
              />
            </div>

            {/* Detalle JSON actual */}
            <div className="mt-5">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted">
                Payload actual
              </span>
              <pre className="mt-2 max-h-40 overflow-auto scrollbar-thin rounded-lg border border-line bg-ink/60 p-3 text-[11px] leading-relaxed text-accent/90">
{actual ? JSON.stringify(actual, null, 2) : "// esperando mensaje MQTT…"}
              </pre>
            </div>
          </div>
        </section>

        {/* CHARTS */}
        <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <VibracionChart datos={historial} />
          <AsentamientoChart datos={historial} />
          <AmbientalChart datos={historial} />
          <HistoryTable datos={historial} />
        </section>

        {/* FOOTER */}
        <footer className="mt-6 flex flex-col items-center gap-1 border-t border-line pt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted/60">
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
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}