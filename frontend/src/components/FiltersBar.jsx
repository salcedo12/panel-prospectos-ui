export default function FiltersBar({
  projects = [],
  project = [],
  setProject = [],
  desde = [],
  setDesde = [],
  hasta = [],
  setHasta = [],
  onBuscar = [],
}) {
  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1">Proyecto</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="border rounded px-3 py-2 bg-white w-full"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border rounded px-3 py-2 bg-white w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border rounded px-3 py-2 bg-white w-full"
          />
        </div>

        <button
          onClick={onBuscar}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
