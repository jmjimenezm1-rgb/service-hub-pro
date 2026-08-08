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

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = any;

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
  iban: r.iban ?? "",
  banco: r.banco ?? "",
  titularCuenta: r.titular_cuenta ?? "",
  bic: r.bic ?? "",
  formaPago: r.forma_pago ?? "domiciliacion",
  mandatoSepa: r.mandato_sepa ?? "",
  fechaMandato: r.fecha_mandato ?? null,
  moneda: r.moneda ?? "EUR",
  tarifa: r.tarifa ?? "estandar",
  descuentoGeneral: Number(r.descuento_general ?? 0),
  diaPago: Number(r.dia_pago ?? 1),
  diasVencimiento: Number(r.dias_vencimiento ?? 30),
  limiteCredito: Number(r.limite_credito ?? 0),
  periodoFacturacion: r.periodo_facturacion ?? "mensual",
  iva: Number(r.iva ?? 21),
  retencion: Number(r.retencion ?? 0),
  condicionesNotas: r.condiciones_notas ?? "",
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
  ...(r.cliente_id === null ? {} : { clienteId: Number(r.cliente_id) }),
  ...(r.aplicacion_id === null ? {} : { aplicacionId: Number(r.aplicacion_id) }),
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

/* ------------------- Roles, permisos e historial ---------------------- */

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  sistema: boolean;
}

export interface RolPermiso {
  id: number;
  rolId: number;
  modulo: string;
  nivel: string;
}

export interface EntradaHistorial {
  id: number;
  clienteId: number;
  tipo: string;
  titulo: string;
  detalle: string;
  autor: string;
  created_at: string;
}

export const rolesQuery = queryOptions({
  queryKey: ["roles"],
  queryFn: () =>
    listar("roles", "id", (r: Row): Rol => ({
      id: Number(r.id),
      nombre: r.nombre,
      descripcion: r.descripcion,
      sistema: !!r.sistema,
    })),
});

export const rolPermisosQuery = queryOptions({
  queryKey: ["rol_permisos"],
  queryFn: () =>
    listar("rol_permisos", "id", (r: Row): RolPermiso => ({
      id: Number(r.id),
      rolId: Number(r.rol_id),
      modulo: r.modulo,
      nivel: r.nivel,
    })),
});

export const historialQuery = queryOptions({
  queryKey: ["cliente_historial"],
  queryFn: async (): Promise<EntradaHistorial[]> => {
    const { data, error } = await supabase
      .from("cliente_historial")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: Row) => ({
      id: Number(r.id),
      clienteId: Number(r.cliente_id),
      tipo: r.tipo,
      titulo: r.titulo,
      detalle: r.detalle,
      autor: r.autor,
      created_at: r.created_at,
    }));
  },
});

/* ------------------------------- Hooks -------------------------------- */

const vacio: never[] = [];

export const useClientes = () => useQuery(clientesQuery).data ?? (vacio as Cliente[]);
export const useAplicaciones = () => useQuery(aplicacionesQuery).data ?? (vacio as Aplicacion[]);
export const useSuscripciones = () => useQuery(suscripcionesQuery).data ?? (vacio as Suscripcion[]);
export const useUsuarios = () => useQuery(usuariosQuery).data ?? (vacio as Usuario[]);
export const useConsumos = () => useQuery(consumosQuery).data ?? (vacio as RegistroConsumo[]);
export const useNotificaciones = () => useQuery(notificacionesQuery).data ?? (vacio as Notificacion[]);

export const useRoles = () => useQuery(rolesQuery).data ?? (vacio as Rol[]);
export const useRolPermisos = () => useQuery(rolPermisosQuery).data ?? (vacio as RolPermiso[]);
export const useHistorial = () => useQuery(historialQuery).data ?? (vacio as EntradaHistorial[]);

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

/* ---------------------------- Agenda CRM ------------------------------ */

export interface EntradaAgenda {
  id: number;
  clienteId: number;
  contacto: string;
  aplicacionId: number | null;
  tipo: string;
  asunto: string;
  comentarios: string;
  fechaPlanificada: string;
  fechaReal: string | null;
  estado: string;
  origen: string;
  referenciaExterna: string;
  created_at: string;
}

export const agendaQuery = queryOptions({
  queryKey: ["agenda_cliente"],
  queryFn: () =>
    listar("agenda_cliente", "fecha_planificada", (r: Row): EntradaAgenda => ({
      id: Number(r.id),
      clienteId: Number(r.cliente_id),
      contacto: r.contacto ?? "",
      aplicacionId: r.aplicacion_id === null ? null : Number(r.aplicacion_id),
      tipo: r.tipo,
      asunto: r.asunto,
      comentarios: r.comentarios ?? "",
      fechaPlanificada: r.fecha_planificada,
      fechaReal: r.fecha_real ?? null,
      estado: r.estado,
      origen: r.origen ?? "manual",
      referenciaExterna: r.referencia_externa ?? "",
      created_at: r.created_at,
    })),
});

export const useAgenda = () => useQuery(agendaQuery).data ?? (vacio as EntradaAgenda[]);
