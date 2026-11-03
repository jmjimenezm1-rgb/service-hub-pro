import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { organizacionesQuery } from "@/lib/organizaciones";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_authenticated/organizaciones")({
  head: () => ({
    meta: [
      { title: "Empresas gestoras · ServiceHub" },
      { name: "description", content: "Empresas gestoras y acceso empresarial de ServiceHub." },
      { property: "og:title", content: "Empresas gestoras · ServiceHub" },
      { property: "og:description", content: "Directorio privado de empresas gestoras de ServiceHub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(organizacionesQuery),
  component: OrganizacionesPage,
});

function OrganizacionesPage() {
  const { data } = useSuspenseQuery(organizacionesQuery);
  return (
    <>
      <PageHeader titulo="Empresas gestoras" descripcion="Acceso empresarial" />
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border-y border-border py-12 text-center">
          <Building2 className="size-8 text-muted-foreground" />
          <h2 className="text-base font-semibold">Sin empresas asignadas</h2>
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {data.map((empresa) => (
            <div key={empresa.id} className="flex items-center gap-3 py-4">
              <Building2 className="size-5 text-muted-foreground" />
              <span className="min-w-0 flex-1 break-words font-medium">{empresa.nombre}</span>
              <span className="text-sm text-muted-foreground">{empresa.activa ? "Activa" : "Inactiva"}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}