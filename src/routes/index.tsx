import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users2,
  Wallet,
  TrendingUp,
  ReceiptEuro,
  AlertTriangle,
  UserCheck,
  Repeat,
  Activity,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  alertas,
  eur,
  fecha,
  num,
  serieFacturacion,
  serieUsuariosActivos,
} from "@/lib/mock-data";
import {
  useCatalogo,
  useConsumos,
  useSuscripciones,
  useUsuarios,
} from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · ServiceHub SaaS Pay Per Use" },
      {
        name: "description",
        content:
          "Panel de control de ServiceHub: clientes, MRR, ARR, facturación, cobros, consumo por aplicación y alertas.",
      },
      { property: "og:title", content: "Dashboard · ServiceHub" },
      {
        property: "og:description",
        content: "Indicadores en tiempo real del negocio SaaS: MRR, ARR, cobros, consumo y renovaciones.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { clientes, aplicaciones, getAplicacion, getCliente } = useCatalogo();
  const suscripciones = useSuscripciones();
  const usuarios = useUsuarios();
  const consumos = useConsumos();
  const activos = clientes.filter((c) => c.estado === "activo").length;
  const prueba = clientes.filter((c) => c.estado === "prueba").length;
  const impagos = clientes.filter((c) => c.estado === "impago").length;
  const mrr = clientes.reduce((s, c) => s + c.mrr, 0);

  const usoPorApp = aplicaciones
    .map((a) => ({
      nombre: a.nombre,
      consumo: consumos
        .filter((c) => c.aplicacionId === a.id)
        .reduce((s, c) => s + c.consumido * c.costeUnitario, 0),
      suscripciones: suscripciones.filter((s) => s.aplicacionId === a.id).length,
    }))
    .filter((a) => a.consumo > 0)
    .sort((a, b) => b.consumo - a.consumo);

  const renovaciones = [...suscripciones]
    .filter((s) => s.estado === "activa" || s.estado === "prueba")
    .sort((a, b) => a.fechaRenovacion.localeCompare(b.fechaRenovacion))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        titulo="Dashboard"
        descripcion="Visión global del negocio: clientes, ingresos recurrentes, consumo y alertas operativas."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes" value={clientes.length} icon={Users2} delta={12} hint="vs. mes anterior" to="/crm" search={{ estado: "todos" }} />
        <StatCard label="Clientes activos" value={activos} icon={UserCheck} hint={`${prueba} en prueba`} to="/crm" search={{ estado: "activo" }} />
        <StatCard label="MRR" value={eur(mrr)} icon={Wallet} delta={8} hint="ingreso recurrente" to="/suscripciones" search={{ estado: "activa" }} />
        <StatCard label="ARR" value={eur(mrr * 12)} icon={TrendingUp} delta={19} hint="proyección anual" to="/suscripciones" search={{ estado: "activa" }} />
        <StatCard label="Facturación mensual" value={eur(64100)} icon={ReceiptEuro} delta={3} hint="agosto" to="/suscripciones" search={{ periodicidad: "mensual" }} />
        <StatCard label="Facturación anual" value={eur(630830)} icon={ReceiptEuro} delta={21} hint="acumulado 12 m" to="/suscripciones" search={{ periodicidad: "anual" }} />
        <StatCard label="Cobros pendientes" value={eur(15870)} icon={AlertTriangle} delta={-6} hint={`${impagos} cliente(s) en impago`} to="/crm" search={{ estado: "impago" }} />
        <StatCard label="Usuarios activos" value={num(1512)} icon={Activity} delta={6} hint="412 conectados hoy" to="/usuarios" search={{ estado: "activo" }} />
      </section>


      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Facturación y cobros (12 meses)</h2>
          <p className="text-xs text-muted-foreground">Evolución mensual en euros.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serieFacturacion} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gFact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCob" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => eur(v)}
                />
                <Area type="monotone" dataKey="facturacion" name="Facturación" stroke="var(--color-chart-1)" fill="url(#gFact)" strokeWidth={2} />
                <Area type="monotone" dataKey="cobros" name="Cobros" stroke="var(--color-chart-2)" fill="url(#gCob)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4">
          <h2 className="text-sm font-semibold">Alertas</h2>
          <p className="text-xs text-muted-foreground">Impagos, consumo y renovaciones.</p>
          <ul className="mt-4 space-y-3">
            {alertas.map((a) => (
              <li key={a.id} className="flex gap-3 rounded-lg border border-border p-3">
                <AlertTriangle
                  className={
                    a.tipo === "impago" ? "size-4 shrink-0 text-destructive" : "size-4 shrink-0 text-warning"
                  }
                />
                <div>
                  <p className="text-sm leading-snug">{a.texto}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.fecha}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface p-4">
          <h2 className="text-sm font-semibold">Consumo por aplicación</h2>
          <p className="text-xs text-muted-foreground">Coste generado en el periodo actual.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usoPorApp} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="nombre" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => eur(v)}
                />
                <Bar dataKey="consumo" name="Consumo" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4">
          <h2 className="text-sm font-semibold">Usuarios activos</h2>
          <p className="text-xs text-muted-foreground">Crecimiento de la base de usuarios.</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serieUsuariosActivos} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="usuarios" name="Usuarios" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Repeat className="size-4 text-muted-foreground" /> Próximas renovaciones
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {renovaciones.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{getCliente(s.clienteId)?.nombreComercial}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {getAplicacion(s.aplicacionId)?.nombre} · {fecha(s.fechaRenovacion)}
                  </p>
                </div>
                <StatusBadge estado={s.estado} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface p-4">
        <h2 className="text-sm font-semibold">Aplicaciones más utilizadas</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {usoPorApp.slice(0, 4).map((a) => (
            <Link
              key={a.nombre}
              to="/consumo"
              search={{ aplicacion: a.nombre } as never}
              className="rounded-xl border border-border p-3 transition hover:border-primary/40 hover:shadow-md"
            >
              <p className="text-sm font-medium">{a.nombre}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{eur(a.consumo)}</p>
              <p className="text-xs text-muted-foreground">
                {a.suscripciones} suscripción(es) · {usuarios.filter((u) => u.aplicaciones.includes(aplicaciones.find((ap) => ap.nombre === a.nombre)!.id)).length} usuarios
              </p>
            </Link>
          ))}
        </div>
      </section>

    </>
  );
}
