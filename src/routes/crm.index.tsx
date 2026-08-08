import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Columna } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { eur, fecha, type Cliente } from "@/lib/mock-data";
import { useClientes } from "@/lib/db";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { camposCliente, filaCliente } from "@/lib/form-defs";
import { useGuardarRegistro } from "@/lib/mutations";

export const Route = createFileRoute("/crm/")({
  head: () => ({
    meta: [
      { title: "CRM de clientes · ServiceHub" },
      {
        name: "description",
        content: "Ficha completa de empresas cliente: datos fiscales, contacto, estado, etiquetas y actividad.",
      },
      { property: "og:title", content: "CRM de clientes · ServiceHub" },
      { property: "og:description", content: "Gestiona el ciclo de vida completo de las empresas cliente." },
    ],
  }),
  component: CrmPage,
});

function CrmPage() {
  const navigate = useNavigate();
  const [formAbierto, setFormAbierto] = useState(false);
  const guardar = useGuardarRegistro("clientes", "clientes", "Cliente");
  const clientes = useClientes();

  const columnas: Columna<Cliente>[] = [
    {
      key: "empresa",
      header: "Empresa",
      render: (c) => (
        <div>
          <p className="font-medium">{c.nombreComercial}</p>
          <p className="text-xs text-muted-foreground">{c.razonSocial}</p>
        </div>
      ),
    },
    { key: "nif", header: "NIF/CIF", render: (c) => <span className="tabular-nums">{c.nif}</span> },
    { key: "sector", header: "Sector", render: (c) => c.sector },
    { key: "prov", header: "Provincia", render: (c) => `${c.provincia}, ${c.pais}` },
    {
      key: "contacto",
      header: "Contacto",
      render: (c) => (
        <div>
          <p>{c.contacto}</p>
          <p className="text-xs text-muted-foreground">{c.email}</p>
        </div>
      ),
    },
    { key: "mrr", header: "MRR", className: "text-right", render: (c) => <span className="tabular-nums">{eur(c.mrr)}</span> },
    { key: "estado", header: "Estado", render: (c) => <StatusBadge estado={c.estado} /> },
    { key: "alta", header: "Alta", render: (c) => fecha(c.fechaAlta) },
  ];

  return (
    <>
      <PageHeader
        titulo="CRM · Clientes"
        descripcion="Prospección, alta, contratación, seguimiento y baja de empresas cliente."
        acciones={
          <Button onClick={() => setFormAbierto(true)}>
            <Plus className="size-4" /> Nuevo cliente
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total clientes" value={clientes.length} icon={Building2} />
        <StatCard label="Activos" value={clientes.filter((c) => c.estado === "activo").length} />
        <StatCard label="En prueba" value={clientes.filter((c) => c.estado === "prueba").length} />
        <StatCard label="Prospectos" value={clientes.filter((c) => c.estado === "prospecto").length} />
      </section>

      <DataTable
        data={clientes}
        columnas={columnas}
        onRowClick={(c) => navigate({ to: "/crm/$clienteId", params: { clienteId: String(c.id) } })}
        checks={[{ label: "No mostrar clientes dados de baja", mostrar: (c) => c.estado !== "baja" }]}
        buscar={(c) => `${c.nombreComercial} ${c.razonSocial} ${c.nif} ${c.email} ${c.sector} ${c.provincia}`}
        filtros={[
          {
            label: "Estado",
            opciones: ["activo", "prueba", "prospecto", "impago", "baja"],
            match: (c, v) => c.estado === v,
          },
          { label: "País", opciones: ["España", "Portugal"], match: (c, v) => c.pais === v },
        ]}
      />

      <RecordFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        titulo="Nuevo cliente"
        descripcion="Datos fiscales, contacto y estado comercial del cliente."
        campos={camposCliente}
        valoresIniciales={filaCliente(null)}
        guardando={guardar.isPending}
        onSubmit={(valores) => guardar.mutate({ valores }, { onSuccess: () => setFormAbierto(false) })}
      />
    </>
  );
}
