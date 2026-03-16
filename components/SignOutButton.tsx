"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";

type Variant = "sidebar" | "bottom";

export default function SignOutButton({ variant }: { variant: Variant }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-auto flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Cerrar sesión
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 text-zinc-400 transition-colors active:opacity-80"
      aria-label="Cerrar sesión"
    >
      <LogOut className="h-6 w-6 shrink-0" aria-hidden />
      <span className="text-xs font-medium">Salir</span>
    </button>
  );
}
