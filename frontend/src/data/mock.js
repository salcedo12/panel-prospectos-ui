export const projects = [
  { id: "CANON", name: "Cañon de Arizona" },
  { id: "LAGUNA", name: "Laguna Mar" },
  { id: "RIO", name: "Rio Claro" },
];

export const prospectsMock = [
  {
    ProspectId: "7a048342-0426-444a-80a4-544b1b09346f",
    Cliente: "rodrigo gomez",
    Telefono: "3122636772",
    Probabilidad: 10,
    Asesor: "Angelica Reyes",
    Proyecto: "LAGUNA",
    EnCRM: true,
  },
  {
    ProspectId: "45121d0e-0300-4bca-bd8d-a9459bdcb69d",
    Cliente: "wilmer santos",
    Telefono: "3108042781",
    Probabilidad: 20,
    Asesor: "Luis Eduardo Salcedo",
    Proyecto: "LAGUNA",
    EnCRM: false,
  },
];

export const eventsMockByProspectId = {
  "7a048342-0426-444a-80a4-544b1b09346f": [
    {
      fecha: "2026-02-10",
      asesor: "Angelica Reyes",
      nota: "Se ha actualizado el detalle de la oportunidad del cliente...",
    },
    { fecha: "2026-02-10", asesor: "Angelica Reyes", nota: "No contesta, en seguimiento." },
  ],
  "45121d0e-0300-4bca-bd8d-a9459bdcb69d": [
    { fecha: "2026-02-11", asesor: "Luis Eduardo Salcedo", nota: "Se llamó y quedó pendiente." },
  ],
};

export const crmMock = [
  { advisor: "Angelica Reyes", name: "rodrigo gomez", phone: "3122636772" },
  { advisor: "Angelica Reyes", name: "juan", phone: "3152812369" },
  { advisor: "Luis Eduardo Salcedo", name: "wilmer santos", phone: "3108042781" },
];
