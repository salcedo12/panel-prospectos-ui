import AdvisorCard from "./AdvisorCard";

export default function AdvisorGrid({ advisors, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {advisors.map((a) => (
        <AdvisorCard key={a.id} advisor={a} onClick={() => onSelect(a)} />
      ))}
    </div>
  );
}
