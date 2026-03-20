const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function cleanSpaces(s) {
  return (s ?? "").toString().replace(/\s+/g, " ").trim();
}


export async function getProspects({
  desde,
  hasta,
  advisorName,
  project,
  page = 1,
  records = 20,
}) {
  const url =
    `${BACKEND}/api/prospects` +
    `?createdDate=${encodeURIComponent(desde)}` +
    `&untilDate=${encodeURIComponent(hasta || desde)}` +
    `&advisor=${encodeURIComponent(advisorName || "")}` +
    `&project=${encodeURIComponent(project || "")}` +
    `&page=${encodeURIComponent(page)}` +
    `&records=${encodeURIComponent(records)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return await res.json();
}


export async function getProspectEvents({ prospectId, projectCode }) {
  const url = `${BACKEND}/api/prospects/${encodeURIComponent(prospectId)}/events-enriched?projectCode=${encodeURIComponent(projectCode)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json(); 
}