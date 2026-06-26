export type EstadoClasificacion =
  | "muy seguro"
  | "seguro"
  | "precaucion"
  | "critico"
  | "emergencia";

export interface MedicionPuente {
  fecha: string;
  hora: string;
  timestamp: number;
  sensores: {
    vibracion: {
      rms: number;
      frecuencia_dominante_hz: number;
      estado: string;
    };
    asentamiento_cm: number;
    temperatura: number;
    humedad: number;
  };
  clasificacion: {
    estado: EstadoClasificacion;
    probabilidad: number;
  };
}

export const ESTADO_META: Record<
  EstadoClasificacion,
  { label: string; color: string; bg: string; level: number }
> = {
  "muy seguro": { label: "Muy Seguro", color: "#16a34a", bg: "#16a34a", level: 0 },
  seguro: { label: "Seguro", color: "#65a30d", bg: "#65a30d", level: 1 },
  precaucion: { label: "Precaución", color: "#ca8a04", bg: "#ca8a04", level: 2 },
  critico: { label: "Crítico", color: "#ea580c", bg: "#ea580c", level: 3 },
  emergencia: { label: "Emergencia", color: "#dc2626", bg: "#dc2626", level: 4 },
};

export function normalizarEstado(e: string): EstadoClasificacion {
  const k = e.toLowerCase().trim();
  if (k.includes("muy")) return "muy seguro";
  if (k.includes("emer")) return "emergencia";
  if (k.includes("crit")) return "critico";
  if (k.includes("prec")) return "precaucion";
  return "seguro";
}