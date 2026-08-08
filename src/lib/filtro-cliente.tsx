import { useRouter, useRouterState } from "@tanstack/react-router";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientes } from "@/lib/db";

/**
 * Filtro transversal por cliente: los módulos leen `?cliente=<id>` de la URL
 * para mostrar únicamente los registros de la empresa desde la que se accede.
 */
export function useClienteFiltro(): number | null {
  const search = useRouterState({ select: (s) => s.location.search }) as unknown as Record<
    string,
    unknown
  >;
  const bruto = search?.["cliente"];
  const id = Number(bruto);
  return bruto !== undefined && bruto !== "" && Number.isFinite(id) ? id : null;
}

/** Aplica el filtro de cliente a cualquier colección con `clienteId`. */
export function filtrarPorCliente<T>(
  filas: T[],
  clienteId: number | null,
  obtener: (fila: T) => number | null | undefined,
): T[] {
  if (clienteId === null) return filas;
  return filas.filter((f) => obtener(f) === clienteId);
}

/** Aviso visible cuando el módulo está filtrado por una empresa concreta. */
export function FiltroClienteAviso() {
  const clienteId = useClienteFiltro();
  const router = useRouter();
  const clientes = useClientes();
  if (clienteId === null) return null;
  const cliente = clientes.find((c) => c.id === clienteId);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
      <Filter className="size-4 text-muted-foreground" />
      <span>
        Filtrado por cliente:{" "}
        <strong>{cliente?.nombreComercial ?? `#${clienteId}`}</strong>
      </span>
      <Button
        size="sm"
        variant="ghost"
        className="ml-auto"
        onClick={() => router.navigate({ to: router.state.location.pathname, search: {} })}
      >
        <X className="size-4" /> Quitar filtro
      </Button>
    </div>
  );
}
