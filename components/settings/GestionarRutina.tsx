"use client";

import { useState, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  CloudUpload,
  FileSpreadsheet,
  CheckCircle,
  Trash2,
  X,
  Plus,
  ListPlus,
} from "lucide-react";
import { DIAS_SEMANA } from "@/lib/types";
import {
  replaceUserRutinas,
  CONFIRM_REPLACE_RUTINA,
  type RutinaInsertPayload,
} from "@/lib/saveUserRutina";

type TabId = "manual" | "csv";

const CSV_TEMPLATE = `dia,grupo_muscular,ejercicio,series,repeticiones
Lunes,Pecho y Tríceps,Press de banca con barra,4,8-10
Lunes,Pecho y Tríceps,Aperturas con mancuernas,3,12
Martes,Espalda y Bíceps,Remo con barra,4,10`;

interface ParsedCsvRow {
  dia?: string;
  grupo_muscular?: string;
  ejercicio?: string;
  series?: string;
  repeticiones?: string;
  duracion?: string;
  Dia?: string;
  GrupoMuscular?: string;
  Ejercicio?: string;
  Series?: string;
  Repeticiones?: string;
  Duracion?: string;
}

function normalizeCsvRow(row: ParsedCsvRow): RutinaInsertPayload | null {
  const dia = (row.dia ?? row.Dia ?? "").trim();
  const ejercicio = (row.ejercicio ?? row.Ejercicio ?? "").trim();
  if (!dia && !ejercicio) return null;
  return {
    dia,
    grupo_muscular: (row.grupo_muscular ?? row.GrupoMuscular ?? "").trim(),
    ejercicio,
    series: parseInt(String(row.series ?? row.Series ?? "0"), 10) || 0,
    repeticiones: String(row.repeticiones ?? row.Repeticiones ?? "").trim(),
    duracion: (row.duracion ?? row.Duracion ?? "").trim() || undefined,
  };
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_rutina.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type ManualItem = RutinaInsertPayload & { key: string };

export default function GestionarRutina() {
  const router = useRouter();
  const formId = useId();
  const [tab, setTab] = useState<TabId>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast(type);
    setToastMessage(message);
    setTimeout(() => {
      setToast(null);
      setToastMessage("");
    }, 4000);
  }, []);

  const runSave = useCallback(
    async (rows: RutinaInsertPayload[]) => {
      if (!window.confirm(CONFIRM_REPLACE_RUTINA)) return;
      setIsLoading(true);
      try {
        const { error } = await replaceUserRutinas(rows);
        if (error) {
          showToast("error", error.message);
          return;
        }
        showToast("success", "Rutina guardada correctamente.");
        router.refresh();
        return true;
      } catch (e) {
        showToast("error", e instanceof Error ? e.message : "Error inesperado.");
      } finally {
        setIsLoading(false);
      }
      return false;
    },
    [showToast, router]
  );

  /* ——— Manual ——— */
  const [dia, setDia] = useState("Lunes");
  const [grupoMuscular, setGrupoMuscular] = useState("");
  const [ejercicio, setEjercicio] = useState("");
  const [series, setSeries] = useState<number | "">("");
  const [repeticiones, setRepeticiones] = useState("");
  const [manualList, setManualList] = useState<ManualItem[]>([]);

  const addManual = useCallback(() => {
    if (!ejercicio.trim()) {
      showToast("error", "Indica el nombre del ejercicio.");
      return;
    }
    if (series === "" || Number(series) < 1) {
      showToast("error", "Las series deben ser al menos 1.");
      return;
    }
    const item: ManualItem = {
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      dia,
      grupo_muscular: grupoMuscular.trim(),
      ejercicio: ejercicio.trim(),
      series: Number(series),
      repeticiones: repeticiones.trim() || "—",
    };
    setManualList((prev) => [...prev, item]);
    setEjercicio("");
    setSeries("");
    setRepeticiones("");
  }, [dia, grupoMuscular, ejercicio, series, repeticiones, showToast]);

  const removeManual = useCallback((key: string) => {
    setManualList((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const saveManual = useCallback(async () => {
    if (manualList.length === 0) {
      showToast("error", "Añade al menos un ejercicio a la lista.");
      return;
    }
    const rows: RutinaInsertPayload[] = manualList.map(
      ({ key: _k, ...r }) => r
    );
    const ok = await runSave(rows);
    if (ok) {
      setManualList([]);
      setGrupoMuscular("");
    }
  }, [manualList, runSave, showToast]);

  /* ——— CSV ——— */
  const [csvStep, setCsvStep] = useState<"upload" | "preview">("upload");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<RutinaInsertPayload[]>([]);
  const [csvAll, setCsvAll] = useState<RutinaInsertPayload[]>([]);

  const applyCsvText = useCallback(
    (text: string, file: File) => {
      const result = Papa.parse<ParsedCsvRow>(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (result.errors.length > 0) {
        showToast("error", "El CSV tiene errores de formato.");
        return;
      }
      const parsed = result.data
        .map(normalizeCsvRow)
        .filter((r): r is RutinaInsertPayload => r !== null && !!r.ejercicio);
      if (parsed.length === 0) {
        showToast("error", "El CSV no contiene filas válidas.");
        return;
      }
      setCsvAll(parsed);
      setCsvPreview(parsed.slice(0, 3));
      setCsvFile(file);
      setCsvStep("preview");
    },
    [showToast]
  );

  const handleCsvFile = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        showToast("error", "Selecciona un archivo .csv");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const bad =
          text.includes("\uFFFD") ||
          /Ã[³²º¼½¾ª¯]|Ã©|Ã­|Ã¡|Ãº|Ã±/.test(text);
        if (bad) {
          const r2 = new FileReader();
          r2.onload = () => applyCsvText(r2.result as string, selectedFile);
          r2.readAsText(selectedFile, "ISO-8859-1");
          return;
        }
        applyCsvText(text, selectedFile);
      };
      reader.readAsText(selectedFile, "UTF-8");
    },
    [applyCsvText, showToast]
  );

  const resetCsv = useCallback(() => {
    setCsvFile(null);
    setCsvPreview([]);
    setCsvAll([]);
    setCsvStep("upload");
  }, []);

  const saveCsv = useCallback(async () => {
    if (csvAll.length === 0) return;
    const ok = await runSave(csvAll);
    if (ok) resetCsv();
  }, [csvAll, runSave, resetCsv]);

  const csvColumns = [
    "dia",
    "grupo_muscular",
    "ejercicio",
    "series",
    "repeticiones",
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">
          Gestionar rutina
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Carga ejercicio a ejercicio o importa un CSV. Al guardar se reemplaza
          toda tu rutina actual.
        </p>
      </div>

      <div
        role="tablist"
        className="flex gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "manual"}
          onClick={() => setTab("manual")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "manual"
              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ListPlus className="h-4 w-4" />
          Carga manual
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "csv"}
          onClick={() => setTab("csv")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "csv"
              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Importar CSV
        </button>
      </div>

      {tab === "manual" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6">
          <form
            id={formId}
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              addManual();
            }}
          >
            <div className="sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Día
              </label>
              <select
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Grupo muscular
              </label>
              <input
                type="text"
                value={grupoMuscular}
                onChange={(e) => setGrupoMuscular(e.target.value)}
                placeholder="Pecho y Tríceps"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Ejercicio
              </label>
              <input
                type="text"
                value={ejercicio}
                onChange={(e) => setEjercicio(e.target.value)}
                placeholder="Press de banca con barra"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Series
              </label>
              <input
                type="number"
                min={1}
                value={series}
                onChange={(e) =>
                  setSeries(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="4"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Repeticiones
              </label>
              <input
                type="text"
                value={repeticiones}
                onChange={(e) => setRepeticiones(e.target.value)}
                placeholder="8-10"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Añadir a la lista
              </button>
            </div>
          </form>

          {manualList.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-zinc-400">
                Ejercicios a guardar ({manualList.length})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-zinc-700">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 bg-zinc-800/80">
                      <th className="px-3 py-2 font-medium text-zinc-400">
                        Día
                      </th>
                      <th className="px-3 py-2 font-medium text-zinc-400">
                        Grupo
                      </th>
                      <th className="px-3 py-2 font-medium text-zinc-400">
                        Ejercicio
                      </th>
                      <th className="px-3 py-2 font-medium text-zinc-400">
                        S
                      </th>
                      <th className="px-3 py-2 font-medium text-zinc-400">
                        Reps
                      </th>
                      <th className="w-12 px-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {manualList.map((row) => (
                      <tr
                        key={row.key}
                        className="border-b border-zinc-800 last:border-0"
                      >
                        <td className="px-3 py-2 text-zinc-200">{row.dia}</td>
                        <td className="px-3 py-2 text-zinc-300">
                          {row.grupo_muscular || "—"}
                        </td>
                        <td className="px-3 py-2 text-zinc-100">
                          {row.ejercicio}
                        </td>
                        <td className="px-3 py-2 text-zinc-200">
                          {row.series}
                        </td>
                        <td className="px-3 py-2 text-zinc-200">
                          {row.repeticiones}
                        </td>
                        <td className="px-2">
                          <button
                            type="button"
                            onClick={() => removeManual(row.key)}
                            disabled={isLoading}
                            className="rounded p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                            aria-label="Quitar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={saveManual}
                disabled={isLoading || manualList.length === 0}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {isLoading ? (
                  "Guardando…"
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Guardar rutina manual
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "csv" && (
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6">
          <p className="text-sm text-zinc-400">
            Columnas:{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400/90">
              dia, grupo_muscular, ejercicio, series, repeticiones
            </code>
          </p>
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-sm font-medium text-emerald-500 underline underline-offset-2 hover:text-emerald-400"
          >
            Descargar plantilla CSV
          </button>

          {csvStep === "upload" && (
            <div
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleCsvFile(f);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-950/50 py-12 px-6"
            >
              <CloudUpload className="h-12 w-12 text-zinc-500" />
              <p className="mt-3 text-center text-sm text-zinc-300">
                Arrastra tu .csv o selecciónalo
              </p>
              <label className="mt-4 cursor-pointer">
                <span className="inline-flex rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20">
                  Seleccionar archivo .csv
                </span>
                <input
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCsvFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}

          {csvStep === "preview" && csvFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-9 w-9 text-emerald-500" />
                  <div>
                    <p className="font-medium text-zinc-100">{csvFile.name}</p>
                    <p className="text-xs text-zinc-500">
                      {csvAll.length} filas
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetCsv}
                  disabled={isLoading}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border border-zinc-700">
                <p className="border-b border-zinc-700 px-4 py-2 text-xs text-zinc-500">
                  Vista previa (3 primeras filas)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-700 bg-zinc-800/80">
                        {csvColumns.map((c) => (
                          <th
                            key={c}
                            className="px-4 py-2 font-medium text-zinc-400"
                          >
                            {c.replace("_", " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-800">
                          {csvColumns.map((c) => (
                            <td key={c} className="px-4 py-2 text-zinc-200">
                              {String(row[c] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetCsv}
                  disabled={isLoading}
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveCsv}
                  disabled={isLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 sm:flex-none"
                >
                  {isLoading ? (
                    "Guardando…"
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Guardar rutina desde CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div
          role="alert"
          className={`fixed left-4 right-4 top-20 z-50 rounded-lg px-4 py-3 text-center text-sm font-medium md:left-1/2 md:right-auto md:max-w-sm md:-translate-x-1/2 ${
            toast === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
