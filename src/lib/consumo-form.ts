import type { Campo } from "@/components/shared/RecordFormDialog";
import type { RegistroConsumo } from "@/lib/mock-data";

export function camposConsumo(clientes: { id: number; nombreComercial: string }[], aplicaciones: { id: number; nombre: string }[]): Campo[] {
  return [
    { name: "cliente_id", label: "Cliente", tipo: "select", numerico: true, requerido: true, opciones: clientes.map((c) => ({ value: String(c.id), label: c.nombreComercial })) },
    { name: "aplicacion_id", label: "Aplicación", tipo: "select", numerico: true, requerido: true, opciones: aplicaciones.map((a) => ({ value: String(a.id), label: a.nombre })) },
    { name: "metrica", label: "Métrica", requerido: true },
    { name: "unidad", label: "Unidad", requerido: true },
    { name: "periodo", label: "Periodo", requerido: true, placeholder: "2026-10" },
    { name: "consumido", label: "Consumo registrado", tipo: "numero", min: 0, requerido: true },
    { name: "incluido", label: "Consumo incluido", tipo: "numero", min: 0 },
    { name: "coste_unitario", label: "Coste unitario (€)", tipo: "numero", min: 0 },
  ];
}

export function filaConsumo(c?: RegistroConsumo | null, clienteId?: number | null) {
  return { cliente_id: c?.clienteId ?? clienteId ?? "", aplicacion_id: c?.aplicacionId ?? "", metrica: c?.metrica ?? "", unidad: c?.unidad ?? "", periodo: c?.periodo ?? new Date().toISOString().slice(0, 7), consumido: c?.consumido ?? 0, incluido: c?.incluido ?? 0, coste_unitario: c?.costeUnitario ?? 0 };
}