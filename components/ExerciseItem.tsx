"use client";

import { Dumbbell, Plus } from "lucide-react";
import type { Exercise } from "@/lib/types";

export interface SerieDetalleInput {
  peso: number;
  reps: number;
}

export interface ExerciseItemState {
  completed: boolean;
  /** Modo detallado: una fila por serie */
  detailedMode: boolean;
  /** Modo general */
  pesoKg: number;
  repeticionesCompletadas: number;
  seriesCompletadas: number;
  /** Modo detallado: una entrada por serie (incl. extras con +) */
  seriesRows: SerieDetalleInput[];
}

export function createInitialExerciseState(exercise: Exercise): ExerciseItemState {
  const n = parseSeries(exercise.series);
  return {
    completed: false,
    detailedMode: false,
    pesoKg: 0,
    repeticionesCompletadas: 0,
    seriesCompletadas: n,
    seriesRows: Array.from({ length: n }, () => ({ peso: 0, reps: 0 })),
  };
}

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
  state: ExerciseItemState;
  onStateChange: (state: ExerciseItemState) => void;
}

function parseSeries(s: string): number {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 1 : Math.max(1, n);
}

function parseReps(s: string): number {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 0 : n;
}

export default function ExerciseItem({
  exercise,
  index,
  state,
  onStateChange,
}: ExerciseItemProps) {
  const { nombre, series, repeticiones } = exercise;
  const {
    completed,
    detailedMode,
    pesoKg,
    repeticionesCompletadas,
    seriesCompletadas,
    seriesRows,
  } = state;

  const defaultReps = parseReps(repeticiones) || 10;

  const ensureSeriesRows = (count: number): SerieDetalleInput[] => {
    const rows = [...seriesRows];
    while (rows.length < count) rows.push({ peso: 0, reps: 0 });
    return rows;
  };

  const handleToggleDetailed = () => {
    if (!detailedMode) {
      const n = parseSeries(series);
      onStateChange({
        ...state,
        detailedMode: true,
        seriesRows: Array.from({ length: n }, () => ({ peso: 0, reps: 0 })),
      });
    } else {
      onStateChange({
        ...state,
        detailedMode: false,
        seriesCompletadas: parseSeries(series),
      });
    }
  };

  const updateSerieRow = (i: number, patch: Partial<SerieDetalleInput>) => {
    const rows = ensureSeriesRows(Math.max(seriesRows.length, i + 1));
    rows[i] = { ...rows[i]!, ...patch };
    onStateChange({ ...state, seriesRows: rows });
  };

  const addExtraSerie = () => {
    onStateChange({
      ...state,
      seriesRows: [...seriesRows, { peso: 0, reps: 0 }],
    });
  };

  const handleCompleted = () => {
    onStateChange({ ...state, completed: !state.completed });
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl bg-zinc-900 px-4 py-4 md:gap-4">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
          <Dumbbell className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-100">{nombre}</p>
          <p className="text-sm text-zinc-400">
            {series} series x {repeticiones} reps
          </p>
        </div>
        <button
          type="button"
          onClick={handleCompleted}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 active:opacity-80 md:h-6 md:w-6"
          aria-label={
            completed ? "Marcar como no completado" : "Marcar como completado"
          }
        >
          {completed && (
            <span className="h-3 w-3 rounded-full bg-emerald-500 md:h-2.5 md:w-2.5" />
          )}
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-3 border-t border-zinc-800 pt-3">
        <button
          type="button"
          role="switch"
          aria-checked={detailedMode}
          onClick={handleToggleDetailed}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            detailedMode ? "bg-emerald-500" : "bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              detailedMode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm text-zinc-300">
          Carga detallada por serie
        </span>
      </label>

      {!detailedMode && (
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">Peso (kg)</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={pesoKg || ""}
              onChange={(e) =>
                onStateChange({
                  ...state,
                  pesoKg: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              placeholder="0"
              className="min-h-[44px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500">Repeticiones</span>
            <input
              type="number"
              min={0}
              value={repeticionesCompletadas || ""}
              onChange={(e) =>
                onStateChange({
                  ...state,
                  repeticionesCompletadas:
                    Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              placeholder={String(defaultReps)}
              className="min-h-[44px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
            <span className="text-xs text-zinc-500">Series completadas</span>
            <input
              type="number"
              min={1}
              value={seriesCompletadas || ""}
              onChange={(e) =>
                onStateChange({
                  ...state,
                  seriesCompletadas: Math.max(
                    1,
                    parseInt(e.target.value, 10) || 1
                  ),
                })
              }
              placeholder={series}
              className="min-h-[44px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
        </div>
      )}

      {detailedMode && (
        <div className="space-y-2 border-t border-zinc-800 pt-3">
          <p className="text-xs font-medium text-zinc-500">
            Peso y reps por serie
          </p>
          <div className="flex flex-col gap-2">
            {seriesRows.map((row, i) => (
              <div
                key={i}
                className="flex flex-wrap items-end gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2"
              >
                <span className="w-16 shrink-0 text-sm text-zinc-400">
                  Serie {i + 1}
                </span>
                <label className="flex flex-1 flex-col gap-0.5 min-w-[100px]">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                    kg
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={row.peso || ""}
                    onChange={(e) =>
                      updateSerieRow(i, {
                        peso: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    placeholder="0"
                    className="min-h-10 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-0.5 min-w-[100px]">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                    reps
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={row.reps || ""}
                    onChange={(e) =>
                      updateSerieRow(i, {
                        reps: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    placeholder={String(defaultReps)}
                    className="min-h-10 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </label>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addExtraSerie}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            Serie extra
          </button>
        </div>
      )}
    </div>
  );
}
