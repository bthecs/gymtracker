"use client";

import { Dumbbell } from "lucide-react";
import type { Exercise } from "@/lib/types";

export interface ExerciseItemState {
  completed: boolean;
  pesoKg: number;
  repeticionesCompletadas: number;
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
  const { completed, pesoKg, repeticionesCompletadas } = state;

  const handleCompleted = () => {
    onStateChange({ ...state, completed: !state.completed });
  };

  const handlePesoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) || 0;
    onStateChange({ ...state, pesoKg: v >= 0 ? v : 0 });
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10) || 0;
    onStateChange({ ...state, repeticionesCompletadas: v >= 0 ? v : 0 });
  };

  const defaultReps = parseReps(repeticiones) || 10;

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
          aria-label={completed ? "Marcar como no completado" : "Marcar como completado"}
        >
          {completed && (
            <span className="h-3 w-3 rounded-full bg-emerald-500 md:h-2.5 md:w-2.5" />
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Peso (kg)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={pesoKg || ""}
            onChange={handlePesoChange}
            placeholder="0"
            className="min-h-[44px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Reps completadas</span>
          <input
            type="number"
            min={0}
            value={repeticionesCompletadas || ""}
            onChange={handleRepsChange}
            placeholder={String(defaultReps)}
            className="min-h-[44px] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
      </div>
    </div>
  );
}
