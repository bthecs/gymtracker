import { unstable_noStore as noStore } from "next/cache";
import type { RutinaRow } from "./types";
import { MOCK_RUTINA_ROWS } from "./mockData";
import { DIAS_SEMANA, type DaySummary, type Exercise } from "./types";
import { createClient } from "@/utils/supabase/server";
import type { RutinaRowDb } from "./supabase-types";

/**
 * Mapea una fila de Supabase (snake_case) a RutinaRow (PascalCase).
 */
function mapRutinaRowDbToRutinaRow(r: RutinaRowDb): RutinaRow {
  return {
    Dia: r.dia ?? "",
    GrupoMuscular: r.grupo_muscular ?? "",
    Duracion: r.duracion ?? "",
    Ejercicio: r.ejercicio ?? "",
    Series: String(r.series ?? ""),
    Repeticiones: String(r.repeticiones ?? ""),
  };
}

export type RutinasDataSource = "supabase" | "mock";

/**
 * Resultado de getRutinaRows: filas y origen para mostrar en la UI.
 */
export interface GetRutinaRowsResult {
  rows: RutinaRow[];
  source: RutinasDataSource;
}

/**
 * Obtiene las filas de rutina desde Supabase (tabla `rutinas`) filtradas por el usuario logueado.
 * noStore() evita que Next.js cachee esta petición.
 */
export async function getRutinaRows(): Promise<GetRutinaRowsResult> {
  noStore();
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      if (process.env.NODE_ENV === "development") {
        console.log("[FitTrack] Rutinas: sin usuario, devolviendo vacío");
      }
      return { rows: [], source: "supabase" };
    }
    const { data, error } = await supabase
      .from("rutinas")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[FitTrack] Rutinas Supabase error:", error.message);
      }
      return { rows: MOCK_RUTINA_ROWS, source: "mock" };
    }
    if (!data || data.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("[FitTrack] Rutinas: tabla vacía en Supabase");
      }
      return { rows: [], source: "supabase" };
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[FitTrack] Rutinas: cargadas desde SUPABASE (tabla rutinas)", data.length, "filas");
    }
    return {
      rows: data.map((r) => mapRutinaRowDbToRutinaRow(r as RutinaRowDb)),
      source: "supabase",
    };
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.log("[FitTrack] Rutinas: Supabase no configurado o error, usando MOCK", e);
    }
    return { rows: MOCK_RUTINA_ROWS, source: "mock" };
  }
}

/**
 * Agrupa las filas por día y devuelve un resumen por cada día de la semana.
 */
export function getWeeklySummary(rows: RutinaRow[]): DaySummary[] {
  const byDay = new Map<string, { grupoMuscular: string; duracion: string }>();
  for (const r of rows) {
    const dia = (r.Dia || "").trim();
    if (!dia) continue;
    if (!byDay.has(dia)) {
      byDay.set(dia, { grupoMuscular: r.GrupoMuscular || "", duracion: r.Duracion || "" });
    }
  }
  return DIAS_SEMANA.map((dia) => {
    const info = byDay.get(dia);
    const isRestDay = !info || !info.grupoMuscular;
    return {
      dia,
      grupoMuscular: info?.grupoMuscular ?? "",
      duracion: info?.duracion ?? "",
      isRestDay,
    };
  });
}

/**
 * Devuelve el resumen de un solo día por slug (ej. "lunes").
 */
export function getDaySummaryBySlug(
  rows: RutinaRow[],
  slug: string
): DaySummary | null {
  const summary = getWeeklySummary(rows);
  const normalizedSlug = slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0301/g, "");
  const found = summary.find(
    (s) =>
      s.dia
        .toLowerCase()
        .normalize("NFD")
        .replace(/\u0301/g, "") === normalizedSlug
  );
  return found ?? null;
}

/**
 * Lista de ejercicios para un día dado (por nombre del día).
 */
export function getExercisesForDay(rows: RutinaRow[], diaNombre: string): Exercise[] {
  const normalized = diaNombre.trim();
  return rows
    .filter((r) => (r.Dia || "").trim().toLowerCase() === normalized.toLowerCase())
    .map((r) => ({
      nombre: r.Ejercicio || "",
      series: r.Series || "",
      repeticiones: r.Repeticiones || "",
    }));
}
