import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  className,
  to,
  search,
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: number;
  icon?: LucideIcon;
  className?: string;
  /** Destino al pulsar el cuadro (módulo correspondiente). */
  to?: string;
  /** Filtros que se aplicarán en el módulo de destino. */
  search?: Record<string, string | number>;
}) {
  const positivo = (delta ?? 0) >= 0;

  const contenido = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              positivo ? "text-success" : "text-destructive",
            )}
          >
            {positivo ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint ? <span className="text-muted-foreground">{hint}</span> : null}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to={to as any}
        search={((prev: Record<string, unknown>) => ({ ...prev, ...(search ?? {}) })) as never}
        className={cn(
          "surface block p-4 text-left transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {contenido}
      </Link>
    );
  }

  return <div className={cn("surface p-4", className)}>{contenido}</div>;
}
