import { createFileRoute } from "@tanstack/react-router";
import { Activity, Gauge, AlertTriangle, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FiltroClienteAviso, filtrarPorCliente, useClienteFiltro } from "@/lib/filtro-cliente";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, type Columna } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { eur, num, type RegistroConsumo } from "@/lib/mock-data";
import { useCatalogo, useConsumos } from "@/lib/db";

export const Route = createFileRoute("/consumo")({
  head: () => ({
    meta: [
      { title: "Gestión del uso y consumo · ServiceHub" },
      {
        name: "description",
        content: "Métricas de consumo por cliente y aplicación: documentos, tokens, API, almacenamiento y costes.",
      },
      { property: "og:title", content: "Gestión del uso · ServiceHub" },
      { property: "og:description", content: "Medición pay-per-use por métrica configurable en cada aplicación." },
    ],
  }),
  component: ConsumoPage,
});

function ConsumoPage() {
  const clienteFiltro = useClienteFiltro();
  const consumos = filtrarPorCliente(useConsumos(), clienteFiltro, (c) => c.clienteId);
  const { getAplicacion, getCliente } = useCatalogo();
  const costeTotal = consumos.reduce((s, c) => s + c.consumido * c.costeUnitario, 0);
  const excedidos = consumos.filter((c) => c.incluido > 0 && c.consumido > c.incluido);

  const columnas: Columna<RegistroConsumo>[] = [
    {
      key: "cliente",
      header: "Cliente / Aplicación",
      render: (c) => (
        <div>
          <p className="font-medium">{getCliente(c.clienteId)?.nombreComercial}</p>
          <p className="text-xs text-muted-foreground">{getAplicacion(c.aplicacionId)?.nombre}</p>
        </div>
      ),
    },
    { key: "metrica", header: "Métrica", render: (c) => <Badge variant="secondary">{c.metrica}</Badge> },
    {
      key: "uso",
      header: "Uso del periodo",
      className: "min-w-[200px]",
      render: (c) => {
        const pct = c.incluido ? (c.consumido / c.incluido) * 100 : 0;
        return (
          <div>
            <Progress value={Math.min(100, pct)} className="h-1.5" />
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              {num(c.consumido)} / {c.incluido ? num(c.incluido) : "∞"} {c.unidad} ({Math.round(pct)}%)
            </p>
          </div>
        );
      },
    },
    { key: "unit", header: "Coste unitario", className: "text-right", render: (c) => <span className="tabular-nums">{c.costeUnitario} €</span> },
    {
      key: "coste",
      header: "Coste periodo",
      className: "text-right",
      render: (c) => <span className="font-medium tabular-nums">{eur(c.consumido * c.costeUnitario)}</span>,
    },
    {
      key: "exceso",
      header: "Exceso",
      render: (c) =>
        c.incluido > 0 && c.consumido > c.incluido ? (
          <span className="inline-flex items-center gap-1 text-destructive">
            <AlertTriangle className="size-4" /> +{num(c.consumido - c.incluido)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "periodo", header: "Periodo", render: (c) => c.periodo },
  ];

  return (
    <>
      <PageHeader
        titulo="Gestión del uso"
        descripcion="Registro automático del consumo por cliente y aplicación, con métricas configurables por producto."
        acciones={
          <Button variant="outline">
            <Download className="size-4" /> Exportar CSV
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registros del periodo" value={consumos.length} icon={Activity} />
        <StatCard label="Coste de consumo" value={eur(costeTotal)} icon={Gauge} delta={11} />
        <StatCard label="Métricas activas" value={new Set(consumos.map((c) => c.metrica)).size} />
        <StatCard label="Límites excedidos" value={excedidos.length} icon={AlertTriangle} hint="facturables como exceso" />
      </section>

      <FiltroClienteAviso />

      <DataTable
        data={consumos}
        columnas={columnas}
        porPagina={10}
        buscar={(c) => `${getCliente(c.clienteId)?.nombreComercial} ${getAplicacion(c.aplicacionId)?.nombre} ${c.metrica}`}
        filtros={[
          {
            label: "Aplicación",
            opciones: [...new Set(consumos.map((c) => getAplicacion(c.aplicacionId)!.nombre))],
            match: (c, v) => getAplicacion(c.aplicacionId)?.nombre === v,
          },
        ]}
      />
    </>
  );
}
