"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mqtt from "mqtt";
import { MedicionPuente, normalizarEstado } from "./types";

export type ConnectionState = "conectando" | "conectado" | "desconectado" | "error";

const MAX_HISTORIAL = 50;

export function useMqttMonitor() {
  const [conexion, setConexion] = useState<ConnectionState>("conectando");
  const [actual, setActual] = useState<MedicionPuente | null>(null);
  const [historial, setHistorial] = useState<MedicionPuente[]>([]);
  const [ultimoUpdate, setUltimoUpdate] = useState<number | null>(null);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_MQTT_HOST || process.env.MQTT_HOST || "localhost";
    const port = process.env.NEXT_PUBLIC_MQTT_PORT || process.env.MQTT_PORT || "9001";
    const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || process.env.MQTT_TOPIC || "puente/monitoreo";

    const url = `${window.location.protocol === "https:" ? "wss" : "ws"}://${host}:${port}`;
    let client: mqtt.MqttClient;

    try {
      client = mqtt.connect(url, {
        clientId: `puente-monitor-${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        reconnectPeriod: 3000,
        connectTimeout: 8000,
      });
    } catch {
      setConexion("error");
      return;
    }

    clientRef.current = client;

    client.on("connect", () => {
      setConexion("conectado");
      client.subscribe(topic, { qos: 0 });
    });

    client.on("reconnect", () => setConexion("conectando"));
    client.on("close", () => setConexion("desconectado"));
    client.on("error", () => setConexion("error"));

    const num = (v: unknown, d = 0): number => {
      const n = Number(v);
      return Number.isFinite(n) ? n : d;
    };

    client.on("message", (_topic: string, payload: Buffer) => {
      try {
        const raw = JSON.parse(payload.toString());
        if (!raw || typeof raw !== "object") return;
        if (!raw.clasificacion) return;

        const s = raw.sensores ?? {};
        // búsqueda flexible: directo o dentro de sub-objetos comunes
        const pick = (...paths: any[]) => {
          for (const p of paths) {
            if (p !== undefined && p !== null) {
              const n = Number(p);
              if (Number.isFinite(n)) return n;
            }
          }
          return 0;
        };

        const data: MedicionPuente = {
          fecha: raw.fecha ?? new Date().toISOString().slice(0, 10),
          hora: raw.hora ?? new Date().toLocaleTimeString("es-PE", { hour12: false }),
          timestamp: num(raw.timestamp, Date.now() / 1000),
          sensores: {
            vibracion: {
              rms: pick(s?.vibracion?.rms, s?.rms, s?.vibracion),
              frecuencia_dominante_hz: pick(s?.vibracion?.frecuencia_dominante_hz, s?.frecuencia_dominante_hz, s?.frecuencia),
              estado: s?.vibracion?.estado ?? s?.estado_vibracion ?? "—",
            },
            asentamiento_cm: pick(s?.asentamiento_cm, s?.asentamiento, s?.distancia_cm, s?.distancia),
            temperatura: pick(s?.temperatura, s?.ambiente?.temperatura, s?.dht22?.temperatura, s?.ambiental?.temperatura, s?.temp, raw?.temperatura),
            humedad: pick(s?.humedad, s?.ambiente?.humedad, s?.dht22?.humedad, s?.ambiental?.humedad, s?.hum, raw?.humedad),
          },
          clasificacion: {
            estado: normalizarEstado(raw.clasificacion?.estado ?? raw.clasificacion ?? "seguro"),
            probabilidad: pick(raw.clasificacion?.probabilidad, 0),
          },
        };

        setActual(data);
        setUltimoUpdate(Date.now());
        setHistorial((prev) => [data, ...prev].slice(0, MAX_HISTORIAL));
      } catch {
        // payload inválido
      }
    });

    return () => {
      client.end(true);
    };
  }, []);

  const limpiar = useCallback(() => {
    setHistorial([]);
    setActual(null);
    setUltimoUpdate(null);
  }, []);

  return { conexion, actual, historial, ultimoUpdate, limpiar };
}