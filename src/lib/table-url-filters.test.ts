import { describe, expect, test } from "bun:test";
import { sincronizarChecks, sincronizarFiltros } from "./table-url-filters";
import { crearCsv } from "./csv";

describe("Filtros de navegación", () => {
  const filtros = [{ label: "Estado", param: "estado" }];
  test("el cuadro de clientes activos aplica activos", () => {
    expect(sincronizarFiltros({}, filtros, { estado: "activo" })).toEqual({ Estado: "activo" });
  });
  test("volver sin parámetro elimina el filtro anterior", () => {
    expect(sincronizarFiltros({ Estado: "activo" }, filtros, {})).toEqual({ Estado: "todos" });
  });
  test("quitar estado baja restablece la exclusión marcada por defecto", () => {
    const checks = [{ label: "No mostrar clientes dados de baja", param: "estado", paramValor: "baja" }];
    const bajas = sincronizarChecks({}, checks, { estado: "baja" });
    expect(bajas[checks[0].label]).toBe(false);
    expect(sincronizarChecks(bajas, checks, {})[checks[0].label]).toBe(true);
  });
});

describe("CSV", () => {
  test("protege fórmulas y escapa comillas", () => {
    expect(crearCsv(["Nombre"], [['=SUM(1;2)'], ['Empresa "A"']]))
      .toBe('\uFEFF"Nombre"\r\n"\'=SUM(1;2)"\r\n"Empresa ""A"""');
  });
});