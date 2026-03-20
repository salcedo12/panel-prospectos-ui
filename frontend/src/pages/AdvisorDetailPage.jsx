import { useEffect, useState } from "react";
import { getProspects, getProspectEvents } from "../services/prospectsService";
import ProspectModal from "../components/ProspectModal";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

async function fetchUserName(userId) {
  if (!userId) return "Sistema";
  try {
    const res = await fetch(`${BACKEND}/api/user/${userId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.name || `User ${userId}`;
  } catch (err) {
    console.error("Error fetching user name:", err);
    return `User ${userId}`;
  }
}

export async function enrichEvents(events) {
  return Promise.all(
    events.map(async (e) => {
      if (!e.raw.userId) return e;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/api/user/${e.raw.userId}`,
        );
        if (!res.ok) throw new Error("Error fetching user");
        const data = await res.json();
        return { ...e, asesor: data.name || `User ${e.raw.userId}` };
      } catch (err) {
        console.error("Error fetching user:", err);
        return { ...e, asesor: `User ${e.raw.userId}` };
      }
    }),
  );
}
export default function AdvisorDetailPage({ advisor, projects, onBack }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [project, setProject] = useState("");
  const [prospects, setProspects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [prospectSel, setProspectSel] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState("");

  useEffect(() => {
    if (!desde) return;

    async function loadData() {
      try {
        setLoading(true);
        const data = await getProspects({
          desde,
          hasta,
          advisorName: advisor.name,
          project,
          page,
          records,
        });
        setProspects(data.records || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [desde, hasta, project, advisor, page, records]);

  const abrirProspecto = async (p) => {
    setProspectSel(p);
    setModalOpen(true);
    setEvents([]);
    setLoadingEvents(true);
    setErrorEvents("");

    try {
      if (!p.projectCode) throw new Error("Prospecto sin projectCode");

      const list = await getProspectEvents({
        prospectId: p.prospectId,
        projectCode: p.projectCode,
      });

      const enriched = await enrichEvents(list);
      setEvents(enriched);
    } catch (e) {
      setErrorEvents(e.message || "Error cargando eventos");
    } finally {
      setLoadingEvents(false);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setProspectSel(null);
    setEvents([]);
    setErrorEvents("");
  };

  return (
    <div>
      <button onClick={onBack} className="mb-4 bg-gray-300 px-3 py-2 rounded">
        ← Volver
      </button>

      <h2 className="text-2xl font-bold mb-4">{advisor.name}</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={desde}
          onChange={(e) => {
            setDesde(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => {
            setHasta(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        />
        <select
          value={project}
          onChange={(e) => {
            setProject(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="">Todos los proyectos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={records}
          onChange={(e) => {
            setRecords(Number(e.target.value));
            setPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Tabla de prospects */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Cliente</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Proyecto</th>
              <th className="p-2">Probabilidad</th>
              <th className="p-2">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p, i) => (
              <tr
                key={i}
                onClick={() => abrirProspecto(p)}
                className="border-t cursor-pointer hover:bg-gray-100"
              >
                <td className="p-2">{p.cliente}</td>
                <td className="p-2">{p.telefono}</td>
                <td className="p-2">{p.proyectoNombre}</td>
                <td className="p-2">{p.probabilidad}%</td>
                <td className="p-2">{p.fuenteUbicacionProspecto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Siguiente
        </button>
      </div>

      {/* Modal */}
      <ProspectModal
        open={modalOpen}
        prospect={
          prospectSel
            ? {
                Cliente: prospectSel.cliente,
                Telefono: prospectSel.telefono,
                Probabilidad: prospectSel.probabilidad,
                ProspectId: prospectSel.prospectId,
                Fuente: prospectSel.fuenteUbicacionProspecto,
              }
            : null
        }
        events={events}
        onClose={cerrarModal}
      />

      {modalOpen && (
        <div className="mt-2">
          {loadingEvents && <p>Cargando eventos...</p>}
          {errorEvents && <p className="text-red-600">{errorEvents}</p>}
        </div>
      )}
    </div>
  );
}
