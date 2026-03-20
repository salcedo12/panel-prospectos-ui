import { useState } from "react";
import AdvisorsPage from "./pages/AdvisorsPage";
import AdvisorDetailPage from "./pages/AdvisorDetailPage";
import { advisors } from "./data/advisors";

export default function App() {
  const [advisorSel, setAdvisorSel] = useState(null);

  const projects = [
    { id: "CANON", name: "Cañon de Arizona" },
    { id: "LAGUNA", name: "Laguna Mar" },
    { id: "RIO", name: "Rio Claro" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Panel Comercial</h1>

      {!advisorSel ? (
        <AdvisorsPage advisors={advisors} onSelect={setAdvisorSel} />
      ) : (
        <AdvisorDetailPage
          advisor={advisorSel}
          projects={projects}
          onBack={() => setAdvisorSel(null)}
        />
      )}
    </div>
  );
}
