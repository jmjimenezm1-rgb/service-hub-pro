REVOKE ALL ON public.user_roles, public.organizacion_miembros, public.organizacion_permisos, public.organizaciones FROM anon;
REVOKE ALL ON public.user_roles, public.organizacion_miembros, public.organizacion_permisos, public.organizaciones FROM authenticated;
GRANT SELECT ON public.user_roles, public.organizacion_miembros, public.organizacion_permisos, public.organizaciones TO authenticated;
GRANT ALL ON public.user_roles, public.organizacion_miembros, public.organizacion_permisos, public.organizaciones TO service_role;
REVOKE EXECUTE ON FUNCTION public.es_miembro_organizacion(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.es_miembro_organizacion(uuid) TO authenticated;