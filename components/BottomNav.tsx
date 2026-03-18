"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/actividades", label: "Actividades", icon: Dumbbell },
  { href: "/progreso", label: "Progreso", icon: TrendingUp },
  { href: "/ajustes", label: "Rutina", icon: ClipboardList },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const isActividades =
    pathname === "/actividades" || pathname.startsWith("/actividades/");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-zinc-800 bg-zinc-900/95 py-2 safe-area-inset-bottom md:hidden"
      role="navigation"
      aria-label="Navegación principal"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          label === "Actividades" ? isActividades : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors active:opacity-80 ${
              isActive ? "text-emerald-400" : "text-zinc-400"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
      <SignOutButton variant="bottom" />
    </nav>
  );
}
