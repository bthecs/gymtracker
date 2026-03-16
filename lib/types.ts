/**
 * Una fila del CSV de Google Sheets (o mock).
 * Columnas: Dia, GrupoMuscular, Duracion, Ejercicio, Series, Repeticiones
 */
export interface RutinaRow {
  Dia: string;
  GrupoMuscular: string;
  Duracion: string;
  Ejercicio: string;
  Series: string;
  Repeticiones: string;
}

/**
 * Resumen por día para la vista semanal (agrupado por Dia).
 */
export interface DaySummary {
  dia: string;
  grupoMuscular: string;
  duracion: string;
  isRestDay: boolean;
}

/**
 * Ejercicio para la lista del detalle del día.
 */
export interface Exercise {
  nombre: string;
  series: string;
  repeticiones: string;
}

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];
