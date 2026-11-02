# Integración de ServiceHub y los módulos financieros

## Resultado
Una sola aplicación con el menú y las pantallas actuales, un único acceso y todos los módulos comerciales y financieros conectados a Lovable Cloud. Cada **empresa gestora** tendrá sus propios clientes, facturas, proveedores y personal, sin acceso a los de otra empresa.

No se rediseñarán pantallas ni se borrarán datos. La integración se realizará por etapas comprobables; no se dará por terminada mientras falten capacidades detectadas o verificaciones.

## Inventario y conflictos confirmados
- El anfitrión contiene CRM, Aplicaciones, Suscripciones, Usuarios, Permisos, Consumo, Notificaciones y Auditoría. Su base actual contiene 12 tablas; las tablas financieras todavía no están incorporadas.
- El origen incluye Dashboard financiero, Facturación (facturas, líneas, series, cupones, rectificativas y PDF), Cobros (conciliación y antigüedad de deuda), Compras y proveedores, Pagos a proveedores (conciliación y previsión), Financiero ERP (asientos, cuentas, balances, centros e informes), Documental, Soporte, Parametrización y Auditoría financiera.
- Hay 22 tablas en el origen y dos grupos de migraciones dependientes entre sí. Se conservarán las reglas contables automáticas, reversos y protección de asientos; no se copiarán migraciones antiguas sin adaptación.
- Clientes y aplicaciones tienen identificadores numéricos en el anfitrión y UUID en el origen. Los directorios del anfitrión serán los únicos directorios activos; se adaptarán las relaciones y se conservará un mapa de identificadores originales para la importación.
- Ambos proyectos tienen acceso, menú, componentes compartidos y auditoría propios. Se mantiene el acceso, router y menú del anfitrión; los componentes financieros conservarán sus campos, acciones y densidad, evitando colisiones internas de nombres.
- Los permisos actuales no vinculan de forma segura las cuentas de acceso con los roles empresariales. Las políticas existentes permiten lecturas públicas y escrituras autenticadas demasiado amplias. El origen además asigna administrador al registrarse: **ese comportamiento inseguro no se importará**.
- Los permisos financieros del origen son por pertenencia a rol; los del anfitrión distinguen lectura, escritura y total. Se documentará una correspondencia explícita, sin elevar permisos automáticamente.
- Se detectaron operaciones financieras con varias escrituras no atómicas, numeración susceptible a concurrencia e incoherencias con retenciones y cupones. Se preservarán las opciones visibles; las operaciones sensibles se protegerán con transacciones. No se inventarán reglas fiscales para resolver ambigüedades.
- Stripe, PayPal y SEPA aparecen como métodos de pago, no como conexiones de cobro verificadas. No se presentarán cambios de estado como cobros o devoluciones bancarias reales.
- No hay exportaciones de registros, identidades ni archivos adjuntas. El código permite preparar los módulos sin ellas; su importación y verificación quedan pendientes.

## Etapas de implementación
### 1. Seguridad y datos comunes
Crear organizaciones y membresías protegidas, relacionar las cuentas de acceso con los usuarios empresariales y asignar los registros existentes a la empresa actual mediante una incorporación autorizada, sin conceder administración por registrarse. No deducir la pertenencia por coincidencias ambiguas de email.

Aplicar aislamiento por empresa y permisos por módulo tanto a consultas como a escrituras, relaciones y archivos. Adaptar el acceso a las pantallas privadas sin introducir otro login. Mantener el acceso a las bajas lógicas para quienes estén autorizados. Comprobar el núcleo existente tras este cambio.

### 2. Esquema financiero y navegación
Añadir las tablas financieras con sus relaciones a los clientes, aplicaciones y suscripciones existentes. Mantener UUID en movimientos financieros y claves numéricas en las relaciones al núcleo. Integrar las pantallas originales y el Dashboard financiero en `/dashboard`, conservando el Dashboard actual en `/`.

