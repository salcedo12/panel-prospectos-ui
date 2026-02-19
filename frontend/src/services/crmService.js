const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export async function uploadCrmXlsx(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BACKEND}/api/crm/upload-xlsx`, {
    method: "POST",
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data; 
}

export async function getCrmContactsByAdvisor(advisorName) {
  const res = await fetch(
    `${BACKEND}/api/crm/contacts?advisor=${encodeURIComponent(advisorName)}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data; 
}
