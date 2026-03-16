/**
 * Una fila del CSV de historial de entrenamiento (o mock).
 * Columnas: Fecha, Ejercicio, Peso_Kg, Series_Completadas, Repeticiones_Completadas
 */
export interface HistorialRow {
  Fecha: string;
  Ejercicio: string;
  Peso_Kg: number;
  Series_Completadas: number;
  Repeticiones_Completadas: number;
}
