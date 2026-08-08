CREATE TABLE public.agenda_cliente (
  id bigserial PRIMARY KEY,
  cliente_id bigint NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  contacto text NOT NULL DEFAULT '',
  aplicacion_id bigint REFERENCES public.aplicaciones(id) ON DELETE SET NULL,
  tipo text NOT NULL DEFAULT 'llamada',
  asunto text NOT NULL,
  comentarios text NOT NULL DEFAULT '',
  fecha_planificada timestamptz NOT NULL DEFAULT now(),
  fecha_real timestamptz,
  estado text NOT NULL DEFAULT 'planificado',
  origen text NOT NULL DEFAULT 'manual',
  referencia_externa text NOT NULL DEFAULT '',
  autor text NOT NULL DEFAULT 'sistema',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

GRANT SELECT ON public.agenda_cliente TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_cliente TO authenticated;
GRANT ALL ON public.agenda_cliente TO service_role;

ALTER TABLE public.agenda_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda lectura publica" ON public.agenda_cliente
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

CREATE POLICY "agenda escritura autenticada" ON public.agenda_cliente
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER agenda_cliente_updated_at
  BEFORE UPDATE ON public.agenda_cliente
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX agenda_cliente_cliente_idx ON public.agenda_cliente (cliente_id, fecha_planificada DESC);

INSERT INTO public.agenda_cliente (cliente_id, contacto, aplicacion_id, tipo, asunto, comentarios, fecha_planificada, fecha_real, estado, origen)
SELECT c.id, c.contacto, NULL, t.tipo, t.asunto, t.coment, now() + (t.dias || ' days')::interval, CASE WHEN t.dias < 0 THEN now() + (t.dias || ' days')::interval ELSE NULL END, CASE WHEN t.dias < 0 THEN 'realizado' ELSE 'planificado' END, 'manual'
FROM (SELECT id, contacto FROM public.clientes WHERE deleted_at IS NULL ORDER BY id LIMIT 3) c
CROSS JOIN (VALUES
  ('llamada', 'Llamada de seguimiento comercial', 'Revisión de uso y necesidades del trimestre.', -12),
  ('reunion', 'Reunión de revisión de servicio', 'Presentación de nuevas funcionalidades.', -4),
  ('email', 'Envío de propuesta de renovación', 'Propuesta enviada al contacto principal.', 3),
  ('whatsapp', 'Recordatorio de renovación', 'Aviso rápido antes del vencimiento.', 9)
) AS t(tipo, asunto, coment, dias);