CREATE OR REPLACE FUNCTION public.registrar_auditoria()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor TEXT; v_id TEXT; v_antes JSONB; v_despues JSONB;
BEGIN
  v_actor := COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email', NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', 'sistema');
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.auditoria (tabla, registro_id, operacion, actor, datos_antes, datos_despues)
    VALUES (TG_TABLE_NAME, OLD.id::text, 'baja', v_actor, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  v_id := NEW.id::text; v_despues := to_jsonb(NEW);
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.auditoria (tabla, registro_id, operacion, actor, datos_antes, datos_despues)
    VALUES (TG_TABLE_NAME, v_id, 'alta', v_actor, NULL, v_despues);
  ELSE
    v_antes := to_jsonb(OLD);
    IF v_antes IS DISTINCT FROM v_despues THEN
      INSERT INTO public.auditoria (tabla, registro_id, operacion, actor, datos_antes, datos_despues)
      VALUES (TG_TABLE_NAME, v_id, CASE WHEN v_antes ->> 'deleted_at' IS NULL AND v_despues ->> 'deleted_at' IS NOT NULL THEN 'baja' ELSE 'modificacion' END, v_actor, v_antes, v_despues);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.registrar_auditoria() FROM PUBLIC, anon, authenticated;