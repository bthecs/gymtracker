import { unstable_noStore as noStore } from "next/cache";
import type { HistorialRow } from "./historialTypes";
import { MOCK_HISTORIAL } from "./historialMock";
import { createClient } from "@/utils/supabase/server";
import type { HistorialRowDb } from "./supabase-types";

function mapHistorialDbToRow(r: HistorialRowDb): HistorialRow {
  const fecha = r.creado_en
    ? r.creado_en.slice(0, 10)
    : (r.fecha ?? "");
  return {
    Fecha: fecha,
    Ejercicio: r.ejercicio ?? "",
    Peso_Kg: Number(r.peso_kg) || 0,
    Series_Completadas: Number(r.series_completadas) || 0,
    Repeticiones_Completadas: Number(r.repeticiones_completadas) || 0,
  };
}

export type HistorialDataSource = "supabase" | "mock";

/**
 * Resultado de getHistorialRows: filas y origen para mostrar en la UI.
 */
export interface GetHistorialRowsResult {
  rows: HistorialRow[];
  source: HistorialDataSource;
}

/**
 * Obtiene las filas de historial desde Supabase (tabla `historial`) filtradas por el usuario logueado.
 * noStore() evita que Next.js cachee esta petición.
 */
export async function getHistorialRows(): Promise<GetHistorialRowsResult> {
  noStore();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      if (process.env.NODE_ENV === "development") {
        console.log("[FitTrack] Historial: sin usuario, devolviendo vacío");
      }
      return { rows: [], source: "supabase" };
    }
    const { data, error } = await supabase
      .from("historial")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: true });
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[FitTrack] Historial Supabase error:", error.message);
      }
      return { rows: MOCK_HISTORIAL, source: "mock" };
    }
    if (!data || data.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("[FitTrack] Historial: tabla vacía en Supabase");
      }
      return { rows: [], source: "supabase" };
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[FitTrack] Historial: cargado desde SUPABASE (tabla historial)", data.length, "filas");
    }
    return {
      rows: data.map((r) => mapHistorialDbToRow(r as HistorialRowDb)),
      source: "supabase",
    };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log("[FitTrack] Historial: Supabase no configurado o error, usando MOCK", e);
    }
    return { rows: MOCK_HISTORIAL, source: "mock" };
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

