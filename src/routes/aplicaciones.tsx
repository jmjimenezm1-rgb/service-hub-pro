import { createFileRoute } from "@tanstack/react-router";
import { Plus, ExternalLink, BookOpen, Code2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eur } from "@/lib/mock-data";
import { useAplicaciones, useSuscripciones } from "@/lib/db";

export const Route = createFileRoute("/aplicaciones")({
  head: () => ({
    meta: [
      { title: "Catálogo de aplicaciones · ServiceHub" },
      {
        name: "description",
        content: "Catálogo de aplicaciones SaaS comercializadas: versiones, modelo de cobro, precios y límites.",
      },
      { property: "og:title", content: "Catálogo de aplicaciones · ServiceHub" },
      { property: "og:description", content: "Gestiona el catálogo SaaS, precios y modelos de cobro por uso." },
    ],
  }),
  component: AplicacionesPage,
});

const etiquetaModelo: Record<string, string> = {
  fijo: "Pago fijo",
  por_usuario: "Por usuario",
  por_uso: "Por uso",
  hibrido: "Híbrido",
};

function AplicacionesPage() {
  const aplicaciones = useAplicaciones();
  const suscripciones = useSuscripciones();
  return (
    <>
      <PageHeader
        titulo="Aplicaciones"
        descripcion="Catálogo de aplicaciones SaaS disponibles para contratación por parte de los clientes."
        acciones={
          <Button>
            <Plus className="size-4" /> Nueva aplicación
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {aplicaciones.map((a) => {
          const contratos = suscripciones.filter((s) => s.aplicacionId === a.id).length;
          return (
            <article key={a.id} className="surface flex flex-col p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {a.logo}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold">{a.nombre}</h2>
                    <Badge variant="outline" className="tabular-nums">
                      v{a.version}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.categoria} · {a.proveedor}
                  </p>
                </div>
                <StatusBadge estado={a.estado} />
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{a.descripcion}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border p-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Modelo</dt>
                  <dd className="font-medium">{etiquetaModelo[a.modeloCobro]}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Precio base</dt>
                  <dd className="font-medium tabular-nums">{eur(a.precioBase)}/mes</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Por usuario</dt>
                  <dd className="font-medium tabular-nums">{a.precioUsuario ? `${eur(a.precioUsuario)}/mes` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Por uso</dt>
                  <dd className="font-medium tabular-nums">
                    {a.precioUso ? `${a.precioUso} € / ${a.unidadUso}` : "—"}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 text-xs text-muted-foreground">Límites: {a.limites}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" /> Abrir
                  </a>
                </Button>
                <Button variant="ghost" size="sm">
                  <BookOpen className="size-3.5" /> Manual
                </Button>
                <Button variant="ghost" size="sm">
                  <Code2 className="size-3.5" /> API
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">{contratos} suscripción(es)</span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
