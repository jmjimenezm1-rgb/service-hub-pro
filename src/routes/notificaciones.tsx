import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  Send,
  Webhook,
  AlertTriangle,
  CheckCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Columna } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  plantillasNotificacion,
  type CanalNotificacion,
  type Notificacion,
} from "@/lib/mock-data";
import { useCatalogo, useNotificaciones } from "@/lib/db";

export const Route = createFileRoute("/notificaciones")({
  head: () => ({
    meta: [
      { title: "Notificaciones y alertas · ServiceHub" },
      {
        name: "description",
        content:
          "Centro de notificaciones de ServiceHub: emails, avisos internos, SMS y webhooks para renovaciones, impagos, consumo y seguridad.",
      },
      { property: "og:title", content: "Notificaciones · ServiceHub" },
      {
        property: "og:description",
        content: "Sistema centralizado de avisos con plantillas y reglas de disparo por evento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificacionesPage,
});

const iconoCanal: Record<CanalNotificacion, typeof Mail> = {
  email: Mail,
  interna: MonitorSmartphone,
  sms: MessageSquare,
  webhook: Webhook,
};

const fechaHora = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

function NotificacionesPage() {
  const notificaciones = useNotificaciones();
  const { getAplicacion, getCliente } = useCatalogo();
  const [seleccion, setSeleccion] = useState<Notificacion | null>(null);

  const columnas: Columna<Notificacion>[] = [
    {
      key: "asunto",
      header: "Notificación",
      render: (n) => {
        const Icono = iconoCanal[n.canal];
        return (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icono className="size-4" />
            </span>
            <div className="max-w-[380px]">
              <p className="font-medium">{n.asunto}</p>
              <p className="truncate text-xs text-muted-foreground">{n.mensaje}</p>
            </div>
          </div>
        );
      },
    },
    { key: "categoria", header: "Categoría", render: (n) => <Badge variant="secondary" className="capitalize">{n.categoria}</Badge> },
    { key: "canal", header: "Canal", render: (n) => <span className="capitalize">{n.canal}</span> },
    {
      key: "cliente",
      header: "Cliente",
      render: (n) => getCliente(n.clienteId ?? 0)?.nombreComercial ?? "Plataforma",
    },
    { key: "destinatario", header: "Destinatario", render: (n) => <span className="text-xs text-muted-foreground">{n.destinatario}</span> },
    {
      key: "prioridad",
      header: "Prioridad",
      render: (n) => (
        <span
          className={
            n.prioridad === "alta"
              ? "text-destructive"
              : n.prioridad === "media"
                ? "text-warning"
                : "text-muted-foreground"
          }
        >
          {n.prioridad}
        </span>
      ),
    },
    { key: "estado", header: "Estado", render: (n) => <StatusBadge estado={n.estado} /> },
    { key: "enviada", header: "Fecha", render: (n) => fechaHora(n.enviadaEn) },
  ];

  const pendientes = notificaciones.filter((n) => n.estado === "pendiente").length;
  const fallidas = notificaciones.filter((n) => n.estado === "fallida").length;
  const enviadas = notificaciones.filter((n) => n.estado === "enviada").length;

  return (
    <>
      <PageHeader
        titulo="Notificaciones"
        descripcion="Sistema centralizado de avisos: email, notificaciones internas, SMS y webhooks para renovaciones, impagos, consumo y seguridad."
        acciones={
          <>
            <Button variant="outline">
              <CheckCheck className="size-4" /> Marcar todo como leído
            </Button>
            <Button>
              <Send className="size-4" /> Nueva notificación
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Notificaciones (30 d)" value={notificaciones.length} icon={Bell} />
        <StatCard label="Enviadas" value={enviadas} hint="entregadas correctamente" />
        <StatCard label="Pendientes de envío" value={pendientes} hint="en cola" />
        <StatCard label="Fallidas" value={fallidas} icon={AlertTriangle} hint="requieren revisión" />
      </section>

      <DataTable
        data={notificaciones}
        columnas={columnas}
        porPagina={8}
        onRowClick={setSeleccion}
        buscar={(n) => `${n.asunto} ${n.mensaje} ${n.destinatario} ${n.categoria}`}
        filtros={[
          {
            label: "Canal",
            opciones: ["email", "interna", "sms", "webhook"],
            match: (n, v) => n.canal === v,
          },
          {
            label: "Categoría",
            opciones: ["renovacion", "impago", "consumo", "seguridad", "sistema", "comercial"],
            match: (n, v) => n.categoria === v,
          },
          {
            label: "Estado",
            opciones: ["enviada", "pendiente", "leida", "fallida"],
            match: (n, v) => n.estado === v,
          },
        ]}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Plantillas y reglas de disparo</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plantillasNotificacion.map((p) => (
            <div key={p.id} className="surface flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-tight">{p.nombre}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{p.categoria}</p>
                </div>
                <Switch defaultChecked={p.activa} aria-label={`Activar plantilla ${p.nombre}`} />
              </div>
              <p className="text-xs text-muted-foreground">{p.disparador}</p>
              <div className="mt-auto flex flex-wrap gap-1">
                {p.canales.map((c) => (
                  <Badge key={c} variant="outline" className="capitalize">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Sheet open={!!seleccion} onOpenChange={(o) => !o && setSeleccion(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {seleccion && (
            <>
              <SheetHeader>
                <SheetTitle>{seleccion.asunto}</SheetTitle>
                <SheetDescription>
                  {fechaHora(seleccion.enviadaEn)} · canal {seleccion.canal}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 p-4 text-sm">
                <p className="rounded-lg border border-border bg-muted/40 p-3 leading-relaxed">
                  {seleccion.mensaje}
                </p>

                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Estado</dt>
                    <dd className="mt-1">
                      <StatusBadge estado={seleccion.estado} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Prioridad</dt>
                    <dd className="mt-1 capitalize">{seleccion.prioridad}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Cliente</dt>
                    <dd className="mt-1">
                      {getCliente(seleccion.clienteId ?? 0)?.nombreComercial ?? "Plataforma"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Aplicación</dt>
                    <dd className="mt-1">{getAplicacion(seleccion.aplicacionId ?? 0)?.nombre ?? "—"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Destinatario</dt>
                    <dd className="mt-1 break-all">{seleccion.destinatario}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Plantilla</dt>
                    <dd className="mt-1">
                      <Badge variant="outline">{seleccion.plantilla}</Badge>
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Send className="size-4" /> Reenviar
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckCheck className="size-4" /> Marcar como leída
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
