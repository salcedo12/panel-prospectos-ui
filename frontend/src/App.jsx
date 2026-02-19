import { useState } from "react";
import AdvisorsPage from "./pages/AdvisorsPage";
import AdvisorDetailPage from "./pages/AdvisorDetailPage";

import { advisors } from "./data/advisors";
import { projects, crmMock } from "./data/mock";

export default function App() {
  const [advisorSel, setAdvisorSel] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Panel Comercial</h1>

      {!advisorSel ? (
        <AdvisorsPage advisors={advisors} onSelect={setAdvisorSel} />
      ) : (
        <AdvisorDetailPage
          advisor={advisorSel}
          projects={projects}
          crmMock={crmMock}
          onBack={() => setAdvisorSel(null)}
        />
      )}
    </div>
  );
}
