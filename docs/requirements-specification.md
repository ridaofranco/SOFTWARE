# PROMPT MAESTRO — PERFECCIONAMIENTO DE APP (Next.js + Shadcn)
**NO MODIFICAR** lo que ya funciona. Implementar mejoras exactas sobre archivos indicados.

## Contexto
- Zona horaria oficial: `America/Argentina/Buenos_Aires` (GMT-3).
- Ventana operativa constante: **+30 días** desde "hoy" (recalcular al cruzar medianoche y en vivo).
- Cuenta regresiva (días:horas:min): **decremento en tiempo real** en Dashboard e Índice/Detalle de eventos.
- Colaboración en tiempo real estilo Google Docs (edición simultánea, comentarios, historial).

## Estructura detectada (rutas relevantes)
- `components/event-dashboard.tsx`
- `components/event-calendar.tsx`
- `components/automated-tasks-widget.tsx`
- `components/tasks-list.tsx`
- `components/events/edit-event-modal.tsx`
- `components/new-event-dialog.tsx`
- `lib/event-service.ts`
- `lib/automated-tasks-service.ts`
- `store/unified-event-store.ts`

## Objetivo 1 — Dashboard (30 días + countdown + TZ AR)
### Requisitos
1) Mostrar siempre eventos **dentro de los próximos 30 días**.
2) Recalcular lista automáticamente:
   - Al cambiar el día en AR (medianoche TZ AR).
   - Cada 60s para countdown.
3) Countdown en tarjetas de eventos: `Días:HH:MM` en vivo.
4) Sincronizar todo con TZ AR (`America/Argentina/Buenos_Aires`).

### Instrucciones de implementación
- `store/unified-event-store.ts`:
  - Asegurar selector `upcomingEvents30d` (o crear) que filtre por `nowAR` a `nowAR + 30d`.
  - Implementar `nowAR()` que derive `DateTime.now().setZone('America/Argentina/Buenos_Aires')` usando `luxon`.
- `components/event-dashboard.tsx` y `components/event-calendar.tsx`:
  - Usar selector `upcomingEvents30d`.
  - Agregar hook `useCountdown(event.startAt)` que actualice cada 60s.
- Dependencias sugeridas: `luxon`, y si no existe, instalar.

## Objetivo 2 — Sección Eventos (Índice + Detalle)
### Índice
- Filtros: Todos / Confirmados / Pendientes / Propios / Privados / En curso.
- Campos: nombre, temática, venue, ciudad/país, fecha/hora (TZ AR), **countdown** y estado.
- Acciones rápidas: Ver Detalle / Abrir Tareas / Abrir Proveedores.

### Detalle (pestañas)
**General**
- Fecha/hora, venue (selector), temática.
- Responsables: socio/productor/asistente.
- Contactos de armado: **venue** y **productora** (nombre/rol/email/tel).
- Capacidades: **habilitada oficial**, **declarada venue**, **a la venta** (validar venta ≤ habilitada).
- **Salida a la venta**: fecha/hora. **Bloquear** si falta habilitación/capacidad.

**Proveedores**
- Asignar/quitar/actualizar desde base interna; guardar historial.

**Tareas** (ver Objetivo 3)
- Inyección automática de paquete estándar por evento, con deadlines (críticas ≤ 15d, importantes ≤ 14d) y recordatorios/escalamientos.

**Manuales** (ver Objetivo 4)
- Generar manual automático (DOCX/PDF) aunque no haya respuestas.

**Seguros**
- Padrón de TODA la gente que trabaja (incluye no-proveedores: bailarines, escenógrafos, validadores).
- Niveles editables: Verde ARS 10M / Amarillo 15M / Rojo 18M.
- Vencimientos con semáforo; listado de pólizas; auditoría.

**Contratos**
- Generar desde padrón/proveedores; autocompletar; estados: Borrador/Revisión/Firmado; adjuntos.

## Objetivo 3 — Paquete de Tareas + Preguntas (inyección automática)
Al crear/confirmar evento, **inyectar** tareas estándar con responsable por defecto y **preguntas guía**. Estados: Pendiente/En curso/Completada/Bloqueada; prioridad: Crítica/Alta/Media/Baja.
**SLA**: Críticas resueltas ≤ 15d; Importantes ≤ 14d. Recordatorios cada 48h sin progreso.

### Bloques y Tareas (con responsables por defecto)
(ARTE, BOOKING, MARKETING, EXTRAS DE PRODUCCIÓN) — **Ver la lista completa más abajo**.

