import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Gauge, AlertTriangle, Plus } from "lucide-react";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { camposConsumo, filaConsumo } from "@/lib/consumo-form";
import { useGuardarRegistro } from "@/lib/mutations";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsumoPage,
});

function ConsumoPage() {
  const [editando, setEditando] = useState<RegistroConsumo | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const guardar = useGuardarRegistro("consumos", "consumos", "Registro de consumo");
  const clienteFiltro = useClienteFiltro();
  const consumos = filtrarPorCliente(useConsumos(), clienteFiltro, (c) => c.clienteId);
  const { getAplicacion, getCliente, clientes, aplicaciones } = useCatalogo();
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
          <Button onClick={() => { setEditando(null); setFormAbierto(true); }}>
            <Plus className="size-4" /> Registrar consumo
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registros del periodo" value={consumos.length} icon={Activity} to="/consumo" search={{ exceso: "todos" }} />
        <StatCard label="Coste de consumo" value={eur(costeTotal)} icon={Gauge} to="/consumo" search={{ exceso: "todos" }} />
        <StatCard label="Métricas activas" value={new Set(consumos.map((c) => c.metrica)).size} to="/consumo" search={{ exceso: "todos" }} />
        <StatCard
          label="Límites excedidos"
          value={excedidos.length}
          icon={AlertTriangle}
          hint="facturables como exceso"
          to="/consumo"
          search={{ exceso: "con exceso" }}
        />
      </section>

      <FiltroClienteAviso />

      <DataTable
        data={consumos}
        columnas={columnas}
        porPagina={10}
        onRowClick={(c) => { setEditando(c); setFormAbierto(true); }}
        exportacion={{ nombre: "consumo", cabeceras: ["Cliente", "Aplicación", "Métrica", "Unidad", "Consumo", "Incluido", "Coste unitario", "Coste", "Periodo"], fila: (c) => [getCliente(c.clienteId)?.nombreComercial, getAplicacion(c.aplicacionId)?.nombre, c.metrica, c.unidad, c.consumido, c.incluido, c.costeUnitario, c.consumido * c.costeUnitario, c.periodo] }}
        checks={[
          { label: "No mostrar clientes dados de baja", mostrar: (c) => getCliente(c.clienteId)?.estado !== "baja" },
          { label: "No mostrar aplicaciones retiradas", mostrar: (c) => getAplicacion(c.aplicacionId)?.estado !== "retirada" },
        ]}
        buscar={(c) => `${getCliente(c.clienteId)?.nombreComercial} ${getAplicacion(c.aplicacionId)?.nombre} ${c.metrica}`}
        filtros={[
          {
            label: "Aplicación",
            param: "aplicacion",
            opciones: [...new Set(consumos.flatMap((c) => { const a = getAplicacion(c.aplicacionId); return a ? [a.nombre] : []; }))],
            match: (c, v) => getAplicacion(c.aplicacionId)?.nombre === v,
          },
          { label: "Periodo", param: "periodo", opciones: [...new Set(consumos.map((c) => c.periodo))].sort().reverse(), match: (c, v) => c.periodo === v },
          {
            label: "Exceso",
            param: "exceso",
            opciones: ["con exceso", "sin exceso"],
            match: (c, v) => {
              const hay = c.incluido > 0 && c.consumido > c.incluido;
              return v === "con exceso" ? hay : !hay;
            },
          },
        ]}
      />
      <RecordFormDialog open={formAbierto} onOpenChange={setFormAbierto}
        titulo={editando ? `Editar consumo #${editando.id}` : "Registrar consumo"}
        campos={camposConsumo(clientes, aplicaciones)} valoresIniciales={filaConsumo(editando, clienteFiltro)} guardando={guardar.isPending}
        onSubmit={(valores) => guardar.mutate({ ...(editando ? { id: editando.id } : {}), valores }, { onSuccess: () => setFormAbierto(false) })} />
    </>
  );
}
