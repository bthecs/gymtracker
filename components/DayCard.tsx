"use client";

import Link from "next/link";
import { Dumbbell, Coffee } from "lucide-react";
import type { DaySummary } from "@/lib/types";

interface DayCardProps {
  day: DaySummary;
}

/** Ícono por grupo muscular o descanso */
function DayIcon({ isRestDay }: { isRestDay: boolean }) {
  return isRestDay ? (
    <Coffee className="h-6 w-6 text-zinc-500" />
  ) : (
    <Dumbbell className="h-6 w-6 text-emerald-400" />
  );
}

export default function DayCard({ day }: DayCardProps) {
  const { dia, grupoMuscular, duracion, isRestDay } = day;
  const slug = dia.toLowerCase().normalize("NFD").replace(/\u0301/g, ""); // sin tildes para URL

  return (
    <article
      className={`flex w-full flex-col rounded-xl p-4 transition-colors md:p-5 ${
        isRestDay
          ? "bg-zinc-900/50 text-zinc-500"
          : "bg-zinc-900 text-zinc-100"
      }`}
    >
      <h3
        className={`text-base font-semibold md:text-lg ${
          isRestDay ? "text-zinc-500" : "text-zinc-100"
        }`}
      >
        {dia}
      </h3>
      <p className="mt-0.5 text-sm text-zinc-400">
        {isRestDay ? "Día de Descanso" : grupoMuscular}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <DayIcon isRestDay={isRestDay} />
        <span className="text-sm text-zinc-500">
          {isRestDay ? "—" : duracion}
        </span>
      </div>
      <Link
        href={isRestDay ? "#" : `/actividades/${slug}`}
        className={`mt-4 flex w-full min-h-[44px] items-center justify-center rounded-lg py-3 text-sm font-semibold transition-colors ${
          isRestDay
            ? "cursor-default bg-zinc-800 text-zinc-500"
            : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:opacity-90"
        }`}
      >
        Ver Rutina
      </Link>
    </article>
  );
}
