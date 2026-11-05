import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuditoria, type EntradaAuditoria } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoría de cambios · ServiceHub" },
      {
        name: "description",
        content:
          "Registro cronológico de altas, modificaciones y bajas en todos los módulos con autor, fecha y valores antes y después.",
      },
      { property: "og:title", content: "Auditoría · ServiceHub" },
      {
        property: "og:description",
        content: "Trazabilidad completa de los cambios realizados en ServiceHub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditoriaPage,
});

const nombresTabla: Record<string, string> = {
  clientes: "Clientes",
  aplicaciones: "Aplicaciones",
  suscripciones: "Suscripciones",
  usuarios: "Usuarios",
  notificaciones: "Notificaciones",
  roles: "Roles",
  rol_permisos: "Permisos",
  agenda_cliente: "Agenda CRM",
  plantillas_notificacion: "Plantillas",
  consumos: "Consumo",
};

const colorOperacion: Record<string, string> = {
  alta: "bg-success/12 text-success border-success/25",
  modificacion: "bg-info/12 text-info border-info/25",
  baja: "bg-destructive/12 text-destructive border-destructive/25",
};

function diferencias(e: EntradaAuditoria) {
  const antes = e.datosAntes ?? {};
  const despues = e.datosDespues ?? {};
  const claves = Array.from(new Set([...Object.keys(antes), ...Object.keys(despues)]));
  return claves
    .filter((k) => !["updated_at", "created_at"].includes(k))
    .map((k) => ({
      campo: k,
      antes: JSON.stringify((antes as Record<string, unknown>)[k] ?? null),
      despues: JSON.stringify((despues as Record<string, unknown>)[k] ?? null),
    }))
    .filter((d) => d.antes !== d.despues);
}

function AuditoriaPage() {
  const entradas = useAuditoria();
  const [seleccion, setSeleccion] = useState<EntradaAuditoria | null>(null);

  const kpis = useMemo(
    () => ({
      total: entradas.length,
      altas: entradas.filter((e) => e.operacion === "alta").length,
      modificaciones: entradas.filter((e) => e.operacion === "modificacion").length,
      bajas: entradas.filter((e) => e.operacion === "baja").length,
    }),
    [entradas],
  );

  const tablas = useMemo(
    () => Array.from(new Set(entradas.map((e) => e.tabla))).sort(),
    [entradas],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Auditoría"
        descripcion="Cada alta, modificación y baja registrada automáticamente en todos los módulos."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Movimientos" value={kpis.total} icon={History} hint="últimos 500" to="/auditoria" search={{ operacion: "todos" }} />
        <StatCard
          label="Altas"
          value={kpis.altas}
          icon={History}
          to="/auditoria"
          search={{ operacion: "alta" }}
        />
        <StatCard
          label="Modificaciones"
          value={kpis.modificaciones}
          icon={History}
          to="/auditoria"
          search={{ operacion: "modificacion" }}
        />
        <StatCard
          label="Bajas"
          value={kpis.bajas}
          icon={History}
          to="/auditoria"
          search={{ operacion: "baja" }}
        />
      </div>

      <DataTable
        data={entradas}
        exportacion={{ nombre: "auditoria", cabeceras: ["Fecha", "Módulo", "Registro", "Operación", "Autor"], fila: (e) => [e.created_at, nombresTabla[e.tabla] ?? e.tabla, e.registroId, e.operacion, e.actor] }}
        onRowClick={setSeleccion}
        porPagina={12}
        vacio="Todavía no hay movimientos registrados."
        buscar={(e) => `${e.tabla} ${e.registroId} ${e.operacion} ${e.actor}`}
        filtros={[
          {
            label: "Módulo",
            opciones: tablas,
            match: (e, v) => e.tabla === v,
            param: "tabla",
          },
          {
            label: "Operación",
            opciones: ["alta", "modificacion", "baja"],
            match: (e, v) => e.operacion === v,
            param: "operacion",
          },
        ]}
        columnas={[
          {
            key: "fecha",
            header: "Fecha",
            render: (e) => new Date(e.created_at).toLocaleString("es-ES"),
          },
          {
            key: "modulo",
            header: "Módulo",
            render: (e) => nombresTabla[e.tabla] ?? e.tabla,
          },
          { key: "registro", header: "Registro", render: (e) => `#${e.registroId}` },
          {
            key: "operacion",
            header: "Operación",
            render: (e) => (
              <Badge variant="outline" className={colorOperacion[e.operacion] ?? ""}>
                {e.operacion}
              </Badge>
            ),
          },
          { key: "actor", header: "Autor", render: (e) => e.actor },
          {
            key: "campos",
            header: "Campos afectados",
            render: (e) => {
              const d = diferencias(e);
              return e.operacion === "alta" ? "registro creado" : `${d.length} campo(s)`;
            },
          },
        ]}
      />

      <Sheet open={!!seleccion} onOpenChange={(o) => !o && setSeleccion(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {seleccion && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {nombresTabla[seleccion.tabla] ?? seleccion.tabla} · registro #{seleccion.registroId}
                </SheetTitle>
                <SheetDescription>
                  {seleccion.operacion} realizada por {seleccion.actor} el{" "}
                  {new Date(seleccion.created_at).toLocaleString("es-ES")}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-3">
                {diferencias(seleccion).length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin diferencias de valores.</p>
                )}
                {diferencias(seleccion).map((d) => (
                  <div key={d.campo} className="surface p-3 text-sm">
                    <p className="font-medium">{d.campo}</p>
                    <p className="mt-1 break-all text-muted-foreground line-through">{d.antes}</p>
                    <p className="break-all text-foreground">{d.despues}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
