export default function ProspectsTable({ prospects, onClickRow }) {
  return (
    <div className="bg-white shadow rounded mb-8">
      <div className="border-b p-4">
        <h3 className="font-bold">Prospectos (SmartHome)</h3>
      </div>

      <table className="w-full">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-left">Teléfono</th>

            <th className="p-2 text-left">% Prob.</th>
            <th className="p-2 text-left">fuente de ubicacion</th>
            <th className="p-2 text-left">En CRM</th>
          </tr>
        </thead>

        <tbody>
          {prospects.length === 0 ? (
            <tr>
              <td className="p-3 text-gray-600" colSpan={4}>
                Sin resultados.
              </td>
            </tr>
          ) : (
            prospects.map((p) => (
              <tr
                key={p.prospectId}
                onClick={() => onClickRow(p)}
                className={
                  (p.enCRM ? "bg-green-100" : "bg-gray-50") +
                  " border-b hover:bg-yellow-100 cursor-pointer"
                }
              >
                <td className="p-2">{p.cliente}</td>
                <td className="p-2">{p.telefono}</td>

                <td className="p-2">
                  {p.probabilidad === "" ? "" : `${p.probabilidad}%`}{" "}
                </td>
                <td className="p-2">{p.fuenteUbicacion}</td>

                <td className="p-2 font-bold">{p.enCRM ? "SI" : "NO"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
