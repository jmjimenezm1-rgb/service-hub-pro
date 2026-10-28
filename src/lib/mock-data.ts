/**
 * ServiceHub — capa de datos de ejemplo.
 *
 * Cada módulo consume su propio "repositorio" desde aquí. Cuando se conecte el
 * backend (Lovable Cloud / API REST), basta con sustituir estas funciones por
 * llamadas reales manteniendo las mismas interfaces.
 */

export interface BaseEntity {
  id: number;
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
}

const base = (i: number, date = "2025-01-15"): BaseEntity => ({
  id: i,
  uuid: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  created_at: `${date}T09:00:00Z`,
  updated_at: `${date}T09:00:00Z`,
  deleted_at: null,
  created_by: "admin@servicehub.io",
  updated_by: "admin@servicehub.io",
});

/* ------------------------------- CRM ---------------------------------- */

export type EstadoCliente = "activo" | "prueba" | "prospecto" | "impago" | "baja";

export interface Cliente extends BaseEntity {
  razonSocial: string;
  nombreComercial: string;
  nif: string;
  direccion: string;
  provincia: string;
  pais: string;
  contacto: string;
  email: string;
  telefono: string;
  web: string;
  sector: string;
  empleados: number;
  estado: EstadoCliente;
  fechaAlta: string;
  fechaBaja: string | null;
  observaciones: string;
  etiquetas: string[];
  documentos: number;
  mrr: number;
  /* Datos bancarios */
  iban?: string;
  banco?: string;
  titularCuenta?: string;
  bic?: string;
  formaPago?: string;
  mandatoSepa?: string;
  fechaMandato?: string | null;
  /* Condiciones comerciales */
  moneda?: string;
  tarifa?: string;
  descuentoGeneral?: number;
  diaPago?: number;
  diasVencimiento?: number;
  limiteCredito?: number;
  periodoFacturacion?: string;
  iva?: number;
  retencion?: number;
  condicionesNotas?: string;
}

export const clientes: Cliente[] = [
  {
    ...base(1, "2023-03-04"),
    razonSocial: "Distribuciones Aurora S.L.",
    nombreComercial: "Aurora",
    nif: "B12345678",
    direccion: "C/ Mayor 12",
    provincia: "Madrid",
    pais: "España",
    contacto: "Elena Ruiz",
    email: "elena@aurora.es",
    telefono: "+34 911 220 331",
    web: "aurora.es",
    sector: "Distribución",
    empleados: 120,
    estado: "activo",
    fechaAlta: "2023-03-04",
    fechaBaja: null,
    observaciones: "Cliente estratégico, renovación anual.",
    etiquetas: ["Key Account", "Anual"],
    documentos: 12,
    mrr: 1890,
  },
  {
    ...base(2, "2024-06-18"),
    razonSocial: "Clínica Nordeste S.A.",
    nombreComercial: "Nordeste Salud",
    nif: "A87654321",
    direccion: "Av. Diagonal 244",
    provincia: "Barcelona",
    pais: "España",
    contacto: "Marc Vidal",
    email: "marc@nordeste.health",
    telefono: "+34 933 118 002",
    web: "nordeste.health",
    sector: "Sanidad",
    empleados: 340,
    estado: "activo",
    fechaAlta: "2024-06-18",
    fechaBaja: null,
    observaciones: "Requiere RGPD reforzado.",
    etiquetas: ["Enterprise", "RGPD"],
    documentos: 21,
    mrr: 3250,
  },
  {
    ...base(3, "2025-11-02"),
    razonSocial: "Talleres Iberia S.L.U.",
    nombreComercial: "Iberia Motor",
    nif: "B55512399",
    direccion: "Pol. Ind. Sur 8",
    provincia: "Valencia",
    pais: "España",
    contacto: "Rosa Martín",
    email: "rosa@iberiamotor.com",
    telefono: "+34 963 442 019",
    web: "iberiamotor.com",
    sector: "Automoción",
    empleados: 45,
    estado: "prueba",
    fechaAlta: "2025-11-02",
    fechaBaja: null,
    observaciones: "Trial 30 días, finaliza este mes.",
    etiquetas: ["Trial"],
    documentos: 3,
    mrr: 0,
  },
  {
    ...base(4, "2022-09-12"),
    razonSocial: "Grupo Logístico Atlas S.A.",
    nombreComercial: "Atlas Logistics",
    nif: "A33344455",
    direccion: "Ctra. Nacional 340, km 12",
    provincia: "Sevilla",
    pais: "España",
    contacto: "Javier Peña",
    email: "jpena@atlas-log.com",
    telefono: "+34 954 001 220",
    web: "atlas-log.com",
    sector: "Logística",
    empleados: 800,
    estado: "impago",
    fechaAlta: "2022-09-12",
    fechaBaja: null,
    observaciones: "2 facturas vencidas pendientes de reclamación.",
    etiquetas: ["Riesgo", "Enterprise"],
    documentos: 44,
    mrr: 5400,
  },
  {
    ...base(5, "2025-12-20"),
    razonSocial: "Consultora Mediterránea S.L.",
    nombreComercial: "MedConsulting",
    nif: "B99911122",
    direccion: "C/ Alameda 3",
    provincia: "Málaga",
    pais: "España",
    contacto: "Nuria Cano",
    email: "nuria@medconsulting.es",
    telefono: "+34 952 776 110",
    web: "medconsulting.es",
    sector: "Consultoría",
    empleados: 28,
    estado: "prospecto",
    fechaAlta: "2025-12-20",
    fechaBaja: null,
    observaciones: "Propuesta enviada, pendiente de firma.",
    etiquetas: ["Pipeline"],
    documentos: 1,
    mrr: 0,
  },
  {
    ...base(6, "2021-05-30"),
    razonSocial: "Editorial Lumen Norte S.L.",
    nombreComercial: "Lumen",
    nif: "B10120130",
    direccion: "C/ Gran Vía 88",
    provincia: "Bilbao",
    pais: "España",
    contacto: "Iker Aguirre",
    email: "iker@lumen.eus",
    telefono: "+34 944 220 118",
    web: "lumen.eus",
    sector: "Editorial",
    empleados: 62,
    estado: "baja",
    fechaAlta: "2021-05-30",
    fechaBaja: "2025-08-31",
    observaciones: "Baja por reestructuración interna.",
    etiquetas: ["Histórico"],
    documentos: 30,
    mrr: 0,
  },
  {
    ...base(7, "2024-02-14"),
    razonSocial: "AgroCampo Levante S.Coop.",
    nombreComercial: "AgroCampo",
    nif: "F44455566",
    direccion: "Camí del Riu 45",
    provincia: "Murcia",
    pais: "España",
    contacto: "Pilar Soto",
    email: "pilar@agrocampo.coop",
    telefono: "+34 968 331 774",
    web: "agrocampo.coop",
    sector: "Agroalimentario",
    empleados: 210,
    estado: "activo",
    fechaAlta: "2024-02-14",
    fechaBaja: null,
    observaciones: "Amplía licencias cada campaña.",
    etiquetas: ["Estacional"],
    documentos: 17,
    mrr: 2100,
  },
  {
    ...base(8, "2025-04-09"),
    razonSocial: "Fintech Cobalt Portugal Lda.",
    nombreComercial: "Cobalt",
    nif: "PT501234567",
    direccion: "Av. da Liberdade 110",
    provincia: "Lisboa",
    pais: "Portugal",
    contacto: "Tiago Freitas",
    email: "tiago@cobalt.pt",
    telefono: "+351 213 004 991",
    web: "cobalt.pt",
    sector: "Fintech",
    empleados: 95,
    estado: "activo",
    fechaAlta: "2025-04-09",
    fechaBaja: null,
    observaciones: "Facturación intracomunitaria.",
    etiquetas: ["Internacional"],
    documentos: 9,
    mrr: 2760,
  },
];

