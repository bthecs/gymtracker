import { createClient } from "@/utils/supabase/client";

/**
 * Payload para insertar un registro en historial (desde el cliente).
 */
export type DetalleSerieHistorial = {
  serie: number;
  peso: number;
  reps: number;
};

export interface HistorialInsertItem {
  ejercicio: string;
  peso_kg: number;
  series_completadas: number;
  repeticiones_completadas: number;
  /** JSONB en Supabase; null en modo general */
  detalle_series: DetalleSerieHistorial[] | null;
}

/**
 * Inserta registros en la tabla historial con la fecha actual y el user_id del usuario logueado.
 * Usar desde el cliente (ej. al pulsar "Finalizar Entrenamiento").
 */
export async function insertHistorialRegistros(
  items: HistorialInsertItem[]
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Debes iniciar sesión para guardar") };
  const now = new Date().toISOString();
  const fecha = now.slice(0, 10);
  const rows = items.map((item) => ({
    user_id: user.id,
    fecha,
    ejercicio: item.ejercicio,
    peso_kg: item.peso_kg,
    series_completadas: item.series_completadas,
    repeticiones_completadas: item.repeticiones_completadas,
    detalle_series: item.detalle_series,
    creado_en: now,
  }));
  const { error } = await supabase.from("historial").insert(rows);
  return { error: error ? new Error(error.message) : null };
}
