import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Fila = Record<string, any>;

/**
 * Alta y edición genérica sobre cualquier tabla de módulo.
 * Las políticas RLS exigen sesión activa para escribir.
 */
export function useGuardarRegistro(tabla: string, queryKey: string, etiqueta: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, valores }: { id?: number; valores: Fila }) => {
      const q = supabase.from(tabla as never);
      const { data, error } = id
        ? await (q as any).update(valores).eq("id", id).select("id").single()
        : await (q as any).insert(valores).select("id").single();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("No tienes permiso para modificar este registro.");
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      qc.invalidateQueries({ queryKey: ["auditoria"] });
      toast.success(vars.id ? `${etiqueta} actualizado` : `${etiqueta} creado`);
    },
    onError: (e: Error) =>
      toast.error("No se pudo guardar", {
        description: /row-level security|JWT|permission/i.test(e.message)
          ? "Tu cuenta no tiene permiso para guardar este registro en esta empresa."
          : e.message,
      }),
  });
}

/** Baja de registro: soft delete cuando la tabla tiene deleted_at. */
export function useEliminarRegistro(
  tabla: string,
  queryKey: string,
  etiqueta: string,
  soft = true,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const q = supabase.from(tabla as never) as any;
      const { data, error } = soft
        ? await q.update({ deleted_at: new Date().toISOString() }).eq("id", id).select("id").single()
        : await q.delete().eq("id", id).select("id").single();
      if (error) throw new Error(error.message);
      if (!data) throw new Error("No tienes permiso para eliminar este registro.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      qc.invalidateQueries({ queryKey: ["auditoria"] });
      toast.success(`${etiqueta} dado de baja`);
    },
    onError: (e: Error) =>
      toast.error("No se pudo eliminar", {
        description: /row-level security|JWT|permission/i.test(e.message)
          ? "Tu cuenta no tiene permiso para eliminar este registro en esta empresa."
          : e.message,
      }),
  });
}
