import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  Send,
  Webhook,
  AlertTriangle,
  CheckCheck,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FiltroClienteAviso, filtrarPorCliente, useClienteFiltro } from "@/lib/filtro-cliente";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CanalNotificacion, Notificacion } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useCatalogo, usePlantillas, type PlantillaNotif } from "@/lib/db";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { useNotificaciones } from "@/lib/db";
import {
  camposNotificacionCon,
  camposPlantilla,
  filaNotificacion,
  filaPlantilla,
} from "@/lib/form-defs";
import { useEliminarRegistro, useGuardarRegistro } from "@/lib/mutations";

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
  const clienteFiltro = useClienteFiltro();
  const notificaciones = filtrarPorCliente(useNotificaciones(), clienteFiltro, (n) => n.clienteId ?? null);
  const { getAplicacion, getCliente, clientes, aplicaciones } = useCatalogo();
  const plantillas = usePlantillas();
  const qc = useQueryClient();

  const [seleccion, setSeleccion] = useState<Notificacion | null>(null);
  const [editando, setEditando] = useState<Notificacion | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [plantillaEdit, setPlantillaEdit] = useState<PlantillaNotif | null>(null);
  const [formPlantilla, setFormPlantilla] = useState(false);
  const [plantillaBorrar, setPlantillaBorrar] = useState<PlantillaNotif | null>(null);

  const guardar = useGuardarRegistro("notificaciones", "notificaciones", "Notificación");
  const guardarPlantilla = useGuardarRegistro(
    "plantillas_notificacion",
    "plantillas_notificacion",
    "Plantilla",
  );
  const eliminarPlantilla = useEliminarRegistro(
    "plantillas_notificacion",
    "plantillas_notificacion",
    "Plantilla",
  );

  /** Cambio de estado en lote sobre las notificaciones visibles. */
  const marcarTodo = useMutation({
    mutationFn: async () => {
      const ids = notificaciones.filter((n) => n.canal === "interna" && n.estado === "enviada").map((n) => n.id);
      if (!ids.length) return 0;
      const { error } = await supabase
        .from("notificaciones")
        .update({ estado: "leida" })
        .in("id", ids);
      if (error) throw new Error(error.message);
      return ids.length;
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["notificaciones"] });
      qc.invalidateQueries({ queryKey: ["auditoria"] });
      toast.success(n ? `${n} notificaciones marcadas como leídas` : "No había avisos sin leer");
    },
    onError: (e: Error) =>
      toast.error("No se pudo actualizar", {
        description: /row-level security|JWT|permission/i.test(e.message)
          ? "Inicia sesión para poder actualizar notificaciones."
          : e.message,
      }),
  });

  const cambiarEstado = (n: Notificacion, estado: string) =>
    guardar.mutate(
      { id: n.id, valores: { estado, ...(estado === "enviada" ? { enviada_en: new Date().toISOString() } : {}) } },
      { onSuccess: () => setSeleccion({ ...n, estado: estado as Notificacion["estado"] }) },
    );

  const columnas: Columna<Notificacion>[] = [
    {
      key: "asunto",
      header: "Notificación",
      render: (n) => {
        const Icono = iconoCanal[n.canal] ?? Bell;
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

  const abrirNueva = () => {
    setEditando(null);
    setFormAbierto(true);
  };

  return (
    <>
      <PageHeader
        titulo="Notificaciones"
        descripcion="Sistema centralizado de avisos: email, notificaciones internas, SMS y webhooks para renovaciones, impagos, consumo y seguridad."
        acciones={
          <>
            <Button variant="outline" onClick={() => marcarTodo.mutate()} disabled={marcarTodo.isPending}>
              <CheckCheck className="size-4" /> Leer avisos internos
            </Button>
            <Button onClick={abrirNueva}>
              <Send className="size-4" /> Nueva notificación
            </Button>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Notificaciones" value={notificaciones.length} icon={Bell} to="/notificaciones" search={{ estado: "todos" }} />
        <StatCard label="Enviadas" value={enviadas} hint="entregadas correctamente" to="/notificaciones" search={{ estado: "enviada" }} />
        <StatCard label="Pendientes de envío" value={pendientes} hint="en cola" to="/notificaciones" search={{ estado: "pendiente" }} />
        <StatCard label="Fallidas" value={fallidas} icon={AlertTriangle} hint="requieren revisión" to="/notificaciones" search={{ estado: "fallida" }} />
      </section>

      <FiltroClienteAviso />

      <DataTable
        data={notificaciones}
        columnas={columnas}
        exportacion={{ nombre: "notificaciones", cabeceras: ["Asunto", "Cliente", "Destinatario", "Canal", "Categoría", "Estado", "Fecha"], fila: (n) => [n.asunto, getCliente(n.clienteId ?? 0)?.nombreComercial ?? "Plataforma", n.destinatario, n.canal, n.categoria, n.estado, n.enviadaEn] }}
        porPagina={8}
        onRowClick={setSeleccion}
        buscar={(n) => `${n.asunto} ${n.mensaje} ${n.destinatario} ${n.categoria}`}
        filtros={[
          {
            label: "Canal",
            param: "canal",
            opciones: ["email", "interna", "sms", "webhook"],
            match: (n, v) => n.canal === v,
          },
          {
            label: "Categoría",
            param: "categoria",
            opciones: ["renovacion", "impago", "consumo", "seguridad", "sistema", "comercial"],
            match: (n, v) => n.categoria === v,
          },
          {
            label: "Estado",
            param: "estado",
            opciones: ["enviada", "pendiente", "leida", "fallida"],
            match: (n, v) => n.estado === v,
          },
        ]}
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Plantillas y reglas de disparo</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPlantillaEdit(null);
              setFormPlantilla(true);
            }}
          >
            <Plus className="size-4" /> Nueva plantilla
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plantillas.map((p) => (
            <div key={p.id} className="surface flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-tight">{p.nombre}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{p.categoria}</p>
                </div>
                <Switch
                  checked={p.activa}
                  aria-label={`Activar plantilla ${p.nombre}`}
                  onCheckedChange={(v) => guardarPlantilla.mutate({ id: p.id, valores: { activa: v } })}
                />
              </div>
              <p className="text-xs text-muted-foreground">{p.disparador}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1">
                {p.canales.map((c) => (
                  <Badge key={c} variant="outline" className="capitalize">
                    {c}
                  </Badge>
                ))}
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar plantilla ${p.nombre}`}
                    onClick={() => {
                      setPlantillaEdit(p);
                      setFormPlantilla(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar plantilla ${p.nombre}`}
                    onClick={() => setPlantillaBorrar(p)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {plantillas.length === 0 && (
            <p className="text-sm text-muted-foreground">Todavía no hay plantillas configuradas.</p>
          )}
        </div>
      </section>

      <RecordFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        titulo={editando ? "Editar notificación" : "Nueva notificación"}
        descripcion="Registro de avisos. Los canales externos todavía no tienen un servicio de envío conectado."
        campos={camposNotificacionCon(clientes, aplicaciones, plantillas)}
        valoresIniciales={{ ...filaNotificacion(editando), cliente_id: editando?.clienteId ?? clienteFiltro ?? "" }}
        guardando={guardar.isPending}
        onSubmit={(valores) =>
          guardar.mutate(
            { ...(editando ? { id: editando.id } : {}), valores },
            {
              onSuccess: () => {
                setFormAbierto(false);
                setSeleccion(null);
              },
            },
          )
        }
      />

      <RecordFormDialog
        open={formPlantilla}
        onOpenChange={setFormPlantilla}
        titulo={plantillaEdit ? "Editar plantilla" : "Nueva plantilla"}
        descripcion="Define el disparador, los canales y el contenido del aviso."
        campos={camposPlantilla}
        valoresIniciales={filaPlantilla(plantillaEdit)}
        guardando={guardarPlantilla.isPending}
        onSubmit={(valores) =>
          guardarPlantilla.mutate(
            { ...(plantillaEdit ? { id: plantillaEdit.id } : {}), valores },
            { onSuccess: () => setFormPlantilla(false) },
          )
        }
      />

      <AlertDialog open={!!plantillaBorrar} onOpenChange={(o) => !o && setPlantillaBorrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar «{plantillaBorrar?.nombre}»</AlertDialogTitle>
            <AlertDialogDescription>
              La plantilla dejará de estar disponible para nuevos avisos. Las notificaciones ya
              enviadas se conservan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (plantillaBorrar) eliminarPlantilla.mutate(plantillaBorrar.id);
                setPlantillaBorrar(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                      <Badge variant="outline">{seleccion.plantilla || "—"}</Badge>
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={guardar.isPending}
                    onClick={() => cambiarEstado(seleccion, "pendiente")}
                  >
                    <Send className="size-4" /> Volver a pendiente
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={guardar.isPending || seleccion.canal !== "interna" || seleccion.estado !== "enviada"}
                    onClick={() => cambiarEstado(seleccion, "leida")}
                  >
                    <CheckCheck className="size-4" /> Marcar como leída
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditando(seleccion);
                      setFormAbierto(true);
                    }}
                  >
                    <Pencil className="size-4" /> Editar
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
