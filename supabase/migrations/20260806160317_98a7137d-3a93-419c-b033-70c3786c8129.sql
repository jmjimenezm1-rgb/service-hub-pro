ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS iban text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS banco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS titular_cuenta text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bic text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS forma_pago text NOT NULL DEFAULT 'domiciliacion',
  ADD COLUMN IF NOT EXISTS mandato_sepa text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fecha_mandato date,
  ADD COLUMN IF NOT EXISTS moneda text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS tarifa text NOT NULL DEFAULT 'estandar',
  ADD COLUMN IF NOT EXISTS descuento_general numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dia_pago integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS dias_vencimiento integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS limite_credito numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS periodo_facturacion text NOT NULL DEFAULT 'mensual',
  ADD COLUMN IF NOT EXISTS iva numeric NOT NULL DEFAULT 21,
  ADD COLUMN IF NOT EXISTS retencion numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS condiciones_notas text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.cliente_historial (
  id bigserial PRIMARY KEY,
  cliente_id bigint NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'nota',
  titulo text NOT NULL,
  detalle text NOT NULL DEFAULT '',
  autor text NOT NULL DEFAULT 'sistema',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cliente_historial TO authenticated;
GRANT SELECT ON public.cliente_historial TO anon;
GRANT ALL ON public.cliente_historial TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.cliente_historial_id_seq TO authenticated, anon, service_role;
ALTER TABLE public.cliente_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "historial lectura publica" ON public.cliente_historial FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "historial escritura autenticada" ON public.cliente_historial FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.roles (
  id bigserial PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  descripcion text NOT NULL DEFAULT '',
  sistema boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT SELECT ON public.roles TO anon;
GRANT ALL ON public.roles TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.roles_id_seq TO authenticated, anon, service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles lectura publica" ON public.roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "roles escritura autenticada" ON public.roles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.rol_permisos (
  id bigserial PRIMARY KEY,
  rol_id bigint NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  modulo text NOT NULL,
  nivel text NOT NULL DEFAULT 'ninguno',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rol_id, modulo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rol_permisos TO authenticated;
GRANT SELECT ON public.rol_permisos TO anon;
GRANT ALL ON public.rol_permisos TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rol_permisos_id_seq TO authenticated, anon, service_role;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rol_permisos lectura publica" ON public.rol_permisos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rol_permisos escritura autenticada" ON public.rol_permisos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.roles (nombre, descripcion, sistema) VALUES
  ('Administrador General', 'Acceso total a todos los módulos y a la configuración de la plataforma.', true),
  ('Administrador Comercial', 'Gestión de CRM, catálogo, suscripciones y seguimiento comercial.', true),
  ('Administrador Financiero', 'Facturación, cobros, consumo y control financiero.', true),
  ('Técnico', 'Configuración técnica de aplicaciones, métricas y uso.', true),
  ('Soporte', 'Atención de incidencias y consulta de datos operativos.', true),
  ('Cliente Administrador', 'Administra usuarios y suscripciones de su propia empresa.', true),
  ('Usuario Cliente', 'Acceso de uso a las aplicaciones autorizadas.', true)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.rol_permisos (rol_id, modulo, nivel)
SELECT r.id, m.modulo,
  CASE
    WHEN r.nombre = 'Administrador General' THEN 'total'
    WHEN r.nombre = 'Administrador Comercial' AND m.modulo IN ('CRM','Aplicaciones','Suscripciones','Notificaciones') THEN 'total'
    WHEN r.nombre = 'Administrador Comercial' AND m.modulo IN ('Usuarios','Consumo') THEN 'lectura'
    WHEN r.nombre = 'Administrador Financiero' AND m.modulo IN ('Suscripciones','Consumo') THEN 'total'
    WHEN r.nombre = 'Administrador Financiero' AND m.modulo IN ('CRM','Aplicaciones','Notificaciones') THEN 'lectura'
    WHEN r.nombre = 'Técnico' AND m.modulo IN ('Aplicaciones','Consumo') THEN 'total'
    WHEN r.nombre = 'Técnico' AND m.modulo IN ('Suscripciones','Usuarios','Notificaciones') THEN 'lectura'
    WHEN r.nombre = 'Soporte' AND m.modulo IN ('Notificaciones') THEN 'escritura'
    WHEN r.nombre = 'Soporte' THEN 'lectura'
    WHEN r.nombre = 'Cliente Administrador' AND m.modulo IN ('Usuarios') THEN 'escritura'
    WHEN r.nombre = 'Cliente Administrador' AND m.modulo IN ('Suscripciones','Consumo','Notificaciones') THEN 'lectura'
    WHEN r.nombre = 'Usuario Cliente' AND m.modulo IN ('Consumo','Notificaciones') THEN 'lectura'
    ELSE 'ninguno'
  END
FROM public.roles r
CROSS JOIN (VALUES ('CRM'),('Aplicaciones'),('Suscripciones'),('Usuarios'),('Permisos'),('Consumo'),('Notificaciones')) AS m(modulo)
ON CONFLICT (rol_id, modulo) DO NOTHING;