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

  { name: "iban", label: "IBAN", seccion: "Datos bancarios", placeholder: "ES00 0000 0000 0000 0000 0000" },
  { name: "banco", label: "Entidad bancaria" },
  { name: "titular_cuenta", label: "Titular de la cuenta" },
  { name: "bic", label: "BIC / SWIFT" },
  { name: "forma_pago", label: "Forma de pago", tipo: "select", opciones: op("domiciliacion", "transferencia", "tarjeta", "pagare", "confirming") },
  { name: "mandato_sepa", label: "Mandato SEPA" },
  { name: "fecha_mandato", label: "Fecha del mandato", tipo: "fecha" },

  { name: "moneda", label: "Moneda", tipo: "select", seccion: "Condiciones comerciales", opciones: op("EUR", "USD", "GBP") },
  { name: "tarifa", label: "Tarifa aplicada", tipo: "select", opciones: op("estandar", "preferente", "partner", "personalizada") },
  { name: "descuento_general", label: "Descuento general (%)", tipo: "numero" },
  { name: "periodo_facturacion", label: "Periodo de facturación", tipo: "select", opciones: op("mensual", "trimestral", "semestral", "anual") },
  { name: "dia_pago", label: "Día de pago", tipo: "numero" },
  { name: "dias_vencimiento", label: "Días de vencimiento", tipo: "numero" },
  { name: "limite_credito", label: "Límite de crédito (€)", tipo: "numero" },
  { name: "iva", label: "IVA (%)", tipo: "numero" },
  { name: "retencion", label: "Retención IRPF (%)", tipo: "numero" },
  { name: "condiciones_notas", label: "Notas de condiciones", tipo: "textarea" },
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
  iban: c?.iban ?? "",
  banco: c?.banco ?? "",
  titular_cuenta: c?.titularCuenta ?? "",
  bic: c?.bic ?? "",
  forma_pago: c?.formaPago ?? "domiciliacion",
  mandato_sepa: c?.mandatoSepa ?? "",
  fecha_mandato: c?.fechaMandato ?? "",
  moneda: c?.moneda ?? "EUR",
  tarifa: c?.tarifa ?? "estandar",
  descuento_general: c?.descuentoGeneral ?? 0,
  periodo_facturacion: c?.periodoFacturacion ?? "mensual",
  dia_pago: c?.diaPago ?? 1,
  dias_vencimiento: c?.diasVencimiento ?? 30,
  limite_credito: c?.limiteCredito ?? 0,
  iva: c?.iva ?? 21,
  retencion: c?.retencion ?? 0,
  condiciones_notas: c?.condicionesNotas ?? "",
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

export function camposUsuario(
  clientes: { id: number; nombreComercial: string }[],
  aplicaciones: { id: number; nombre: string }[] = [],
  roles: { nombre: string }[] = [],
): Campo[] {
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
      opciones: (roles.length
        ? roles.map((r) => r.nombre)
        : [
            "Administrador General",
            "Administrador Comercial",
            "Administrador Financiero",
            "Soporte",
            "Cliente Administrador",
            "Usuario Cliente",
          ]
      ).map((r) => ({ value: r, label: r })),
    },
    { name: "estado", label: "Estado", tipo: "select", opciones: op("activo", "inactivo", "bloqueado") },
    { name: "idioma", label: "Idioma", tipo: "select", opciones: op("es-ES", "en-GB", "pt-PT") },
    { name: "zona_horaria", label: "Zona horaria" },
    { name: "mfa", label: "MFA activo", tipo: "switch" },
    {
      name: "aplicaciones",
      label: "Aplicaciones autorizadas",
      tipo: "multiselect",
      numerico: true,
      seccion: "Accesos a aplicaciones",
      opciones: aplicaciones.map((a) => ({ value: String(a.id), label: a.nombre })),
    },
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
  aplicaciones: u?.aplicaciones ?? [],
});

/* --------------------------- Notificaciones --------------------------- */

export const camposNotificacion: Campo[] = [
  { name: "asunto", label: "Asunto", requerido: true, ancho: "full" },
  { name: "mensaje", label: "Mensaje", tipo: "textarea" },
  { name: "destinatario", label: "Destinatario", tipo: "email" },
  { name: "canal", label: "Canal", tipo: "select", opciones: op("email", "interna", "sms", "webhook") },
  { name: "categoria", label: "Categoría", tipo: "select", opciones: op("renovacion", "impago", "consumo", "seguridad", "sistema", "comercial") },
  { name: "prioridad", label: "Prioridad", tipo: "select", opciones: op("baja", "media", "alta") },
  { name: "estado", label: "Estado", tipo: "select", opciones: op("pendiente", "enviada", "leida", "fallida") },
  { name: "plantilla", label: "Plantilla" },
];

