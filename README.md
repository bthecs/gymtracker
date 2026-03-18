# FitTrack - Rutinas de Gimnasio

App web en **Next.js (App Router)** + **Tailwind CSS** para gestionar rutinas de gimnasio en modo oscuro.

## Stack

- **Next.js** (App Router)
- **Tailwind CSS** (tema oscuro), **lucide-react**, **recharts**
- **Supabase** (`@supabase/supabase-js`) como origen de datos

## Configuración (Supabase)

1. Copia `.env.local.example` a `.env.local` y rellena tus credenciales de Supabase (Settings → API).
2. **Login con Google (OAuth):** en Supabase → Authentication → URL configuration, añade en **Redirect URLs** la URL de callback, por ejemplo `http://localhost:3000/auth/callback` (dev) y `https://tudominio.com/auth/callback` (prod). El flujo usa `signInWithOAuth` y la ruta `app/auth/callback`.
3. Crea en Supabase las tablas con el SQL del editor SQL:

```sql
-- Tabla de rutinas (plan semanal)
create table rutinas (
  id uuid default gen_random_uuid() primary key,
  dia text not null,
  grupo_muscular text,
  duracion text,
  ejercicio text not null,
  series text,
  repeticiones text
);

-- Tabla de historial (registros de entrenamiento)
create table historial (
  id uuid default gen_random_uuid() primary key,
  fecha date not null,
  ejercicio text not null,
  peso_kg numeric not null default 0,
  series_completadas int not null default 0,
  repeticiones_completadas int not null default 0,
  creado_en timestamptz default now()
);

-- Detalle por serie (carga detallada en el día de entrenamiento)
-- Ejecuta si la tabla historial ya existe:
-- alter table historial add column if not exists detalle_series jsonb;
```

### Columna `detalle_series` (historial)

Guarda un array JSON por fila, p. ej. `[{"serie":1,"peso":20,"reps":10},...]`. En modo general de la app se envía `null`.

```sql
alter table historial add column if not exists detalle_series jsonb;
```

```sql
-- Opcional: RLS (permite anon read/insert si usas anon key)
alter table rutinas enable row level security;
alter table historial enable row level security;
create policy "Allow read rutinas" on rutinas for select using (true);
create policy "Allow read historial" on historial for select using (true);
create policy "Allow insert historial" on historial for insert with check (true);
```

Si no configuras `.env.local`, la app usa datos mock (rutinas e historial en `lib/mockData.ts` y `lib/historialMock.ts`).

### Cómo confirmar que usa Supabase

1. **Variables de entorno**: Crea `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Reinicia el servidor (`npm run dev`) después de cambiar env.
2. **Indicador en pantalla** (solo en desarrollo): En la esquina inferior derecha verás un badge **"Datos: Supabase"** (verde) si está configurado, o **"Datos: Demo (mock)"** (ámbar) si no.
3. **Consola del servidor**: Al cargar `/actividades` o `/progreso` verás en la terminal mensajes como `[FitTrack] Rutinas: cargadas desde SUPABASE X filas` o `[FitTrack] Historial: cargado desde SUPABASE X filas`. Si usas mock, verás "usando datos MOCK".
4. **Dashboard de Supabase**: En tu proyecto → Logs o Table Editor puedes ver las lecturas/inserciones en las tablas.

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
- **/progreso** → gráficos de evolución
- **/ajustes** (Rutina) → gestión de rutina y CSV

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
