import GestionarRutina from "@/components/settings/GestionarRutina";

export default function AjustesPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-zinc-100">Rutina</h1>
      <p className="mt-2 text-zinc-400">
        Edita tu plan semanal y carga ejercicios desde CSV.
      </p>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
        <GestionarRutina />
      </section>
    </div>
  );
}
