
CREATE TABLE IF NOT EXISTS public.auditoria (
  id BIGSERIAL PRIMARY KEY,
  tabla TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  operacion TEXT NOT NULL,
  actor TEXT,
  datos_antes JSONB,
  datos_despues JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auditoria_tabla_idx ON public.auditoria (tabla, created_at DESC);
CREATE INDEX IF NOT EXISTS auditoria_registro_idx ON public.auditoria (tabla, registro_id);

GRANT SELECT ON public.auditoria TO authenticated;
GRANT SELECT ON public.auditoria TO anon;
GRANT ALL ON public.auditoria TO service_role;

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auditoria lectura" ON public.auditoria;
CREATE POLICY "auditoria lectura" ON public.auditoria FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor TEXT;
  v_id TEXT;
BEGIN
  v_actor := COALESCE(
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email',
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    'sistema'
  );

  IF TG_OP = 'DELETE' THEN
    v_id := OLD.id::text;
    INSERT INTO public.auditoria (tabla, registro_id, operacion, actor, datos_antes, datos_despues)
    VALUES (TG_TABLE_NAME, v_id, 'baja', v_actor, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;

  v_id := NEW.id::text;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.auditoria (tabla, registro_id, operacion, actor, datos_antes, datos_despues)
    VALUES (TG_TABLE_NAME, v_id, 'alta', v_actor, NULL, to_jsonb(NEW));
  ELSE
    IF to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
      INSERT INTO public.auditoria (tabla, registro_id, operacion, actor, datos_antes, datos_despues)
      VALUES (
        TG_TABLE_NAME,
        v_id,
        CASE WHEN OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN 'baja' ELSE 'modificacion' END,
        v_actor,
        to_jsonb(OLD),
        to_jsonb(NEW)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['clientes','aplicaciones','suscripciones','usuarios','notificaciones','roles','rol_permisos','agenda_cliente','plantillas_notificacion','consumos']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS aud_%1$s ON public.%1$I', t);
    EXECUTE format('CREATE TRIGGER aud_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.registrar_auditoria()', t);
  END LOOP;
END $$;
