import { useUnifiedEventStore } from "@/store/unified-event-store"
import { DateTime } from "luxon"

// Definir los venues que requieren tareas automáticas
const INTERNATIONAL_VENUES = [
  // Uruguay
  "Montevideo",

  // Ecuador
  "Cuenca",
  "Quito",
  "Guayaquil",

  // Paraguay
  "Asunción",
]

const ARGENTINA_VENUES = [
  "Normandina",
  "Stadium",
  "Gap",
  "Córdoba",
  "Rosario",
  "Mendoza",
  "Quilmes",
  "Capital Federal",
  "Buenos Aires",
]

// Fecha límite para generar tareas automáticas
const AUTOMATION_START_DATE = new Date("2025-08-15")

// Tipos de tareas automáticas con sus configuraciones
const AUTOMATED_TASK_TYPES = [
  {
    id: "pasajes",
    title: "🛫 Gestionar Pasajes",
    description: "Coordinar y confirmar pasajes aéreos para el equipo",
    daysToComplete: 7,
    priority: "high" as const,
    category: "Logística Internacional",
    forInternational: true,
    forArgentina: true,
  },
  {
    id: "hoteleria",
    title: "🏨 Reservar Hotelería",
    description: "Confirmar alojamiento para todo el equipo",
    daysToComplete: 10,
    priority: "high" as const,
    category: "Logística Internacional",
    forInternational: true,
    forArgentina: true,
  },
  {
    id: "aduana_ida",
    title: "📋 Trámites Aduana IDA",
    description: "Preparar documentación y trámites aduaneros de ida",
    daysToComplete: 14,
    priority: "medium" as const,
    category: "Documentación Internacional",
    forInternational: true,
    forArgentina: false,
  },
  {
    id: "aduana_vuelta",
    title: "📋 Trámites Aduana VUELTA",
    description: "Preparar documentación y trámites aduaneros de vuelta",
    daysToComplete: 21,
    priority: "medium" as const,
    category: "Documentación Internacional",
    forInternational: true,
    forArgentina: false,
  },
]

