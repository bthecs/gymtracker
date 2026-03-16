import { DIAS_SEMANA } from "./types";

/**
 * Convierte slug de URL (ej. "lunes", "miercoles") al nombre del día con mayúscula.
 */
export function slugToDia(slug: string): string | null {
  const normalized = slug.toLowerCase().trim();
  const found = DIAS_SEMANA.find(
    (d) => d.toLowerCase().normalize("NFD").replace(/\u0301/g, "") === normalized
  );
  return found ?? null;
}
