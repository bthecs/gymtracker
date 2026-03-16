import { ChevronDown } from "lucide-react";
import { getHistorialRows } from "@/lib/historialData";
import {
  getTrainedDates,
  getRachaActual,
  getSesionesEnMes,
  getVolumenTotal,
  getEjerciciosUnicos,
  getEvolucionPorEjercicio,
} from "@/lib/historialData";
import ProgressCards from "@/components/progress/ProgressCards";
import ActivityHeatmap from "@/components/progress/ActivityHeatmap";
import StrengthChart from "@/components/progress/StrengthChart";

/** Siempre datos frescos de Supabase. */
export const dynamic = "force-dynamic";

export default async function ProgresoPage() {
  const { rows } = await getHistorialRows();
  const trainedDates = getTrainedDates(rows);
  const trainedDatesList = Array.from(trainedDates);

  const now = new Date();
  const rachaDias = getRachaActual(trainedDates);
  const sesionesMes = getSesionesEnMes(
    trainedDates,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const volumenKg = getVolumenTotal(rows, startOfMonth, endOfMonth);

  const ejercicios = getEjerciciosUnicos(rows);
  const defaultEjercicio = "Press de banca con barra";
  const datosPorEjercicio: Record<string, { fecha: string; peso: number }[]> = {};
  for (const e of ejercicios) {
    datosPorEjercicio[e] = getEvolucionPorEjercicio(rows, e);
  }

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">Mi Progreso</h1>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          Últimos 30 días
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </button>
      </div>

      <section className="mb-8">
        <ProgressCards
          rachaDias={rachaDias}
          sesionesMes={sesionesMes}
          volumenKg={volumenKg}
        />
      </section>

      <section className="mb-8">
        <ActivityHeatmap trainedDatesList={trainedDatesList} daysToShow={30} />
      </section>

      <section>
        <StrengthChart
          ejercicios={ejercicios.length > 0 ? ejercicios : [defaultEjercicio]}
          datosPorEjercicio={
            Object.keys(datosPorEjercicio).length > 0
              ? datosPorEjercicio
              : { [defaultEjercicio]: [] }
          }
          defaultEjercicio={defaultEjercicio}
        />
      </section>
    </div>
  );
}
