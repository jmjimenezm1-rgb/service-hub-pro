import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso de administradores · ServiceHub" },
      {
        name: "description",
        content: "Inicia sesión en ServiceHub para gestionar clientes, aplicaciones, suscripciones y usuarios.",
      },
      { property: "og:title", content: "Acceso · ServiceHub" },
      { property: "og:description", content: "Panel de administración SaaS Pay Per Use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { autenticado } = useSesion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (autenticado) navigate({ to: "/", replace: true });
  }, [autenticado, navigate]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) toast.error("No se pudo iniciar sesión", { description: error.message });
    else toast.success("Sesión iniciada");
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setCargando(false);
    if (error) toast.error("No se pudo crear la cuenta", { description: error.message });
    else if (!data.session)
      toast.success("Cuenta creada", { description: "Revisa tu correo para confirmar el acceso." });
    else toast.success("Cuenta creada y sesión iniciada");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-10">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Layers className="size-5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Acceso a ServiceHub</h1>
          <p className="text-sm text-muted-foreground">Necesario para crear y editar registros.</p>
        </div>
      </div>

      <div className="surface w-full p-5">
        <Tabs defaultValue="entrar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrar">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="registro">Crear cuenta</TabsTrigger>
          </TabsList>

          {(["entrar", "registro"] as const).map((modo) => (
            <TabsContent key={modo} value={modo}>
              <form onSubmit={modo === "entrar" ? entrar : registrar} className="space-y-4 pt-2">
                <div>
                  <Label htmlFor={`email-${modo}`}>Correo electrónico</Label>
                  <Input
                    id={`email-${modo}`}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor={`pass-${modo}`}>Contraseña</Label>
                  <Input
                    id={`pass-${modo}`}
                    type="password"
                    required
                    minLength={6}
                    autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={cargando}>
                  {cargando ? "Procesando…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
