import { useMemo, useState, type ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Columna<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface FiltroDef<T> {
  label: string;
  opciones: string[];
  match: (row: T, valor: string) => boolean;
}

/**
 * Tabla reutilizable por todos los módulos: búsqueda, filtros y paginación.
 */
export function DataTable<T extends { id: number }>({
  data,
  columnas,
  buscar,
  filtros = [],
  onRowClick,
  porPagina = 8,
  vacio = "Sin resultados",
}: {
  data: T[];
  columnas: Columna<T>[];
  buscar: (row: T) => string;
  filtros?: FiltroDef<T>[];
  onRowClick?: (row: T) => void;
  porPagina?: number;
  vacio?: string;
}) {
  const [q, setQ] = useState("");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((row) => {
      if (term && !buscar(row).toLowerCase().includes(term)) return false;
      return filtros.every((f) => {
        const v = valores[f.label];
        return !v || v === "todos" || f.match(row, v);
      });
    });
  }, [data, q, valores, filtros, buscar]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const pageActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((pageActual - 1) * porPagina, pageActual * porPagina);

  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar…"
            className="pl-9"
          />
        </div>
        {filtros.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" />
            {filtros.map((f) => (
              <Select
                key={f.label}
                value={valores[f.label] ?? "todos"}
                onValueChange={(v) => {
                  setValores((prev) => ({ ...prev, [f.label]: v }));
                  setPagina(1);
                }}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder={f.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{f.label}: todos</SelectItem>
                  {f.opciones.map((o) => (
                    <SelectItem key={o} value={o} className="capitalize">
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columnas.map((c) => (
                <TableHead key={c.key} className={cn("whitespace-nowrap", c.className)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columnas.map((c) => (
                  <TableCell key={c.key} className={cn("whitespace-nowrap", c.className)}>
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} className="py-10 text-center text-muted-foreground">
                  {vacio}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border p-3 text-sm text-muted-foreground">
        <span>
          {filtrados.length} registro{filtrados.length === 1 ? "" : "s"} · página {pageActual} de {totalPaginas}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={pageActual <= 1}
            onClick={() => setPagina(pageActual - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={pageActual >= totalPaginas}
            onClick={() => setPagina(pageActual + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
