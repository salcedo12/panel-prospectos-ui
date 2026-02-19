import { useEscapeClose } from "../hooks/useEscapeClose";

export default function ProspectModal({ open, prospect, events, onClose }) {
  useEscapeClose(open, onClose);

  if (!open || !prospect) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-50 w-full max-w-5xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b p-4">
          <div>
            <h3 className="text-lg font-bold">{prospect.Cliente}</h3>
            <p className="text-sm text-gray-600">
              Tel: {prospect.Telefono} · Prob: {prospect.Probabilidad}% ·
              ProspectId:{" "}
              <span className="font-mono text-xs">{prospect.ProspectId}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded bg-black px-3 py-1 text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-2 text-left w-[160px]">Fecha</th>
                <th className="p-2 text-left w-[220px]">Asesor</th>
                <th className="p-2 text-left">Bitácora</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td className="p-2 text-gray-600" colSpan={3}>
                    Sin eventos.
                  </td>
                </tr>
              ) : (
                events.map((e, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 align-top">{e.fecha}</td>
                    <td className="p-2 align-top">{e.asesor}</td>
                    <td className="p-2 whitespace-pre-wrap">{e.nota}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
