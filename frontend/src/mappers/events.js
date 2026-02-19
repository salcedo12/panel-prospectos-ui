export function mapEvent(apiItem) {
  const fecha = apiItem?.fecha ?? apiItem?.Fecha ?? apiItem?.createdDate ?? apiItem?.CreatedDate ?? apiItem?.Date ?? "";
  const asesor = apiItem?.asesor ?? apiItem?.Asesor ?? apiItem?.User ?? apiItem?.Agent ?? "";
  const nota =
    apiItem?.nota ??
    apiItem?.Nota ??
    apiItem?.bitacora ??
    apiItem?.Bitacora ??
    apiItem?.description ??
    apiItem?.Description ??
    "";

  return {
    fecha: String(fecha),
    asesor: String(asesor),
    nota: String(nota),
    raw: apiItem,
  };
}

export function mapEventList(apiResponse) {
  const list = Array.isArray(apiResponse)
    ? apiResponse
    : apiResponse?.events || apiResponse?.items || apiResponse?.data || [];
  return list.map(mapEvent);
}
