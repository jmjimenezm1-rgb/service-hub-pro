import { cn } from "@/lib/utils";

type Tono = "success" | "warning" | "danger" | "info" | "neutral";

const tonos: Record<Tono, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-info/12 text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

const mapa: Record<string, Tono> = {
  activo: "success",
  activa: "success",
  publicada: "success",
  cobrado: "success",
  prueba: "info",
  beta: "info",
  prospecto: "info",
  mantenimiento: "warning",
  suspendida: "warning",
  pendiente: "warning",
  impago: "danger",
  impagado: "danger",
  bloqueado: "danger",
  cancelada: "danger",
  retirada: "neutral",
  baja: "neutral",
  inactivo: "neutral",
};

export function StatusBadge({ estado, className }: { estado: string; className?: string }) {
  const tono = mapa[estado.toLowerCase()] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        tonos[tono],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {estado}
    </span>
  );
}
