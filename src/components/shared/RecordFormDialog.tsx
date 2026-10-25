import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Campo = {
  name: string;
  label: string;
  tipo?:
    | "texto"
    | "numero"
    | "fecha"
    | "email"
    | "textarea"
    | "select"
    | "switch"
    | "multiselect";
  opciones?: { value: string; label: string }[];
  requerido?: boolean;
  numerico?: boolean;
  ancho?: "full";
  placeholder?: string;
  min?: number;
  max?: number;
  /** Agrupa campos bajo un encabezado dentro del formulario. */
  seccion?: string;
};

/**
 * Formulario genérico de alta/edición reutilizado por todos los módulos.
 * Soporta secciones, selects numéricos y selección múltiple (arrays).
 */
export function RecordFormDialog({
  open,
  onOpenChange,
  titulo,
  descripcion,
  campos,
  valoresIniciales,
  onSubmit,
  guardando,
  extra,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  titulo: string;
  descripcion?: string;
  campos: Campo[];
  valoresIniciales: Record<string, any>;
  onSubmit: (valores: Record<string, any>) => void;
  guardando?: boolean;
  extra?: ReactNode;
}) {
  const [valores, setValores] = useState<Record<string, any>>(valoresIniciales);

  useEffect(() => {
    if (open) setValores(valoresIniciales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: string, v: any) => setValores((p) => ({ ...p, [k]: v }));

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio: Record<string, any> = {};
    for (const c of campos) {
      const v = valores[c.name];
      if (c.requerido && (v == null || String(v).trim() === "")) {
        toast.error(`Completa el campo ${c.label}`);
        return;
      }
      limpio[c.name] =
        c.tipo === "multiselect"
          ? (Array.isArray(v) ? v : []).map((x) => (c.numerico ? Number(x) : x))
          : c.tipo === "select" && c.numerico
            ? v === "" || v == null
              ? null
              : Number(v)
            : c.tipo === "numero"
              ? Number(v ?? 0)
              : c.tipo === "switch"
                ? !!v
                : c.tipo === "fecha"
                  ? v || null
                  : (v ?? "");
    }
    onSubmit(limpio);
  };

  let seccionActual: string | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion ? <DialogDescription>{descripcion}</DialogDescription> : null}
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {campos.map((c) => {
              const nuevaSeccion = c.seccion && c.seccion !== seccionActual ? c.seccion : null;
              if (c.seccion) seccionActual = c.seccion;
              return (
                <div
                  key={c.name}
                  className={
                    c.ancho === "full" || c.tipo === "textarea" || c.tipo === "multiselect"
                      ? "sm:col-span-2"
                      : undefined
                  }
                  style={nuevaSeccion ? { gridColumn: "1 / -1" } : undefined}
                >
                  {nuevaSeccion && (
                    <h4 className="mb-3 border-b border-border pb-1.5 text-sm font-semibold">
                      {nuevaSeccion}
                    </h4>
                  )}
                  <div
                    className={
                      nuevaSeccion &&
                      !(c.ancho === "full" || c.tipo === "textarea" || c.tipo === "multiselect")
                        ? "sm:max-w-[calc(50%-0.5rem)]"
                        : undefined
                    }
                  >
                    <Label
                      htmlFor={c.name}
                      className="text-xs uppercase tracking-wide text-muted-foreground"
                    >
                      {c.label}
                    </Label>
                    <div className="mt-1.5">
                      {c.tipo === "multiselect" ? (
                        <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                          {(c.opciones ?? []).map((o) => {
                            const lista: string[] = (
                              Array.isArray(valores[c.name]) ? valores[c.name] : []
                            ).map((x: unknown) => String(x));
                            const marcado = lista.includes(o.value);
                            return (
                              <label
                                key={o.value}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                              >
                                <Checkbox
                                  checked={marcado}
                                  onCheckedChange={(v) =>
                                    set(
                                      c.name,
                                      v
                                        ? [...lista, o.value]
                                        : lista.filter((x) => x !== o.value),
                                    )
                                  }
                                />
                                {o.label}
                              </label>
                            );
                          })}
                          {(c.opciones ?? []).length === 0 && (
                            <p className="text-sm text-muted-foreground">Sin opciones disponibles.</p>
                          )}
                        </div>
                      ) : c.tipo === "select" ? (
                        <Select
                          value={String(valores[c.name] ?? "") || "__sin_valor__"}
                          onValueChange={(v) => set(c.name, v === "__sin_valor__" ? "" : v)}
                        >
                          <SelectTrigger id={c.name}>
                            <SelectValue placeholder={c.placeholder ?? "Selecciona…"} />
                          </SelectTrigger>
                          <SelectContent>
                            {(c.opciones ?? []).map((o) => (
                              <SelectItem key={o.value} value={o.value || "__sin_valor__"}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : c.tipo === "textarea" ? (
                        <Textarea
                          id={c.name}
                          value={valores[c.name] ?? ""}
                          onChange={(e) => set(c.name, e.target.value)}
                          rows={3}
                        />
                      ) : c.tipo === "switch" ? (
                        <div className="flex h-9 items-center">
                          <Switch
                            id={c.name}
                            checked={!!valores[c.name]}
                            onCheckedChange={(v) => set(c.name, v)}
                          />
                        </div>
                      ) : (
                        <Input
                          id={c.name}
                          type={
                            c.tipo === "numero"
                              ? "number"
                              : c.tipo === "fecha"
                                ? "date"
                                : c.tipo === "email"
                                  ? "email"
                                  : "text"
                          }
                          step={c.tipo === "numero" ? "any" : undefined}
                          required={c.requerido}
                          min={c.min}
                          max={c.max}
                          placeholder={c.placeholder ?? ""}
                          value={valores[c.name] ?? ""}
                          onChange={(e) => set(c.name, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {extra}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
