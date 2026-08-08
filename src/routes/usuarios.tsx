import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, ShieldCheck, ShieldOff, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FiltroClienteAviso, filtrarPorCliente, useClienteFiltro } from "@/lib/filtro-cliente";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Columna } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { type Usuario } from "@/lib/mock-data";
import { useCatalogo, useRoles, useUsuarios } from "@/lib/db";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { camposUsuario, filaUsuario } from "@/lib/form-defs";
import { useGuardarRegistro } from "@/lib/mutations";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuarios y accesos · ServiceHub" },
      {
        name: "description",
        content: "Usuarios de cada empresa cliente: roles, aplicaciones autorizadas, MFA y último acceso.",
      },
      { property: "og:title", content: "Usuarios · ServiceHub" },
      { property: "og:description", content: "Administra usuarios, roles, MFA y aplicaciones autorizadas." },
    ],
  }),
  component: UsuariosPage,
});

function UsuariosPage() {
  const clienteFiltro = useClienteFiltro();
  const usuarios = filtrarPorCliente(useUsuarios(), clienteFiltro, (u) => u.clienteId);
  const { getAplicacion, getCliente, clientes, aplicaciones } = useCatalogo();
  const roles = useRoles();
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const guardar = useGuardarRegistro("usuarios", "usuarios", "Usuario");
  const abrirForm = (u: Usuario | null) => {
    setEditando(u);
    setFormAbierto(true);
  };
  const columnas: Columna<Usuario>[] = [
    {
      key: "usuario",
      header: "Usuario",
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {u.nombre[0]}
            {u.apellidos[0]}
          </span>
          <div>
            <p className="font-medium">
              {u.nombre} {u.apellidos}
            </p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "empresa", header: "Empresa", render: (u) => getCliente(u.clienteId ?? 0)?.nombreComercial ?? "ServiceHub (interno)" },
    { key: "cargo", header: "Cargo", render: (u) => (
      <div>
        <p>{u.cargo}</p>
        <p className="text-xs text-muted-foreground">{u.departamento}</p>
      </div>
    ) },
    { key: "rol", header: "Rol", render: (u) => <Badge variant="secondary">{u.rol}</Badge> },
    {
      key: "apps",
      header: "Aplicaciones",
      render: (u) =>
        u.aplicaciones.length ? (
          <div className="flex flex-wrap gap-1">
            {u.aplicaciones.slice(0, 3).map((id) => (
              <Badge key={id} variant="outline">
                {getAplicacion(id)?.logo}
              </Badge>
            ))}
            {u.aplicaciones.length > 3 && <Badge variant="outline">+{u.aplicaciones.length - 3}</Badge>}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "idioma", header: "Idioma / TZ", render: (u) => (
      <div className="text-xs">
        <p>{u.idioma}</p>
        <p className="text-muted-foreground">{u.zonaHoraria}</p>
      </div>
    ) },
    {
      key: "mfa",
      header: "MFA",
      render: (u) =>
        u.mfa ? (
          <span className="inline-flex items-center gap-1 text-success"><ShieldCheck className="size-4" /> Activo</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground"><ShieldOff className="size-4" /> Sin MFA</span>
        ),
    },
    {
      key: "acceso",
      header: "Último acceso",
      render: (u) =>
        new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(u.ultimoAcceso)),
    },
    { key: "estado", header: "Estado", render: (u) => <StatusBadge estado={u.estado} /> },
    {
      key: "activo",
      header: "Activar",
      render: (u) => (
        <Switch
          checked={u.estado === "activo"}
          aria-label={`Activar ${u.email}`}
          onCheckedChange={(v) =>
            guardar.mutate({ id: u.id, valores: { estado: v ? "activo" : "inactivo" } })
          }
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Usuarios internos y de empresas cliente, con roles, MFA e historial de accesos."
        acciones={
          <Button onClick={() => abrirForm(null)}>
            <Plus className="size-4" /> Nuevo usuario
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios totales" value={usuarios.length} icon={Users} />
        <StatCard label="Activos" value={usuarios.filter((u) => u.estado === "activo").length} />
        <StatCard label="Con MFA" value={`${Math.round((usuarios.filter((u) => u.mfa).length / usuarios.length) * 100)}%`} icon={ShieldCheck} />
        <StatCard label="Bloqueados / inactivos" value={usuarios.filter((u) => u.estado !== "activo").length} />
      </section>

      <FiltroClienteAviso />

      <DataTable
        data={usuarios}
        columnas={columnas}
        porPagina={10}
        onRowClick={abrirForm}
        buscar={(u) => `${u.nombre} ${u.apellidos} ${u.email} ${u.cargo} ${u.rol}`}
        checks={[
          {
            label: "No mostrar usuarios de clientes dados de baja",
            mostrar: (u) => !u.clienteId || getCliente(u.clienteId)?.estado !== "baja",
          },
        ]}
        filtros={[
          { label: "Estado", opciones: ["activo", "inactivo", "bloqueado"], match: (u, v) => u.estado === v },
          {
            label: "Rol",
            opciones: roles.length
              ? roles.map((r) => r.nombre)
              : [
                  "Administrador General",
                  "Administrador Comercial",
                  "Administrador Financiero",
                  "Soporte",
                  "Cliente Administrador",
                  "Usuario Cliente",
                ],
            match: (u, v) => u.rol === v,
          },
        ]}
      />

      <RecordFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        titulo={editando ? `Editar ${editando.nombre} ${editando.apellidos}` : "Nuevo usuario"}
        descripcion="Datos del usuario, empresa asociada, rol RBAC, seguridad y aplicaciones autorizadas."
        campos={camposUsuario(clientes, aplicaciones, roles)}
        valoresIniciales={filaUsuario(editando)}
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
