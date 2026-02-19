export default function AdvisorSearch({ value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">Buscar asesor</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: angelica, zuluaga, avila..."
        className="w-full border rounded px-3 py-2 bg-white"
      />
    </div>
  );
}
