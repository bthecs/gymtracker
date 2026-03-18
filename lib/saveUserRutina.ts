import { createClient } from "@/utils/supabase/client";

export type RutinaInsertPayload = {
  dia: string;
  grupo_muscular: string;
  ejercicio: string;
  series: number;
  repeticiones: string;
  /** Opcional; la app usa duración en resumen semanal */
  duracion?: string;
};

/**
 * Elimina todas las filas de rutinas del usuario e inserta las nuevas.
 */
export async function replaceUserRutinas(
  rows: RutinaInsertPayload[]
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: new Error("Debes iniciar sesión para guardar la rutina.") };
  }
  if (rows.length === 0) {
    return { error: new Error("No hay ejercicios para guardar.") };
  }

  const { error: deleteError } = await supabase
    .from("rutinas")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: new Error(deleteError.message) };
  }

  const payload = rows.map((r) => ({
    dia: r.dia.trim(),
    grupo_muscular: r.grupo_muscular.trim(),
    ejercicio: r.ejercicio.trim(),
    series: Number(r.series) || 0,
    repeticiones: String(r.repeticiones ?? "").trim(),
    duracion: (r.duracion ?? "").trim() || "—",
    user_id: user.id,
  }));

  const { error: insertError } = await supabase.from("rutinas").insert(payload);
  if (insertError) {
    return { error: new Error(insertError.message) };
  }
  return { error: null };
}

export const CONFIRM_REPLACE_RUTINA =
  "Al guardar una nueva rutina, se borrará tu rutina anterior. ¿Deseas continuar?";
