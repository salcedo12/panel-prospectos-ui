const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MANAGE = process.env.SMARTHOME_MANAGE_BASE;
const API = process.env.SMARTHOME_API_BASE;
const CLIENT = process.env.SMARTHOME_CLIENT || "ac00771c";

function cleanSpaces(s) {
  return (s ?? "").toString().replace(/\s+/g, " ").trim();
}

function norm(s) {
  return cleanSpaces(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${String(text).slice(0, 300)}`);
  return data;
}

function headersBI() {
  return { Authorization: process.env.SMART_HOME_BI_USERKEY };
}

function headersAPI() {
  return { Authorization: process.env.SMART_HOME_API_KEY };
}

/**
 * Mapeo flexible: cualquier variante del nombre del proyecto -> projectCode
 * (se compara usando norm())
 */
const PROJECT_CODE_BY_NAME = {
  [norm("Cañon de Arizona Bungalow Luxury Living Club")]: "17c89d4e",
  [norm("Ciudad Country Laguna Mar Bungalow Coliving Club")]: "48c9266a",
  [norm("Rio Claro Luxury Living Club")]: "5ad1b166",

  [norm("Cañon de Arizona")]: "17c89d4e",
  [norm("Cañon de arizona")]: "17c89d4e",
  [norm("Canon de Arizona")]: "17c89d4e",

  [norm("Ciudad Country Laguna Mar")]: "48c9266a",
  [norm("Laguna Mar")]: "48c9266a",
  [norm("Laguna mar")]: "48c9266a",

  [norm("Rio Claro")]: "5ad1b166",
  [norm("Río Claro")]: "5ad1b166",
};

function getProjectCode(projectName) {
  return PROJECT_CODE_BY_NAME[norm(projectName)] || null;
}

let crmSheets = {};

const SHEET_BY_ADVISOR = {
  [norm("Angelica Reyes")]: "angelica",
  [norm("Luisa Zuluaga")]: "luisa",
  [norm("Juana María Ávila Rojas")]: "juana",
  [norm("Edwin Mauricio Ramirez Vega")]: "edwin",
  [norm("Angelica Acevedo")]: "acevedo",
  [norm("Luis Carlos Machado")]: "luis",
  [norm("Claudia Patricia Bolaños Vega")]: "claudia",
  [norm("Beatriz Adriana Garzón")]: "beatriz",
  [norm("Alexander Zuluaga Santacruz")]: "alexander",
};

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => res.json({ ok: true }));

/**
 * GET /api/prospects
 * Query:
 *  - createdDate=YYYY-MM-DD (requerido)
 *  - advisor=texto (opcional, filtra por nombre asesor)
 *  - project=texto (opcional, filtra por proyecto)
 *  - page, records (opcional)
 */
app.get("/api/prospects", async (req, res) => {
  try {
    const createdDate = req.query.createdDate;
    const advisor = req.query.advisor;
    const project = req.query.project; // <-- NUEVO
    const page = req.query.page || 1;
    const records = req.query.records || 50;

    if (!createdDate) return res.status(400).json({ error: "createdDate requerido YYYY-MM-DD" });

    const encrypted = process.env.SMART_HOME_ENCRYPTED;
    if (!encrypted) return res.status(500).json({ error: "SMART_HOME_ENCRYPTED no configurado" });

    const safeEncrypted = encodeURIComponent(encrypted);
    const url = `${MANAGE}/api/bi/getProspectDetail/${safeEncrypted}/?page=${page}&records=${records}&createdDate=${createdDate}`;

    const data = await fetchJson(url, { headers: headersBI() });
    const list = Array.isArray(data?.records) ? data.records : [];

    const normalized = list
      .map((r) => {
        const proyectoNombre = cleanSpaces(r.Proyecto || "");
        const projectCode = getProjectCode(proyectoNombre);

        const telefono = cleanSpaces(r.Celular || r.Telefono || "");
        const asesor = cleanSpaces(r.Asesor || "");

        return {
          prospectId: r.ProspectId,
          proyectoNombre,
          projectCode,
          asesor,
          probabilidad: r.Probabilidad ?? "",
          telefono,
          fechaCreacion: r.Fecha_de_Creacion || "",
          raw: r,
        };
      })
      .filter((x) => x.prospectId);

    // 1) filtro por advisor (como ya lo tenías)
    let filtered = advisor
      ? normalized.filter((x) => norm(x.asesor).includes(norm(advisor)))
      : normalized;

    // 2) filtro por project (NUEVO)
    // - si project es vacío o "todos", no filtra
    const projectNorm = norm(project);
    const ignoreProject =
      !projectNorm || projectNorm === "todos" || projectNorm === "todas" || projectNorm === "all";

    if (!ignoreProject) {
      const codeWanted = getProjectCode(project);

      if (codeWanted) {
        // Filtra por projectCode cuando lo podemos mapear (recomendado)
        filtered = filtered.filter((x) => x.projectCode === codeWanted);
      } else {
        // Si no hay mapeo, intenta filtrar por nombre normalizado (fallback)
        filtered = filtered.filter((x) => norm(x.proyectoNombre).includes(projectNorm));
      }
    }

    res.json({ records: filtered });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/prospects/:prospectId/events", async (req, res) => {
  try {
    const { prospectId } = req.params;
    const projectCode = req.query.projectCode;

    if (!projectCode) return res.status(400).json({ error: "projectCode requerido (ej: 48c9266a)" });

    const url = `${API}/api/v1/getProspectEvents/${CLIENT}/${projectCode}/${prospectId}/`;
    const data = await fetchJson(url, { headers: headersAPI() });

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/crm/upload-xlsx", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Falta archivo (field name: file)" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames || [];

    const result = {};

    for (const sheetName of sheetNames) {
      const ws = workbook.Sheets[sheetName];
      if (!ws) continue;

      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const mapped = rows
        .map((r) => ({
          sheet: sheetName,
          name: cleanSpaces(r["Nombre del Contacto"]),
          source: cleanSpaces(r["Fuente"]),
          createdAt: cleanSpaces(r["Creada el"]),
          phone: cleanSpaces(r["Número de teléfono"]),
          tags: cleanSpaces(r["Etiquetas"]),
          followers: cleanSpaces(r["Seguidores"]),
          assignedUser: cleanSpaces(r["Usuario asignado"]),
          raw: r,
        }))
        .filter((x) => x.name || x.phone);

      result[norm(sheetName)] = mapped;
    }

    crmSheets = result;

    res.json({
      ok: true,
      sheets: sheetNames,
      totalSheets: sheetNames.length,
      totalRows: Object.values(result).reduce((acc, arr) => acc + arr.length, 0),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/crm/contacts", (req, res) => {
  try {
    const advisor = req.query.advisor;
    if (!advisor) return res.status(400).json({ error: "advisor requerido" });

    const sheetKey = SHEET_BY_ADVISOR[norm(advisor)];
    if (!sheetKey) {
      return res.status(400).json({
        error: "No tengo mapeo hoja->asesor para ese nombre",
        advisor,
      });
    }

    const data = crmSheets[norm(sheetKey)] || [];
    res.json({ records: data, sheet: sheetKey });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
