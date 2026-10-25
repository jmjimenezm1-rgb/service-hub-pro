import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { useGuardarRegistro } from "@/lib/mutations";
import { useRolPermisos, useRoles, useUsuarios, type Rol } from "@/lib/db";
import { modulosPermisos, type NivelPermiso } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/permisos")({
  head: () => ({
    meta: [
      { title: "Roles y permisos RBAC · ServiceHub" },
      {
        name: "description",
        content:
          "Gestión RBAC: crear, editar y suprimir roles y ajustar sus permisos por módulo con control de usuarios asignados.",
      },
      { property: "og:title", content: "Roles y permisos · ServiceHub" },
      {
        property: "og:description",
        content: "Control de acceso basado en roles editable para cada módulo del sistema.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PermisosPage,
});

const niveles: NivelPermiso[] = ["ninguno", "lectura", "escritura", "total"];

const estilos: Record<NivelPermiso, string> = {
  total: "bg-success/12 text-success border-success/25",
  escritura: "bg-info/12 text-info border-info/25",
  lectura: "bg-warning/15 text-warning border-warning/30",
  ninguno: "bg-muted text-muted-foreground border-border",
};

function PermisosPage() {
  const roles = useRoles();
  const permisos = useRolPermisos();
  const usuarios = useUsuarios();
  const qc = useQueryClient();

  const [editando, setEditando] = useState<Rol | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [aBorrar, setABorrar] = useState<Rol | null>(null);

  const guardarRol = useGuardarRegistro("roles", "roles", "Rol");

  const nivelDe = (rolId: number, modulo: string): NivelPermiso =>
    (permisos.find((p) => p.rolId === rolId && p.modulo === modulo)?.nivel as NivelPermiso) ??
    "ninguno";

  const usuariosDe = (nombre: string) => usuarios.filter((u) => u.rol === nombre);

  const cambiarPermiso = useMutation({
    mutationFn: async ({
      rolId,
      modulo,
      nivel,
    }: {
      rolId: number;
      modulo: string;
      nivel: string;
    }) => {
      const existente = permisos.find((p) => p.rolId === rolId && p.modulo === modulo);
      const { error } = existente
        ? await supabase.from("rol_permisos").update({ nivel }).eq("id", existente.id)
        : await supabase.from("rol_permisos").insert({ rol_id: rolId, modulo, nivel });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rol_permisos"] }),
    onError: (e: Error) =>
      toast.error("No se pudo actualizar el permiso", {
        description: /row-level security|JWT|permission/i.test(e.message)
          ? "Inicia sesión para modificar permisos."
          : e.message,
      }),
  });

  const borrarRol = useMutation({
    mutationFn: async (rol: Rol) => {
      const { error: e1 } = await supabase.from("rol_permisos").delete().eq("rol_id", rol.id);
      if (e1) throw new Error(e1.message);
      const { error } = await supabase.from("roles").delete().eq("id", rol.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["rol_permisos"] });
      toast.success("Rol suprimido");
      setABorrar(null);
    },
    onError: (e: Error) =>
      toast.error("No se pudo suprimir el rol", {
        description: /row-level security|JWT|permission/i.test(e.message)
          ? "Inicia sesión para suprimir roles."
          : e.message,
      }),
  });

  const abrirForm = (r: Rol | null) => {
    setEditando(r);
    setFormAbierto(true);
  };

  const bloqueado = aBorrar ? usuariosDe(aBorrar.nombre) : [];

  return (
    <>
      <PageHeader
        titulo="Roles y permisos"
        descripcion="Control de acceso RBAC: crea, edita o suprime roles y ajusta sus permisos por módulo."
        acciones={
          <Button onClick={() => abrirForm(null)}>
            <Plus className="size-4" /> Nuevo rol
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((r) => (
          <div key={r.id} className="surface p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{r.nombre}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.descripcion}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant="secondary">
                {usuariosDe(r.nombre).length} usuario{usuariosDe(r.nombre).length === 1 ? "" : "s"}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${r.nombre}`}
                  onClick={() => abrirForm(r)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Suprimir ${r.nombre}`}
                  onClick={() => setABorrar(r)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 bg-card p-3 text-left font-medium">Rol</th>
              {modulosPermisos.map((m) => (
                <th
                  key={m}
                  className="whitespace-nowrap p-3 text-left font-medium text-muted-foreground"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 bg-card p-3 font-medium">{r.nombre}</td>
                {modulosPermisos.map((m) => {
                  const nivel = nivelDe(r.id, m);
                  return (
                    <td key={m} className="p-2">
                      <Select
                        value={nivel}
                        onValueChange={(v) =>
                          cambiarPermiso.mutate({ rolId: r.id, modulo: m, nivel: v })
                        }
                      >
                        <SelectTrigger
                          aria-label={`Permiso de ${r.nombre} en ${m}`}
                          className={cn("h-8 w-[130px] capitalize", estilos[nivel])}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {niveles.map((n) => (
                            <SelectItem key={n} value={n} className="capitalize">
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Cada módulo declara sus propios permisos, de forma que añadir un módulo nuevo no obliga a
        modificar los existentes. Toda modificación de permisos queda registrada en auditoría.
      </p>

      <RecordFormDialog
        open={formAbierto}
        onOpenChange={setFormAbierto}
        titulo={editando ? `Editar rol ${editando.nombre}` : "Nuevo rol"}
        descripcion="Define el nombre y la finalidad del rol; los permisos se ajustan en la matriz."
        campos={[
          { name: "nombre", label: "Nombre del rol", requerido: true },
          { name: "descripcion", label: "Descripción", tipo: "textarea" },
        ]}
        valoresIniciales={{
          nombre: editando?.nombre ?? "",
          descripcion: editando?.descripcion ?? "",
        }}
        guardando={guardarRol.isPending}
        onSubmit={(valores) =>
          guardarRol.mutate(
            { ...(editando ? { id: editando.id } : {}), valores },
            { onSuccess: () => setFormAbierto(false) },
          )
        }
      />

      <AlertDialog open={!!aBorrar} onOpenChange={(o) => !o && setABorrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bloqueado.length ? "No se puede suprimir este rol" : `Suprimir ${aBorrar?.nombre}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bloqueado.length
                ? `El rol "${aBorrar?.nombre}" está asignado a ${bloqueado.length} usuario(s) activos (${bloqueado
                    .slice(0, 3)
                    .map((u) => u.email)
                    .join(", ")}${bloqueado.length > 3 ? "…" : ""}). Cambia primero su rol en el módulo de Usuarios y vuelve a intentarlo.`
                : "Se eliminarán el rol y sus permisos por módulo. Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {bloqueado.length === 0 && (
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  if (aBorrar) borrarRol.mutate(aBorrar);
                }}
              >
                Suprimir
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
