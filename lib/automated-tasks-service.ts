import { useUnifiedEventStore } from "@/store/unified-event-store"

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

// Función para obtener estadísticas de tareas automáticas
export function getAutomatedTasksStats() {
  const { tasks, events } = useUnifiedEventStore.getState()

  const automatedTasks = tasks.filter((task) => task.isAutomated)
  const eventsWithAutomatedTasks = events.filter((event) => automatedTasks.some((task) => task.eventId === event.id))

  return {
    totalAutomatedTasks: automatedTasks.length,
    pendingAutomatedTasks: automatedTasks.filter((task) => task.status === "pending").length,
    completedAutomatedTasks: automatedTasks.filter((task) => task.status === "completed").length,
    eventsWithAutomation: eventsWithAutomatedTasks.length,
    upcomingEvents: eventsWithAutomatedTasks.filter((event) => {
      const eventDate = new Date(event.date)
      const today = new Date()
      return eventDate > today
    }).length,
  }
}

// Función para obtener eventos que requieren atención urgente
export function getUrgentAutomatedEvents() {
  const { events, tasks } = useUnifiedEventStore.getState()

  return events
    .filter((event) => {
      const eventDate = new Date(event.date)
      const today = new Date()
      const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Eventos en los próximos 30 días que requieren automatización
      return (
        daysUntilEvent <= 30 && daysUntilEvent > 0 && requiresAutomation(event.venue) && event.status === "confirmed"
      )
    })
    .map((event) => {
      const eventTasks = tasks.filter((task) => task.eventId === event.id && task.isAutomated)
      const pendingTasks = eventTasks.filter((task) => task.status === "pending")

      return {
        ...event,
        automatedTasks: eventTasks.length,
        pendingTasks: pendingTasks.length,
        country: getCountryFromVenue(event.venue),
        daysUntilEvent: Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      }
    })
    .sort((a, b) => a.daysUntilEvent - b.daysUntilEvent)
}
