import Papa from "papaparse";
import type { RutinaRow } from "./types";
import { MOCK_RUTINA_ROWS } from "./mockData";
import { DIAS_SEMANA, type DaySummary, type Exercise } from "./types";

/** URL pública del CSV de Google Sheets. Vacía = usar solo datos mock. */
export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiLph3aoNI65nNxIl680vvm5IcR8KybcrpqTe2fXVuL3dsvkypaFUvxkpp5V9_oNPZnRzsXZ0wWlop/pub?gid=0&single=true&output=csv";

/**
 * Obtiene las filas de rutina: desde CSV si hay URL, si no desde mock.
 */
export async function getRutinaRows(): Promise<RutinaRow[]> {
  if (!SHEET_CSV_URL.trim()) {
    return MOCK_RUTINA_ROWS;
  }
  try {
    const res = await fetch(SHEET_CSV_URL, { next: { revalidate: 60 } });
    const text = await res.text();
    const parsed = Papa.parse<RutinaRow>(text, { header: true, skipEmptyLines: true });
    if (parsed.errors.length > 0) return MOCK_RUTINA_ROWS;
    return parsed.data.length ? parsed.data : MOCK_RUTINA_ROWS;
  } catch {
    return MOCK_RUTINA_ROWS;
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