Agrupar el menú en Operación, Finanzas y Plataforma. Conservar `/compras`, `/facturacion`, `/cobros`, `/pagos`, `/financiero`, `/documental`, `/soporte` y `/parametrizacion`. Mantener `/auditoria` e incorporar allí el acceso a la auditoría financiera sin perder filtros ni detalles de ninguno de los dos sistemas.

### 3. Finanzas y operaciones sensibles
Integrar proveedores, compras, pagos a proveedores, facturas y líneas, series, cupones, cobros, conciliación y deuda. Proteger la asignación de números, cambios de saldo, rectificación y anulación mediante operaciones transaccionales e idempotentes.

Conservar el motor contable automático completo, las asociaciones configurables de cuentas, reversos, informes por ejercicio y la excepción que permite reasignar el centro de coste. Probar impuestos, descuentos, retenciones, documentos negativos y reintentos; cualquier regla de negocio no resoluble desde el origen requerirá una decisión antes de activarla.

### 4. Documentos, soporte y auditoría
Conservar generación y descarga de PDF, archivos privados, versiones y vínculos con facturas y clientes. Integrar tickets, comentarios y notas internas con límites de acceso. Registrar actor, empresa, entidad, acción y valores anteriores/nuevos desde operaciones confiables; conservar el contrato de `/api/public/ip` sin tratar sus cabeceras como prueba de identidad.

### 5. Importación y comprobación final
Importar exportaciones autorizadas y filtradas, manteniendo IDs originales en el mapa y verificando cantidades y relaciones. Los usuarios existentes conservarán perfiles y datos; en su primera visita verificarán su email y elegirán una contraseña nueva. Las contraseñas y sesiones antiguas no se trasladan. Esta vinculación quedará pendiente si faltan identidades verificables.

## Detalles técnicos
- Conservar TanStack Start, versiones del anfitrión, conexión generada y componentes existentes. Añadir únicamente dependencias necesarias para PDF.
- Cambios de esquema aditivos, versionados, con GRANT y RLS explícitos; no renombrar ni eliminar tablas o columnas activas. Adaptadores de catálogo en vez de duplicar `clients` y `applications`.
- Roles en una tabla protegida independiente y asignaciones por organización; validar autorización en servidor/base, nunca desde almacenamiento del navegador ni desde el campo editable de rol en `usuarios`.
- Validar pertenencia a la misma organización en cada relación financiera y del núcleo. El servidor no confiará en una organización enviada por el navegador sin comprobar membresía.
- Operaciones internas sensibles con funciones de servidor y transacciones de base; preservar funciones contables del origen adaptando autorización y claves. Archivos privados con políticas por organización.
- Registro de capacidades y tareas actualizado por etapa, diferenciando implementación de verificación. No publicar ni cambiar destinos de servicios externos sin solicitud.

## Verificación por etapa
- Navegador con sesión real: núcleo existente y altas, lecturas, ediciones y bajas representativas de cada módulo integrado; retirar registros temporales.
- Permisos: acceso permitido y denegado por rol, sesión expirada y aislamiento real entre dos empresas, incluidas llamadas directas y documentos.
- Finanzas: numeración concurrente, importes, cobros, reversos, reintentos, asientos equilibrados y protegidos, informes por ejercicio y exportaciones.
- Comparación visual en escritorio, tablet y móvil: mismos campos, columnas, filtros, diálogos, acciones, PDF y estados. Metadatos propios en cada página.
- Revisar errores de compilación y ejecución y ejecutar las pruebas relevantes. La integración completa exige verificar todas las capacidades, no solo mostrar las pantallas.

## Pendientes externos
Exportaciones CSV/JSON de registros e identidades y archivos con metadatos del proyecto financiero. Se pedirán después de preparar la experiencia integrada, sin bloquear el trabajo de código. El envío de notificaciones por email sigue pendiente de un dominio propio. Cualquier conexión externa que aparezca durante la integración se conservará y sus claves se solicitarán solo por el formulario seguro.