const STANDARD_TASK_CATALOG = {
  ARTE: [
    {
      id: "direccion-artistas",
      title: "Dirección de artistas",
      description:
        "¿Line-up de performance y tiempos de salida? ¿Quién da el GO en cada cue (aperturas/Serpiente)? ¿Brief a actores/bailarines listo y enviado? ¿Relevos y suplentes definidos? ¿Entrega: fotos/video de referencia para ensayo?",
      defaultAssignee: "PABLO",
      priority: "high" as const,
      criticality: "critical", // ≤15 days
      questions: [
        "¿Line-up de performance y tiempos de salida?",
        "¿Quién da el GO en cada cue (aperturas/Serpiente)?",
        "¿Brief a actores/bailarines listo y enviado?",
        "¿Relevos y suplentes definidos?",
        "¿Entrega: fotos/video de referencia para ensayo?",
      ],
    },
    {
      id: "actores-serpiente",
      title: "Actores + Serpiente",
      description:
        "¿Cuántos actores? ¿call times? ¿Serpiente lista 02:30? ¿show 03:00? ¿Máscara/props listos y custodiados post? ¿Ensayo 22:00 confirmado? ¿Plan B si falta alguien?",
      defaultAssignee: "PABLO",
      priority: "high" as const,
      criticality: "critical",
      questions: [
        "¿Cuántos actores? ¿call times?",
        "¿Serpiente lista 02:30? ¿show 03:00?",
        "¿Máscara/props listos y custodiados post?",
        "¿Ensayo 22:00 confirmado?",
        "¿Plan B si falta alguien?",
      ],
    },
    {
      id: "escenario-extra",
      title: "Escenario extra",
      description:
        "¿Medidas / altura / carga admitida? ¿Flete/armado/desarme y pasacalles incluidos? ¿Certificados (si requiere)? ¿Protecciones antideslizantes? ¿Layout aprobado con venue?",
      defaultAssignee: "FRANCO",
      priority: "high" as const,
      criticality: "important", // ≤14 days
      questions: [
        "¿Medidas / altura / carga admitida?",
        "¿Flete/armado/desarme y pasacalles incluidos?",
        "¿Certificados (si requiere)?",
        "¿Protecciones antideslizantes?",
        "¿Layout aprobado con venue?",
      ],
    },
    {
      id: "escenografia",
      title: "Escenografía",
      description:
        "¿Lista de piezas + renders aprobados? ¿Materiales ignífugos? ¿certificado? ¿Armadores y tiempos? ¿Depósito/retorno? Viático escenografía: ¿monto, a quién, cuándo?",
      defaultAssignee: "FRANCO",
      priority: "high" as const,
      criticality: "important",
      questions: [
        "¿Lista de piezas + renders aprobados?",
        "¿Materiales ignífugos? ¿certificado?",
        "¿Armadores y tiempos?",
        "¿Depósito/retorno?",
        "Viático escenografía: ¿monto, a quién, cuándo?",
      ],
    },
    {
      id: "vj",
      title: "VJ",
      description:
        "¿Material oficial (logos/tour) precargado? ¿Pixel map recibido y probado? ¿Frecuencia de branding definida? ¿Backup (segunda compu/media)? ¿Horario de prueba?",
      defaultAssignee: "FRANCO",
      priority: "high" as const,
      criticality: "important",
      questions: [
        "¿Material oficial (logos/tour) precargado?",
        "¿Pixel map recibido y probado?",
        "¿Frecuencia de branding definida?",
        "¿Backup (segunda compu/media)?",
        "¿Horario de prueba?",
      ],
    },
    {
      id: "fx",
      title: "FX",
      description:
        "¿Tipos: CO₂ / chispas frías / humo / confetti? ¿Permisos y zonas de seguridad? ¿Sincronía con Serpiente 03:00? ¿Matafuegos y responsable al lado? ¿Limpieza post incluida?",
      defaultAssignee: "PABLO",
      priority: "high" as const,
      criticality: "critical",
      questions: [
        "¿Tipos: CO₂ / chispas frías / humo / confetti?",
        "¿Permisos y zonas de seguridad?",
        "¿Sincronía con Serpiente 03:00?",
        "¿Matafuegos y responsable al lado?",
        "¿Limpieza post incluida?",
      ],
    },
    {
      id: "iluminador",
      title: "Iluminador",
      description:
        "¿Showfile + cues (warm-up, 00:30, 03:00, cierre)? ¿Consola/fixture list compatibles? ¿Focus previo / haze permitido? ¿Sincronía con VJ/FX? ¿Contacto del operador del venue?",
      defaultAssignee: "FRANCO",
      priority: "high" as const,
      criticality: "important",
      questions: [
        "¿Showfile + cues (warm-up, 00:30, 03:00, cierre)?",
        "¿Consola/fixture list compatibles?",
        "¿Focus previo / haze permitido?",
        "¿Sincronía con VJ/FX?",
        "¿Contacto del operador del venue?",
      ],
    },
  ],
  BOOKING: [
    {
      id: "dj",
      title: "DJ",
      description:
        "¿Confirmado, horario y set? ¿Rider (CDJ/Mixer/pendrive) OK? ¿Hospitality? ¿Caché / factura / pago? ¿Traslado/hospedaje si aplica?",
      defaultAssignee: "PABLO",
      priority: "high" as const,
      criticality: "critical",
      questions: [
        "¿Confirmado, horario y set?",
        "¿Rider (CDJ/Mixer/pendrive) OK?",
        "¿Hospitality?",
        "¿Caché / factura / pago?",
        "¿Traslado/hospedaje si aplica?",
      ],
    },
    {
      id: "armado-lista",
      title: "Armado de lista",
      description:
        "¿Responsable y deadline? ¿Cupos por categoría (VIP, invitados, influencers, hostel)? ¿Control de duplicados/anulados? ¿Formato (Google Sheet / CSV)? ¿Corte de actualización?",
      defaultAssignee: "PABLO",
      priority: "high" as const,
      criticality: "important",
      questions: [
        "¿Responsable y deadline?",
        "¿Cupos por categoría (VIP, invitados, influencers, hostel)?",
        "¿Control de duplicados/anulados?",
        "¿Formato (Google Sheet / CSV)?",
        "¿Corte de actualización?",
      ],
    },
    {
      id: "boletero",
      title: "Boletero",
      description:
        "¿Turnos / caja / pulseras? ¿Precios (general/VIP efectivo y MP) y upgrade? ¿Cierre de caja y arqueo? ¿Procedimientos de incidencias? ¿Owner y backup?",
      defaultAssignee: "PABLO",
      priority: "medium" as const,
      criticality: "important",
      questions: [
        "¿Turnos / caja / pulseras?",
        "¿Precios (general/VIP efectivo y MP) y upgrade?",
        "¿Cierre de caja y arqueo?",
        "¿Procedimientos de incidencias?",
        "¿Owner y backup?",
      ],
    },
    {
      id: "validadores-qr",
      title: "Validadores QR",
      description:
        "¿3 general / 2 VIP, datos/baterías OK? ¿Plan offline? ¿Listas: anticipadas/VIP/invitados/hostel? ¿Duplicados/anulados: procedimiento? ¿Soporte técnico?",
      defaultAssignee: "PABLO",
      priority: "medium" as const,
      criticality: "important",
      questions: [
        "¿3 general / 2 VIP, datos/baterías OK?",
        "¿Plan offline?",
        "¿Listas: anticipadas/VIP/invitados/hostel?",
        "¿Duplicados/anulados: procedimiento?",
        "¿Soporte técnico?",
      ],
    },
    {
      id: "seguridad",
      title: "Seguridad",
      description:
        "Brief (cacheo suave, baños inclusivos, VIP/camarín). Puntos fijos/recorridas. Jefe y contactos. Informe de incidentes. ¿Policía requerida?",
      defaultAssignee: "FRANCO",
      priority: "high" as const,
      criticality: "critical",
      questions: [
        "Brief (cacheo suave, baños inclusivos, VIP/camarín)",
        "Puntos fijos/recorridas",
        "Jefe y contactos",
        "Informe de incidentes",
        "¿Policía requerida?",
      ],
    },
    {
      id: "paramedicos",
      title: "Paramédicos",
      description:
        "¿Horas y dotación? ¿Equipamiento / camilla / DEA? ¿Ubicación del puesto? ¿Reporte a Producción? Ambulancia confirmada 00:00.",
      defaultAssignee: "PABLO",
      priority: "high" as const,
      criticality: "critical",
      questions: [
        "¿Horas y dotación?",
        "¿Equipamiento / camilla / DEA?",
        "¿Ubicación del puesto?",
        "¿Reporte a Producción?",
        "Ambulancia confirmada 00:00",
      ],
    },
  ],
  MARKETING: [
    {
      id: "creadora-contenido",
      title: "Creadora de contenido",
      description:
        "¿Brief y calendario? ¿Accesos en venue? ¿Entregables (reels/stories) y plazos? ¿Uso de imagen? ¿Pago?",
      defaultAssignee: "PABLO",
      priority: "medium" as const,
      criticality: "normal",
      questions: [
        "¿Brief y calendario?",
        "¿Accesos en venue?",
        "¿Entregables (reels/stories) y plazos?",
        "¿Uso de imagen?",
        "¿Pago?",
      ],
    },
    {
      id: "filmmaker",
      title: "Filmmaker",
      description:
        "¿Guion de highlights? ¿Audio de referencia? ¿Entrega teaser 24–48h? ¿Accesos VIP/cabina/camarín? ¿Pago?",
      defaultAssignee: "PABLO",
      priority: "medium" as const,
      criticality: "normal",
      questions: [
        "¿Guion de highlights?",
        "¿Audio de referencia?",
        "¿Entrega teaser 24–48h?",
        "¿Accesos VIP/cabina/camarín?",
        "¿Pago?",
      ],
    },
    {
      id: "fotografia",
      title: "Fotografía",
      description:
        "¿Shot list: aperturas, Serpiente, branding, VIP? ¿Entrega same night/24–48h? ¿Derechos/uso? ¿Coordinación con luces? ¿Pago?",
      defaultAssignee: "PABLO",
      priority: "medium" as const,
      criticality: "normal",
      questions: [
        "¿Shot list: aperturas, Serpiente, branding, VIP?",
        "¿Entrega same night/24–48h?",
        "¿Derechos/uso?",
        "¿Coordinación con luces?",
        "¿Pago?",
      ],
    },
    {
      id: "merch",
      title: "Merch",
      description:
        "¿Diseños aprobados? ¿Stock talles/colores? ¿LED para puesto merch: pedido? ¿POS/efectivo? ¿Cierre y recuento?",
      defaultAssignee: "PABLO",
      priority: "low" as const,
      criticality: "normal",
      questions: [
        "¿Diseños aprobados?",
        "¿Stock talles/colores?",
        "¿LED para puesto merch: pedido?",
        "¿POS/efectivo?",
        "¿Cierre y recuento?",
      ],
    },
  ],
}

