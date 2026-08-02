import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { modulosPermisos, roles, type NivelPermiso } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/permisos")({
  head: () => ({
    meta: [
      { title: "Roles y permisos RBAC · ServiceHub" },
      {
        name: "description",
        content: "Matriz RBAC de la plataforma: siete roles del sistema con permisos independientes por módulo.",
      },
      { property: "og:title", content: "Roles y permisos · ServiceHub" },
      { property: "og:description", content: "Control de acceso basado en roles para cada módulo del sistema." },
    ],
  }),
  component: PermisosPage,
});

const estilos: Record<NivelPermiso, string> = {
  total: "bg-success/12 text-success border-success/25",
  escritura: "bg-info/12 text-info border-info/25",
  lectura: "bg-warning/15 text-warning border-warning/30",
  ninguno: "bg-muted text-muted-foreground border-border",
};

function PermisosPage() {
  return (
    <>
      <PageHeader
        titulo="Roles y permisos"
        descripcion="Control de acceso RBAC: cada rol define permisos independientes sobre cada módulo."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((r) => (
          <div key={r.rol} className="surface p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold leading-tight">{r.rol}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.descripcion}</p>
              </div>
            </div>
            <Badge variant="secondary" className="mt-3">
              {r.usuarios} usuario{r.usuarios === 1 ? "" : "s"}
            </Badge>
          </div>
        ))}
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 bg-card p-3 text-left font-medium">Rol</th>
              {modulosPermisos.map((m) => (
                <th key={m} className="whitespace-nowrap p-3 text-left font-medium text-muted-foreground">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.rol} className="border-b border-border last:border-0">
                <td className="sticky left-0 bg-card p-3 font-medium">{r.rol}</td>
                {modulosPermisos.map((m) => (
                  <td key={m} className="p-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-xs capitalize",
                        estilos[r.permisos[m]],
                      )}
                    >
                      {r.permisos[m]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Cada módulo declara sus propios permisos en el registro central, de forma que añadir un módulo nuevo no
        obliga a modificar los existentes. Toda modificación de permisos queda registrada en auditoría.
      </p>
    </>
  );
}
