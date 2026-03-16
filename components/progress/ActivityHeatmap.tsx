"use client";

/**
 * Heatmap tipo GitHub: cuadrados por día.
 * trainedDatesList = array de fechas "YYYY-MM-DD" con entrenamiento.
 * daysToShow = número de días hacia atrás (ej. 30).
 */
interface ActivityHeatmapProps {
  trainedDatesList: string[];
  daysToShow?: number;
}

function getDaysForHeatmap(daysToShow: number): { date: Date; key: string }[] {
  const out: { date: Date; key: string }[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < daysToShow; i++) {
    const key = d.toISOString().slice(0, 10);
    out.push({ date: new Date(d), key });
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

export default function ActivityHeatmap({
  trainedDatesList,
  daysToShow = 30,
}: ActivityHeatmapProps) {
  const trainedDates = new Set(trainedDatesList);
  const days = getDaysForHeatmap(daysToShow);

  return (
    <div className="w-full rounded-xl bg-zinc-900 p-4 md:p-6">
      <h2 className="text-lg font-semibold text-zinc-100">
        Historial de Actividad
      </h2>
      <div
        className="mt-4 grid gap-1.5"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(1rem, 1fr))",
          maxWidth: "100%",
        }}
      >
        {days.map(({ key }) => {
          const trained = trainedDates.has(key);
          return (
            <div
              key={key}
              className={`h-4 w-4 rounded-sm ${trained ? "bg-emerald-500" : "bg-zinc-800"}`}
              title={key}
              aria-label={trained ? `Entrenado ${key}` : `Sin entrenar ${key}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
        <span>Menos</span>
        <div className="h-3.5 w-3.5 rounded-sm bg-zinc-800" />
        <div className="h-3.5 w-3.5 rounded-sm bg-emerald-500" />
        <span>Más</span>
      </div>
    </div>
  );
}
