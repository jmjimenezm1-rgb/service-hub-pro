import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { sincronizarChecks, sincronizarFiltros } from "./table-url-filters";
import { crearCsv } from "./csv";

describe("Filtros de navegación", () => {
  const filtros = [{ label: "Estado", param: "estado" }];
  test("el cuadro de clientes activos aplica activos", () => {
    assert.deepEqual(sincronizarFiltros({}, filtros, { estado: "activo" }), { Estado: "activo" });
  });
  test("volver sin parámetro elimina el filtro anterior", () => {
    assert.deepEqual(sincronizarFiltros({ Estado: "activo" }, filtros, {}), { Estado: "todos" });
  });
  test("quitar estado baja restablece la exclusión marcada por defecto", () => {
    const checks = [{ label: "No mostrar clientes dados de baja", param: "estado", paramValor: "baja" }];
    const bajas = sincronizarChecks({}, checks, { estado: "baja" });
    assert.equal(bajas["No mostrar clientes dados de baja"], false);
    assert.equal(sincronizarChecks(bajas, checks, {})["No mostrar clientes dados de baja"], true);
  });
});

describe("CSV", () => {
  test("protege fórmulas y escapa comillas", () => {
    assert.equal(crearCsv(["Nombre"], [['=SUM(1;2)'], ['Empresa "A"']]),
      '\uFEFF"Nombre"\r\n"\'=SUM(1;2)"\r\n"Empresa ""A"""');
  });
});