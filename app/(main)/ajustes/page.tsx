import CsvUploader from "@/components/settings/CsvUploader";

export default function AjustesPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold text-zinc-100">Ajustes</h1>
      <p className="mt-2 text-zinc-400">
        Gestiona tu perfil y tu rutina de entrenamiento.
      </p>

      <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8">
        <CsvUploader />
      </section>
    </div>
  );
}