### Implementación
- `lib/automated-tasks-service.ts`:
  - Agregar `injectStandardTasks(eventId)` que:
    - Inserte todas las tareas con responsable por defecto (FRANCO/PABLO o “definir”).
    - Asigne `deadline` según criticidad (fechaEvento - 15d/14d).
    - Vincule `questions[]` según catálogo de preguntas.
- `store/unified-event-store.ts`:
  - Asegurar métodos `addTasks(eventId, tasks[])`, `updateTask`, `setTaskState`, `assignOwner`.
- `components/automated-tasks-widget.tsx` / `components/tasks-list.tsx`:
  - Botón “**Inyectar tareas estándar**”; mostrar checklist con estados, ordenadas por prioridad real (viajes/aduana > pista/FX > habilitaciones).

## Objetivo 4 — Manuales automáticos (plantillas + respuestas)
- Acción: botón **Generar Manual** dentro del evento.
- Proceso: consolidar **datos del evento + proveedores + tareas + respuestas a preguntas**.
- **Debe generar SIEMPRE un manual**, aunque no haya respuestas (relleno con campos vacíos).
- Colaboración en tiempo real (edición simultánea), comentarios, historial, versionado.
- Exportar **DOCX** y **PDF**.
- Plantillas/estructura basadas en manuales de referencia (Asistente, VJ, Sonidista, Socio, Directora de Arte, Boletería, Asistente Puerta).

### Implementación
- Crear módulo `lib/manuals.ts` con:
  - `generateManual(eventId, role)` → devuelve documento (docx/pdf) basado en plantilla + respuestas.
  - Soporte de horarios y flujos base (22:00 llegada, 00:30 puertas, 03:00 Serpiente, 06:00 cierre).
- (Opcional) Usar `docx` npm package o servidor ligero de render.

## Objetivo 5 — Venues y Habilitaciones
- Para cada venue: guardar **vencimiento** de habilitación general, venta de alcohol y capacidad.
- Si un venue está **vigente**, **no volver a preguntar** hasta su vencimiento.
- Alertar con semáforo por proximidad a vencimiento.

## Objetivo 6 — Colaboración en tiempo real
- Integrar **Liveblocks** o **Yjs + y-websocket**:
  - Presencia (cursores con nombre), edición simultánea por campo, comentarios con @menciones, historial.
- Auditoría global: usuario, cambio, timestamp.

---

# Catálogo de Tareas + Preguntas (completo)

## ARTE
**Dirección de artistas — PABLO**
- ¿Line-up de performance y tiempos de salida?
- ¿Quién da el GO en cada cue (aperturas/Serpiente)?
- ¿Brief a actores/bailarines listo y enviado?
- ¿Relevos y suplentes definidos?
- ¿Entrega: fotos/video de referencia para ensayo?

**Actores + Serpiente — PABLO**
- ¿Cuántos actores? ¿call times?
- ¿Serpiente lista 02:30? ¿show 03:00?
- ¿Máscara/props listos y custodiados post?
- ¿Ensayo 22:00 confirmado?
- ¿Plan B si falta alguien?

**Escenario extra — FRANCO**
- ¿Medidas / altura / carga admitida?
- ¿Flete/armado/desarme y pasacalles incluidos?
- ¿Certificados (si requiere)?
- ¿Protecciones antideslizantes?
- ¿Layout aprobado con venue?

**Escenografía — FRANCO**
- ¿Lista de piezas + renders aprobados?
- ¿Materiales ignífugos? ¿certificado?
- ¿Armadores y tiempos?
- ¿Depósito/retorno?
- Viático escenografía: ¿monto, a quién, cuándo?

**Peón de escenografía — FRANCO**
- ¿Cantidad, horarios, EPP?
- ¿Tareas: carga/armado/retira?
- ¿Responsable en sitio?
- ¿Viáticos/comidas?
- ¿Seguro AP?

**Horas extra personal – montaje — (según planilla)**
- ¿Quiénes pueden extender? ¿top de horas?
- ¿Costo/hora y pre-aprobación?
- ¿Registro y firma?
- ¿Tope presupuestario?
- ¿Con quién se liquida?

**Riggers — FRANCO**
- ¿Puntos de rigging aprobados por venue?
- ¿Planos de carga y altura?
- ¿EPP y seguros vigentes?
- ¿Ventana de colgado/descolgado?
- ¿Certificación post-montaje?

**Pista — FRANCO**
- ¿Doble fecha? ¿pista extra?
- ¿Estado / limpieza / reparación previa?
- ¿Antideslizante y terminación?
- ¿Armado/desarme: quién/cuándo?
- ¿Peones de pista asignados?

