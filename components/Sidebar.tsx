"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  TrendingUp,
  Settings,
  User,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/actividades", label: "Actividades", icon: Dumbbell },
  { href: "/progreso", label: "Mi Progreso", icon: TrendingUp },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const isActividades =
    pathname === "/actividades" || pathname.startsWith("/actividades/");

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[260px] flex-col border-r border-zinc-800 bg-zinc-900/95 p-5 md:flex">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-3 text-zinc-100 no-underline"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
          <Dumbbell className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">FitTrack</span>
      </Link>

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
          <User className="h-5 w-5 text-zinc-400" />
        </div>
        <span className="text-sm text-zinc-400">Usuario</span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            label === "Actividades" ? isActividades : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <SignOutButton variant="sidebar" />
    </aside>
  );
}
