CREATE TABLE public.plantillas_notificacion (
  id bigserial PRIMARY KEY,
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  categoria text NOT NULL DEFAULT 'sistema',
  canales text[] NOT NULL DEFAULT '{}'::text[],
  disparador text NOT NULL DEFAULT '',
  asunto text NOT NULL DEFAULT '',
  cuerpo text NOT NULL DEFAULT '',
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

GRANT SELECT ON public.plantillas_notificacion TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plantillas_notificacion TO authenticated;
GRANT ALL ON public.plantillas_notificacion TO service_role;

ALTER TABLE public.plantillas_notificacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plantillas lectura publica" ON public.plantillas_notificacion
  FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
CREATE POLICY "plantillas escritura autenticada" ON public.plantillas_notificacion
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER plantillas_notificacion_updated_at
  BEFORE UPDATE ON public.plantillas_notificacion
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.plantillas_notificacion (codigo, nombre, categoria, canales, disparador, asunto, cuerpo, activa) VALUES
('renovacion-proxima','Renovación próxima','renovacion','{email,interna}','30, 15 y 7 días antes del vencimiento','Renovación de {{aplicacion}} el {{fecha}}','El contrato de {{aplicacion}} para {{cliente}} vence el {{fecha}}.',true),
('renovacion-automatica','Confirmación de renovación','renovacion','{email}','Al renovar automáticamente un contrato','Renovación confirmada de {{aplicacion}}','Hemos renovado automáticamente {{aplicacion}} para {{cliente}}.',true),
('impago-segundo-aviso','Aviso de impago','impago','{email,sms}','3, 10 y 20 días tras el vencimiento','Aviso de impago ({{importe}})','{{cliente}} acumula facturas vencidas por {{importe}}.',true),
('limite-consumo','Límite de consumo','consumo','{interna,email}','Al alcanzar el 80% y el 95% del límite','Consumo al {{porcentaje}} en {{aplicacion}}','{{cliente}} ha alcanzado el {{porcentaje}} del consumo contratado.',true),
('exceso-api','Excedente facturable','consumo','{interna}','Al superar el consumo contratado','Excedente facturable en {{aplicacion}}','Se ha superado el consumo contratado de {{aplicacion}}.',true),
('acceso-sospechoso','Acceso sospechoso','seguridad','{interna,email}','Login desde IP o dispositivo nuevo','Acceso sospechoso detectado','Se ha detectado un acceso desde un dispositivo o IP nuevos.',true),
('fin-prueba','Fin de periodo de prueba','comercial','{email}','7 y 3 días antes de finalizar la prueba','Tu periodo de prueba finaliza pronto','El periodo de prueba de {{aplicacion}} finaliza el {{fecha}}.',true),
('mantenimiento','Mantenimiento programado','sistema','{email,interna}','Publicación de ventana de mantenimiento','Mantenimiento programado','Habrá una ventana de mantenimiento el {{fecha}}.',true),
('webhook-error','Error de integración','sistema','{interna,webhook}','3 fallos consecutivos de entrega','Error de integración en {{aplicacion}}','Se han producido 3 fallos consecutivos de entrega.',false),
('recordatorio-pago','Recordatorio de pago','impago','{sms,email}','1 día antes del vencimiento','Recordatorio de pago','Recuerda que mañana vence la factura de {{importe}}.',true);