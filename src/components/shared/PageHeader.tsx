import type { ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion: string;
  acciones?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label="Volver a la pantalla anterior"
          className="mt-0.5 shrink-0"
          onClick={() => router.history.back()}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
        </div>
      </div>
      {acciones ? <div className="flex flex-wrap gap-2">{acciones}</div> : null}
    </div>
  );
}
