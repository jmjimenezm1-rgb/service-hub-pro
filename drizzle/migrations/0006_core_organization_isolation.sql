ALTER TABLE public.rol_permisos ADD COLUMN organizacion_id uuid REFERENCES public.organizaciones(id);
UPDATE public.rol_permisos p SET organizacion_id=r.organizacion_id FROM public.roles r WHERE r.id=p.rol_id;
ALTER TABLE public.auditoria ADD COLUMN organizacion_id uuid REFERENCES public.organizaciones(id);
UPDATE public.auditoria SET organizacion_id='9d2045d0-85c2-4afc-b8c3-5c1f2063e85f' WHERE organizacion_id IS NULL;
CREATE INDEX auditoria_organizacion_idx ON public.auditoria(organizacion_id);
CREATE INDEX rol_permisos_organizacion_idx ON public.rol_permisos(organizacion_id);
CREATE FUNCTION public.validar_empresa_registro() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d jsonb; empresa uuid; relacionada uuid; campo text; tabla text; referencia text; cantidad integer;
BEGIN
 d:=to_jsonb(NEW); empresa:=NEW.organizacion_id;
 IF TG_OP='UPDATE' AND empresa IS DISTINCT FROM OLD.organizacion_id THEN
  RAISE EXCEPTION 'No se puede cambiar la empresa de un registro' USING ERRCODE='42501';
 END IF;
 -- A related directory row is authoritative when a form omits its company.
 FOREACH campo IN ARRAY ARRAY['cliente_id','aplicacion_id','rol_id'] LOOP
  referencia:=d->>campo;
  IF referencia IS NOT NULL THEN
   tabla:=CASE campo WHEN 'cliente_id' THEN 'clientes' WHEN 'aplicacion_id' THEN 'aplicaciones' ELSE 'roles' END;
   EXECUTE format('SELECT organizacion_id FROM public.%I WHERE id=$1',tabla) INTO relacionada USING referencia::bigint;
   IF relacionada IS NULL THEN RAISE EXCEPTION 'Relación no válida' USING ERRCODE='23503'; END IF;
   IF empresa IS NULL THEN empresa:=relacionada; END IF;
   IF empresa IS DISTINCT FROM relacionada THEN RAISE EXCEPTION 'Los registros relacionados deben pertenecer a la misma empresa' USING ERRCODE='23514'; END IF;
  END IF;
 END LOOP;
 IF empresa IS NULL THEN
  SELECT count(*),(array_agg(m.organizacion_id))[1] INTO cantidad,empresa FROM public.organizacion_miembros m JOIN public.organizaciones o ON o.id=m.organizacion_id WHERE m.user_id=auth.uid() AND m.activo AND o.activa;
  IF cantidad<>1 THEN RAISE EXCEPTION 'Selecciona una empresa autorizada para el alta' USING ERRCODE='42501'; END IF;
 END IF;
 NEW.organizacion_id:=empresa;
 IF TG_TABLE_NAME='usuarios' THEN
  IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(d->'aplicaciones') a WHERE NOT EXISTS(SELECT 1 FROM public.aplicaciones p WHERE p.id=a.value::bigint AND p.organizacion_id=empresa)) THEN
   RAISE EXCEPTION 'Las aplicaciones del usuario deben pertenecer a su empresa' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validar_empresa_registro() FROM PUBLIC,anon,authenticated;
DO $$ DECLARE t text; m text; p record;
BEGIN
 FOREACH t IN ARRAY ARRAY['clientes','aplicaciones','suscripciones','usuarios','consumos','notificaciones','plantillas_notificacion','agenda_cliente','cliente_historial','roles','rol_permisos'] LOOP
  m:=CASE WHEN t IN ('clientes','agenda_cliente','cliente_historial') THEN 'crm' WHEN t IN ('roles','rol_permisos') THEN 'permisos' WHEN t='consumos' THEN 'consumo' WHEN t='plantillas_notificacion' THEN 'notificaciones' ELSE t END;
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t); END LOOP;
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',t);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO authenticated',t);
  EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY empresa_lectura ON public.%I FOR SELECT TO authenticated USING (public.tiene_permiso_organizacion(organizacion_id,%L,''lectura''))',t,m);
  EXECUTE format('CREATE POLICY empresa_alta ON public.%I FOR INSERT TO authenticated WITH CHECK (public.tiene_permiso_organizacion(organizacion_id,%L,''escritura''))',t,m);
  EXECUTE format('CREATE POLICY empresa_edicion ON public.%I FOR UPDATE TO authenticated USING (public.tiene_permiso_organizacion(organizacion_id,%L,''escritura'')) WITH CHECK (public.tiene_permiso_organizacion(organizacion_id,%L,''escritura''))',t,m,m);
  EXECUTE format('CREATE POLICY empresa_baja ON public.%I FOR DELETE TO authenticated USING (public.tiene_permiso_organizacion(organizacion_id,%L,''total''))',t,m);
  EXECUTE format('CREATE TRIGGER empresa_registro BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.validar_empresa_registro()',t);
 END LOOP;
END $$;
DROP POLICY "auditoria lectura" ON public.auditoria;
REVOKE ALL ON public.auditoria FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.auditoria TO authenticated;
GRANT ALL ON public.auditoria TO service_role;
CREATE POLICY empresa_auditoria ON public.auditoria FOR SELECT TO authenticated USING (public.tiene_permiso_organizacion(organizacion_id,'auditoria','lectura'));
CREATE OR REPLACE FUNCTION public.registrar_auditoria() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_actor text; v_antes jsonb; v_despues jsonb; v_id text; empresa uuid;
BEGIN
 v_actor:=coalesce(auth.uid()::text,'sistema');
 IF TG_OP='DELETE' THEN v_antes:=to_jsonb(OLD); ELSE v_despues:=to_jsonb(NEW); END IF;
 IF TG_OP='UPDATE' THEN v_antes:=to_jsonb(OLD); END IF;
 empresa:=coalesce(v_despues->>'organizacion_id',v_antes->>'organizacion_id')::uuid;
 v_id:=coalesce(v_despues->>'id',v_antes->>'id');
 IF TG_OP<>'UPDATE' OR v_antes IS DISTINCT FROM v_despues THEN
  INSERT INTO public.auditoria(tabla,registro_id,operacion,actor,datos_antes,datos_despues,organizacion_id) VALUES(TG_TABLE_NAME,v_id,CASE WHEN TG_OP='INSERT' THEN 'alta' WHEN TG_OP='DELETE' OR (v_antes->>'deleted_at' IS NULL AND v_despues->>'deleted_at' IS NOT NULL) THEN 'baja' ELSE 'modificacion' END,v_actor,v_antes,v_despues,empresa);
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.registrar_auditoria() FROM PUBLIC,anon,authenticated;