// Función para determinar si un venue es internacional
function isInternationalVenue(venue: string): boolean {
  return INTERNATIONAL_VENUES.some((intlVenue) => venue.toLowerCase().includes(intlVenue.toLowerCase()))
}

// Función para determinar si un venue es de Argentina
function isArgentinaVenue(venue: string): boolean {
  return ARGENTINA_VENUES.some((argVenue) => venue.toLowerCase().includes(argVenue.toLowerCase()))
}

// Función para determinar si un evento requiere automatización
function requiresAutomation(venue: string): boolean {
  return isInternationalVenue(venue) || isArgentinaVenue(venue)
}

// Función para obtener el país basado en el venue
function getCountryFromVenue(venue: string): string {
  if (venue.toLowerCase().includes("montevideo")) return "🇺🇾 Uruguay"
  if (
    venue.toLowerCase().includes("cuenca") ||
    venue.toLowerCase().includes("quito") ||
    venue.toLowerCase().includes("guayaquil")
  )
    return "🇪🇨 Ecuador"
  if (venue.toLowerCase().includes("asunción")) return "🇵🇾 Paraguay"
  return "🇦🇷 Argentina"
}

// Función principal para procesar tareas automáticas
export function processAutomatedTasks(): void {
  const { events, tasks, addTask } = useUnifiedEventStore.getState()

  // Filtrar eventos que requieren automatización
  const eventsRequiringAutomation = events.filter((event) => {
    const eventDate = new Date(event.date)
    const isAfterAutomationDate = eventDate >= AUTOMATION_START_DATE
    const needsAutomation = requiresAutomation(event.venue)
    const isConfirmed = event.status === "confirmed"

    return isAfterAutomationDate && needsAutomation && isConfirmed
  })

  // Procesar cada evento
  eventsRequiringAutomation.forEach((event) => {
    const eventDate = new Date(event.date)
    const today = new Date()
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Solo crear tareas si faltan 60 días o menos
    if (daysUntilEvent <= 60 && daysUntilEvent > 0) {
      const isInternational = isInternationalVenue(event.venue)
      const country = getCountryFromVenue(event.venue)

      // Crear tareas automáticas según el tipo de venue
      AUTOMATED_TASK_TYPES.forEach((taskType) => {
        // Determinar si esta tarea aplica para este venue
        const shouldCreateTask = isInternational ? taskType.forInternational : taskType.forArgentina

        if (!shouldCreateTask) return

        // Verificar si ya existe una tarea de este tipo para este evento
        const existingTask = tasks.find(
          (task) => task.eventId === event.id && task.title === taskType.title && task.isAutomated,
        )

        if (existingTask) return // Ya existe, no duplicar

        // Calcular fecha de vencimiento
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + taskType.daysToComplete)

        // Crear la tarea automática
        const newTask = {
          id: `auto-task-${event.id}-${taskType.id}-${Date.now()}`,
          title: taskType.title,
          description: `${taskType.description}\n\nEvento: ${event.venue}\nPaís: ${country}\nFecha del evento: ${eventDate.toLocaleDateString("es-AR")}\nDías restantes: ${daysUntilEvent}`,
          status: "pending" as const,
          priority: taskType.priority,
          assignee: "Franco",
          dueDate: dueDate.toISOString().split("T")[0],
          eventId: event.id,
          category: taskType.category,
          isAutomated: true,
        }

        addTask(newTask)
      })
    }
  })
}

