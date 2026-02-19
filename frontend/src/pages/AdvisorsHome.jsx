import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdvisorsHome() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const go = () => {
    if (!name.trim()) return;
    navigate(`/advisor/${encodeURIComponent(name.trim())}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Abrir asesor</h1>

      <div className="mt-3 flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Ej: ANGELICA REYES"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="border rounded px-3 py-2" onClick={go}>
          Entrar
        </button>
      </div>
    </div>
  );
}