**Peones pista — FRANCO**
- ¿Cantidad / turnos?
- ¿Herramientas provistas?
- ¿Supervisor asignado?
- ¿AP/seguros?
- ¿Pago y cierre?

**Flete — FRANCO**
- ¿Camión(es), patentes y franjas de carga/descarga?
- ¿Puntos de acceso (Mujica/Retiro) confirmados?
- ¿Seguro de carga?
- ¿Ayudantes incluidos?
- ¿Tel del chofer?

**Peones carga y descarga — FRANCO**
- ¿Cantidad / ventanas horarias?
- ¿EPP / seguro?
- ¿Quién recibe y firma?
- ¿Lista de bultos?
- ¿Pago/viáticos?

**Ignifugado — FRANCO**
- ¿Qué piezas cubre?
- ¿Certificado al día para inspección?
- ¿Aplicación/renovación cuándo?
- ¿Proveedor habilitado?
- ¿Copia en carpeta de Legales?

**Personal eléctrico armado — FRANCO**
- ¿Electricista matriculado?
- ¿Tablero/distribución/puesta a tierra?
- ¿Protecciones y cableado aprobado?
- ¿Check de carga total?
- ¿Acta de conformidad venue?

**VJ — FRANCO**
- ¿Material oficial (logos/tour) precargado?
- ¿Pixel map recibido y probado?
- ¿Frecuencia de branding definida?
- ¿Backup (segunda compu/media)?
- ¿Horario de prueba?

**Pantallas — FRANCO**
- ¿LED/proyector? ¿pitch/tamaño/altura?
- ¿Estructura y energía dedicadas?
- ¿Entrada de señal (HDMI/SDI) y distancias?
- ¿Contenido escalado sin deformar?
- ¿Operador y soporte onsite?

**FX — PABLO**
- ¿Tipos: CO₂ / chispas frías / humo / confetti?
- ¿Permisos y zonas de seguridad?
- ¿Sincronía con Serpiente 03:00?
- ¿Matafuegos y responsable al lado?
- ¿Limpieza post incluida?

**Presentación — PABLO**
- ¿Guion de apertura y microcues?
- ¿Host o voz en off?
- ¿Visual/luces/sonido coordinado?
- ¿Duración y corte?
- ¿Plan B si se retrasa?

**Iluminador — FRANCO**
- ¿Showfile + cues (warm-up, 00:30, 03:00, cierre)?
- ¿Consola/fixture list compatibles?
- ¿Focus previo / haze permitido?
- ¿Sincronía con VJ/FX?
- ¿Contacto del operador del venue?

**Asistente de iluminación — FRANCO**
- ¿Tareas claras (follow, focos, cambios)?
- ¿Comunicación (intercom/handy)?
- ¿Turno y reemplazo?
- ¿Pago/viático?
- ¿Responsable directo?

**Luces extras — FRANCO**
- ¿Qué fixtures y cuántos?
- ¿Rigging/energía extra?
- ¿Programación necesaria?
- ¿Transporte/instalación incluidos?
- ¿Costo y seguro?

**Máquina de humo — FRANCO**
- ¿Tipo (humo/niebla/CO₂)?
- ¿Detectores y política del venue?
- ¿Fluido/cargas suficientes?
- ¿Operador asignado?
- ¿Ubicación segura?

**Aduana — FRANCO**
- ¿Hay ingreso de equipo externo?
- ¿Permisos/ATA/corresponsal?
- ¿Fechas de arribo/salida?
- ¿Seguro internacional?
- ¿Responsable documental?

**Glitter / Peinados / Tattoo / Maquillaje / Pochoclos — PABLO**
- ¿Ubicación, toma eléctrica, mesa y sillas?
- ¿Horarios y personal?
- ¿Precios / cortesías / medios de pago?
- ¿Higiene y residuos (contener, limpiar)?
- ¿Stock e insumos provistos?

**Productos de limpieza — FRANCO**
- ¿Lista de insumos y responsable?
- ¿Frecuencia de limpieza de pista/baños?
- ¿Volquete/bolsas/elementos?
- ¿Post evento incluido?
- ¿Contacto en sitio?

**Bola disco — (definir)**
- ¿Diámetro, peso, rigging y motor?
- ¿Punto de colgado aprobado?
- ¿Seguridad (cadenas secundarias)?
- ¿Control On/Off con luces?
- ¿Seguro/instalación certificada?

**Tintorería — (definir)**
- ¿Qué piezas y cuándo?
- ¿Retiro/entrega coordinados?
- ¿Emergencias post-evento?
- ¿Costo por prenda?
- Owner definido.

