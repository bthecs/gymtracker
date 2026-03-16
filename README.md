# FitTrack - Rutinas de Gimnasio

App web en **Next.js (App Router)** + **Tailwind CSS** para gestionar rutinas de gimnasio en modo oscuro.

## Stack

- **Next.js** (App Router)
- **Tailwind CSS** (tema oscuro: `bg-zinc-950`, tarjetas `bg-zinc-900`, acentos `emerald-400` / `emerald-500`)
- **lucide-react** (iconos)
- **papaparse** (lectura de CSV desde Google Sheets)

## Estructura de datos (CSV)

Columnas esperadas: `Dia`, `GrupoMuscular`, `Duracion`, `Ejercicio`, `Series`, `Repeticiones`.

Por defecto se usa `SHEET_CSV_URL = ""` y datos mock en `lib/mockData.ts`. Para usar Google Sheets, exporta la hoja como CSV (publicado en web) y asigna la URL en `lib/data.ts`:

```ts
export const SHEET_CSV_URL = "https://docs.google.com/.../export?format=csv";
```

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/actividades`.

## Rutas

- **/** → redirección a `/actividades`
- **/actividades** → Resumen semanal (7 tarjetas, una por día)
- **/actividades/[dia]** → Detalle del día (ej. `/actividades/lunes`): lista de ejercicios, checkboxes y botón "Finalizar Entrenamiento"
- **/progreso**, **/ajustes** → placeholders

## Estructura de carpetas

```
app/
  layout.tsx      # Layout con Sidebar
  page.tsx        # Redirect a /actividades
  actividades/
    page.tsx      # Vista resumen semanal
    [dia]/page.tsx # Vista detalle del día
components/
  Sidebar.tsx
  DayCard.tsx
  ExerciseItem.tsx
lib/
  types.ts
  mockData.ts
  data.ts         # getRutinaRows, getWeeklySummary, getExercisesForDay
  utils.ts        # slugToDia
```
