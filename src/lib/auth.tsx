import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sesión de ServiceHub. Un único suscriptor por componente que la necesite;
 * la escritura en base de datos exige sesión activa (RLS).
 */
export function useSesion() {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSesion(s);
      setCargando(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { sesion, cargando, autenticado: !!sesion };
}
