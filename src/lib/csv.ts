export type CsvValue = string | number | boolean | null | undefined;

export function crearCsv(cabeceras: string[], filas: CsvValue[][]): string {
  const celda = (valor: CsvValue) => {
    const texto = String(valor ?? "");
    // Prevent spreadsheet formulas from executing when opening exported data.
    const seguro = /^[\s]*[=+@-]/.test(texto) ? `'${texto}` : texto;
    return `"${seguro.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + [cabeceras, ...filas].map((fila) => fila.map(celda).join(";")).join("\r\n");
}

export function descargarCsv(nombre: string, cabeceras: string[], filas: CsvValue[][]) {
  const url = URL.createObjectURL(new Blob([crearCsv(cabeceras, filas)], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombre}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}