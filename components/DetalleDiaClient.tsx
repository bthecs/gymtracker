"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Exercise } from "@/lib/types";
import ExerciseItem, { type ExerciseItemState } from "@/components/ExerciseItem";
import { insertHistorialRegistros } from "@/lib/historialClient";

interface DetalleDiaClientProps {
  diaNombre: string;
  grupoMuscular: string;
  exercises: Exercise[];
}

function parseSeries(s: string): number {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 1 : Math.max(1, n);
}

export default function DetalleDiaClient({
  diaNombre,
  grupoMuscular,
  exercises,
}: DetalleDiaClientProps) {
  const [states, setStates] = useState<ExerciseItemState[]>(() =>
    exercises.map(() => ({
      completed: false,
      pesoKg: 0,
      repeticionesCompletadas: 0,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  const resetLocalState = useCallback(() => {
    setStates(
      exercises.map(() => ({
        completed: false,
        pesoKg: 0,
        repeticionesCompletadas: 0,
      }))
    );
  }, [exercises]);

  const handleStateChange = useCallback((index: number, state: ExerciseItemState) => {
    setStates((prev) => {
      const next = [...prev];
      next[index] = state;
      return next;
    });
  }, []);

  const handleFinalizar = useCallback(async () => {
    const completedItems = exercises
      .map((ex, i) => ({ ex, state: states[i] }))
      .filter(({ state }) => state.completed);
    if (completedItems.length === 0) {
      setToast("error");
      setToastMessage("Marca al menos un ejercicio como completado.");
      setTimeout(() => { setToast(null); setToastMessage(null); }, 3000);
      return;
    }
    setIsLoading(true);
    setToast(null);
    const items = completedItems.map(({ ex, state }) => ({
      ejercicio: ex.nombre,
      peso_kg: state.pesoKg || 0,
      series_completadas: parseSeries(ex.series) || 1,
      repeticiones_completadas: state.repeticionesCompletadas || parseSeries(ex.repeticiones) || 10,
    }));
    const { error } = await insertHistorialRegistros(items);
    setIsLoading(false);
    if (error) {
      setToast("error");
      setToastMessage(error.message);
      setTimeout(() => { setToast(null); setToastMessage(null); }, 3000);
      return;
    }
    setToast("success");
    setToastMessage("¡Serie guardada!");
    setTimeout(() => { setToast(null); setToastMessage(null); }, 3000);
    resetLocalState();
    router.refresh();
  }, [exercises, states, resetLocalState, router]);

  if (exercises.length === 0) {
    return (
      <p className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-zinc-400">
        No hay ejercicios para este día.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {exercises.map((exercise, index) => (
          <ExerciseItem
            key={`${exercise.nombre}-${index}`}
            exercise={exercise}
            index={index}
            state={states[index]!}
            onStateChange={(state) => handleStateChange(index, state)}
          />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className={`fixed left-4 right-4 top-20 z-50 rounded-lg px-4 py-3 text-center text-sm font-medium md:left-1/2 md:right-auto md:w-auto md:max-w-sm md:-translate-x-1/2 ${
            toast === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast === "success" ? toastMessage : (toastMessage ?? "Error al guardar.")}
        </div>
      )}

      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 md:static md:z-auto md:mt-8 md:flex md:justify-end md:px-0">
        <button
          type="button"
          onClick={handleFinalizar}
          disabled={isLoading}
          className="w-full min-h-[48px] rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed md:w-auto md:min-h-0"
        >
          {isLoading ? "Guardando…" : "Finalizar Entrenamiento"}
        </button>
      </div>
    </>
  );
}
