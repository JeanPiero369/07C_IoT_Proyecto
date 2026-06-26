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
  { label: string; color: string; bg: string; ring: string; level: number }
> = {
  "muy seguro": { label: "Muy Seguro", color: "#4ADE80", bg: "#4ADE80", ring: "rgba(74,222,128,0.35)", level: 0 },
  seguro: { label: "Seguro", color: "#A3E635", bg: "#A3E635", ring: "rgba(163,230,53,0.35)", level: 1 },
  precaucion: { label: "Precaución", color: "#FBBF24", bg: "#FBBF24", ring: "rgba(251,191,36,0.35)", level: 2 },
  critico: { label: "Crítico", color: "#FB923C", bg: "#FB923C", ring: "rgba(251,146,60,0.35)", level: 3 },
  emergencia: { label: "Emergencia", color: "#F87171", bg: "#F87171", ring: "rgba(248,113,113,0.35)", level: 4 },
};

export function normalizarEstado(e: string): EstadoClasificacion {
  const k = e.toLowerCase().trim();
  if (k.includes("muy")) return "muy seguro";
  if (k.includes("emer")) return "emergencia";
  if (k.includes("crit")) return "critico";
  if (k.includes("prec")) return "precaucion";
  return "seguro";
}