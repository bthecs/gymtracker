import { getRutinaRows } from "@/lib/data";
import { getWeeklySummary } from "@/lib/data";
import DayCard from "@/components/DayCard";

export default async function ActividadesPage() {
  const rows = await getRutinaRows();
  const summary = getWeeklySummary(rows);

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100 md:text-3xl">
          Mis Rutinas
        </h1>
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
      {/* Móvil: lista vertical una columna; escritorio: grid */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        {summary.map((day) => (
          <DayCard key={day.dia} day={day} />
        ))}
      </div>
    </div>
  );
}