/* --------------------------- Aplicaciones ------------------------------ */

export type ModeloCobro = "fijo" | "por_usuario" | "por_uso" | "hibrido";

export interface Aplicacion extends BaseEntity {
  nombre: string;
  urlManual?: string;
  urlApi?: string;
  descripcion: string;
  version: string;
  estado: "publicada" | "beta" | "mantenimiento" | "retirada";
  categoria: string;
  url: string;
  proveedor: string;
  modeloCobro: ModeloCobro;
  precioBase: number;
  precioUsuario: number;
  precioUso: number;
  unidadUso: string;
  limites: string;
  logo: string;
}

export const aplicaciones: Aplicacion[] = [
  {
    ...base(1, "2022-01-10"),
    nombre: "DocuFlow",
    descripcion: "Gestión documental y firma de contratos.",
    version: "4.2.1",
    estado: "publicada",
    categoria: "Documental",
    url: "https://docuflow.servicehub.io",
    proveedor: "ServiceHub Labs",
    modeloCobro: "hibrido",
    precioBase: 149,
    precioUsuario: 9,
    precioUso: 0.12,
    unidadUso: "documento procesado",
    limites: "50 GB / 20.000 docs mes",
    logo: "DF",
  },
  {
    ...base(2, "2022-08-22"),
    nombre: "FactuOne",
    descripcion: "Facturación electrónica y remesas SEPA.",
    version: "3.8.0",
    estado: "publicada",
    categoria: "Finanzas",
    url: "https://factuone.servicehub.io",
    proveedor: "ServiceHub Labs",
    modeloCobro: "por_usuario",
    precioBase: 99,
    precioUsuario: 12,
    precioUso: 0,
    unidadUso: "factura emitida",
    limites: "10.000 facturas mes",
    logo: "F1",
  },
  {
    ...base(3, "2023-05-05"),
    nombre: "InsightAI",
    descripcion: "Analítica e IA predictiva sobre datos de negocio.",
    version: "2.0.4",
    estado: "beta",
    categoria: "Inteligencia de negocio",
    url: "https://insightai.servicehub.io",
    proveedor: "Nova Data",
    modeloCobro: "por_uso",
    precioBase: 0,
    precioUsuario: 0,
    precioUso: 0.004,
    unidadUso: "1K tokens",
    limites: "5M tokens mes",
    logo: "AI",
  },
  {
    ...base(4, "2021-11-18"),
    nombre: "TeamDesk",
    descripcion: "Soporte, tickets y base de conocimiento.",
    version: "6.1.2",
    estado: "publicada",
    categoria: "Soporte",
    url: "https://teamdesk.servicehub.io",
    proveedor: "ServiceHub Labs",
    modeloCobro: "por_usuario",
    precioBase: 49,
    precioUsuario: 7,
    precioUso: 0,
    unidadUso: "ticket",
    limites: "Sin límite",
    logo: "TD",
  },
  {
    ...base(5, "2024-03-30"),
    nombre: "StockCore",
    descripcion: "Inventario, almacenes y trazabilidad.",
    version: "1.9.7",
    estado: "mantenimiento",
    categoria: "Operaciones",
    url: "https://stockcore.servicehub.io",
    proveedor: "Iberdata",
    modeloCobro: "fijo",
    precioBase: 320,
    precioUsuario: 0,
    precioUso: 0,
    unidadUso: "referencia",
    limites: "100.000 referencias",
    logo: "SC",
  },
  {
    ...base(6, "2020-07-01"),
    nombre: "LegacyMail",
    descripcion: "Campañas de correo (producto descatalogado).",
    version: "0.9.0",
    estado: "retirada",
    categoria: "Marketing",
    url: "https://legacymail.servicehub.io",
    proveedor: "ServiceHub Labs",
    modeloCobro: "por_uso",
    precioBase: 0,
    precioUsuario: 0,
    precioUso: 0.001,
    unidadUso: "email enviado",
    limites: "—",
    logo: "LM",
  },
];

