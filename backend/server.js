
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const xml2js = require("xml2js");

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
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      console.error("Fetch error URL:", url);
      console.error("Response text:", text);
      throw new Error(`HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error("fetchJson error:", err.message);
    throw err;
  }
}

function headersBI() {
  return { Authorization: process.env.SMART_HOME_BI_USERKEY };
}

function headersAPI() {
  return { Authorization: process.env.SMART_HOME_API_KEY };
}

const PROJECT_CODE_BY_NAME = {
  [norm("Cañon de Arizona Bungalow Luxury Living Club")]: "17c89d4e",
  [norm("Ciudad Country Laguna Mar Bungalow Coliving Club")]: "48c9266a",
  [norm("Rio Claro Luxury Living Club")]: "5ad1b166",
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

function getDatesBetween(start, end) {
  const dates = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}


app.get("/health", (req, res) => res.json({ ok: true }));


const { XMLParser } = require("fast-xml-parser");

app.get("/api/prospects/:prospectId/events-enriched", async (req, res) => {
  try {
    const { prospectId } = req.params;
    const projectCode = req.query.projectCode;
    if (!projectCode) return res.status(400).json({ error: "projectCode requerido" });

    const url = `${API}/api/v1/getProspectEvents/${CLIENT}/${projectCode}/${prospectId}/`;
    const eventsRaw = await fetchJson(url, { headers: headersAPI() });
    const events = Array.isArray(eventsRaw?.events) ? eventsRaw.events : [];

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

   const enriched = await Promise.all(events.map(async (e) => {
  let asesor = `User ${e.userId || ""}`;
  if (e.userId) {
    try {
      const userUrl = `${API}/api/v1/getUser/${CLIENT}/${e.userId}`;
      const userRes = await fetch(userUrl, { headers: headersAPI() });
      const text = await userRes.text();

      if (text.trim().startsWith("<")) {
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const parsed = parser.parse(text);

        // Buscamos el User dinámicamente
        let user = parsed?.V1Control?.UserResponse?.users?.User;
        if (Array.isArray(user)) user = user[0]; // si viene como array
        if (user && (user.firstName || user.lastName)) {
          asesor = `${user.firstName || ""} ${user.lastName || ""}`.trim();
        }
      } else {
        const data = JSON.parse(text);
        if (data?.firstName || data?.lastName) {
          asesor = `${data.firstName || ""} ${data.lastName || ""}`.trim();
        }
      }

    } catch (err) {
      console.error("Error fetching user:", err.message);
    }
  }

  return {
    fecha: e.date || e.startTime || "",
    asesor,
    nota: e.content || "",
    raw: e,
  };
}));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// User info endpoint
// ======================
app.get("/api/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const url = `${API}/api/v1/getUser/${CLIENT}/${userId}`;
    const response = await fetch(url, { headers: headersAPI() });
    const text = await response.text();

    let name = `User ${userId}`;
    if (text.trim().startsWith("<")) {
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(text);
      const user = result?.['V1Control.UserResponse']?.users?.['V1Control.UserResponse.User'];
      if (user) name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    } else {
      const data = JSON.parse(text);
      if (data?.firstName || data?.lastName) name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    }

    res.json({ name });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.json({ name: `User ${req.params.userId}` });
  }
});

// ======================
// Prospects endpoint
// ======================
app.get("/api/prospects", async (req, res) => {
  try {
    const { createdDate, untilDate, advisor, project, page = 1, records = 20 } = req.query;
    if (!createdDate) return res.status(400).json({ error: "createdDate requerido" });

    const encrypted = process.env.SMART_HOME_ENCRYPTED;
    if (!encrypted) return res.status(500).json({ error: "SMART_HOME_ENCRYPTED no configurado" });

    const safeEncrypted = encodeURIComponent(encrypted);
    const dates = untilDate ? getDatesBetween(createdDate, untilDate) : [createdDate];

    let allRecords = [];

    for (const d of dates) {
      const url = `${MANAGE}/api/bi/getProspectDetail/${safeEncrypted}/?page=1&records=500&createdDate=${d}`;
      console.log("Fetching SMART HOME BI:", url);
      const data = await fetchJson(url, { headers: headersBI() });
      if (Array.isArray(data?.records)) allRecords.push(...data.records);
    }

    let filtered = allRecords
      .map((r) => {
        const proyectoNombre = cleanSpaces(r.Proyecto || "");
        return {
          prospectId: r.ProspectId,
          cliente: cleanSpaces(r.Nombre_del_Cliente || ""),
          telefono: cleanSpaces(r.Celular || r.Telefono || ""),
          probabilidad: r.Probabilidad ?? "",
          asesor: cleanSpaces(r.Asesor || ""),
          proyectoNombre,
          projectCode: getProjectCode(proyectoNombre),
          fechaCreacion: r.Fecha_de_Creacion,
          fuenteUbicacionCliente: cleanSpaces(r.Fuente_de_Ubicacion_Cliente || ""),
          fuenteUbicacionProspecto: cleanSpaces(r.Fuente_de_Ubicacion_Prospecto || "")
        };
      })
      .filter((x) => x.prospectId);

    if (advisor) filtered = filtered.filter((x) => norm(x.asesor) === norm(advisor));
    if (project) filtered = filtered.filter((x) => norm(x.proyectoNombre).includes(norm(project)));

    const pageNum = parseInt(page);
    const limit = parseInt(records);
    const start = (pageNum - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    res.json({
      page: pageNum,
      totalRecords: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      records: paginated,
    });
  } catch (err) {
    console.error("ERROR /api/prospects:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// Events endpoint (raw)
// ======================
app.get("/api/prospects/:prospectId/events", async (req, res) => {
  try {
    const { prospectId } = req.params;
    const projectCode = req.query.projectCode;
    if (!projectCode) return res.status(400).json({ error: "projectCode requerido" });

    const url = `${API}/api/v1/getProspectEvents/${CLIENT}/${projectCode}/${prospectId}/`;
    const data = await fetchJson(url, { headers: headersAPI() });
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ======================
// CRM upload XLSX
// ======================
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

// ======================
// CRM contacts
// ======================
app.get("/api/crm/contacts", (req, res) => {
  try {
    const advisor = req.query.advisor;
    if (!advisor) return res.status(400).json({ error: "advisor requerido" });

    const sheetKey = SHEET_BY_ADVISOR[norm(advisor)];
    if (!sheetKey) return res.status(400).json({ error: "No tengo mapeo hoja->asesor para ese nombre" });

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