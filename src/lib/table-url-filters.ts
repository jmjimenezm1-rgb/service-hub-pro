export function sincronizarFiltros(
  anteriores: Record<string, string>,
  filtros: { label: string; param?: string }[],
  busqueda: Record<string, unknown>,
): Record<string, string> {
  const siguientes = { ...anteriores };
  for (const filtro of filtros) {
    if (!filtro.param) continue;
    const valor = busqueda[filtro.param];
    siguientes[filtro.label] = valor == null || valor === "" ? "todos" : String(valor);
  }
  return siguientes;
}

export function sincronizarChecks(
  anteriores: Record<string, boolean>,
  checks: { label: string; param?: string; paramValor?: string; porDefecto?: boolean }[],
  busqueda: Record<string, unknown>,
): Record<string, boolean> {
  const siguientes = { ...anteriores };
  for (const check of checks) {
    if (!check.param) continue;
    const valor = busqueda[check.param];
    const desactivar = valor != null && valor !== "" &&
      (check.paramValor === undefined || check.paramValor === String(valor));
    siguientes[check.label] = desactivar ? false : check.porDefecto !== false;
  }
  return siguientes;
}