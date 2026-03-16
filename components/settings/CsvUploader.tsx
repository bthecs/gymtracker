"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  CloudUpload,
  FileSpreadsheet,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const CSV_TEMPLATE = `dia,grupo_muscular,duracion,ejercicio,series,repeticiones
Lunes,Pecho y Tríceps,60 min,Press de banca con barra,4,8-10
Lunes,Pecho y Tríceps,60 min,Aperturas con mancuernas,3,12
Martes,Espalda y Bíceps,55 min,Remo con barra,4,10
Miércoles,Piernas,70 min,Sentadillas,4,10-12`;

type UploadStep = "upload" | "preview";

interface ParsedRow {
  dia?: string;
  grupo_muscular?: string;
  duracion?: string;
  ejercicio?: string;
  series?: string;
  repeticiones?: string;
  Dia?: string;
  GrupoMuscular?: string;
  Duracion?: string;
  Ejercicio?: string;
  Series?: string;
  Repeticiones?: string;
}

function normalizeRow(row: ParsedRow): Record<string, unknown> {
  return {
    dia: (row.dia ?? row.Dia ?? "").trim(),
    grupo_muscular: (row.grupo_muscular ?? row.GrupoMuscular ?? "").trim(),
    duracion: (row.duracion ?? row.Duracion ?? "").trim(),
    ejercicio: (row.ejercicio ?? row.Ejercicio ?? "").trim(),
    series: parseInt(String(row.series ?? row.Series ?? "0"), 10) || 0,
    repeticiones: String(row.repeticiones ?? row.Repeticiones ?? "").trim(),
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

export default function CsvUploader() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [allRows, setAllRows] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<"success" | "error" | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast(type);
    setToastMessage(message);
    setTimeout(() => {
      setToast(null);
      setToastMessage("");
    }, 4000);
  }, []);

  const applyParsedFile = useCallback(
    (text: string, selectedFile: File) => {
      const result = Papa.parse<ParsedRow>(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (result.errors.length > 0) {
        showToast("error", "El CSV tiene errores de formato.");
        return;
      }
      const normalized = result.data.map(normalizeRow).filter((r) => r.ejercicio || r.dia);
      if (normalized.length === 0) {
        showToast("error", "El CSV no contiene filas válidas.");
        return;
      }
      setAllRows(normalized);
      setPreviewRows(normalized.slice(0, 3));
      setFile(selectedFile);
      setStep("preview");
    },
    [showToast]
  );

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        showToast("error", "Por favor selecciona un archivo .csv");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const hasReplacement = text.includes("\uFFFD");
        const hasMojibake = /Ã[³²º¼½¾ª¯]|Ã©|Ã­|Ã¡|Ãº|Ã±/.test(text);
        const likelyWrongEncoding = hasReplacement || hasMojibake;
        if (likelyWrongEncoding) {
          const readerLatin1 = new FileReader();
          readerLatin1.onload = () => {
            applyParsedFile(readerLatin1.result as string, selectedFile);
          };
          readerLatin1.readAsText(selectedFile, "ISO-8859-1");
          return;
        }
        applyParsedFile(text, selectedFile);
      };
      reader.readAsText(selectedFile, "UTF-8");
    },
    [showToast, applyParsedFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleCancel = useCallback(() => {
    setFile(null);
    setPreviewRows([]);
    setAllRows([]);
    setStep("upload");
  }, []);

  const handleSave = useCallback(async () => {
    if (allRows.length === 0) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showToast("error", "Debes iniciar sesión para guardar la rutina.");
        setIsLoading(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from("rutinas")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        showToast("error", "Error al limpiar rutina anterior: " + deleteError.message);
        setIsLoading(false);
        return;
      }

      const datosFormateados = allRows.map((row) => ({
        dia: row.dia,
        grupo_muscular: row.grupo_muscular,
        duracion: row.duracion,
        ejercicio: row.ejercicio,
        series: Number(row.series) || 0,
        repeticiones: String(row.repeticiones ?? ""),
        user_id: user.id,
      }));

      const { error: insertError } = await supabase
        .from("rutinas")
        .insert(datosFormateados);

      if (insertError) {
        showToast("error", "Error al guardar: " + insertError.message);
        setIsLoading(false);
        return;
      }

      showToast("success", "Rutina actualizada correctamente.");
      router.refresh();
      handleCancel();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [allRows, showToast, router, handleCancel]);

  const columns = ["dia", "grupo_muscular", "duracion", "ejercicio", "series", "repeticiones"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Mi Rutina Actual</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Sube tu plan de entrenamiento en formato CSV para asociarlo a tu cuenta.
        </p>
        <button
          type="button"
          onClick={downloadTemplate}
          className="mt-2 text-sm font-medium text-emerald-500 underline underline-offset-2 hover:text-emerald-400"
        >
          Descargar plantilla CSV
        </button>
      </div>

      {step === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900/50 py-12 px-6 transition-colors hover:border-zinc-500"
        >
          <CloudUpload className="h-12 w-12 text-zinc-500" aria-hidden />
          <p className="mt-3 text-center text-sm text-zinc-300">
            Haz clic para seleccionar o arrastra tu archivo .csv aquí
          </p>
          <label className="mt-4 cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
              Seleccionar archivo .csv
            </span>
            <input
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={handleInputChange}
              aria-label="Seleccionar archivo CSV"
            />
          </label>
        </div>
      )}

      {step === "preview" && file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-9 w-9 text-emerald-500" aria-hidden />
              <div>
                <p className="font-medium text-zinc-100">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {(file.size / 1024).toFixed(1)} KB · {allRows.length} filas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50"
              aria-label="Quitar archivo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
            <p className="border-b border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-500">
              Vista previa (primeras 3 filas)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-700 bg-zinc-800/80">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 font-medium capitalize text-zinc-400"
                      >
                        {col.replace("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-zinc-800 last:border-0"
                    >
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-zinc-200">
                          {String(row[col] ?? "")}
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
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                "Guardando…"
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Guardar Rutina
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="alert"
          className={`fixed left-4 right-4 top-20 z-50 rounded-lg px-4 py-3 text-center text-sm font-medium md:left-1/2 md:right-auto md:w-auto md:max-w-sm md:-translate-x-1/2 ${
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
