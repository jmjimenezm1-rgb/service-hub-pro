import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Users2, AppWindow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useClientes, useAplicaciones } from "@/lib/db";
import { modulos } from "@/lib/modules";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} aria-label="Buscar en ServiceHub" title="Buscar en ServiceHub" className="size-9 shrink-0 p-0 sm:h-9 sm:w-full sm:max-w-md sm:justify-start sm:px-3">
        <Search className="size-4 shrink-0" />
        <span className="hidden truncate font-normal text-muted-foreground sm:inline">Buscar clientes, aplicaciones y páginas…</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] gap-0 overflow-hidden p-0" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Buscar en ServiceHub</DialogTitle>
          {open && <SearchResults onSelect={(action) => { setOpen(false); action(navigate); }} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchResults({ onSelect }: { onSelect: (action: (navigate: ReturnType<typeof useNavigate>) => void) => void }) {
  const clientes = useClientes();
  const aplicaciones = useAplicaciones();
  return (
    <Command>
      <CommandInput autoFocus placeholder="Buscar…" aria-label="Texto de búsqueda global" className="pr-10" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Clientes">
          {clientes.map((c) => <CommandItem key={c.id} value={`cliente ${c.id} ${c.nombreComercial} ${c.razonSocial} ${c.nif} ${c.email}`} onSelect={() => onSelect((navigate) => { void navigate({ to: "/crm/$clienteId", params: { clienteId: String(c.id) } }); })}>
            <Users2 /><span className="min-w-0"><span className="block break-words">{c.nombreComercial}</span><span className="block break-all text-xs text-muted-foreground">{c.nif} · {c.email}</span></span>
          </CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Aplicaciones">
          {aplicaciones.map((a) => <CommandItem key={a.id} value={`aplicacion ${a.id} ${a.nombre} ${a.proveedor} ${a.categoria}`} onSelect={() => onSelect((navigate) => { void navigate({ to: "/aplicaciones", search: { aplicacion: String(a.id), ocultarRetiradas: false } }); })}>
            <AppWindow /><span className="min-w-0"><span className="block break-words">{a.nombre}</span><span className="block break-words text-xs text-muted-foreground">{a.categoria} · {a.proveedor}</span></span>
          </CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Páginas">
          {modulos.filter((m) => m.disponible && m.ruta).map((m) => <CommandItem key={m.id} value={`pagina ${m.nombre}`} onSelect={() => onSelect((navigate) => { if (m.ruta) void navigate({ to: m.ruta }); })}>
            <m.icono />{m.nombre}
          </CommandItem>)}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}