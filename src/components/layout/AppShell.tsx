import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, Moon, Sun, Bell, Layers, Lock, LogIn, LogOut } from "lucide-react";
import { grupos, modulos } from "@/lib/modules";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("sh-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("sh-theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Layers className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight text-sidebar-foreground">ServiceHub</span>
          <span className="block text-[11px] text-sidebar-foreground/60">SaaS Pay Per Use</span>
        </span>
      </Link>

      {grupos.map((grupo) => (
        <div key={grupo} className="space-y-1">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
            {grupo}
          </p>
          {modulos
            .filter((m) => m.grupo === grupo)
            .map((m) => {
              const activo = m.ruta === "/" ? pathname === "/" : !!m.ruta && pathname.startsWith(m.ruta);
              const Icono = m.icono;
              if (!m.disponible) {
                return (
                  <div
                    key={m.id}
                    title="Módulo previsto — se integrará en la siguiente fase"
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/35"
                  >
                    <Icono className="size-4" />
                    <span className="flex-1">{m.nombre}</span>
                    <Lock className="size-3" />
                  </div>
                );
              }
              return (
                <Link
                  key={m.id}
                  to={m.ruta ?? "/"}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    activo
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icono className="size-4" />
                  {m.nombre}
                </Link>
              );
            })}
        </div>
      ))}

      <SesionCard />
    </nav>
  );
}

function SesionCard() {
  const { sesion } = useSesion();
  return (
    <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
      <p className="truncate text-xs font-medium text-sidebar-accent-foreground">
        {sesion?.user.email ?? "Sin sesión"}
      </p>
      <p className="text-[11px] text-sidebar-foreground/60">
        {sesion ? "Sesión iniciada" : "Sin sesión"}
      </p>
    </div>
  );
}

function BotonSesion() {
  const { sesion } = useSesion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!sesion) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/auth">
          <LogIn className="size-4" /> Iniciar sesión
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        navigate({ to: "/auth", replace: true });
      }}
    >
      <LogOut className="size-4" /> Salir
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <NavContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navegación</SheetTitle>
              <NavContent />
            </SheetContent>
          </Sheet>

          <GlobalSearch />

          <div className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/notificaciones" aria-label="Notificaciones" title="Notificaciones">
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Cambiar tema">
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <BotonSesion />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
