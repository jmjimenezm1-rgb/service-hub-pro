import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Globe,
  Headphones,
  History,
  Landmark,
  Lock,
  Mail,
  Pencil,
  Phone,
  Receipt,
  Repeat,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AgendaCliente } from "@/components/crm/AgendaCliente";
import { RecordFormDialog, type Campo } from "@/components/shared/RecordFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { camposCliente, filaCliente } from "@/lib/form-defs";
import { useGuardarRegistro } from "@/lib/mutations";
import {
  useAgenda,
  useClientes,
  useConsumos,
  useHistorial,
  useSuscripciones,
  useUsuarios,
} from "@/lib/db";
import { eur, fecha } from "@/lib/mock-data";

export const Route = createFileRoute("/crm/$clienteId")({
  head: () => ({
    meta: [
      { title: "Ficha de cliente · ServiceHub" },
      {
        name: "description",
        content:
          "Ficha visual del cliente: datos generales, bancarios, condiciones comerciales, agenda de contactos e histórico.",
      },
      { property: "og:title", content: "Ficha de cliente · ServiceHub" },
      { property: "og:description", content: "Toda la relación con la empresa cliente en una sola pantalla." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FichaClientePage,
});

/** Agrupa la definición de campos del cliente por sección editable. */
function porSeccion(): Record<string, Campo[]> {
  const grupos: Record<string, Campo[]> = {};
  let actual = "Datos generales";
  for (const campo of camposCliente) {
    if (campo.seccion) actual = campo.seccion;
    grupos[actual] = [...(grupos[actual] ?? []), campo];
  }
  return grupos;
}

function FichaClientePage() {
  const { clienteId } = Route.useParams();
  const id = Number(clienteId);
  const navigate = useNavigate();

  const cliente = useClientes().find((c) => c.id === id);
  const suscripciones = useSuscripciones().filter((s) => s.clienteId === id);
  const usuarios = useUsuarios().filter((u) => u.clienteId === id);
  const consumos = useConsumos().filter((c) => c.clienteId === id);
  const agenda = useAgenda().filter((a) => a.clienteId === id);
  const historial = useHistorial().filter((h) => h.clienteId === id);

  const guardar = useGuardarRegistro("clientes", "clientes", "Cliente");
  const registrar = useGuardarRegistro("cliente_historial", "cliente_historial", "Registro");
  const [seccionEdit, setSeccionEdit] = useState<string | null>(null);
  const [nota, setNota] = useState("");

  const grupos = useMemo(porSeccion, []);
  const contactos = useMemo(
    () =>
      [
        ...(cliente?.contacto ? [cliente.contacto] : []),
        ...usuarios.map((u) => `${u.nombre} ${u.apellidos}`.trim()),
      ].filter((v, i, a) => v && a.indexOf(v) === i),
    [cliente, usuarios],
  );

  if (!cliente) {
    return (
      <>
        <PageHeader titulo="Cliente no encontrado" descripcion="La ficha solicitada no existe o fue dada de baja." />
        <Button onClick={() => navigate({ to: "/crm" })}>Volver al CRM</Button>
      </>
    );
  }

  const pendientes = agenda.filter((a) => a.estado === "planificado").length;

  const modulos = [
    { titulo: "Suscripciones", desc: `${suscripciones.length} contratos`, icon: Repeat, to: "/suscripciones" as const },
    { titulo: "Usuarios", desc: `${usuarios.length} usuarios`, icon: Users, to: "/usuarios" as const },
    { titulo: "Gestión del uso", desc: `${consumos.length} registros`, icon: Activity, to: "/consumo" as const },
    { titulo: "Notificaciones", desc: "Avisos del cliente", icon: Bell, to: "/notificaciones" as const },
  ];

  const futuros = [
    { titulo: "Facturación", icon: Receipt },
    { titulo: "Cobros", icon: Wallet },
    { titulo: "Soporte", icon: Headphones },
  ];

  return (
    <>
      <PageHeader
        titulo={cliente.nombreComercial}
        descripcion={`${cliente.razonSocial} · ${cliente.nif} · ${cliente.provincia}, ${cliente.pais}`}
        acciones={
          <>
            <StatusBadge estado={cliente.estado} />
            <Button variant="outline" onClick={() => setSeccionEdit("Datos generales")}>
              <Pencil className="size-4" /> Editar ficha
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={eur(cliente.mrr)} icon={Building2} to="/suscripciones" search={{ cliente: String(id), estado: "activa" }} />
        <StatCard label="Suscripciones" value={suscripciones.length} icon={Repeat} to="/suscripciones" search={{ cliente: String(id), estado: "todos" }} />
        <StatCard label="Usuarios" value={usuarios.length} icon={Users} to="/usuarios" search={{ cliente: String(id), estado: "todos" }} />
        <StatCard label="Acciones planificadas" value={pendientes} hint="en agenda" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {modulos.map((m) => (
          <Link key={m.titulo} to={m.to} search={{ cliente: String(cliente.id) }}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardContent className="flex items-center gap-3 py-4">
                <m.icon className="size-5 text-primary" />
                <div>
                  <p className="font-medium">{m.titulo}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {futuros.map((m) => (
          <Card key={m.titulo} className="h-full opacity-60">
            <CardContent className="flex items-center gap-3 py-4">
              <m.icon className="size-5 text-muted-foreground" />
              <div>
                <p className="flex items-center gap-1 font-medium">
                  {m.titulo} <Lock className="size-3" />
                </p>
                <p className="text-xs text-muted-foreground">Módulo en integración</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" /> Datos generales
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSeccionEdit("Datos generales")}>
              <Pencil className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              <Dato k="NIF / CIF" v={cliente.nif} />
              <Dato k="Sector" v={cliente.sector || "—"} />
              <Dato k="Empleados" v={String(cliente.empleados)} />
              <Dato k="Alta" v={fecha(cliente.fechaAlta)} />
              <Dato k="Dirección" v={`${cliente.direccion || "—"}`} />
              <Dato k="Documentos" v={`${cliente.documentos}`} />
            </dl>
            <div className="space-y-1.5 border-t border-border pt-3">
              <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{cliente.email || "—"}</p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{cliente.telefono || "—"}</p>
              <p className="flex items-center gap-2"><Globe className="size-4 text-muted-foreground" />{cliente.web || "—"}</p>
              <p className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />{cliente.contacto || "—"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cliente.etiquetas.map((e) => (
                <Badge key={e} variant="secondary">{e}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Landmark className="size-4 text-muted-foreground" /> Datos bancarios
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSeccionEdit("Datos bancarios")}>
              <Pencil className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Dato k="IBAN" v={cliente.iban || "—"} />
              <Dato k="Entidad" v={cliente.banco || "—"} />
              <Dato k="Titular" v={cliente.titularCuenta || "—"} />
              <Dato k="BIC / SWIFT" v={cliente.bic || "—"} />
              <Dato k="Forma de pago" v={cliente.formaPago || "—"} />
              <Dato k="Mandato SEPA" v={cliente.mandatoSepa || "—"} />
              <Dato k="Fecha mandato" v={cliente.fechaMandato ? fecha(cliente.fechaMandato) : "—"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-4 text-muted-foreground" /> Condiciones comerciales
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSeccionEdit("Condiciones comerciales")}>
              <Pencil className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Dato k="Tarifa" v={cliente.tarifa ?? "—"} />
              <Dato k="Moneda" v={cliente.moneda ?? "—"} />
              <Dato k="Descuento" v={`${cliente.descuentoGeneral ?? 0}%`} />
              <Dato k="Facturación" v={cliente.periodoFacturacion ?? "—"} />
              <Dato k="Día de pago" v={String(cliente.diaPago ?? "—")} />
              <Dato k="Vencimiento" v={`${cliente.diasVencimiento ?? 0} días`} />
              <Dato k="Límite crédito" v={eur(cliente.limiteCredito ?? 0)} />
              <Dato k="IVA / IRPF" v={`${cliente.iva ?? 0}% / ${cliente.retencion ?? 0}%`} />
            </dl>
            {cliente.condicionesNotas ? (
              <p className="mt-3 text-sm text-muted-foreground">{cliente.condicionesNotas}</p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <AgendaCliente clienteId={cliente.id} contactos={contactos} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" /> Historial de actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nota.trim()) return;
              registrar.mutate(
                { valores: { cliente_id: cliente.id, tipo: "nota", titulo: nota.trim(), detalle: "" } },
                { onSuccess: () => setNota("") },
              );
            }}
          >
            <Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Añadir anotación al historial…" />
            <Button type="submit" size="sm" disabled={registrar.isPending}>Añadir</Button>
          </form>
          <ol className="mt-4 space-y-3 border-l border-border pl-4 text-sm">
            {historial.map((h) => (
              <li key={h.id}>
                <p>{h.titulo}</p>
                {h.detalle && <p className="text-xs text-muted-foreground">{h.detalle}</p>}
                <p className="text-xs text-muted-foreground">{fecha(h.created_at)} · {h.tipo} · {h.autor}</p>
              </li>
            ))}
            <li>
              <p>Alta del cliente en la plataforma</p>
              <p className="text-xs text-muted-foreground">{fecha(cliente.fechaAlta)}</p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <RecordFormDialog
        open={!!seccionEdit}
        onOpenChange={(o) => !o && setSeccionEdit(null)}
        titulo={`Editar · ${seccionEdit ?? ""}`}
        descripcion="Los cambios se guardan directamente en la ficha del cliente."
        campos={seccionEdit ? (grupos[seccionEdit] ?? []) : []}
        valoresIniciales={filaCliente(cliente)}
        guardando={guardar.isPending}
        onSubmit={(valores) =>
          guardar.mutate(
            { id: cliente.id, valores },
            {
              onSuccess: () => {
                setSeccionEdit(null);
                registrar.mutate({
                  valores: {
                    cliente_id: cliente.id,
                    tipo: "actualizacion",
                    titulo: `Sección actualizada: ${seccionEdit}`,
                    detalle: "Edición directa desde la ficha del cliente.",
                  },
                });
              },
            },
          )
        }
      />
    </>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 break-words">{v}</dd>
    </div>
  );
}
