SELECT setval('public.clientes_id_seq', (SELECT max(id) FROM public.clientes));
SELECT setval('public.aplicaciones_id_seq', (SELECT max(id) FROM public.aplicaciones));
SELECT setval('public.suscripciones_id_seq', (SELECT max(id) FROM public.suscripciones));
SELECT setval('public.usuarios_id_seq', (SELECT max(id) FROM public.usuarios));
SELECT setval('public.consumos_id_seq', (SELECT max(id) FROM public.consumos));
SELECT setval('public.notificaciones_id_seq', (SELECT max(id) FROM public.notificaciones));