/** Formulario de notificación con selección de cliente, aplicación y plantilla. */
export function camposNotificacionCon(
  clientes: { id: number; nombreComercial: string }[],
  aplicaciones: { id: number; nombre: string }[],
  plantillas: { codigo: string; nombre: string }[],
): Campo[] {
  return [
    ...camposNotificacion.slice(0, 7),
    {
      name: "plantilla",
      label: "Plantilla",
      tipo: "select",
      opciones: [
        { value: "", label: "Sin plantilla" },
        ...plantillas.map((p) => ({ value: p.codigo, label: p.nombre })),
      ],
    },
    {
      name: "cliente_id",
      label: "Cliente",
      tipo: "select",
      numerico: true,
      opciones: [
        { value: "", label: "Plataforma (sin cliente)" },
        ...clientes.map((c) => ({ value: String(c.id), label: c.nombreComercial })),
      ],
    },
    {
      name: "aplicacion_id",
      label: "Aplicación",
      tipo: "select",
      numerico: true,
      opciones: [
        { value: "", label: "Sin aplicación" },
        ...aplicaciones.map((a) => ({ value: String(a.id), label: a.nombre })),
      ],
    },
  ];
}

export const filaNotificacion = (n?: Notificacion | null) => ({
  asunto: n?.asunto ?? "",
  mensaje: n?.mensaje ?? "",
  destinatario: n?.destinatario ?? "",
  canal: n?.canal ?? "email",
  categoria: n?.categoria ?? "sistema",
  prioridad: n?.prioridad ?? "media",
  estado: n?.estado ?? "pendiente",
  plantilla: n?.plantilla ?? "",
  cliente_id: n?.clienteId != null ? String(n.clienteId) : "",
  aplicacion_id: n?.aplicacionId != null ? String(n.aplicacionId) : "",
});

/* --------------------- Plantillas de notificación --------------------- */

export const camposPlantilla: Campo[] = [
  { name: "codigo", label: "Código", requerido: true, placeholder: "renovacion-proxima" },
  { name: "nombre", label: "Nombre", requerido: true },
  { name: "categoria", label: "Categoría", tipo: "select", opciones: op("renovacion", "impago", "consumo", "seguridad", "sistema", "comercial") },
  { name: "activa", label: "Activa", tipo: "switch" },
  {
    name: "canales",
    label: "Canales",
    tipo: "multiselect",
    opciones: op("email", "interna", "sms", "webhook"),
  },
  { name: "disparador", label: "Regla de disparo", ancho: "full" },
  { name: "asunto", label: "Asunto de la plantilla", ancho: "full" },
  { name: "cuerpo", label: "Cuerpo del mensaje", tipo: "textarea" },
];

export const filaPlantilla = (p?: {
  codigo: string;
  nombre: string;
  categoria: string;
  canales: string[];
  disparador: string;
  asunto: string;
  cuerpo: string;
  activa: boolean;
} | null) => ({
  codigo: p?.codigo ?? "",
  nombre: p?.nombre ?? "",
  categoria: p?.categoria ?? "sistema",
  activa: p?.activa ?? true,
  canales: p?.canales ?? ["email"],
  disparador: p?.disparador ?? "",
  asunto: p?.asunto ?? "",
  cuerpo: p?.cuerpo ?? "",
});


/* ------------------------------ Agenda -------------------------------- */

export const tiposAgenda = ["llamada", "reunion", "email", "whatsapp", "marketing"] as const;

export function camposAgenda(
  aplicaciones: { id: number; nombre: string }[],
  contactos: string[],
): Campo[] {
  return [
    { name: "tipo", label: "Tipo de contacto", tipo: "select", opciones: op(...tiposAgenda) },
    { name: "estado", label: "Estado", tipo: "select", opciones: op("planificado", "realizado", "cancelado") },
    { name: "asunto", label: "Asunto", requerido: true, ancho: "full" },
    {
      name: "contacto",
      label: "Contacto del cliente",
      tipo: "select",
      opciones: [{ value: "", label: "Sin especificar" }, ...contactos.map((c) => ({ value: c, label: c }))].filter(
        (o) => o.value !== "",
      ),
    },
    {
      name: "aplicacion_id",
      label: "Producto / aplicación",
      tipo: "select",
      numerico: true,
      opciones: [
        { value: "0", label: "Sin aplicación" },
        ...aplicaciones.map((a) => ({ value: String(a.id), label: a.nombre })),
      ],
    },
    { name: "fecha_planificada", label: "Fecha planificada", tipo: "fecha" },
    { name: "fecha_real", label: "Fecha real", tipo: "fecha" },
    { name: "origen", label: "Origen", tipo: "select", opciones: op("manual", "marketing") },
    { name: "referencia_externa", label: "Referencia de campaña", placeholder: "ID de marketing" },
    { name: "comentarios", label: "Comentarios generales", tipo: "textarea", ancho: "full" },
  ];
}

export const filaAgenda = (e?: import("@/lib/db").EntradaAgenda | null) => ({
  tipo: e?.tipo ?? "llamada",
  estado: e?.estado ?? "planificado",
  asunto: e?.asunto ?? "",
  contacto: e?.contacto ?? "",
  aplicacion_id: e?.aplicacionId ?? 0,
  fecha_planificada: (e?.fechaPlanificada ?? new Date().toISOString()).slice(0, 10),
  fecha_real: e?.fechaReal ? e.fechaReal.slice(0, 10) : "",
  origen: e?.origen ?? "manual",
  referencia_externa: e?.referenciaExterna ?? "",
  comentarios: e?.comentarios ?? "",
});
