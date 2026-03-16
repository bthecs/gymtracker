import { getRutinaRows } from "@/lib/data";
import { getWeeklySummary } from "@/lib/data";
import DayCard from "@/components/DayCard";

export default async function ActividadesPage() {
  const rows = await getRutinaRows();
  const summary = getWeeklySummary(rows);

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">Mis Rutinas</h1>
        <div className="flex h-10 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm text-zinc-300">
          Semana Actual
          <svg
            className="h-4 w-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {summary.map((day) => (
          <DayCard key={day.dia} day={day} />
        ))}
      </div>
    </div>
  );
}
