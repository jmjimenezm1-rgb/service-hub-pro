BEGIN;
INSERT INTO public.organizaciones(id,nombre) VALUES ('b1000000-0000-4000-8000-000000000001','Test A'),('b1000000-0000-4000-8000-000000000002','Test B');
INSERT INTO public.organizacion_miembros(organizacion_id,user_id) VALUES ('b1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001');
INSERT INTO public.organizacion_permisos(organizacion_id,user_id,modulo,nivel) VALUES ('b1000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','crm','lectura');
INSERT INTO public.clientes(id,nombre_comercial,organizacion_id) VALUES (-901,'Test A','b1000000-0000-4000-8000-000000000001'),(-902,'Test B','b1000000-0000-4000-8000-000000000002');
INSERT INTO public.aplicaciones(id,nombre,organizacion_id) VALUES (-901,'Test B','b1000000-0000-4000-8000-000000000002');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','b2000000-0000-4000-8000-000000000001',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.clientes WHERE id IN(-901,-902))<>1 THEN RAISE EXCEPTION 'Company read isolation failed'; END IF;
 IF EXISTS(SELECT 1 FROM public.aplicaciones WHERE id=-901) THEN RAISE EXCEPTION 'Module read permission leaked'; END IF;
END $$;
DO $$ BEGIN
 BEGIN INSERT INTO public.clientes(nombre_comercial) VALUES('Denied'); RAISE EXCEPTION 'Read-only member inserted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF EXISTS(WITH changed AS(UPDATE public.clientes SET nombre_comercial='Denied' WHERE id=-901 RETURNING id) SELECT 1 FROM changed) THEN RAISE EXCEPTION 'Read-only member updated'; END IF;
END $$;
RESET ROLE;
UPDATE public.organizacion_permisos SET nivel='escritura' WHERE user_id='b2000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$ DECLARE empresa uuid; BEGIN
 INSERT INTO public.clientes(id,nombre_comercial) VALUES(-903,'Auto') RETURNING organizacion_id INTO empresa;
 IF empresa<>'b1000000-0000-4000-8000-000000000001' THEN RAISE EXCEPTION 'Automatic organization failed'; END IF;
 BEGIN UPDATE public.clientes SET organizacion_id='b1000000-0000-4000-8000-000000000002' WHERE id=-903; RAISE EXCEPTION 'Ownership change allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.agenda_cliente(cliente_id,aplicacion_id,asunto) VALUES(-903,-901,'Cross company'); RAISE EXCEPTION 'Cross-company relation allowed'; EXCEPTION WHEN check_violation THEN NULL; END;
 IF EXISTS(WITH changed AS(DELETE FROM public.clientes WHERE id=-903 RETURNING id) SELECT 1 FROM changed) THEN RAISE EXCEPTION 'Write permission allowed hard delete'; END IF;
 IF EXISTS(SELECT 1 FROM public.auditoria) THEN RAISE EXCEPTION 'Audit leaked without permission'; END IF;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['clientes','aplicaciones','suscripciones','usuarios','consumos','notificaciones','agenda_cliente','cliente_historial','plantillas_notificacion','roles','rol_permisos','auditoria'] LOOP
  IF has_table_privilege(current_user,'public.'||t,'SELECT') THEN RAISE EXCEPTION 'Anonymous access to %',t; END IF;
 END LOOP;
END $$;
RESET ROLE;
ROLLBACK;