/* --------------------------- Suscripciones ----------------------------- */

export interface Suscripcion extends BaseEntity {
  clienteId: number;
  aplicacionId: number;
  fechaInicio: string;
  fechaRenovacion: string;
  estado: "activa" | "prueba" | "suspendida" | "cancelada";
  modalidad: ModeloCobro;
  maxUsuarios: number;
  consumoContratado: number;
  consumoReal: number;
  precio: number;
  descuento: number;
  periodicidad: "mensual" | "trimestral" | "semestral" | "anual";
  renovacionAutomatica: boolean;
  observaciones: string;
}

export const suscripciones: Suscripcion[] = [
  {
    ...base(1, "2023-03-05"),
    clienteId: 1,
    aplicacionId: 1,
    fechaInicio: "2023-03-05",
    fechaRenovacion: "2026-03-05",
    estado: "activa",
    modalidad: "hibrido",
    maxUsuarios: 60,
    consumoContratado: 20000,
    consumoReal: 14320,
    precio: 890,
    descuento: 10,
    periodicidad: "anual",
    renovacionAutomatica: true,
    observaciones: "Incluye soporte prioritario.",
  },
  {
    ...base(2, "2023-03-05"),
    clienteId: 1,
    aplicacionId: 2,
    fechaInicio: "2023-04-01",
    fechaRenovacion: "2026-04-01",
    estado: "activa",
    modalidad: "por_usuario",
    maxUsuarios: 25,
    consumoContratado: 10000,
    consumoReal: 6210,
    precio: 399,
    descuento: 0,
    periodicidad: "mensual",
    renovacionAutomatica: true,
    observaciones: "",
  },
  {
    ...base(3, "2024-06-19"),
    clienteId: 2,
    aplicacionId: 1,
    fechaInicio: "2024-06-19",
    fechaRenovacion: "2026-06-19",
    estado: "activa",
    modalidad: "hibrido",
    maxUsuarios: 150,
    consumoContratado: 40000,
    consumoReal: 38900,
    precio: 1950,
    descuento: 5,
    periodicidad: "anual",
    renovacionAutomatica: true,
    observaciones: "Cerca del límite de consumo.",
  },
  {
    ...base(4, "2024-06-19"),
    clienteId: 2,
    aplicacionId: 4,
    fechaInicio: "2024-07-01",
    fechaRenovacion: "2026-02-28",
    estado: "activa",
    modalidad: "por_usuario",
    maxUsuarios: 40,
    consumoContratado: 0,
    consumoReal: 512,
    precio: 329,
    descuento: 0,
    periodicidad: "mensual",
    renovacionAutomatica: false,
    observaciones: "Renovación manual pendiente de confirmar.",
  },
  {
    ...base(5, "2025-11-02"),
    clienteId: 3,
    aplicacionId: 2,
    fechaInicio: "2025-11-02",
    fechaRenovacion: "2026-02-02",
    estado: "prueba",
    modalidad: "por_usuario",
    maxUsuarios: 5,
    consumoContratado: 500,
    consumoReal: 118,
    precio: 0,
    descuento: 100,
    periodicidad: "mensual",
    renovacionAutomatica: false,
    observaciones: "Trial comercial 30 días.",
  },
  {
    ...base(6, "2022-09-13"),
    clienteId: 4,
    aplicacionId: 5,
    fechaInicio: "2022-09-13",
    fechaRenovacion: "2026-09-13",
    estado: "suspendida",
    modalidad: "fijo",
    maxUsuarios: 300,
    consumoContratado: 100000,
    consumoReal: 74000,
    precio: 3200,
    descuento: 0,
    periodicidad: "anual",
    renovacionAutomatica: true,
    observaciones: "Suspendida por impago.",
  },
  {
    ...base(7, "2024-02-15"),
    clienteId: 7,
    aplicacionId: 3,
    fechaInicio: "2024-02-15",
    fechaRenovacion: "2026-02-15",
    estado: "activa",
    modalidad: "por_uso",
    maxUsuarios: 30,
    consumoContratado: 5000000,
    consumoReal: 3120000,
    precio: 1240,
    descuento: 15,
    periodicidad: "trimestral",
    renovacionAutomatica: true,
    observaciones: "",
  },
  {
    ...base(8, "2025-04-10"),
    clienteId: 8,
    aplicacionId: 1,
    fechaInicio: "2025-04-10",
    fechaRenovacion: "2026-04-10",
    estado: "activa",
    modalidad: "hibrido",
    maxUsuarios: 50,
    consumoContratado: 15000,
    consumoReal: 9800,
    precio: 760,
    descuento: 0,
    periodicidad: "semestral",
    renovacionAutomatica: true,
    observaciones: "Facturación en EUR, inversión sujeto pasivo.",
  },
];

