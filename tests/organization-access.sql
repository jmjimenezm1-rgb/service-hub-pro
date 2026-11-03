BEGIN;
INSERT INTO public.organizaciones (id,nombre) VALUES
 ('a1000000-0000-4000-8000-000000000001','Prueba temporal A'),
 ('a1000000-0000-4000-8000-000000000002','Prueba temporal B');
INSERT INTO public.organizacion_miembros (organizacion_id,user_id) VALUES
 ('a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001'),
 ('a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002');
INSERT INTO public.organizacion_permisos (organizacion_id,user_id,modulo,nivel) VALUES
 ('a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','crm','lectura');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000001',true);
SELECT set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
DO $$ BEGIN
 IF NOT public.es_miembro_organizacion('a1000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Own membership must be readable'; END IF;
 IF public.es_miembro_organizacion('a1000000-0000-4000-8000-000000000002') THEN RAISE EXCEPTION 'Other company membership leaked'; END IF;
 IF (SELECT count(*) FROM public.organizaciones WHERE id IN ('a1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002')) <> 1 THEN RAISE EXCEPTION 'Organization isolation failed'; END IF;
END $$;
DO $$ BEGIN
 IF public.es_admin_organizacion('a1000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Member became administrator'; END IF;
 IF has_table_privilege(current_user,'public.user_roles','INSERT') OR has_table_privilege(current_user,'public.organizacion_miembros','INSERT') OR has_table_privilege(current_user,'public.organizacion_permisos','UPDATE') THEN RAISE EXCEPTION 'Self promotion allowed'; END IF;
END $$;
DO $$ BEGIN
 IF NOT public.tiene_permiso_organizacion('a1000000-0000-4000-8000-000000000001','crm','lectura') THEN RAISE EXCEPTION 'Explicit read denied'; END IF;
 IF public.tiene_permiso_organizacion('a1000000-0000-4000-8000-000000000001','crm','escritura') THEN RAISE EXCEPTION 'Read permission allowed write'; END IF;
 IF public.tiene_permiso_organizacion('a1000000-0000-4000-8000-000000000002','crm','lectura') THEN RAISE EXCEPTION 'Permission crossed company boundary'; END IF;
 IF public.tiene_permiso_organizacion('a1000000-0000-4000-8000-000000000001','crm','invalid') THEN RAISE EXCEPTION 'Invalid permission accepted'; END IF;
END $$;
RESET ROLE;
UPDATE public.organizacion_miembros SET activo=false WHERE user_id='a2000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 IF public.es_miembro_organizacion('a1000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Inactive member retained access'; END IF;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
 IF has_table_privilege(current_user,'public.organizaciones','SELECT') OR has_function_privilege(current_user,'public.es_miembro_organizacion(uuid)','EXECUTE') THEN RAISE EXCEPTION 'Anonymous access allowed'; END IF;
END $$;
RESET ROLE;
ROLLBACK;