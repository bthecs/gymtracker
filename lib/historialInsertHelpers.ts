import type { Exercise } from "@/lib/types";
import type { ExerciseItemState } from "@/components/ExerciseItem";
import type { HistorialInsertItem } from "@/lib/historialClient";

function parseRepsHint(s: string): number {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 10 : n;
}

/**
 * Construye el payload de historial según modo general o detallado por serie.
 */
export function buildHistorialItem(
  exercise: Exercise,
  state: ExerciseItemState
): { item: HistorialInsertItem | null; error?: string } {
  if (state.detailedMode) {
    const detalle = state.seriesRows
      .map((r, i) => ({ serie: i + 1, peso: r.peso, reps: r.reps }))
      .filter((r) => r.peso > 0 || r.reps > 0);
    if (detalle.length === 0) {
      return {
        item: null,
        error: `Completa al menos una serie en "${exercise.nombre}" (peso o reps).`,
      };
    }
    const conPeso = detalle.filter((r) => r.peso > 0);
    const pesoPromedio =
      conPeso.length > 0
        ? conPeso.reduce((s, r) => s + r.peso, 0) / conPeso.length
        : 0;
    const repsTotal = detalle.reduce((s, r) => s + (r.reps > 0 ? r.reps : 0), 0);
    return {
      item: {
        ejercicio: exercise.nombre,
        peso_kg: Math.round(pesoPromedio * 10) / 10,
        series_completadas: detalle.length,
        repeticiones_completadas: repsTotal,
        detalle_series: detalle,
      },
    };
  }
  return {
    item: {
      ejercicio: exercise.nombre,
      peso_kg: state.pesoKg || 0,
      series_completadas: Math.max(1, state.seriesCompletadas),
      repeticiones_completadas:
        state.repeticionesCompletadas > 0
          ? state.repeticionesCompletadas
          : parseRepsHint(exercise.repeticiones),
      detalle_series: null,
    },
  };
}
