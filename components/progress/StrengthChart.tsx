"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface EvolucionPoint {
  fecha: string;
  peso: number;
}

interface StrengthChartProps {
  ejercicios: string[];
  datosPorEjercicio: Record<string, EvolucionPoint[]>;
  defaultEjercicio?: string;
}

function formatFecha(v: string): string {
  try {
    const d = new Date(v);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return v;
  }
}

export default function StrengthChart(props: StrengthChartProps) {
  const { ejercicios, datosPorEjercicio, defaultEjercicio } = props;
  const first = defaultEjercicio ?? ejercicios[0] ?? "";
  const [ejercicio, setEjercicio] = useState(first);
  const data = datosPorEjercicio[ejercicio] ?? [];

  return (
    <div className="rounded-xl bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold text-zinc-100">
        Evolución de Fuerza
      </h2>
      <div className="mt-4">
        <select
          value={ejercicio}
          onChange={(e) => setEjercicio(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {ejercicios.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="fecha"
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={{ stroke: "#27272a" }}
              axisLine={{ stroke: "#27272a" }}
              tickFormatter={formatFecha}
            />
            <YAxis
              dataKey="peso"
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={{ stroke: "#27272a" }}
              axisLine={{ stroke: "#27272a" }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${v} kg`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fafafa",
              }}
              labelStyle={{ color: "#a1a1aa" }}
              formatter={(value: number) => [`${value} kg`, "Peso"]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
              activeDot={{
                r: 6,
                fill: "#10b981",
                stroke: "#0f0f0f",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
