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
    <div className="px-4 pb-28 pt-4 md:p-8 md:pb-8">
      {/* En móvil el "volver" está en el header; en desktop mostramos enlace */}
      <Link
        href="/actividades"
        className="mb-4 hidden items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 md:inline-flex"
      >
        <ChevronLeft className="h-5 w-5" />
        Volver a la semana
      </Link>

      <h1 className="mb-6 text-xl font-bold text-zinc-100 md:mb-8 md:text-3xl">
        {diaNombre}: {grupoMuscular || "Sin rutina"}
      </h1>

      <div className="flex flex-col gap-3">
        {exercises.length === 0 ? (
          <p className="rounded-xl bg-zinc-900/50 px-4 py-6 text-center text-zinc-400">
            No hay ejercicios para este día.
          </p>
        ) : (
          exercises.map((exercise, index) => (
            <ExerciseItem
              key={`${exercise.nombre}-${index}`}
              exercise={exercise}
              index={index}
            />
          ))
        )}
      </div>

      {/* Móvil: FAB full-width anclado encima de la bottom nav; desktop: botón alineado a la derecha */}
      {exercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 md:static md:z-auto md:mt-8 md:flex md:justify-end md:px-0">
          <button
            type="button"
            className="w-full min-h-[48px] rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 active:opacity-90 md:w-auto md:min-h-0"
          >
            Finalizar Entrenamiento
          </button>
        </div>
      )}
    </div>
  );
}
