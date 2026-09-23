import {
  LayoutDashboard,
  Users2,
  AppWindow,
  Repeat,
  UserCog,
  ShieldCheck,
  Activity,
  Bell,
  ReceiptEuro,
  Banknote,
  Calculator,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

/**
 * Registro central de módulos.
 *
 * Añadir un módulo nuevo = añadir una entrada aquí + su ruta en src/routes.
 * Ningún módulo existente necesita modificarse (arquitectura desacoplada).
 */
export interface ModuloDef {
  id: string;
  nombre: string;
  icono: LucideIcon;
  ruta?: string;
  grupo: "Operación" | "Finanzas" | "Plataforma";
  disponible: boolean;
}

export const modulos: ModuloDef[] = [
  { id: "dashboard", nombre: "Dashboard", icono: LayoutDashboard, ruta: "/", grupo: "Operación", disponible: true },
  { id: "crm", nombre: "CRM · Clientes", icono: Users2, ruta: "/crm", grupo: "Operación", disponible: true },
  { id: "aplicaciones", nombre: "Aplicaciones", icono: AppWindow, ruta: "/aplicaciones", grupo: "Operación", disponible: true },
  { id: "suscripciones", nombre: "Suscripciones", icono: Repeat, ruta: "/suscripciones", grupo: "Operación", disponible: true },
  { id: "usuarios", nombre: "Usuarios", icono: UserCog, ruta: "/usuarios", grupo: "Plataforma", disponible: true },
  { id: "permisos", nombre: "Roles y permisos", icono: ShieldCheck, ruta: "/permisos", grupo: "Plataforma", disponible: true },
  { id: "consumo", nombre: "Gestión del uso", icono: Activity, ruta: "/consumo", grupo: "Plataforma", disponible: true },
  { id: "notificaciones", nombre: "Notificaciones", icono: Bell, ruta: "/notificaciones", grupo: "Plataforma", disponible: true },
  { id: "auditoria", nombre: "Auditoría", icono: History, ruta: "/auditoria", grupo: "Plataforma", disponible: true },
  { id: "facturacion", nombre: "Facturación", icono: ReceiptEuro, grupo: "Finanzas", disponible: false },
  { id: "cobros", nombre: "Cobros", icono: Banknote, grupo: "Finanzas", disponible: false },
  { id: "financiero", nombre: "Financiero (ERP)", icono: Calculator, grupo: "Finanzas", disponible: false },
  { id: "soporte", nombre: "Soporte", icono: LifeBuoy, grupo: "Plataforma", disponible: false },
];

export const grupos = ["Operación", "Plataforma", "Finanzas"] as const;