## BOOKING
**DJ — PABLO**
- ¿Confirmado, horario y set?
- ¿Rider (CDJ/Mixer/pendrive) OK?
- ¿Hospitality?
- ¿Caché / factura / pago?
- ¿Traslado/hospedaje si aplica?

**Cabina DJ — (definir)**
- ¿Estructura/alturas/espacio?
- ¿Monitores/retorno?
- ¿Alfombra/seguridad?
- ¿Cableado oculto/pasacables?
- ¿Iluminación de trabajo?

**Armado de lista — PABLO**
- ¿Responsable y deadline?
- ¿Cupos por categoría (VIP, invitados, influencers, hostel)?
- ¿Control de duplicados/anulados?
- ¿Formato (Google Sheet / CSV)?
- ¿Corte de actualización?

**CDJ — (definir)**
- ¿Modelo requerido (2000NXS2/3000)?
- ¿Cantidad / estado / USB test?
- ¿Soporte técnico en sitio?
- ¿Flete/seguro?
- ¿Plan B?

**CDJ falsa — PABLO**
- ¿Prop para cabina/escena?
- ¿Ubicación y fijación?
- ¿Aspecto estético consistente?
- ¿No interfiere con equipo real?
- ¿Armado/desarme responsable?

**Asistentes — PABLO**
- ¿Cantidad, roles, horarios?
- ¿Brief de tareas y comunicación?
- ¿Viáticos/comidas?
- ¿AP/seguros al día?
- ¿Responsable directo?

**Asistente de pre-producción — PABLO**
- ¿Tareas previas (cotizaciones, llamados, planillas)?
- ¿Fechas límite / recordatorios?
- ¿Accesos a carpetas/documentos?
- ¿Reporta a quién?
- ¿Pago/horas?

**Sonidista — (si no está en Producción)**
- ¿Confirmado + prueba 23:00?
- ¿Equipo propio (laptop/placa)?
- ¿Playlist 03:00?
- ¿Pago/caché?
- ¿Contacto de emergencia?

**Consola sonido / Agregados sonido — PABLO**
- ¿Modelo + canales suficientes?
- ¿Micros/DI/cables extra?
- ¿Monitores/PA extra?
- ¿Transporte/instalación?
- ¿Soporte onsite?

**Boletero — PABLO**
- ¿Turnos / caja / pulseras?
- ¿Precios (general/VIP efectivo y MP) y upgrade?
- ¿Cierre de caja y arqueo?
- ¿Procedimientos de incidencias?
- ¿Owner y backup?

**Validadores QR — PABLO**
- ¿3 general / 2 VIP, datos/baterías OK?
- ¿Plan offline?
- ¿Listas: anticipadas/VIP/invitados/hostel?
- ¿Duplicados/anulados: procedimiento?
- ¿Soporte técnico?

**Seguro de accidentes personales — PABLO**
- ¿Cobertura staff/performers?
- ¿Lista nominal y horarios?
- ¿Póliza en carpeta?
- ¿Contacto de siniestros?
- ¿Vigencia evento?

**Seguridad — FRANCO**
- Brief (cacheo suave, baños inclusivos, VIP/camarín).
- Puntos fijos/recorridas.
- Jefe y contactos.
- Informe de incidentes.
- ¿Policía requerida?

**Policías — FRANCO**
- ¿Cantidad/horarios/costos?
- ¿Pedido y orden de servicio?
- ¿Ubicación y funciones?
- ¿Coordinación con seguridad privada?
- ¿Pago/recibo?

**Paramédicos — PABLO**
- ¿Horas y dotación?
- ¿Equipamiento / camilla / DEA?
- ¿Ubicación del puesto?
- ¿Reporte a Producción?
- Ambulancia confirmada 00:00.

**Ambulancia — PABLO**
- ¿Unidad, matrícula, radio?
- ¿Hora de arribo 00:00?
- ¿Protocolos y derivaciones?
- ¿Contacto 24h?
- ¿Pago?

**Precintos (Pulseras) — PABLO**
- ¿Colores por categoría?
- ¿Cantidad/stock/backup?
- ¿Custodia y entrega?
- ¿Cierre y recuento?
- ¿Proveedor/factura?

**Hospedaje — FRANCO**
- ¿Rooming list, late check-out?
- ¿Ubicación vs. venue?
- ¿Pagos/garantías?
- ¿Viáticos asociados?
- ¿Contacto hotel?

**Movilidad — PABLO**
- ¿Traslados staff/artistas?
- ¿Rutas y horarios?
- ¿Choferes/contactos?
- ¿Backups?
- ¿Costos?