// Función para obtener tareas automáticas de un evento específico
export function getAutomatedTasksForEvent(eventId: string) {
  const { tasks } = useUnifiedEventStore.getState()
  return tasks.filter((task) => task.eventId === eventId && task.isAutomated)
}

// Función para generar tareas automáticas (alias para compatibilidad)
export function generateAutomatedTasks(): void {
  processAutomatedTasks()
}

export function injectStandardTasks(eventId: string): number {
  const { events, tasks, addTask } = useUnifiedEventStore.getState()

  const event = events.find((e) => e.id === eventId)
  if (!event) return 0

  const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
  let tasksCreated = 0

  // Inject tasks from all categories
  Object.entries(STANDARD_TASK_CATALOG).forEach(([category, categoryTasks]) => {
    categoryTasks.forEach((taskTemplate) => {
      // Check if task already exists
      const existingTask = tasks.find(
        (task) => task.eventId === eventId && task.title === taskTemplate.title && task.isAutomated,
      )

      if (existingTask) return

      const deadline = calculateDeadline(eventDate, taskTemplate.criticality)

      const newTask = {
        id: `auto-${eventId}-${taskTemplate.id}-${Date.now()}`,
        title: taskTemplate.title,
        description: taskTemplate.description,
        status: "pending" as const,
        priority: taskTemplate.priority,
        assignee: taskTemplate.defaultAssignee,
        dueDate: deadline.toISODate(),
        eventId: eventId,
        category: category,
        isAutomated: true,
        automatedTaskType: taskTemplate.id,
        questions: taskTemplate.questions,
        createdAt: DateTime.now().toISO(),
        updatedAt: DateTime.now().toISO(),
      }

      addTask(newTask)
      tasksCreated++
    })
  })

  return tasksCreated
}

