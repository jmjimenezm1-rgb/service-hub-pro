import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Aplicacion,
  Cliente,
  Notificacion,
  RegistroConsumo,
  Suscripcion,
  Usuario,
} from "@/lib/mock-data";

/**
 * Capa de acceso a datos de ServiceHub.
 *
 * Cada módulo consume su propia consulta; las filas de la base de datos
 * (snake_case) se mapean a los tipos de dominio de la aplicación (camelCase),
 * de forma que los módulos permanecen desacoplados del esquema físico.
 */

type Row = Record<string, any>;

const auditoria = (r: Row) => ({
  id: Number(r.id),
  uuid: String(r.id),
  created_at: r.created_at,
  updated_at: r.updated_at,
  deleted_at: r.deleted_at ?? null,
  created_by: "sistema",
  updated_by: "sistema",
});

const aCliente = (r: Row): Cliente => ({
  ...auditoria(r),
  razonSocial: r.razon_social,
  nombreComercial: r.nombre_comercial,
  nif: r.nif,
  direccion: r.direccion,
  provincia: r.provincia,
  pais: r.pais,
  contacto: r.contacto,
  email: r.email,
  telefono: r.telefono,
  web: r.web,
  sector: r.sector,
  empleados: r.empleados,
  estado: r.estado,
  fechaAlta: r.fecha_alta,
  fechaBaja: r.fecha_baja,
  observaciones: r.observaciones,
  etiquetas: r.etiquetas ?? [],
  documentos: r.documentos,
  mrr: Number(r.mrr),
});

const aAplicacion = (r: Row): Aplicacion => ({
  ...auditoria(r),
  nombre: r.nombre,
  descripcion: r.descripcion,
  version: r.version,
  estado: r.estado,
  categoria: r.categoria,
  url: r.url,
  proveedor: r.proveedor,
  modeloCobro: r.modelo_cobro,
  precioBase: Number(r.precio_base),
  precioUsuario: Number(r.precio_usuario),
  precioUso: Number(r.precio_uso),
  unidadUso: r.unidad_uso,
  limites: r.limites,
  logo: r.logo,
});

const aSuscripcion = (r: Row): Suscripcion => ({
  ...auditoria(r),
  clienteId: Number(r.cliente_id),
  aplicacionId: Number(r.aplicacion_id),
  fechaInicio: r.fecha_inicio,
  fechaRenovacion: r.fecha_renovacion,
  estado: r.estado,
  modalidad: r.modalidad,
  maxUsuarios: r.max_usuarios,
  consumoContratado: Number(r.consumo_contratado),
  consumoReal: Number(r.consumo_real),
  precio: Number(r.precio),
  descuento: Number(r.descuento),
  periodicidad: r.periodicidad,
  renovacionAutomatica: r.renovacion_automatica,
  observaciones: r.observaciones,
});

const aUsuario = (r: Row): Usuario => ({
  ...auditoria(r),
  nombre: r.nombre,
  apellidos: r.apellidos,
  email: r.email,
  telefono: r.telefono,
  cargo: r.cargo,
  departamento: r.departamento,
  clienteId: r.cliente_id === null ? null : Number(r.cliente_id),
  estado: r.estado,
  idioma: r.idioma,
  zonaHoraria: r.zona_horaria,
  ultimoAcceso: r.ultimo_acceso ?? new Date().toISOString(),
  rol: r.rol,
  aplicaciones: (r.aplicaciones ?? []).map(Number),
  mfa: r.mfa,
});

const aConsumo = (r: Row): RegistroConsumo => ({
  id: Number(r.id),
  clienteId: Number(r.cliente_id),
  aplicacionId: Number(r.aplicacion_id),
  metrica: r.metrica,
  unidad: r.unidad,
  consumido: Number(r.consumido),
  incluido: Number(r.incluido),
  costeUnitario: Number(r.coste_unitario),
  periodo: r.periodo,
});

const aNotificacion = (r: Row): Notificacion => ({
  ...auditoria(r),
  asunto: r.asunto,
  mensaje: r.mensaje,
  canal: r.canal,
  categoria: r.categoria,
  estado: r.estado,
  prioridad: r.prioridad,
  destinatario: r.destinatario,
  clienteId: r.cliente_id === null ? undefined : Number(r.cliente_id),
  aplicacionId: r.aplicacion_id === null ? undefined : Number(r.aplicacion_id),
  plantilla: r.plantilla,
  enviadaEn: r.enviada_en,
});

async function listar<T>(tabla: string, orden: string, mapper: (r: Row) => T): Promise<T[]> {
  const { data, error } = await supabase.from(tabla as never).select("*").order(orden);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapper as never) as T[];
}

export const clientesQuery = queryOptions({
  queryKey: ["clientes"],
  queryFn: () => listar("clientes", "nombre_comercial", aCliente),
});

export const aplicacionesQuery = queryOptions({
  queryKey: ["aplicaciones"],
  queryFn: () => listar("aplicaciones", "nombre", aAplicacion),
});

export const suscripcionesQuery = queryOptions({
  queryKey: ["suscripciones"],
  queryFn: () => listar("suscripciones", "id", aSuscripcion),
});

export const usuariosQuery = queryOptions({
  queryKey: ["usuarios"],
  queryFn: () => listar("usuarios", "id", aUsuario),
});

export const consumosQuery = queryOptions({
  queryKey: ["consumos"],
  queryFn: () => listar("consumos", "id", aConsumo),
});

export const notificacionesQuery = queryOptions({
  queryKey: ["notificaciones"],
  queryFn: () => listar("notificaciones", "enviada_en", aNotificacion),
});

/* ------------------------------- Hooks -------------------------------- */

const vacio: never[] = [];

export const useClientes = () => useQuery(clientesQuery).data ?? (vacio as Cliente[]);
export const useAplicaciones = () => useQuery(aplicacionesQuery).data ?? (vacio as Aplicacion[]);
export const useSuscripciones = () => useQuery(suscripcionesQuery).data ?? (vacio as Suscripcion[]);
export const useUsuarios = () => useQuery(usuariosQuery).data ?? (vacio as Usuario[]);
export const useConsumos = () => useQuery(consumosQuery).data ?? (vacio as RegistroConsumo[]);
export const useNotificaciones = () => useQuery(notificacionesQuery).data ?? (vacio as Notificacion[]);

/** Catálogo compartido: clientes y aplicaciones con búsqueda por id. */
export function useCatalogo() {
  const clientes = useClientes();
  const aplicaciones = useAplicaciones();
  return {
    clientes,
    aplicaciones,
    getCliente: (id: number) => clientes.find((c) => c.id === id),
    getAplicacion: (id: number) => aplicaciones.find((a) => a.id === id),
  };
}
