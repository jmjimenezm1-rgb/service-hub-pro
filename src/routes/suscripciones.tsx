import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Repeat } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FiltroClienteAviso, filtrarPorCliente, useClienteFiltro } from "@/lib/filtro-cliente";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Columna } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { eur, fecha, num, type Suscripcion } from "@/lib/mock-data";
import { useCatalogo, useSuscripciones } from "@/lib/db";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { camposSuscripcion, filaSuscripcion } from "@/lib/form-defs";
import { useGuardarRegistro } from "@/lib/mutations";

export const Route = createFileRoute("/suscripciones")({
  head: () => ({
    meta: [
      { title: "Suscripciones y renovaciones · ServiceHub" },
      {
        name: "description",
        content: "Contratación de aplicaciones por cliente: modalidad, consumo contratado, precios y renovaciones.",
      },
      { property: "og:title", content: "Suscripciones · ServiceHub" },
      { property: "og:description", content: "Controla contratos, consumo y renovaciones automáticas." },
    ],
  }),
  component: SuscripcionesPage,
});

const etiquetaModalidad: Record<string, string> = {
  fijo: "Pago fijo",
  por_usuario: "Por usuario",
  por_uso: "Por uso",
  hibrido: "Híbrido",
};

function SuscripcionesPage() {
  const [editando, setEditando] = useState<Suscripcion | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const guardar = useGuardarRegistro("suscripciones", "suscripciones", "Suscripción");
  const abrirForm = (x: Suscripcion | null) => {
    setEditando(x);
    setFormAbierto(true);
  };
  const clienteFiltro = useClienteFiltro();
  const suscripciones = filtrarPorCliente(useSuscripciones(), clienteFiltro, (s) => s.clienteId);
  const { getAplicacion, getCliente, clientes, aplicaciones } = useCatalogo();
  const activas = suscripciones.filter((s) => s.estado === "activa");
  const ingresos = activas.reduce((s, x) => s + x.precio * (1 - x.descuento / 100), 0);

  const columnas: Columna<Suscripcion>[] = [
    {
      key: "cliente",
      header: "Cliente / Aplicación",
      render: (s) => (
        <div>
          <p className="font-medium">{getCliente(s.clienteId)?.nombreComercial}</p>
          <p className="text-xs text-muted-foreground">{getAplicacion(s.aplicacionId)?.nombre}</p>
        </div>
      ),
    },
    { key: "modalidad", header: "Modalidad", render: (s) => etiquetaModalidad[s.modalidad] },
    { key: "periodicidad", header: "Periodicidad", render: (s) => <span className="capitalize">{s.periodicidad}</span> },
    { key: "inicio", header: "Inicio", render: (s) => fecha(s.fechaInicio) },
    { key: "renovacion", header: "Renovación", render: (s) => (
      <div>
        <p>{fecha(s.fechaRenovacion)}</p>
        <p className="text-xs text-muted-foreground">{s.renovacionAutomatica ? "Automática" : "Manual"}</p>
      </div>
    ) },
    {
      key: "consumo",
      header: "Consumo",
      className: "min-w-[160px]",
      render: (s) => {
        const pct = s.consumoContratado ? Math.min(100, (s.consumoReal / s.consumoContratado) * 100) : 0;
        return (
          <div>
            <Progress value={pct} className="h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {num(s.consumoReal)} / {s.consumoContratado ? num(s.consumoContratado) : "∞"} ({Math.round(pct)}%)
            </p>
          </div>
        );
      },
    },
    { key: "usuarios", header: "Máx. usuarios", className: "text-right", render: (s) => <span className="tabular-nums">{s.maxUsuarios}</span> },
    {
      key: "precio",
      header: "Precio",
      className: "text-right",
      render: (s) => (
        <div className="tabular-nums">
          <p>{eur(s.precio * (1 - s.descuento / 100))}</p>
          {s.descuento > 0 && <p className="text-xs text-success">-{s.descuento}% dto.</p>}
        </div>
      ),
    },
    { key: "estado", header: "Estado", render: (s) => <StatusBadge estado={s.estado} /> },
  ];

  return (
    <>
      <PageHeader
        titulo="Suscripciones"
        descripcion="Contratos de aplicaciones por cliente, consumo contratado frente a real y renovaciones."
        acciones={
          <Button onClick={() => abrirForm(null)}>
            <Plus className="size-4" /> Nueva suscripción
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Suscripciones" value={suscripciones.length} icon={Repeat} />
        <StatCard label="Activas" value={activas.length} />
        <StatCard label="Ingreso contratado" value={eur(ingresos)} hint="neto de descuentos" />
        <StatCard
          label="Renovación automática"
          value={`${Math.round((suscripciones.filter((s) => s.renovacionAutomatica).length / suscripciones.length) * 100)}%`}
        />
      </section>

      <DataTable
        data={suscripciones}
        columnas={columnas}
        porPagina={10}
        onRowClick={abrirForm}
        buscar={(s) =>
          `${getCliente(s.clienteId)?.nombreComercial} ${getAplicacion(s.aplicacionId)?.nombre} ${s.periodicidad}`
        }
        checks={[
          {
            label: "No mostrar suscripciones de clientes dados de baja",
            mostrar: (s) => getCliente(s.clienteId)?.estado !== "baja",
          },
        ]}
        filtros={[
          { label: "Estado", opciones: ["activa", "prueba", "suspendida", "cancelada"], match: (s, v) => s.estado === v },
          {
            label: "Periodicidad",
            opciones: ["mensual", "trimestral", "semestral", "anual"],
            match: (s, v) => s.periodicidad === v,
          },
        ]}
      />

      <RecordFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        titulo={editando ? `Editar suscripción #${editando.id}` : "Nueva suscripción"}
        descripcion="Contrato de una aplicación para un cliente: fechas, modalidad, consumo y precio."
        campos={camposSuscripcion(clientes, aplicaciones)}
        valoresIniciales={filaSuscripcion(editando)}
        guardando={guardar.isPending}
        onSubmit={(valores) =>
          guardar.mutate(
            { ...(editando ? { id: editando.id } : {}), valores },
            { onSuccess: () => setFormAbierto(false) },
          )
        }
      />
    </>
  );
}