function calculateDeadline(eventDate: DateTime, criticality: string): DateTime {
  switch (criticality) {
    case "critical":
      return eventDate.minus({ days: 15 })
    case "important":
      return eventDate.minus({ days: 14 })
    case "normal":
      return eventDate.minus({ days: 7 })
    default:
      return eventDate.minus({ days: 3 })
  }
}

export function checkTaskReminders(): Array<{ taskId: string; message: string; urgency: "low" | "medium" | "high" }> {
  const { tasks } = useUnifiedEventStore.getState()
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  const reminders: Array<{ taskId: string; message: string; urgency: "low" | "medium" | "high" }> = []

  tasks
    .filter((task) => task.isAutomated && task.status === "pending")
    .forEach((task) => {
      const dueDate = DateTime.fromISO(task.dueDate)
      const daysDiff = dueDate.diff(now, "days").days

      // Check if task needs reminder (every 48h without progress)
      const lastUpdate = DateTime.fromISO(task.updatedAt || task.createdAt || now.toISO())
      const hoursSinceUpdate = now.diff(lastUpdate, "hours").hours

      if (hoursSinceUpdate >= 48) {
        let urgency: "low" | "medium" | "high" = "low"
        let message = `Tarea sin progreso por ${Math.floor(hoursSinceUpdate)}h: ${task.title}`

        if (daysDiff <= 0) {
          urgency = "high"
          message = `🚨 VENCIDA: ${task.title} (${Math.abs(Math.floor(daysDiff))} días de retraso)`
        } else if (daysDiff <= 3) {
          urgency = "high"
          message = `⚠️ URGENTE: ${task.title} (vence en ${Math.floor(daysDiff)} días)`
        } else if (daysDiff <= 7) {
          urgency = "medium"
          message = `⏰ Próximo vencimiento: ${task.title} (${Math.floor(daysDiff)} días)`
        }

        reminders.push({
          taskId: task.id,
          message,
          urgency,
        })
      }
    })

  return reminders
}

