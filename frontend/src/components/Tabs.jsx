export default function Tabs({ value, onChange, items }) {
  return (
    <div className="mb-4 flex gap-2">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={
              (active ? "bg-black text-white" : "bg-white text-black") +
              " border border-black px-4 py-2 rounded"
            }
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