/* ------------------------------ Usuarios ------------------------------- */

export type RolSistema =
  | "Administrador General"
  | "Administrador Comercial"
  | "Administrador Financiero"
  | "Administrador Técnico"
  | "Soporte"
  | "Cliente Administrador"
  | "Usuario Cliente";

export interface Usuario extends BaseEntity {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  clienteId: number | null;
  estado: "activo" | "inactivo" | "bloqueado";
  idioma: string;
  zonaHoraria: string;
  ultimoAcceso: string;
  rol: RolSistema;
  aplicaciones: number[];
  mfa: boolean;
}

export const usuarios: Usuario[] = [
  {
    ...base(1, "2021-01-04"),
    nombre: "Laura",
    apellidos: "Beltrán",
    email: "laura.beltran@servicehub.io",
    telefono: "+34 600 100 200",
    cargo: "COO",
    departamento: "Dirección",
    clienteId: null,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-02T08:42:00Z",
    rol: "Administrador General",
    aplicaciones: [1, 2, 3, 4, 5],
    mfa: true,
  },
  {
    ...base(2, "2022-02-10"),
    nombre: "Diego",
    apellidos: "Ferrer",
    email: "diego.ferrer@servicehub.io",
    telefono: "+34 600 300 400",
    cargo: "Sales Manager",
    departamento: "Comercial",
    clienteId: null,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-02T07:15:00Z",
    rol: "Administrador Comercial",
    aplicaciones: [1, 2],
    mfa: true,
  },
  {
    ...base(3, "2022-05-20"),
    nombre: "Sofía",
    apellidos: "Lozano",
    email: "sofia.lozano@servicehub.io",
    telefono: "+34 600 500 600",
    cargo: "Controller",
    departamento: "Finanzas",
    clienteId: null,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-01T16:02:00Z",
    rol: "Administrador Financiero",
    aplicaciones: [2],
    mfa: true,
  },
  {
    ...base(4, "2023-09-01"),
    nombre: "Elena",
    apellidos: "Ruiz",
    email: "elena@aurora.es",
    telefono: "+34 611 220 331",
    cargo: "Directora de Operaciones",
    departamento: "Operaciones",
    clienteId: 1,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-02T09:05:00Z",
    rol: "Cliente Administrador",
    aplicaciones: [1, 2],
    mfa: true,
  },
  {
    ...base(5, "2024-07-11"),
    nombre: "Marc",
    apellidos: "Vidal",
    email: "marc@nordeste.health",
    telefono: "+34 622 118 002",
    cargo: "CIO",
    departamento: "Sistemas",
    clienteId: 2,
    estado: "activo",
    idioma: "ca-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-02T06:48:00Z",
    rol: "Cliente Administrador",
    aplicaciones: [1, 4],
    mfa: true,
  },
  {
    ...base(6, "2024-08-02"),
    nombre: "Ana",
    apellidos: "Prieto",
    email: "ana.prieto@nordeste.health",
    telefono: "+34 622 118 010",
    cargo: "Administrativa",
    departamento: "Administración",
    clienteId: 2,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-07-31T11:20:00Z",
    rol: "Usuario Cliente",
    aplicaciones: [1],
    mfa: false,
  },
  {
    ...base(7, "2025-11-03"),
    nombre: "Rosa",
    apellidos: "Martín",
    email: "rosa@iberiamotor.com",
    telefono: "+34 633 442 019",
    cargo: "Gerente",
    departamento: "Dirección",
    clienteId: 3,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-02T10:11:00Z",
    rol: "Cliente Administrador",
    aplicaciones: [2],
    mfa: false,
  },
  {
    ...base(8, "2022-10-04"),
    nombre: "Javier",
    apellidos: "Peña",
    email: "jpena@atlas-log.com",
    telefono: "+34 644 001 220",
    cargo: "CFO",
    departamento: "Finanzas",
    clienteId: 4,
    estado: "bloqueado",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-06-12T13:44:00Z",
    rol: "Cliente Administrador",
    aplicaciones: [5],
    mfa: false,
  },
  {
    ...base(9, "2023-01-16"),
    nombre: "Hugo",
    apellidos: "Serrano",
    email: "hugo.serrano@servicehub.io",
    telefono: "+34 600 700 800",
    cargo: "Técnico de soporte",
    departamento: "Soporte",
    clienteId: null,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Atlantic/Canary",
    ultimoAcceso: "2026-08-02T09:58:00Z",
    rol: "Soporte",
    aplicaciones: [1, 2, 4],
    mfa: true,
  },
  {
    ...base(10, "2024-03-19"),
    nombre: "Tiago",
    apellidos: "Freitas",
    email: "tiago@cobalt.pt",
    telefono: "+351 913 004 991",
    cargo: "Head of Ops",
    departamento: "Operaciones",
    clienteId: 8,
    estado: "activo",
    idioma: "pt-PT",
    zonaHoraria: "Europe/Lisbon",
    ultimoAcceso: "2026-08-01T18:30:00Z",
    rol: "Cliente Administrador",
    aplicaciones: [1, 3],
    mfa: true,
  },
  {
    ...base(11, "2021-06-01"),
    nombre: "Iker",
    apellidos: "Aguirre",
    email: "iker@lumen.eus",
    telefono: "+34 655 220 118",
    cargo: "Director",
    departamento: "Dirección",
    clienteId: 6,
    estado: "inactivo",
    idioma: "eu-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2025-08-30T10:00:00Z",
    rol: "Usuario Cliente",
    aplicaciones: [],
    mfa: false,
  },
  {
    ...base(12, "2024-02-20"),
    nombre: "Pilar",
    apellidos: "Soto",
    email: "pilar@agrocampo.coop",
    telefono: "+34 666 331 774",
    cargo: "Responsable IT",
    departamento: "Sistemas",
    clienteId: 7,
    estado: "activo",
    idioma: "es-ES",
    zonaHoraria: "Europe/Madrid",
    ultimoAcceso: "2026-08-02T07:59:00Z",
    rol: "Cliente Administrador",
    aplicaciones: [3],
    mfa: true,
  },
];