export function getTasksByPriority(eventId?: string) {
  const { tasks } = useUnifiedEventStore.getState()

  const filteredTasks = eventId
    ? tasks.filter((task) => task.eventId === eventId && task.isAutomated)
    : tasks.filter((task) => task.isAutomated)

  return {
    critical: filteredTasks.filter((task) => task.priority === "high" && task.category === "ARTE"),
    important: filteredTasks.filter((task) => task.priority === "high" && task.category === "BOOKING"),
    normal: filteredTasks.filter((task) => task.priority === "medium"),
    low: filteredTasks.filter((task) => task.priority === "low"),
  }
}

export function getAutomatedTasksStats() {
  const { tasks, events } = useUnifiedEventStore.getState()
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

  const automatedTasks = tasks.filter((task) => task.isAutomated)
  const overdueTasks = automatedTasks.filter((task) => {
    if (task.status !== "pending") return false
    const dueDate = DateTime.fromISO(task.dueDate)
    return dueDate < now
  })

  const criticalTasks = automatedTasks.filter((task) => task.priority === "high" && task.status === "pending")

  return {
    totalAutomatedTasks: automatedTasks.length,
    pendingTasks: automatedTasks.filter((task) => task.status === "pending").length,
    completedTasks: automatedTasks.filter((task) => task.status === "completed").length,
    overdueTasks: overdueTasks.length,
    criticalPending: criticalTasks.length,
    slaCompliance:
      automatedTasks.length > 0
        ? Math.round(((automatedTasks.length - overdueTasks.length) / automatedTasks.length) * 100)
        : 100,
    pendingAutomatedTasks: automatedTasks.filter((task) => task.status === "pending").length,
    completedAutomatedTasks: automatedTasks.filter((task) => task.status === "completed").length,
    eventsWithAutomation: [...new Set(automatedTasks.map((task) => task.eventId))].length,
    upcomingEvents: events.filter((event) => {
      const eventDate = DateTime.fromISO(event.date)
      return eventDate > now && eventDate <= now.plus({ days: 30 })
    }).length,
  }
}

export function getUrgentAutomatedEvents() {
  const { events, tasks } = useUnifiedEventStore.getState()
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

  // Get events in the next 30 days that have automated tasks
  const upcomingEvents = events.filter((event) => {
    const eventDate = DateTime.fromISO(event.date)
    const daysUntilEvent = eventDate.diff(now, "days").days
    return daysUntilEvent > 0 && daysUntilEvent <= 30
  })

  // Filter events that have pending automated tasks
  const urgentEvents = upcomingEvents
    .map((event) => {
      const eventTasks = tasks.filter((task) => task.eventId === event.id && task.isAutomated)
      const pendingTasks = eventTasks.filter((task) => task.status === "pending")

      if (pendingTasks.length === 0) return null

      const eventDate = DateTime.fromISO(event.date)
      const daysUntilEvent = Math.ceil(eventDate.diff(now, "days").days)
      const country = getCountryFromVenue(event.venue)

      return {
        ...event,
        automatedTasks: eventTasks.length,
        pendingTasks: pendingTasks.length,
        daysUntilEvent,
        country,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a!.daysUntilEvent - b!.daysUntilEvent)

  return urgentEvents
}