**Viáticos — FRANCO**
- ¿Montos por rol/día?
- ¿Comprobación y rendición?
- ¿Entrega previa o reintegro?
- ¿Topes?
- ¿Owner de control?

**Espacio Públicos / SADAIC / ADICAPIF — FRANCO**
- ¿Quién gestiona cada uno?
- ¿Estados/comprobantes?
- ¿Importes y vencimientos?
- ¿Documentación en carpeta?
- ¿Contacto del gestor?

**Grupo electrógeno / Gasoil — (definir)**
- ¿Potencia y autonomía?
- ¿Ubicación/sonorización?
- Gasoil: litros / reposición.
- ¿Operador y mantención?
- ¿Plan de transferencia?

**Consumo en venue / Camareras extra — (definir)**
- ¿Acuerdo de consumo mínimo/máximo?
- ¿Camareras extra: cantidad/horario?
- ¿Control de consumos por mesa/sector?
- ¿Tarjeta de consumo (emisión y cierre)?
- ¿Owner del control?

## MARKETING (PABLO)
**Creadora de contenido**
- ¿Brief y calendario?
- ¿Accesos en venue?
- ¿Entregables (reels/stories) y plazos?
- ¿Uso de imagen?
- ¿Pago?

**Filmmaker**
- ¿Guion de highlights?
- ¿Audio de referencia?
- ¿Entrega teaser 24–48h?
- ¿Accesos VIP/cabina/camarín?
- ¿Pago?

**Fotografía**
- ¿Shot list: aperturas, Serpiente, branding, VIP?
- ¿Entrega same night/24–48h?
- ¿Derechos/uso?
- ¿Coordinación con luces?
- ¿Pago?

**Merch**
- ¿Diseños aprobados?
- ¿Stock talles/colores?
- ¿LED para puesto merch: pedido?
- ¿POS/efectivo?
- ¿Cierre y recuento?

**PR**
- ¿Invitados prensa/influencers?
- ¿Consumo influencers acordado?
- ¿Acreditación y hospitality?
- ¿Clipping post?
- ¿Contacto prensa?

**Impresiones y señalética**
- ¿Piezas, tiradas y materiales?
- ¿Instalación y retiro?
- ¿Mapeo de ubicación?
- ¿Permisos si externos?
- ¿Factura y control?

## EXTRAS DE PRODUCCIÓN (chequeo rápido)
- Capacidad y habilitación: ¿vigente y visible?
- Hora inicio/finalización: ¿comunicada a todos?
- Horarios de armado/desarme: ¿cerrados con venue y flete?
- Carga/descarga escenografía/pista: ¿ventanas y peones?
- Armado/desarmado pista: ¿responsable y tiempos?
- Apertura de puertas / Cierre: ¿quién da la orden?
- Rider sonido / iluminación: ¿aprobado y disponible onsite?
- Horarios técnicos (22:00 pruebas): ¿avisados?
- Pasacables / Escaleras: ¿cantidad y ubicación?
- Vestuario: ¿guardado y backup?
- Visuales: ¿solo material oficial? ¿branding recurrente?
- Máscara de Serpiente: ¿lista 02:30, custodia post?
- Conexiones eléctricas: ¿puntos y carga?
- Mesa con consumo / sin consumo: ¿condiciones y control?
- Guardarropa: ¿política y tickets?
- Enfermería: ¿ubicación y comunicación?
- Ingreso VIP: ¿carril, validador, pulsera?
- Upgrade entrada: ¿diferencia y procedimiento?
- Precio entrada efectivo/MP: ¿claros y visibles?
- Creación grupo MKT-Acceso: ¿difusión interna?
- LED puesto merch: ¿resuelto?
- Manual Anabella: ¿entregado con especificaciones?
- Vallado: ¿perímetro y pasillos críticos?

---

# Reglas de negocio
- Operar siempre con **+30 días** por delante.
- Tareas críticas resueltas **≤ 15 días** antes; importantes **≤ 14 días**.
- Publicación de venta: **bloqueada** si faltan habilitaciones/capacidad.
- Venues: no re-preguntar habilitaciones hasta **vencimiento** (con alerta).
- Seguros: todos los trabajadores en padrón con cobertura (10/15/18M ARS).
- Colaboración en vivo + auditoría global.

# Criterios de aceptación
- Dashboard y listados muestran solo próximos 30 días con countdown vivo.
- Detalle de evento permite editar General, Proveedores, Tareas (inyectadas), Manuales, Seguros, Contratos.
- Botón “Generar Manual” crea DOCX/PDF aunque no haya respuestas.
- Recordatorios y escalados automáticos para tareas sin progreso.
- Habilitaciones bloquean salida a la venta si no están OK.
