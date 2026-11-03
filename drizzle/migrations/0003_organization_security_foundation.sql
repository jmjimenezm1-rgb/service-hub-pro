CREATE TYPE public.organization_role AS ENUM ('admin', 'member');
CREATE TABLE public.organizaciones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nombre text NOT NULL,
 activa boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.organizaciones TO authenticated;
GRANT ALL ON public.organizaciones TO service_role;
ALTER TABLE public.organizaciones ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.organizacion_miembros (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizacion_id uuid NOT NULL REFERENCES public.organizaciones(id),
 user_id uuid NOT NULL,
 activo boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (organizacion_id, user_id)
);
GRANT SELECT ON public.organizacion_miembros TO authenticated;
GRANT ALL ON public.organizacion_miembros TO service_role;
ALTER TABLE public.organizacion_miembros ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizacion_id uuid NOT NULL,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role public.organization_role NOT NULL DEFAULT 'member',
 UNIQUE (organizacion_id, user_id, role),
 FOREIGN KEY (organizacion_id, user_id) REFERENCES public.organizacion_miembros(organizacion_id, user_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.organizacion_permisos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizacion_id uuid NOT NULL,
 user_id uuid NOT NULL,
 modulo text NOT NULL,
 nivel text NOT NULL DEFAULT 'ninguno' CHECK (nivel IN ('ninguno', 'lectura', 'escritura', 'total')),
 UNIQUE (organizacion_id, user_id, modulo),
 FOREIGN KEY (organizacion_id, user_id) REFERENCES public.organizacion_miembros(organizacion_id, user_id)
);
GRANT SELECT ON public.organizacion_permisos TO authenticated;
GRANT ALL ON public.organizacion_permisos TO service_role;
ALTER TABLE public.organizacion_permisos ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.es_miembro_organizacion(_organizacion uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.organizacion_miembros m JOIN public.organizaciones o ON o.id=m.organizacion_id WHERE m.organizacion_id=_organizacion AND m.user_id=auth.uid() AND m.activo AND o.activa) $$;
REVOKE ALL ON FUNCTION public.es_miembro_organizacion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.es_miembro_organizacion(uuid) TO authenticated;
CREATE FUNCTION public.es_admin_organizacion(_organizacion uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.es_miembro_organizacion(_organizacion) AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.organizacion_id=_organizacion AND r.user_id=auth.uid() AND r.role='admin') $$;
REVOKE ALL ON FUNCTION public.es_admin_organizacion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.es_admin_organizacion(uuid) TO authenticated;
CREATE FUNCTION public.tiene_permiso_organizacion(_organizacion uuid, _modulo text, _nivel text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT _nivel IN ('lectura','escritura','total') AND public.es_miembro_organizacion(_organizacion) AND (public.es_admin_organizacion(_organizacion) OR EXISTS (SELECT 1 FROM public.organizacion_permisos p WHERE p.organizacion_id=_organizacion AND p.user_id=auth.uid() AND p.modulo=_modulo AND CASE p.nivel WHEN 'total' THEN 3 WHEN 'escritura' THEN 2 WHEN 'lectura' THEN 1 ELSE 0 END >= CASE _nivel WHEN 'total' THEN 3 WHEN 'escritura' THEN 2 WHEN 'lectura' THEN 1 ELSE 4 END)) $$;
REVOKE ALL ON FUNCTION public.tiene_permiso_organizacion(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tiene_permiso_organizacion(uuid,text,text) TO authenticated;
CREATE POLICY organizaciones_lectura ON public.organizaciones FOR SELECT TO authenticated USING (public.es_miembro_organizacion(id));
CREATE POLICY organizaciones_edicion ON public.organizaciones FOR UPDATE TO authenticated USING (public.es_admin_organizacion(id)) WITH CHECK (public.es_admin_organizacion(id));
CREATE POLICY miembros_lectura ON public.organizacion_miembros FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.es_admin_organizacion(organizacion_id));
CREATE POLICY user_roles_lectura ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.es_admin_organizacion(organizacion_id));
CREATE POLICY permisos_lectura ON public.organizacion_permisos FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.es_admin_organizacion(organizacion_id));
CREATE TRIGGER organizaciones_updated_at BEFORE UPDATE ON public.organizaciones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
COMMENT ON TABLE public.organizacion_miembros IS 'Protected organization memberships; no automatic enrollment on signup. Existing CRM records are not reassigned by this foundation.';
COMMENT ON TABLE public.organizacion_permisos IS 'Explicit organization module grants. Legacy usuarios.rol and rol_permisos do not authorize access.';