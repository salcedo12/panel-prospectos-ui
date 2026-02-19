const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function cleanSpaces(s) {
  return (s ?? "").toString().replace(/\s+/g, " ").trim();
}

export async function getProspects({ desde, advisorName, page = 1, records = 100 }) {
  const url =
    `${BACKEND}/api/prospects` +
    `?createdDate=${encodeURIComponent(desde)}` +
    `&page=${encodeURIComponent(page)}` +
    `&records=${encodeURIComponent(records)}` +
    `&advisor=${encodeURIComponent(advisorName)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const list = Array.isArray(data?.records) ? data.records : [];

  return list.map((r) => ({
    prospectId: r.prospectId,
    cliente: cleanSpaces(r.raw?.Nombre_del_Cliente || ""),
    telefono: cleanSpaces(r.telefono),
    probabilidad: r.probabilidad ?? "",
    asesor: cleanSpaces(r.asesor),
    proyectoNombre: cleanSpaces(r.proyectoNombre),
    projectCode: r.projectCode,
    enCRM: false,
    raw: r.raw,
  }));
}

export async function getProspectEvents({ prospectId, projectCode }) {
  const url =
    `${BACKEND}/api/prospects/${encodeURIComponent(prospectId)}/events` +
    `?projectCode=${encodeURIComponent(projectCode)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const events = Array.isArray(data?.events) ? data.events : [];

  return events.map((e) => ({
    fecha: e.date || e.startTime || "",
    asesor: e.userId ? `User ${e.userId}` : "Sistema",
    nota: cleanSpaces(e.content || ""),
    accion: cleanSpaces(e.action || ""),
    raw: e,
  }));
}
