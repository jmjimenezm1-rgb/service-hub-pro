import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const organizacionesQuery = queryOptions({
  queryKey: ["organizaciones"],
  queryFn: async () => {
    const { data, error } = await supabase.from("organizaciones").select("id,nombre,activa").order("nombre");
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});