import { useMemo, useState } from "react";
import AdvisorGrid from "../components/AdvisorGrid";
import AdvisorSearch from "../components/AdvisorSearch";
import { normalizeText } from "../utils/text";

export default function AdvisorsPage({ advisors, onSelect }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = normalizeText(q);
    if (!qq) return advisors;

    return advisors.filter((a) => normalizeText(a.name).includes(qq));
  }, [advisors, q]);

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Asesores</h2>

      <AdvisorSearch value={q} onChange={setQ} />

      <p className="text-sm text-gray-600 mb-3">
        Mostrando {filtered.length} de {advisors.length}
      </p>

      <AdvisorGrid advisors={filtered} onSelect={onSelect} />
    </>
  );
}
