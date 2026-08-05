import type { Campo } from "@/components/shared/RecordFormDialog";
import type { Aplicacion, Cliente, Notificacion, Suscripcion, Usuario } from "@/lib/mock-data";

const op = (...v: string[]) => v.map((x) => ({ value: x, label: x.replace(/_/g, " ") }));

/* ------------------------------- CRM ---------------------------------- */

export const camposCliente: Campo[] = [
  { name: "nombre_comercial", label: "Nombre comercial", requerido: true },
  { name: "razon_social", label: "Razón social", requerido: true },
  { name: "nif", label: "NIF / CIF", requerido: true },
  { name: "sector", label: "Sector" },
  { name: "direccion", label: "Dirección", ancho: "full" },
  { name: "provincia", label: "Provincia" },
  { name: "pais", label: "País" },
  { name: "contacto", label: "Persona de contacto" },
  { name: "email", label: "Email", tipo: "email" },
  { name: "telefono", label: "Teléfono" },
  { name: "web", label: "Web" },
  { name: "empleados", label: "Empleados", tipo: "numero" },
  { name: "mrr", label: "MRR (€)", tipo: "numero" },
  { name: "estado", label: "Estado", tipo: "select", opciones: op("prospecto", "prueba", "activo", "impago", "baja") },
  { name: "fecha_alta", label: "Fecha de alta", tipo: "fecha" },
  { name: "observaciones", label: "Observaciones", tipo: "textarea" },
];

export const filaCliente = (c?: Cliente | null) => ({
  nombre_comercial: c?.nombreComercial ?? "",
  razon_social: c?.razonSocial ?? "",
  nif: c?.nif ?? "",
  sector: c?.sector ?? "",
  direccion: c?.direccion ?? "",
  provincia: c?.provincia ?? "",
  pais: c?.pais ?? "España",
  contacto: c?.contacto ?? "",
  email: c?.email ?? "",
  telefono: c?.telefono ?? "",
  web: c?.web ?? "",
  empleados: c?.empleados ?? 0,
  mrr: c?.mrr ?? 0,
  estado: c?.estado ?? "prospecto",
  fecha_alta: c?.fechaAlta ?? new Date().toISOString().slice(0, 10),
  observaciones: c?.observaciones ?? "",
});

/* --------------------------- Aplicaciones ----------------------------- */

export const camposAplicacion: Campo[] = [
  { name: "nombre", label: "Nombre", requerido: true },
  { name: "logo", label: "Siglas / logo", placeholder: "SH" },
  { name: "descripcion", label: "Descripción", tipo: "textarea" },
  { name: "version", label: "Versión" },
  { name: "estado", label: "Estado", tipo: "select", opciones: op("activa", "beta", "mantenimiento", "retirada") },
  { name: "categoria", label: "Categoría" },
  { name: "proveedor", label: "Proveedor" },
  { name: "url", label: "URL" },
  { name: "modelo_cobro", label: "Modelo de cobro", tipo: "select", opciones: op("fijo", "por_usuario", "por_uso", "hibrido") },
  { name: "precio_base", label: "Precio base (€)", tipo: "numero" },
  { name: "precio_usuario", label: "Precio por usuario (€)", tipo: "numero" },
  { name: "precio_uso", label: "Precio por uso (€)", tipo: "numero" },
  { name: "unidad_uso", label: "Unidad de uso", placeholder: "tokens, llamadas…" },
  { name: "limites", label: "Límites incluidos", ancho: "full" },
];

export const filaAplicacion = (a?: Aplicacion | null) => ({
  nombre: a?.nombre ?? "",
  logo: a?.logo ?? "",
  descripcion: a?.descripcion ?? "",
  version: a?.version ?? "1.0.0",
  estado: a?.estado ?? "beta",
  categoria: a?.categoria ?? "",
  proveedor: a?.proveedor ?? "",
  url: a?.url ?? "",
  modelo_cobro: a?.modeloCobro ?? "fijo",
  precio_base: a?.precioBase ?? 0,
  precio_usuario: a?.precioUsuario ?? 0,
  precio_uso: a?.precioUso ?? 0,
  unidad_uso: a?.unidadUso ?? "",
  limites: a?.limites ?? "",
});

/* --------------------------- Suscripciones ---------------------------- */

export function camposSuscripcion(
  clientes: { id: number; nombreComercial: string }[],
  aplicaciones: { id: number; nombre: string }[],
): Campo[] {
  return [
    {
      name: "cliente_id",
      label: "Cliente",
      tipo: "select",
      numerico: true,
      opciones: clientes.map((c) => ({ value: String(c.id), label: c.nombreComercial })),
    },
    {
      name: "aplicacion_id",
      label: "Aplicación",
      tipo: "select",
      numerico: true,
      opciones: aplicaciones.map((a) => ({ value: String(a.id), label: a.nombre })),
    },
    { name: "fecha_inicio", label: "Inicio", tipo: "fecha" },
    { name: "fecha_renovacion", label: "Renovación", tipo: "fecha" },
    { name: "estado", label: "Estado", tipo: "select", opciones: op("activa", "prueba", "suspendida", "cancelada") },
    { name: "modalidad", label: "Modalidad", tipo: "select", opciones: op("fijo", "por_usuario", "por_uso", "hibrido") },
    { name: "periodicidad", label: "Periodicidad", tipo: "select", opciones: op("mensual", "trimestral", "anual") },
    { name: "max_usuarios", label: "Máx. usuarios", tipo: "numero" },
    { name: "consumo_contratado", label: "Consumo contratado", tipo: "numero" },
    { name: "consumo_real", label: "Consumo real", tipo: "numero" },
    { name: "precio", label: "Precio (€)", tipo: "numero" },
    { name: "descuento", label: "Descuento (%)", tipo: "numero" },
    { name: "renovacion_automatica", label: "Renovación automática", tipo: "switch" },
    { name: "observaciones", label: "Observaciones", tipo: "textarea" },
  ];
}

