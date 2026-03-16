"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import type { Exercise } from "@/lib/types";

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
}

export default function ExerciseItem({ exercise, index }: ExerciseItemProps) {
  const [completed, setCompleted] = useState(false);
  const { nombre, series, repeticiones } = exercise;

  return (
    <div className="flex w-full items-center gap-3 rounded-xl bg-zinc-900 px-4 py-4 md:gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
        <Dumbbell className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zinc-100">{nombre}</p>
        <p className="text-sm text-zinc-400">
          {series} series x {repeticiones} reps
        </p>
      </div>
      {/* Touch target mínimo 44x44px para pulgar */}
      <button
        type="button"
        onClick={() => setCompleted((c) => !c)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 active:opacity-80 md:h-6 md:w-6"
        aria-label={completed ? "Marcar como no completado" : "Marcar como completado"}
      >
        {completed && (
          <span className="h-3 w-3 rounded-full bg-emerald-500 md:h-2.5 md:w-2.5" />
        )}
      </button>
    </div>
  );
}
