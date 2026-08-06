import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Building2, Mail, Phone, Globe, FileText, History } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Columna } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { eur, fecha, type Cliente } from "@/lib/mock-data";
import { useClientes, useHistorial, useSuscripciones, useUsuarios } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Landmark, Receipt } from "lucide-react";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { camposCliente, filaCliente } from "@/lib/form-defs";
import { useEliminarRegistro, useGuardarRegistro } from "@/lib/mutations";

export const Route = createFileRoute("/crm")({
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
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const guardar = useGuardarRegistro("clientes", "clientes", "Cliente");
  const eliminar = useEliminarRegistro("clientes", "clientes", "Cliente");
  const registrar = useGuardarRegistro("cliente_historial", "cliente_historial", "Registro");
  const historial = useHistorial();
  const [nota, setNota] = useState("");

  const abrirForm = (c: Cliente | null) => {
    setEditando(c);
    setFormAbierto(true);
  };

  const clientes = useClientes();
  const suscripciones = useSuscripciones();
  const usuarios = useUsuarios();

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
    { key: "contacto", header: "Contacto", render: (c) => (
      <div>
        <p>{c.contacto}</p>
        <p className="text-xs text-muted-foreground">{c.email}</p>
      </div>
    ) },
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
          <Button onClick={() => abrirForm(null)}>
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
        onRowClick={setSeleccionado}
        checks={[
          { label: "No mostrar clientes dados de baja", mostrar: (c) => c.estado !== "baja" },
        ]}
        buscar={(c) => `${c.nombreComercial} ${c.razonSocial} ${c.nif} ${c.email} ${c.sector} ${c.provincia}`}
        filtros={[
          {
            label: "Estado",
            opciones: ["activo", "prueba", "prospecto", "impago", "baja"],
            match: (c, v) => c.estado === v,
          },
          {
            label: "País",
            opciones: ["España", "Portugal"],
            match: (c, v) => c.pais === v,
          },
        ]}
      />

      <RecordFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        titulo={editando ? `Editar ${editando.nombreComercial}` : "Nuevo cliente"}
        descripcion="Datos fiscales, contacto y estado comercial del cliente."
        campos={camposCliente}
        valoresIniciales={filaCliente(editando)}
        guardando={guardar.isPending}
        onSubmit={(valores) =>
          guardar.mutate(
            { ...(editando ? { id: editando.id } : {}), valores },
            {
              onSuccess: () => {
                setFormAbierto(false);
                if (editando) {
                  registrar.mutate({
                    valores: {
                      cliente_id: editando.id,
                      tipo: "actualizacion",
                      titulo: "Ficha del cliente actualizada",
                      detalle: "Datos generales, bancarios o condiciones comerciales.",
                    },
                  });
                }
              },
            },
          )
        }
      />

      <Sheet open={!!seleccionado} onOpenChange={(o) => !o && setSeleccionado(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {seleccionado && (
            <>
              <SheetHeader>
                <SheetTitle>{seleccionado.nombreComercial}</SheetTitle>
                <p className="text-sm text-muted-foreground">{seleccionado.razonSocial}</p>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-8">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      abrirForm(seleccionado);
                      setSeleccionado(null);
                    }}
                  >
                    Editar ficha
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      eliminar.mutate(seleccionado.id);
                      registrar.mutate({
                        valores: {
                          cliente_id: seleccionado.id,
                          tipo: "baja",
                          titulo: "Cliente dado de baja",
                          detalle: "Baja registrada desde la ficha de CRM.",
                        },
                      });
                      setSeleccionado(null);
                    }}
                  >
                    Dar de baja
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge estado={seleccionado.estado} />
                  {seleccionado.etiquetas.map((e) => (
                    <Badge key={e} variant="secondary">
                      {e}
                    </Badge>
                  ))}
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <Dato k="NIF/CIF" v={seleccionado.nif} />
                  <Dato k="Sector" v={seleccionado.sector} />
                  <Dato k="Empleados" v={String(seleccionado.empleados)} />
                  <Dato k="Alta" v={fecha(seleccionado.fechaAlta)} />
                  <Dato k="Baja" v={seleccionado.fechaBaja ? fecha(seleccionado.fechaBaja) : "—"} />
                  <Dato k="MRR" v={eur(seleccionado.mrr)} />
                  <Dato k="Dirección" v={`${seleccionado.direccion}, ${seleccionado.provincia} (${seleccionado.pais})`} />
                </dl>

                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{seleccionado.email}</p>
                  <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{seleccionado.telefono}</p>
                  <p className="flex items-center gap-2"><Globe className="size-4 text-muted-foreground" />{seleccionado.web}</p>
                  <p className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />{seleccionado.documentos} documentos asociados</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Suscripciones</h3>
                  <ul className="mt-2 space-y-2">
                    {suscripciones
                      .filter((s) => s.clienteId === seleccionado.id)
                      .map((s) => (
                        <li key={s.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                          <span>Suscripción #{s.id} · {s.periodicidad}</span>
                          <StatusBadge estado={s.estado} />
                        </li>
                      ))}
                    {suscripciones.filter((s) => s.clienteId === seleccionado.id).length === 0 && (
                      <li className="text-sm text-muted-foreground">Sin suscripciones activas.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Usuarios ({usuarios.filter((u) => u.clienteId === seleccionado.id).length})</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {usuarios
                      .filter((u) => u.clienteId === seleccionado.id)
                      .map((u) => (
                        <li key={u.id}>{u.nombre} {u.apellidos} · {u.rol}</li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Landmark className="size-4 text-muted-foreground" /> Datos bancarios
                  </h3>
                  <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <Dato k="IBAN" v={seleccionado.iban || "—"} />
                    <Dato k="Entidad" v={seleccionado.banco || "—"} />
                    <Dato k="Titular" v={seleccionado.titularCuenta || "—"} />
                    <Dato k="BIC/SWIFT" v={seleccionado.bic || "—"} />
                    <Dato k="Forma de pago" v={seleccionado.formaPago || "—"} />
                    <Dato k="Mandato SEPA" v={seleccionado.mandatoSepa || "—"} />
                    <Dato k="Fecha mandato" v={seleccionado.fechaMandato ? fecha(seleccionado.fechaMandato) : "—"} />
                  </dl>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Receipt className="size-4 text-muted-foreground" /> Condiciones comerciales
                  </h3>
                  <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <Dato k="Tarifa" v={seleccionado.tarifa ?? "—"} />
                    <Dato k="Moneda" v={seleccionado.moneda ?? "—"} />
                    <Dato k="Descuento general" v={`${seleccionado.descuentoGeneral ?? 0}%`} />
                    <Dato k="Facturación" v={seleccionado.periodoFacturacion ?? "—"} />
                    <Dato k="Día de pago" v={String(seleccionado.diaPago ?? "—")} />
                    <Dato k="Vencimiento" v={`${seleccionado.diasVencimiento ?? 0} días`} />
                    <Dato k="Límite de crédito" v={eur(seleccionado.limiteCredito ?? 0)} />
                    <Dato k="IVA / IRPF" v={`${seleccionado.iva ?? 0}% / ${seleccionado.retencion ?? 0}%`} />
                  </dl>
                  {seleccionado.condicionesNotas ? (
                    <p className="mt-2 text-sm text-muted-foreground">{seleccionado.condicionesNotas}</p>
                  ) : null}
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <History className="size-4 text-muted-foreground" /> Historial de actividad
                  </h3>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!nota.trim()) return;
                      registrar.mutate(
                        {
                          valores: {
                            cliente_id: seleccionado.id,
                            tipo: "nota",
                            titulo: nota.trim(),
                            detalle: "",
                          },
                        },
                        { onSuccess: () => setNota("") },
                      );
                    }}
                  >
                    <Input
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      placeholder="Añadir anotación al historial…"
                    />
                    <Button type="submit" size="sm" disabled={registrar.isPending}>
                      Añadir
                    </Button>
                  </form>
                  <ol className="mt-3 space-y-3 border-l border-border pl-4 text-sm">
                    {historial
                      .filter((h) => h.clienteId === seleccionado.id)
                      .map((h) => (
                        <li key={h.id}>
                          <p>{h.titulo}</p>
                          {h.detalle && <p className="text-xs text-muted-foreground">{h.detalle}</p>}
                          <p className="text-xs text-muted-foreground">
                            {fecha(h.created_at)} · {h.tipo} · {h.autor}
                          </p>
                        </li>
                      ))}
                    <li>
                      <p>Alta del cliente en la plataforma</p>
                      <p className="text-xs text-muted-foreground">
                        {fecha(seleccionado.fechaAlta)} · {seleccionado.created_by}
                      </p>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Observaciones</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{seleccionado.observaciones || "—"}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