export const filaSuscripcion = (s?: Suscripcion | null) => ({
  cliente_id: s?.clienteId ?? "",
  aplicacion_id: s?.aplicacionId ?? "",
  fecha_inicio: s?.fechaInicio ?? new Date().toISOString().slice(0, 10),
  fecha_renovacion: s?.fechaRenovacion ?? new Date().toISOString().slice(0, 10),
  estado: s?.estado ?? "activa",
  modalidad: s?.modalidad ?? "fijo",
  periodicidad: s?.periodicidad ?? "mensual",
  max_usuarios: s?.maxUsuarios ?? 0,
  consumo_contratado: s?.consumoContratado ?? 0,
  consumo_real: s?.consumoReal ?? 0,
  precio: s?.precio ?? 0,
  descuento: s?.descuento ?? 0,
  renovacion_automatica: s?.renovacionAutomatica ?? false,
  observaciones: s?.observaciones ?? "",
});

/* ------------------------------ Usuarios ------------------------------ */

export function camposUsuario(clientes: { id: number; nombreComercial: string }[]): Campo[] {
  return [
    { name: "nombre", label: "Nombre", requerido: true },
    { name: "apellidos", label: "Apellidos" },
    { name: "email", label: "Email", tipo: "email", requerido: true },
    { name: "telefono", label: "Teléfono" },
    { name: "cargo", label: "Cargo" },
    { name: "departamento", label: "Departamento" },
    {
      name: "cliente_id",
      label: "Empresa",
      tipo: "select",
      numerico: true,
      opciones: [
        { value: "", label: "ServiceHub (interno)" },
        ...clientes.map((c) => ({ value: String(c.id), label: c.nombreComercial })),
      ],
    },
    {
      name: "rol",
      label: "Rol",
      tipo: "select",
      opciones: [
        "Administrador General",
        "Administrador Comercial",
        "Administrador Financiero",
        "Soporte",
        "Cliente Administrador",
        "Usuario Cliente",
      ].map((r) => ({ value: r, label: r })),
    },
    { name: "estado", label: "Estado", tipo: "select", opciones: op("activo", "inactivo", "bloqueado") },
    { name: "idioma", label: "Idioma", tipo: "select", opciones: op("es-ES", "en-GB", "pt-PT") },
    { name: "zona_horaria", label: "Zona horaria" },
    { name: "mfa", label: "MFA activo", tipo: "switch" },
  ];
}

export const filaUsuario = (u?: Usuario | null) => ({
  nombre: u?.nombre ?? "",
  apellidos: u?.apellidos ?? "",
  email: u?.email ?? "",
  telefono: u?.telefono ?? "",
  cargo: u?.cargo ?? "",
  departamento: u?.departamento ?? "",
  cliente_id: u?.clienteId ?? "",
  rol: u?.rol ?? "Usuario Cliente",
  estado: u?.estado ?? "activo",
  idioma: u?.idioma ?? "es-ES",
  zona_horaria: u?.zonaHoraria ?? "Europe/Madrid",
  mfa: u?.mfa ?? false,
});

/* --------------------------- Notificaciones --------------------------- */

export const camposNotificacion: Campo[] = [
  { name: "asunto", label: "Asunto", requerido: true, ancho: "full" },
  { name: "mensaje", label: "Mensaje", tipo: "textarea" },
  { name: "destinatario", label: "Destinatario", tipo: "email" },
  { name: "canal", label: "Canal", tipo: "select", opciones: op("email", "interna", "sms", "push") },
  { name: "categoria", label: "Categoría", tipo: "select", opciones: op("renovacion", "impago", "consumo", "sistema", "soporte", "comercial") },
  { name: "prioridad", label: "Prioridad", tipo: "select", opciones: op("baja", "media", "alta", "critica") },
  { name: "estado", label: "Estado", tipo: "select", opciones: op("pendiente", "enviada", "leida", "fallida") },
  { name: "plantilla", label: "Plantilla" },
];

export const filaNotificacion = (n?: Notificacion | null) => ({
  asunto: n?.asunto ?? "",
  mensaje: n?.mensaje ?? "",
  destinatario: n?.destinatario ?? "",
  canal: n?.canal ?? "email",
  categoria: n?.categoria ?? "sistema",
  prioridad: n?.prioridad ?? "media",
  estado: n?.estado ?? "pendiente",
  plantilla: n?.plantilla ?? "",
});
