-- ServiceHub · esquema base (módulos 1-7)
CREATE TABLE public.clientes (
  id bigserial PRIMARY KEY,
  razon_social text NOT NULL,
  nombre_comercial text NOT NULL,
  nif text NOT NULL,
  direccion text NOT NULL DEFAULT '',
  provincia text NOT NULL DEFAULT '',
  pais text NOT NULL DEFAULT 'España',
  contacto text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefono text NOT NULL DEFAULT '',
  web text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  empleados integer NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'prospecto',
  fecha_alta date NOT NULL DEFAULT current_date,
  fecha_baja date,
  observaciones text NOT NULL DEFAULT '',
  etiquetas text[] NOT NULL DEFAULT '{}',
  documentos integer NOT NULL DEFAULT 0,
  mrr numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT ON public.clientes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes lectura publica" ON public.clientes FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
CREATE POLICY "clientes escritura autenticada" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.aplicaciones (
  id bigserial PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0.0',
  estado text NOT NULL DEFAULT 'beta',
  categoria text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  proveedor text NOT NULL DEFAULT '',
  modelo_cobro text NOT NULL DEFAULT 'fijo',
  precio_base numeric NOT NULL DEFAULT 0,
  precio_usuario numeric NOT NULL DEFAULT 0,
  precio_uso numeric NOT NULL DEFAULT 0,
  unidad_uso text NOT NULL DEFAULT '',
  limites text NOT NULL DEFAULT '',
  logo text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT ON public.aplicaciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aplicaciones TO authenticated;
GRANT ALL ON public.aplicaciones TO service_role;
ALTER TABLE public.aplicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aplicaciones lectura publica" ON public.aplicaciones FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
CREATE POLICY "aplicaciones escritura autenticada" ON public.aplicaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.suscripciones (
  id bigserial PRIMARY KEY,
  cliente_id bigint NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  aplicacion_id bigint NOT NULL REFERENCES public.aplicaciones(id) ON DELETE RESTRICT,
  fecha_inicio date NOT NULL,
  fecha_renovacion date NOT NULL,
  estado text NOT NULL DEFAULT 'activa',
  modalidad text NOT NULL DEFAULT 'fijo',
  max_usuarios integer NOT NULL DEFAULT 0,
  consumo_contratado numeric NOT NULL DEFAULT 0,
  consumo_real numeric NOT NULL DEFAULT 0,
  precio numeric NOT NULL DEFAULT 0,
  descuento numeric NOT NULL DEFAULT 0,
  periodicidad text NOT NULL DEFAULT 'mensual',
  renovacion_automatica boolean NOT NULL DEFAULT false,
  observaciones text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT ON public.suscripciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suscripciones TO authenticated;
GRANT ALL ON public.suscripciones TO service_role;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suscripciones lectura publica" ON public.suscripciones FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
CREATE POLICY "suscripciones escritura autenticada" ON public.suscripciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.usuarios (
  id bigserial PRIMARY KEY,
  nombre text NOT NULL,
  apellidos text NOT NULL DEFAULT '',
  email text NOT NULL UNIQUE,
  telefono text NOT NULL DEFAULT '',
  cargo text NOT NULL DEFAULT '',
  departamento text NOT NULL DEFAULT '',
  cliente_id bigint REFERENCES public.clientes(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'activo',
  idioma text NOT NULL DEFAULT 'es-ES',
  zona_horaria text NOT NULL DEFAULT 'Europe/Madrid',
  ultimo_acceso timestamptz,
  rol text NOT NULL DEFAULT 'Usuario Cliente',
  aplicaciones bigint[] NOT NULL DEFAULT '{}',
  mfa boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT ON public.usuarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuarios lectura publica" ON public.usuarios FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
CREATE POLICY "usuarios escritura autenticada" ON public.usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.consumos (
  id bigserial PRIMARY KEY,
  cliente_id bigint NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  aplicacion_id bigint NOT NULL REFERENCES public.aplicaciones(id) ON DELETE CASCADE,
  metrica text NOT NULL,
  unidad text NOT NULL DEFAULT '',
  consumido numeric NOT NULL DEFAULT 0,
  incluido numeric NOT NULL DEFAULT 0,
  coste_unitario numeric NOT NULL DEFAULT 0,
  periodo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.consumos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consumos TO authenticated;
GRANT ALL ON public.consumos TO service_role;
ALTER TABLE public.consumos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consumos lectura publica" ON public.consumos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "consumos escritura autenticada" ON public.consumos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.notificaciones (
  id bigserial PRIMARY KEY,
  asunto text NOT NULL,
  mensaje text NOT NULL DEFAULT '',
  canal text NOT NULL DEFAULT 'interna',
  categoria text NOT NULL DEFAULT 'sistema',
  estado text NOT NULL DEFAULT 'pendiente',
  prioridad text NOT NULL DEFAULT 'media',
  destinatario text NOT NULL DEFAULT '',
  cliente_id bigint REFERENCES public.clientes(id) ON DELETE SET NULL,
  aplicacion_id bigint REFERENCES public.aplicaciones(id) ON DELETE SET NULL,
  plantilla text NOT NULL DEFAULT '',
  enviada_en timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notificaciones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificaciones TO authenticated;
GRANT ALL ON public.notificaciones TO service_role;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificaciones lectura publica" ON public.notificaciones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "notificaciones escritura autenticada" ON public.notificaciones FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_suscripciones_cliente ON public.suscripciones(cliente_id);
CREATE INDEX idx_usuarios_cliente ON public.usuarios(cliente_id);
CREATE INDEX idx_consumos_cliente ON public.consumos(cliente_id, periodo);