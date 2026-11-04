DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clientes','aplicaciones','suscripciones','usuarios','consumos','notificaciones','plantillas_notificacion','agenda_cliente','cliente_historial','roles'] LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS organizacion_id uuid REFERENCES public.organizaciones(id)', t);
    EXECUTE format('UPDATE public.%I SET organizacion_id = %L WHERE organizacion_id IS NULL', t, '9d2045d0-85c2-4afc-b8c3-5c1f2063e85f');
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (organizacion_id)', t || '_organizacion_idx', t);
  END LOOP;
END $$;