/* ------------------------------ Permisos ------------------------------- */

export const modulosPermisos = [
  "CRM",
  "Aplicaciones",
  "Suscripciones",
  "Usuarios",
  "Consumo",
  "Facturación",
  "Cobros",
  "Financiero",
  "Soporte",
  "Auditoría",
] as const;

export type ModuloPermiso = (typeof modulosPermisos)[number];
export type NivelPermiso = "total" | "escritura" | "lectura" | "ninguno";

export const roles: {
  rol: RolSistema;
  descripcion: string;
  usuarios: number;
  permisos: Record<ModuloPermiso, NivelPermiso>;
}[] = [
  {
    rol: "Administrador General",
    descripcion: "Acceso completo a todos los módulos y configuración.",
    usuarios: 1,
    permisos: Object.fromEntries(modulosPermisos.map((m) => [m, "total"])) as Record<
      ModuloPermiso,
      NivelPermiso
    >,
  },
  {
    rol: "Administrador Comercial",
    descripcion: "Prospección, altas, contratación y renovaciones.",
    usuarios: 1,
    permisos: {
      CRM: "total",
      Aplicaciones: "lectura",
      Suscripciones: "total",
      Usuarios: "escritura",
      Consumo: "lectura",
      Facturación: "lectura",
      Cobros: "lectura",
      Financiero: "ninguno",
      Soporte: "lectura",
      Auditoría: "lectura",
    },
  },
  {
    rol: "Administrador Financiero",
    descripcion: "Facturación, cobros y contabilidad.",
    usuarios: 1,
    permisos: {
      CRM: "lectura",
      Aplicaciones: "lectura",
      Suscripciones: "lectura",
      Usuarios: "ninguno",
      Consumo: "lectura",
      Facturación: "total",
      Cobros: "total",
      Financiero: "total",
      Soporte: "ninguno",
      Auditoría: "lectura",
    },
  },
  {
    rol: "Administrador Técnico",
    descripcion: "Catálogo de aplicaciones, integraciones y métricas de uso.",
    usuarios: 0,
    permisos: {
      CRM: "lectura",
      Aplicaciones: "total",
      Suscripciones: "escritura",
      Usuarios: "escritura",
      Consumo: "total",
      Facturación: "ninguno",
      Cobros: "ninguno",
      Financiero: "ninguno",
      Soporte: "escritura",
      Auditoría: "lectura",
    },
  },
  {
    rol: "Soporte",
    descripcion: "Tickets, incidencias y consulta de clientes.",
    usuarios: 1,
    permisos: {
      CRM: "lectura",
      Aplicaciones: "lectura",
      Suscripciones: "lectura",
      Usuarios: "lectura",
      Consumo: "lectura",
      Facturación: "ninguno",
      Cobros: "ninguno",
      Financiero: "ninguno",
      Soporte: "total",
      Auditoría: "ninguno",
    },
  },
  {
    rol: "Cliente Administrador",
    descripcion: "Gestiona los usuarios y el consumo de su propia empresa.",
    usuarios: 6,
    permisos: {
      CRM: "ninguno",
      Aplicaciones: "lectura",
      Suscripciones: "lectura",
      Usuarios: "total",
      Consumo: "lectura",
      Facturación: "lectura",
      Cobros: "lectura",
      Financiero: "ninguno",
      Soporte: "escritura",
      Auditoría: "ninguno",
    },
  },
  {
    rol: "Usuario Cliente",
    descripcion: "Acceso únicamente a las aplicaciones autorizadas.",
    usuarios: 2,
    permisos: {
      CRM: "ninguno",
      Aplicaciones: "lectura",
      Suscripciones: "ninguno",
      Usuarios: "ninguno",
      Consumo: "ninguno",
      Facturación: "ninguno",
      Cobros: "ninguno",
      Financiero: "ninguno",
      Soporte: "escritura",
      Auditoría: "ninguno",
    },
  },
];

