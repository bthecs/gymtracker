import type { RutinaRow } from "./types";

/**
 * Datos mock con la misma estructura que el CSV de Google Sheets.
 * Se usan cuando SHEET_CSV_URL está vacío o falla la carga.
 */
export const MOCK_RUTINA_ROWS: RutinaRow[] = [
  { Dia: "Lunes", GrupoMuscular: "Pecho y Tríceps", Duracion: "60 min", Ejercicio: "Press de banca plano", Series: "4", Repeticiones: "10-12" },
  { Dia: "Lunes", GrupoMuscular: "Pecho y Tríceps", Duracion: "60 min", Ejercicio: "Aperturas con mancuernas", Series: "3", Repeticiones: "12-15" },
  { Dia: "Lunes", GrupoMuscular: "Pecho y Tríceps", Duracion: "60 min", Ejercicio: "Fondos en paralelas", Series: "3", Repeticiones: "10-12" },
  { Dia: "Lunes", GrupoMuscular: "Pecho y Tríceps", Duracion: "60 min", Ejercicio: "Extensiones de tríceps en polea", Series: "3", Repeticiones: "12" },
  { Dia: "Martes", GrupoMuscular: "Espalda y Bíceps", Duracion: "55 min", Ejercicio: "Dominadas", Series: "3", Repeticiones: "8-10" },
  { Dia: "Martes", GrupoMuscular: "Espalda y Bíceps", Duracion: "55 min", Ejercicio: "Remo con barra", Series: "4", Repeticiones: "10" },
  { Dia: "Martes", GrupoMuscular: "Espalda y Bíceps", Duracion: "55 min", Ejercicio: "Curl de bíceps con barra", Series: "3", Repeticiones: "12" },
  { Dia: "Miércoles", GrupoMuscular: "Piernas", Duracion: "70 min", Ejercicio: "Sentadillas", Series: "4", Repeticiones: "10-12" },
  { Dia: "Miércoles", GrupoMuscular: "Piernas", Duracion: "70 min", Ejercicio: "Prensa de piernas", Series: "3", Repeticiones: "12" },
  { Dia: "Miércoles", GrupoMuscular: "Piernas", Duracion: "70 min", Ejercicio: "Peso muerto rumano", Series: "3", Repeticiones: "12" },
  { Dia: "Jueves", GrupoMuscular: "Hombros", Duracion: "45 min", Ejercicio: "Press militar", Series: "4", Repeticiones: "10" },
  { Dia: "Jueves", GrupoMuscular: "Hombros", Duracion: "45 min", Ejercicio: "Elevaciones laterales", Series: "3", Repeticiones: "15" },
  { Dia: "Viernes", GrupoMuscular: "Full Body", Duracion: "50 min", Ejercicio: "Press de banca", Series: "3", Repeticiones: "10" },
  { Dia: "Viernes", GrupoMuscular: "Full Body", Duracion: "50 min", Ejercicio: "Remo al mentón", Series: "3", Repeticiones: "12" },
  { Dia: "Sábado", GrupoMuscular: "Core y Cardio", Duracion: "40 min", Ejercicio: "Plancha", Series: "3", Repeticiones: "45s" },
  { Dia: "Sábado", GrupoMuscular: "Core y Cardio", Duracion: "40 min", Ejercicio: "Running", Series: "1", Repeticiones: "20 min" },
  // Domingo sin filas = Día de Descanso
];
