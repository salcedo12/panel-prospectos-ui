import { useState } from "react";
import { uploadCrmXlsx } from "../services/crmService";

export default function XlsxUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const subir = async () => {
    setErr("");
    setMsg("");
    if (!file) return setErr("Selecciona un archivo .xlsx");

    setLoading(true);
    try {
      const r = await uploadCrmXlsx(file);
      setMsg(`Cargado: ${r.totalRows} filas · ${r.totalSheets} hojas`);
      onUploaded?.(r);
    } catch (e) {
      setErr(e.message || "Error subiendo archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold">Cargar Excel Asimpro (.xlsx)</p>
          <p className="text-sm text-gray-600">
            Debe tener hojas: angelica, luisa, juana, etc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={subir}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "Subiendo..." : "Subir"}
          </button>
        </div>
      </div>

      {msg ? <p className="text-sm text-gray-700 mt-2">{msg}</p> : null}
      {err ? <p className="text-sm text-red-600 mt-2">{err}</p> : null}
    </div>
  );
}