/* ------------------------------- Consumo -------------------------------- */

export interface RegistroConsumo {
  id: number;
  clienteId: number;
  aplicacionId: number;
  metrica: string;
  unidad: string;
  consumido: number;
  incluido: number;
  costeUnitario: number;
  periodo: string;
}

export const consumos: RegistroConsumo[] = [
  { id: 1, clienteId: 1, aplicacionId: 1, metrica: "Documentos procesados", unidad: "docs", consumido: 14320, incluido: 20000, costeUnitario: 0.12, periodo: "2026-08" },
  { id: 2, clienteId: 1, aplicacionId: 1, metrica: "Almacenamiento", unidad: "GB", consumido: 38, incluido: 50, costeUnitario: 0.9, periodo: "2026-08" },
  { id: 3, clienteId: 1, aplicacionId: 2, metrica: "Licencias ocupadas", unidad: "licencias", consumido: 22, incluido: 25, costeUnitario: 12, periodo: "2026-08" },
  { id: 4, clienteId: 2, aplicacionId: 1, metrica: "Documentos procesados", unidad: "docs", consumido: 38900, incluido: 40000, costeUnitario: 0.12, periodo: "2026-08" },
  { id: 5, clienteId: 2, aplicacionId: 4, metrica: "Tickets gestionados", unidad: "tickets", consumido: 512, incluido: 1000, costeUnitario: 0.4, periodo: "2026-08" },
  { id: 6, clienteId: 2, aplicacionId: 1, metrica: "Llamadas API", unidad: "req", consumido: 182400, incluido: 150000, costeUnitario: 0.0004, periodo: "2026-08" },
  { id: 7, clienteId: 3, aplicacionId: 2, metrica: "Facturas emitidas", unidad: "facturas", consumido: 118, incluido: 500, costeUnitario: 0.2, periodo: "2026-08" },
  { id: 8, clienteId: 7, aplicacionId: 3, metrica: "Tokens utilizados", unidad: "1K tokens", consumido: 3120, incluido: 5000, costeUnitario: 0.004, periodo: "2026-08" },
  { id: 9, clienteId: 8, aplicacionId: 1, metrica: "Documentos procesados", unidad: "docs", consumido: 9800, incluido: 15000, costeUnitario: 0.12, periodo: "2026-08" },
  { id: 10, clienteId: 8, aplicacionId: 3, metrica: "Tiempo de utilización", unidad: "horas", consumido: 640, incluido: 500, costeUnitario: 1.5, periodo: "2026-08" },
  { id: 11, clienteId: 4, aplicacionId: 5, metrica: "Referencias activas", unidad: "refs", consumido: 74000, incluido: 100000, costeUnitario: 0.002, periodo: "2026-08" },
  { id: 12, clienteId: 7, aplicacionId: 3, metrica: "Llamadas API", unidad: "req", consumido: 96200, incluido: 120000, costeUnitario: 0.0004, periodo: "2026-08" },
];

/* -------------------------- Series del dashboard ------------------------ */

