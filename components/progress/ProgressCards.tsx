"use client";

import { Flame, Calendar, Dumbbell } from "lucide-react";

interface ProgressCardsProps {
  rachaDias?: number;
  sesionesMes?: number;
  volumenKg?: number;
}

export default function ProgressCards({
  rachaDias = 4,
  sesionesMes = 16,
  volumenKg = 12500,
}: ProgressCardsProps) {
  const displayCards = [
    { icon: Flame, title: "Racha Actual", value: `${rachaDias} Días` },
    { icon: Calendar, title: "Entrenamientos en el mes", value: `${sesionesMes} Sesiones` },
    { icon: Dumbbell, title: "Volumen Total Movido", value: `${volumenKg.toLocaleString("es")} kg` },
  ];

  return (
    <>
      {/* Móvil: carrusel horizontal con scroll y snap */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:hidden [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {displayCards.map(({ icon: Icon, title, value }) => (
          <div
            key={title}
            className="min-w-[85%] shrink-0 snap-center rounded-xl bg-zinc-900 p-5"
          >
            <Icon className="h-7 w-7 text-emerald-400" aria-hidden />
            <p className="mt-2 text-sm text-zinc-400">{title}</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{value}</p>
          </div>
        ))}
      </div>
      {/* Desktop: grid 3 columnas */}
      <div className="hidden grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:grid">
        {displayCards.map(({ icon: Icon, title, value }) => (
          <div key={title} className="rounded-xl bg-zinc-900 p-5">
            <Icon className="h-7 w-7 text-emerald-400" aria-hidden />
            <p className="mt-2 text-sm text-zinc-400">{title}</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
