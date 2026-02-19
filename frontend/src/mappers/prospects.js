export function mapProspect(apiItem) {
  // Soporta variaciones de nombres
  const prospectId = apiItem?.ProspectId ?? apiItem?.prospectId ?? apiItem?.id ?? "";
  const cliente = apiItem?.Cliente ?? apiItem?.cliente ?? apiItem?.FullName ?? apiItem?.name ?? "";
  const telefono = apiItem?.Telefono ?? apiItem?.telefono ?? apiItem?.Phone ?? apiItem?.phone ?? "";
  const probabilidad = apiItem?.Probabilidad ?? apiItem?.probabilidad ?? apiItem?.Probability ?? "";
  const asesor = apiItem?.Asesor ?? apiItem?.asesor ?? apiItem?.Agent ?? apiItem?.agent ?? "";
  const proyecto = apiItem?.Proyecto ?? apiItem?.proyecto ?? apiItem?.Project ?? apiItem?.project ?? "";

  return {
    prospectId: String(prospectId),
    cliente: String(cliente),
    telefono: String(telefono),
    probabilidad: probabilidad === "" ? "" : Number(probabilidad),
    asesor: String(asesor),
    proyecto: String(proyecto),
    enCRM: Boolean(apiItem?.EnCRM ?? apiItem?.enCRM ?? false),
    raw: apiItem,
  };
}

export function mapProspectList(apiResponse) {
  const list = Array.isArray(apiResponse)
    ? apiResponse
    : apiResponse?.items || apiResponse?.data || [];
  return list.map(mapProspect);
}
