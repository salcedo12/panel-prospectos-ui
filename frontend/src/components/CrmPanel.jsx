export default function CrmPanel({
  conSeguimiento,
  sinSeguimiento,
  loading,
  error,
  sheet,
}) {
  return (
    <div className="bg-white shadow rounded">
      <div className="border-b p-4">
        <h3 className="font-bold">Asimpro (CRM)</h3>
        <p className="text-sm text-gray-600">
          {sheet ? `Hoja: ${sheet}` : "Cargue el Excel y seleccione asesor."}
        </p>
      </div>

      <div className="p-4">
        {loading ? (
          <p className="text-gray-600 mb-3">Cargando contactos...</p>
        ) : null}
        {error ? <p className="text-red-600 mb-3">{error}</p> : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">Con seguimiento</h4>
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {conSeguimiento.length === 0 ? (
                  <tr>
                    <td className="p-2 text-gray-600" colSpan={2}>
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  conSeguimiento.map((c, i) => (
                    <tr key={i} className="bg-green-100 border-b">
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-bold mb-2">Sin seguimiento</h4>
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {sinSeguimiento.length === 0 ? (
                  <tr>
                    <td className="p-2 text-gray-600" colSpan={2}>
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  sinSeguimiento.map((c, i) => (
                    <tr key={i} className="bg-red-100 border-b">
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
