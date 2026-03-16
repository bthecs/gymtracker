import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getRutinaRows } from "@/lib/data";
import { getDaySummaryBySlug, getExercisesForDay } from "@/lib/data";
import { slugToDia } from "@/lib/utils";
import DetalleDiaClient from "@/components/DetalleDiaClient";

/** Siempre datos frescos de Supabase. */
export const dynamic = "force-dynamic";

interface PageProps {
  params: { dia: string };
}

export default async function DiaPage({ params }: PageProps) {
  const { dia: slug } = params;
  const diaNombre = slugToDia(slug);
  if (!diaNombre) notFound();

  const { rows } = await getRutinaRows();
  const daySummary = getDaySummaryBySlug(rows, slug);
  const exercises = getExercisesForDay(rows, diaNombre);

  if (!daySummary) notFound();

  const { grupoMuscular } = daySummary;

  return (
    <div className="px-4 pb-28 pt-4 md:p-8 md:pb-8">
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

      <DetalleDiaClient
        diaNombre={diaNombre}
        grupoMuscular={grupoMuscular}
        exercises={exercises}
      />
    </div>
  );
}