export const serieFacturacion = [
  { mes: "Sep", facturacion: 41200, cobros: 39800 },
  { mes: "Oct", facturacion: 43850, cobros: 42100 },
  { mes: "Nov", facturacion: 45120, cobros: 41900 },
  { mes: "Dic", facturacion: 49780, cobros: 47320 },
  { mes: "Ene", facturacion: 47010, cobros: 46150 },
  { mes: "Feb", facturacion: 51340, cobros: 48900 },
  { mes: "Mar", facturacion: 53980, cobros: 52410 },
  { mes: "Abr", facturacion: 55220, cobros: 51000 },
  { mes: "May", facturacion: 57640, cobros: 56180 },
  { mes: "Jun", facturacion: 59310, cobros: 55940 },
  { mes: "Jul", facturacion: 62480, cobros: 60120 },
  { mes: "Ago", facturacion: 64100, cobros: 58230 },
];

export const serieUsuariosActivos = [
  { mes: "Mar", usuarios: 980 },
  { mes: "Abr", usuarios: 1085 },
  { mes: "May", usuarios: 1190 },
  { mes: "Jun", usuarios: 1310 },
  { mes: "Jul", usuarios: 1425 },
  { mes: "Ago", usuarios: 1512 },
];

export const alertas = [
  { id: 1, tipo: "impago" as const, texto: "Atlas Logistics acumula 2 facturas vencidas (9.870 €).", fecha: "hace 2 h" },
  { id: 2, tipo: "consumo" as const, texto: "Nordeste Salud al 97% del consumo contratado en DocuFlow.", fecha: "hace 5 h" },
  { id: 3, tipo: "renovacion" as const, texto: "TeamDesk de Nordeste Salud renueva el 28/02 sin renovación automática.", fecha: "ayer" },
  { id: 4, tipo: "prueba" as const, texto: "El periodo de prueba de Iberia Motor finaliza en 4 días.", fecha: "ayer" },
];

/* --------------------------- 7 · Notificaciones ------------------------- */

export type CanalNotificacion = "email" | "interna" | "sms" | "webhook";
export type CategoriaNotificacion =
  | "renovacion"
  | "impago"
  | "consumo"
  | "seguridad"
  | "sistema"
  | "comercial";
export type EstadoNotificacion = "enviada" | "pendiente" | "leida" | "fallida";
export type PrioridadNotificacion = "alta" | "media" | "baja";

export interface Notificacion extends BaseEntity {
  asunto: string;
  mensaje: string;
  canal: CanalNotificacion;
  categoria: CategoriaNotificacion;
  estado: EstadoNotificacion;
  prioridad: PrioridadNotificacion;
  destinatario: string;
  clienteId?: number;
  aplicacionId?: number;
  plantilla: string;
  enviadaEn: string;
}

const baseNotif = (id: number) => base(600 + id, "2026-08-01");

