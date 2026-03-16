"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Dumbbell, User } from "lucide-react";

/** Cabecera fija para móvil: logo o botón atrás + avatar */
export default function MobileHeader() {
  const pathname = usePathname();
  const isDayDetail =
    pathname.startsWith("/actividades/") && pathname !== "/actividades";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 safe-area-inset-top md:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {isDayDetail ? (
          <Link
            href="/actividades"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-emerald-400 hover:bg-zinc-800 active:opacity-80"
            aria-label="Volver a la semana"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-100 no-underline"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="truncate text-base font-semibold">FitTrack</span>
          </Link>
        )}
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-400">
        <User className="h-5 w-5" />
      </div>
    </header>
  );
}
