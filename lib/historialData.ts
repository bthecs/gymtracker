import Papa from "papaparse";
import type { HistorialRow } from "./historialTypes";
import { MOCK_HISTORIAL } from "./historialMock";

/** URL pública del CSV de historial de Google Sheets. Vacía = usar solo mock. */
export const HISTORIAL_CSV_URL = "";

/**
 * Obtiene las filas de historial: desde CSV si hay URL, si no desde mock.
 */
export async function getHistorialRows(): Promise<HistorialRow[]> {
  if (!HISTORIAL_CSV_URL.trim()) {
    return MOCK_HISTORIAL;
  }
  try {
    const res = await fetch(HISTORIAL_CSV_URL, { next: { revalidate: 60 } });
    const text = await res.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length > 0) return MOCK_HISTORIAL;
    const rows: HistorialRow[] = parsed.data.map((r) => ({
      Fecha: r.Fecha ?? "",
      Ejercicio: r.Ejercicio ?? "",
      Peso_Kg: Number(r.Peso_Kg) || 0,
      Series_Completadas: Number(r.Series_Completadas) || 0,
      Repeticiones_Completadas: Number(r.Repeticiones_Completadas) || 0,
    }));
    return rows.length ? rows : MOCK_HISTORIAL;
  } catch {
    return MOCK_HISTORIAL;
  }
}

/** Días únicos con al menos un entrenamiento (YYYY-MM-DD). */
export function getTrainedDates(rows: HistorialRow[]): Set<string> {
  const set = new Set<string>();
  for (const r of rows) if (r.Fecha) set.add(r.Fecha.trim());
  return set;
}

/** Racha actual: días consecutivos con entrenamiento hacia atrás desde hoy. */
export function getRachaActual(trainedDates: Set<string>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let count = 0;
  const d = new Date(today);
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (trainedDates.has(key)) count++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Cantidad de sesiones (días distintos) en el mes dado. */
export function getSesionesEnMes(
  trainedDates: Set<string>,
  year: number,
  month: number
): number {
  let count = 0;
  trainedDates.forEach((dateStr) => {
    const [y, m] = dateStr.split("-").map(Number);
    if (y === year && m === month) count++;
  });
  return count;
}

/** Volumen total (kg) en el periodo: sum(Peso_Kg * Series * Reps) para las filas en las fechas dadas. */
export function getVolumenTotal(
  rows: HistorialRow[],
  fromDate: Date,
  toDate: Date
): number {
  const from = fromDate.getTime();
  const to = toDate.getTime();
  let total = 0;
  for (const r of rows) {
    const t = new Date(r.Fecha).getTime();
    if (t >= from && t <= to) {
      total +=
        r.Peso_Kg * r.Series_Completadas * r.Repeticiones_Completadas;
    }
  }
  return Math.round(total);
}

/** Lista de ejercicios únicos para el selector. */
export function getEjerciciosUnicos(rows: HistorialRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) if (r.Ejercicio?.trim()) set.add(r.Ejercicio.trim());
  return Array.from(set).sort();
}

/** Datos para el gráfico de evolución: por ejercicio, por fecha, peso (ej. máximo del día). */
export function getEvolucionPorEjercicio(
  rows: HistorialRow[],
  ejercicio: string
): { fecha: string; peso: number }[] {
  const byDate = new Map<string, number>();
  for (const r of rows) {
    if ((r.Ejercicio || "").trim() !== ejercicio) continue;
    const key = r.Fecha.trim();
    const current = byDate.get(key) ?? 0;
    byDate.set(key, Math.max(current, r.Peso_Kg));
  }
  return Array.from(byDate.entries())
    .map(([fecha, peso]) => ({ fecha, peso }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