export const notificaciones: Notificacion[] = [
  {
    ...baseNotif(1),
    asunto: "Renovación de TeamDesk el 28/02",
    mensaje: "El contrato de TeamDesk para Nordeste Salud vence en 15 días y no tiene renovación automática activada.",
    canal: "email",
    categoria: "renovacion",
    estado: "enviada",
    prioridad: "alta",
    destinatario: "direccion@nordestesalud.es",
    clienteId: 2,
    aplicacionId: 3,
    plantilla: "renovacion-proxima",
    enviadaEn: "2026-08-04T08:12:00Z",
  },
  {
    ...baseNotif(2),
    asunto: "Segundo aviso de impago (9.870 €)",
    mensaje: "Atlas Logistics acumula 2 facturas vencidas. Se suspenderá el servicio en 7 días si no se regulariza.",
    canal: "email",
    categoria: "impago",
    estado: "enviada",
    prioridad: "alta",
    destinatario: "finanzas@atlaslogistics.com",
    clienteId: 3,
    plantilla: "impago-segundo-aviso",
    enviadaEn: "2026-08-04T07:40:00Z",
  },
  {
    ...baseNotif(3),
    asunto: "Consumo al 97% del límite contratado",
    mensaje: "Nordeste Salud ha consumido el 97% de los documentos incluidos en DocuFlow este periodo.",
    canal: "interna",
    categoria: "consumo",
    estado: "leida",
    prioridad: "media",
    destinatario: "Equipo de Operaciones",
    clienteId: 2,
    aplicacionId: 2,
    plantilla: "limite-consumo",
    enviadaEn: "2026-08-04T05:20:00Z",
  },
  {
    ...baseNotif(4),
    asunto: "Nuevo inicio de sesión sin MFA",
    mensaje: "Se ha detectado un acceso desde una IP nueva en una cuenta sin doble factor activado.",
    canal: "interna",
    categoria: "seguridad",
    estado: "pendiente",
    prioridad: "alta",
    destinatario: "seguridad@servicehub.io",
    plantilla: "acceso-sospechoso",
    enviadaEn: "2026-08-03T22:05:00Z",
  },
  {
    ...baseNotif(5),
    asunto: "Fin de periodo de prueba en 4 días",
    mensaje: "El periodo de prueba de Iberia Motor finaliza el 08/08. Contacta para convertir la cuenta.",
    canal: "email",
    categoria: "comercial",
    estado: "enviada",
    prioridad: "media",
    destinatario: "comercial@servicehub.io",
    clienteId: 4,
    plantilla: "fin-prueba",
    enviadaEn: "2026-08-03T10:00:00Z",
  },
  {
    ...baseNotif(6),
    asunto: "Webhook de facturación no entregado",
    mensaje: "El endpoint de integración devolvió 500 en 3 reintentos consecutivos.",
    canal: "webhook",
    categoria: "sistema",
    estado: "fallida",
    prioridad: "alta",
    destinatario: "https://erp.cliente.com/hooks/facturacion",
    clienteId: 1,
    plantilla: "webhook-error",
    enviadaEn: "2026-08-03T04:31:00Z",
  },
  {
    ...baseNotif(7),
    asunto: "Mantenimiento programado de FinPulse",
    mensaje: "Ventana de mantenimiento el domingo de 02:00 a 04:00 CET. Servicio en modo lectura.",
    canal: "email",
    categoria: "sistema",
    estado: "enviada",
    prioridad: "baja",
    destinatario: "todos-los-clientes",
    plantilla: "mantenimiento",
    enviadaEn: "2026-08-02T16:45:00Z",
  },
  {
    ...baseNotif(8),
    asunto: "Aviso de renovación automática",
    mensaje: "La suscripción de CloudMetrics se renovará automáticamente el 01/09 por 12 meses.",
    canal: "email",
    categoria: "renovacion",
    estado: "pendiente",
    prioridad: "baja",
    destinatario: "it@grupovertex.es",
    clienteId: 1,
    plantilla: "renovacion-automatica",
    enviadaEn: "2026-08-02T09:15:00Z",
  },
  {
    ...baseNotif(9),
    asunto: "SMS de recordatorio de pago",
    mensaje: "Recordatorio de la factura F-2026-0184 con vencimiento mañana.",
    canal: "sms",
    categoria: "impago",
    estado: "enviada",
    prioridad: "media",
    destinatario: "+34 600 112 233",
    clienteId: 5,
    plantilla: "recordatorio-pago",
    enviadaEn: "2026-08-01T11:00:00Z",
  },
  {
    ...baseNotif(10),
    asunto: "Exceso de llamadas API facturable",
    mensaje: "Grupo Vertex superó en 18% las llamadas API incluidas; se facturará el excedente.",
    canal: "interna",
    categoria: "consumo",
    estado: "leida",
    prioridad: "media",
    destinatario: "Equipo Financiero",
    clienteId: 1,
    aplicacionId: 1,
    plantilla: "exceso-api",
    enviadaEn: "2026-08-01T08:30:00Z",
  },
];

export interface PlantillaNotificacion {
  id: string;
  nombre: string;
  categoria: CategoriaNotificacion;
  canales: CanalNotificacion[];
  disparador: string;
  activa: boolean;
}

export const plantillasNotificacion: PlantillaNotificacion[] = [
  { id: "renovacion-proxima", nombre: "Renovación próxima", categoria: "renovacion", canales: ["email", "interna"], disparador: "30, 15 y 7 días antes del vencimiento", activa: true },
  { id: "renovacion-automatica", nombre: "Confirmación de renovación", categoria: "renovacion", canales: ["email"], disparador: "Al renovar automáticamente un contrato", activa: true },
  { id: "impago-segundo-aviso", nombre: "Aviso de impago", categoria: "impago", canales: ["email", "sms"], disparador: "3, 10 y 20 días tras el vencimiento", activa: true },
  { id: "limite-consumo", nombre: "Límite de consumo", categoria: "consumo", canales: ["interna", "email"], disparador: "Al alcanzar el 80% y el 95% del límite", activa: true },
  { id: "exceso-api", nombre: "Excedente facturable", categoria: "consumo", canales: ["interna"], disparador: "Al superar el consumo contratado", activa: true },
  { id: "acceso-sospechoso", nombre: "Acceso sospechoso", categoria: "seguridad", canales: ["interna", "email"], disparador: "Login desde IP o dispositivo nuevo", activa: true },
  { id: "fin-prueba", nombre: "Fin de periodo de prueba", categoria: "comercial", canales: ["email"], disparador: "7 y 3 días antes de finalizar la prueba", activa: true },
  { id: "mantenimiento", nombre: "Mantenimiento programado", categoria: "sistema", canales: ["email", "interna"], disparador: "Publicación de ventana de mantenimiento", activa: true },
  { id: "webhook-error", nombre: "Error de integración", categoria: "sistema", canales: ["interna", "webhook"], disparador: "3 fallos consecutivos de entrega", activa: false },
  { id: "recordatorio-pago", nombre: "Recordatorio de pago", categoria: "impago", canales: ["sms", "email"], disparador: "1 día antes del vencimiento", activa: true },
];


/* ------------------------------ Helpers -------------------------------- */

export const getCliente = (id: number) => clientes.find((c) => c.id === id);
export const getAplicacion = (id: number) => aplicaciones.find((a) => a.id === id);

export const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const num = (n: number) => new Intl.NumberFormat("es-ES").format(n);

export const fecha = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
