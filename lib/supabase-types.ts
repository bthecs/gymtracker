/**
 * Tipos de las tablas de Supabase (snake_case).
 * Usados para mapear respuestas de .from('rutinas') y .from('historial').
 */

export interface RutinaRowDb {
  id: string;
  dia: string;
  grupo_muscular: string;
  duracion: string;
  ejercicio: string;
  series: string;
  repeticiones: string;
}

export interface HistorialRowDb {
  id: string;
  fecha: string;
  ejercicio: string;
  peso_kg: number;
  series_completadas: number;
  repeticiones_completadas: number;
  creado_en: string;
  detalle_series?: { serie: number; peso: number; reps: number }[] | null;
}
