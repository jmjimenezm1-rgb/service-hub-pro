import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Mail,
  MessageCircle,
  Megaphone,
  Phone,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { RecordFormDialog } from "@/components/shared/RecordFormDialog";
import { camposAgenda, filaAgenda } from "@/lib/form-defs";
import { useGuardarRegistro } from "@/lib/mutations";
import { useAgenda, useCatalogo, type EntradaAgenda } from "@/lib/db";
import { fecha } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconoTipo: Record<string, typeof Phone> = {
  llamada: Phone,
  reunion: Users,
  email: Mail,
  whatsapp: MessageCircle,
  marketing: Megaphone,
};

const etiquetaTipo: Record<string, string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  email: "Correo enviado",
  whatsapp: "WhatsApp enviado",
  marketing: "Evento de marketing",
};

const claveDia = (iso: string) => iso.slice(0, 10);

export function AgendaCliente({
  clienteId,
  contactos,
}: {
  clienteId: number;
  contactos: string[];
}) {
  const [vista, setVista] = useState<"tabla" | "calendario">("tabla");
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<EntradaAgenda | null>(null);
  const [mes, setMes] = useState(() => {
    const h = new Date();
    return new Date(h.getFullYear(), h.getMonth(), 1);
  });

  const guardar = useGuardarRegistro("agenda_cliente", "agenda_cliente", "Registro de agenda");
  const { aplicaciones, getAplicacion } = useCatalogo();
  const agenda = useAgenda();

  const eventos = useMemo(
    () =>
      agenda
        .filter((e) => e.clienteId === clienteId)
        .sort(
          (a, b) =>
            new Date(b.fechaReal ?? b.fechaPlanificada).getTime() -
            new Date(a.fechaReal ?? a.fechaPlanificada).getTime(),
        ),
    [agenda, clienteId],
  );

  const porDia = useMemo(() => {
    const m = new Map<string, EntradaAgenda[]>();
    for (const e of eventos) {
      const k = claveDia(e.fechaReal ?? e.fechaPlanificada);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return m;
  }, [eventos]);

  const abrir = (e: EntradaAgenda | null) => {
    setEditando(e);
    setAbierto(true);
  };

  const dias = useMemo(() => {
    const inicio = new Date(mes);
    const desplazamiento = (inicio.getDay() + 6) % 7; // lunes primero
    const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const celdas: (Date | null)[] = Array.from({ length: desplazamiento }, () => null);
    for (let d = 1; d <= total; d++) celdas.push(new Date(mes.getFullYear(), mes.getMonth(), d));
    return celdas;
  }, [mes]);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" /> Agenda del cliente
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Llamadas, reuniones, correos, WhatsApp y eventos de marketing en orden cronológico.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              size="sm"
              variant={vista === "tabla" ? "secondary" : "ghost"}
              onClick={() => setVista("tabla")}
            >
              <List className="size-4" /> Tabla
            </Button>
            <Button
              size="sm"
              variant={vista === "calendario" ? "secondary" : "ghost"}
              onClick={() => setVista("calendario")}
            >
              <CalendarDays className="size-4" /> Calendario
            </Button>
          </div>
          <Button size="sm" onClick={() => abrir(null)}>
            <Plus className="size-4" /> Nueva acción
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {vista === "tabla" ? (
          <ul className="divide-y divide-border">
            {eventos.map((e) => {
              const Icono = iconoTipo[e.tipo] ?? Phone;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => abrir(e)}
                    className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="mt-0.5 rounded-md bg-muted p-2">
                      <Icono className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{e.asunto}</span>
                        <Badge variant="secondary">{etiquetaTipo[e.tipo] ?? e.tipo}</Badge>
                        <StatusBadge estado={e.estado} />
                        {e.origen === "marketing" && <Badge variant="outline">marketing</Badge>}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Planificada {fecha(e.fechaPlanificada)}
                        {e.fechaReal ? ` · Realizada ${fecha(e.fechaReal)}` : " · pendiente de realizar"}
                        {e.contacto ? ` · ${e.contacto}` : ""}
                        {e.aplicacionId ? ` · ${getAplicacion(e.aplicacionId)?.nombre ?? ""}` : ""}
                      </span>
                      {e.comentarios && (
                        <span className="mt-1 block text-sm text-muted-foreground">{e.comentarios}</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            {eventos.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Todavía no hay acciones registradas para este cliente.
              </li>
            )}
          </ul>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Button
                size="icon"
                variant="outline"
                aria-label="Mes anterior"
                onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="text-sm font-medium capitalize">
                {mes.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </p>
              <Button
                size="icon"
                variant="outline"
                aria-label="Mes siguiente"
                onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {dias.map((d, i) => {
                if (!d) return <div key={`v${i}`} />;
                const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                const delDia = porDia.get(clave) ?? [];
                const hoy = clave === new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={clave}
                    className={cn(
                      "min-h-20 rounded-lg border border-border p-1 text-left",
                      hoy && "border-primary",
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{d.getDate()}</p>
                    <div className="mt-0.5 space-y-0.5">
                      {delDia.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => abrir(e)}
                          title={`${etiquetaTipo[e.tipo] ?? e.tipo}: ${e.asunto}`}
                          className={cn(
                            "block w-full truncate rounded px-1 py-0.5 text-left text-[11px]",
                            e.estado === "realizado"
                              ? "bg-success/15 text-success"
                              : e.estado === "cancelado"
                                ? "bg-muted text-muted-foreground line-through"
                                : "bg-primary/15 text-primary",
                          )}
                        >
                          {e.asunto}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <RecordFormDialog
        open={abierto}
        onOpenChange={setAbierto}
        titulo={editando ? `Editar acción · ${editando.asunto}` : "Nueva acción de agenda"}
        descripcion="Registra o planifica una llamada, reunión, correo, WhatsApp o evento de marketing."
        campos={camposAgenda(aplicaciones, contactos)}
        valoresIniciales={filaAgenda(editando)}
        guardando={guardar.isPending}
        onSubmit={(valores) => {
          const v = valores as Record<string, unknown>;
          guardar.mutate(
            {
              ...(editando ? { id: editando.id } : {}),
              valores: {
                ...v,
                cliente_id: clienteId,
                aplicacion_id: Number(v["aplicacion_id"]) || null,
                fecha_real: v["fecha_real"] ? v["fecha_real"] : null,
              },
            },
            { onSuccess: () => setAbierto(false) },
          );
        }}
      />
    </Card>
  );
}
