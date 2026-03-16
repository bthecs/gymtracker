import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getRutinaRows } from "@/lib/data";
import { getDaySummaryBySlug, getExercisesForDay } from "@/lib/data";
import { slugToDia } from "@/lib/utils";
import ExerciseItem from "@/components/ExerciseItem";

interface PageProps {
  params: { dia: string };
}

export default async function DiaPage({ params }: PageProps) {
  const { dia: slug } = params;
  const diaNombre = slugToDia(slug);
  if (!diaNombre) notFound();

  const rows = await getRutinaRows();
  const daySummary = getDaySummaryBySlug(rows, slug);
  const exercises = getExercisesForDay(rows, diaNombre);

  if (!daySummary) notFound();

  const { grupoMuscular } = daySummary;

  return (
    <div className="p-8">
      <Link
        href="/actividades"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
      >
        <ChevronLeft className="h-5 w-5" />
        Volver a la semana
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-zinc-100 md:text-3xl">
        {diaNombre}: {grupoMuscular || "Sin rutina"}
      </h1>

      <div className="flex flex-col gap-3">
        {exercises.length === 0 ? (
          <p className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-zinc-400">
            No hay ejercicios para este día.
          </p>
        ) : (
          exercises.map((exercise, index) => (
            <ExerciseItem key={`${exercise.nombre}-${index}`} exercise={exercise} index={index} />
          ))
        )}
      </div>

      {exercises.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Finalizar Entrenamiento
          </button>
        </div>
      )}
    </div>
  );
}
