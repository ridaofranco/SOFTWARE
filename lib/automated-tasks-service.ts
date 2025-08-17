import { DateTime } from "luxon"

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: string
  dueDate: string
  category: string
  eventId?: string
  isAutomated?: boolean
  createdAt: string
  updatedAt: string
  estimatedHours?: number
  tags?: string[]
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  daysBeforeEvent: number
  estimatedHours: number
  conditions?: {
    minAttendees?: number
    maxAttendees?: number
    eventTypes?: string[]
    international?: boolean
    venueRequired?: boolean
  }
  tags?: string[]
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  overdue: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

// Standard task templates
const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "venue-booking",
    title: "Confirmar reserva del venue",
    description: "Confirmar la disponibilidad y reserva del venue para la fecha del evento",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 2,
    conditions: { venueRequired: true },
    tags: ["venue", "booking"],
  },
  {
    id: "venue-setup",
    title: "Coordinar montaje del venue",
    description: "Planificar y coordinar el setup del venue incluyendo decoración y equipamiento",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 7,
    estimatedHours: 4,
    tags: ["venue", "setup"],
  },
  {
    id: "venue-cleanup",
    title: "Organizar limpieza post-evento",
    description: "Coordinar la limpieza y desmontaje del venue después del evento",
    category: "Venue Management",
    priority: "medium",
    daysBeforeEvent: -1,
    estimatedHours: 3,
    tags: ["venue", "cleanup"],
  },
  {
    id: "sound-equipment",
    title: "Contratar equipo de sonido",
    description: "Coordinar el alquiler y setup del equipo de sonido profesional",
    category: "Technical Production",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 4,
    conditions: { minAttendees: 50 },
    tags: ["audio", "equipment"],
  },
  {
    id: "lighting-setup",
    title: "Diseño de iluminación",
    description: "Planificar y coordinar el setup de iluminación del evento",
    category: "Technical Production",
    priority: "medium",
    daysBeforeEvent: 25,
    estimatedHours: 3,
    tags: ["lighting", "design"],
  },
  {
    id: "av-equipment",
    title: "Equipo audiovisual",
    description: "Coordinar proyectores, pantallas y equipo AV necesario",
    category: "Technical Production",
    priority: "medium",
    daysBeforeEvent: 20,
    estimatedHours: 2,
    tags: ["av", "equipment"],
  },
  {
    id: "catering-menu",
    title: "Definir menú de catering",
    description: "Seleccionar y confirmar el menú con el proveedor de catering",
    category: "Catering & Logistics",
    priority: "medium",
    daysBeforeEvent: 21,
    estimatedHours: 2,
    conditions: { minAttendees: 20 },
    tags: ["catering", "menu"],
  },
  {
    id: "catering-contract",
    title: "Contrato de catering",
    description: "Firmar contrato con proveedor de catering seleccionado",
    category: "Catering & Logistics",
    priority: "high",
    daysBeforeEvent: 14,
    estimatedHours: 1,
    tags: ["catering", "contract"],
  },
  {
    id: "transportation",
    title: "Coordinar transporte",
    description: "Organizar transporte para participantes si es necesario",
    category: "Catering & Logistics",
    priority: "low",
    daysBeforeEvent: 10,
    estimatedHours: 2,
    conditions: { minAttendees: 100 },
    tags: ["transport", "logistics"],
  },
  {
    id: "security-plan",
    title: "Plan de seguridad",
    description: "Desarrollar plan de seguridad y evacuación para el evento",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 3,
    conditions: { minAttendees: 100 },
    tags: ["security", "safety"],
  },
  {
    id: "insurance",
    title: "Seguro del evento",
    description: "Contratar seguro de responsabilidad civil para el evento",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 45,
    estimatedHours: 1,
    tags: ["insurance", "legal"],
  },
  {
    id: "permits",
    title: "Permisos municipales",
    description: "Obtener todos los permisos necesarios de las autoridades locales",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 4,
    tags: ["permits", "legal"],
  },
  {
    id: "marketing-strategy",
    title: "Estrategia de marketing",
    description: "Desarrollar estrategia de promoción y marketing del evento",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 90,
    estimatedHours: 4,
    tags: ["marketing", "strategy"],
  },
  {
    id: "social-media",
    title: "Campaña en redes sociales",
    description: "Lanzar campaña promocional en redes sociales",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 30,
    estimatedHours: 6,
    tags: ["social-media", "promotion"],
  },
  {
    id: "press-release",
    title: "Comunicado de prensa",
    description: "Preparar y enviar comunicado de prensa a medios locales",
    category: "Marketing & Promotion",
    priority: "low",
    daysBeforeEvent: 21,
    estimatedHours: 2,
    tags: ["press", "media"],
  },
  {
    id: "budget-approval",
    title: "Aprobación de presupuesto",
    description: "Obtener aprobación final del presupuesto del evento",
    category: "Financial Management",
    priority: "high",
    daysBeforeEvent: 75,
    estimatedHours: 2,
    tags: ["budget", "approval"],
  },
  {
    id: "vendor-payments",
    title: "Cronograma de pagos",
    description: "Establecer cronograma de pagos con todos los proveedores",
    category: "Financial Management",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 3,
    tags: ["payments", "vendors"],
  },
  {
    id: "financial-tracking",
    title: "Seguimiento financiero",
    description: "Implementar sistema de seguimiento de gastos en tiempo real",
    category: "Financial Management",
    priority: "medium",
    daysBeforeEvent: 60,
    estimatedHours: 2,
    tags: ["tracking", "finance"],
  },
  {
    id: "artistic-concept",
    title: "Concepto artístico",
    description: "Definir concepto artístico y temática del evento",
    category: "Artistic Direction",
    priority: "medium",
    daysBeforeEvent: 90,
    estimatedHours: 4,
    conditions: { eventTypes: ["cultural", "artistic", "entertainment"] },
    tags: ["artistic", "concept"],
  },
  {
    id: "performer-booking",
    title: "Contratación de artistas",
    description: "Seleccionar y contratar artistas o performers principales",
    category: "Artistic Direction",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 6,
    conditions: { eventTypes: ["cultural", "artistic", "entertainment"] },
    tags: ["performers", "booking"],
  },
  {
    id: "rehearsal-schedule",
    title: "Cronograma de ensayos",
    description: "Organizar cronograma de ensayos y pruebas técnicas",
    category: "Artistic Direction",
    priority: "medium",
    daysBeforeEvent: 14,
    estimatedHours: 3,
    conditions: { eventTypes: ["cultural", "artistic", "entertainment"] },
    tags: ["rehearsal", "schedule"],
  },
  {
    id: "visa-requirements",
    title: "Requisitos de visa",
    description: "Verificar y asistir con requisitos de visa para participantes internacionales",
    category: "International Support",
    priority: "high",
    daysBeforeEvent: 90,
    estimatedHours: 4,
    conditions: { international: true },
    tags: ["visa", "international"],
  },
  {
    id: "customs-documentation",
    title: "Documentación aduanera",
    description: "Preparar documentación necesaria para equipos internacionales",
    category: "International Support",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 3,
    conditions: { international: true },
    tags: ["customs", "documentation"],
  },
  {
    id: "translation-services",
    title: "Servicios de traducción",
    description: "Coordinar servicios de traducción e interpretación",
    category: "International Support",
    priority: "medium",
    daysBeforeEvent: 30,
    estimatedHours: 2,
    conditions: { international: true },
    tags: ["translation", "interpretation"],
  },
  {
    id: "accommodation-international",
    title: "Alojamiento internacional",
    description: "Coordinar alojamiento para participantes internacionales",
    category: "International Support",
    priority: "medium",
    daysBeforeEvent: 45,
    estimatedHours: 3,
    conditions: { international: true, minAttendees: 10 },
    tags: ["accommodation", "international"],
  },
]

// Helper function to check if an event is international
function isInternationalEvent(event: any): boolean {
  if (!event) return false

  const venue = event.venue || ""
  const title = event.title?.toLowerCase() || ""
  const description = event.description?.toLowerCase() || ""

  const internationalKeywords = [
    "international",
    "mundial",
    "global",
    "embassy",
    "consulate",
    "foreign",
    "overseas",
    "cross-border",
    "multinational",
    "usa",
    "europe",
    "uk",
    "spain",
    "france",
    "germany",
    "italy",
    "brazil",
    "chile",
    "colombia",
    "mexico",
    "miami",
    "new york",
    "london",
    "madrid",
    "barcelona",
    "paris",
    "berlin",
    "rome",
    "são paulo",
    "santiago",
    "bogotá",
    "mexico city",
  ]

  return internationalKeywords.some(
    (keyword) => venue.toLowerCase().includes(keyword) || title.includes(keyword) || description.includes(keyword),
  )
}

// Calculate days until event - MISSING EXPORT ADDED
export function calculateDaysUntilEvent(eventDate: string): number {
  try {
    const event = DateTime.fromISO(eventDate).setZone("America/Argentina/Buenos_Aires")
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    return Math.ceil(event.diff(now, "days").days)
  } catch (error) {
    console.error("Error calculating days until event:", error)
    return 0
  }
}

// Check if event requires customs handling
export function requiresCustoms(venue: string): boolean {
  if (!venue) return false

  const internationalKeywords = [
    "usa",
    "europe",
    "uk",
    "spain",
    "france",
    "germany",
    "italy",
    "brazil",
    "chile",
    "colombia",
    "mexico",
    "miami",
    "new york",
    "london",
    "madrid",
    "barcelona",
    "paris",
    "berlin",
    "rome",
    "são paulo",
    "santiago",
    "bogotá",
    "mexico city",
    "international",
    "world",
    "global",
  ]

  return internationalKeywords.some((keyword) => venue.toLowerCase().includes(keyword))
}

// Get country from venue name
export function getCountryFromVenue(venue: string): string {
  if (!venue) return "Argentina"

  const countryMap: Record<string, string> = {
    usa: "Estados Unidos",
    miami: "Estados Unidos",
    "new york": "Estados Unidos",
    europe: "Europa",
    uk: "Reino Unido",
    london: "Reino Unido",
    spain: "España",
    madrid: "España",
    barcelona: "España",
    france: "Francia",
    paris: "Francia",
    germany: "Alemania",
    berlin: "Alemania",
    italy: "Italia",
    rome: "Italia",
    brazil: "Brasil",
    "são paulo": "Brasil",
    chile: "Chile",
    santiago: "Chile",
    colombia: "Colombia",
    bogotá: "Colombia",
    mexico: "México",
    "mexico city": "México",
  }

  const venueLower = venue.toLowerCase()
  for (const [keyword, country] of Object.entries(countryMap)) {
    if (venueLower.includes(keyword)) {
      return country
    }
  }

  return "Argentina"
}

// Generate automated tasks based on event parameters
export function generateAutomatedTasks(event: any): Task[] {
  if (!event || !event.date) {
    return []
  }

  try {
    const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    const isInternational = isInternationalEvent(event)
    const attendees = event.attendees || 0
    const eventType = event.type?.toLowerCase() || "general"

    const applicableTasks = TASK_TEMPLATES.filter((template) => {
      if (template.conditions) {
        const conditions = template.conditions

        if (conditions.minAttendees && attendees < conditions.minAttendees) return false
        if (conditions.maxAttendees && attendees > conditions.maxAttendees) return false
        if (conditions.international && !isInternational) return false
        if (conditions.venueRequired && !event.venue) return false
        if (conditions.eventTypes && !conditions.eventTypes.includes(eventType)) return false
      }

      return true
    })

    return applicableTasks.map((template) => {
      const dueDate = eventDate.minus({ days: template.daysBeforeEvent })
      const taskId = `${event.id}-${template.id}-${Date.now()}`

      return {
        id: taskId,
        title: template.title,
        description: template.description,
        category: template.category,
        priority: template.priority,
        status: "pending" as const,
        dueDate: dueDate.toISO() || "",
        estimatedHours: template.estimatedHours,
        isAutomated: true,
        eventId: event.id,
        createdAt: now.toISO() || "",
        updatedAt: now.toISO() || "",
        tags: template.tags,
      }
    })
  } catch (error) {
    console.error("Error generating automated tasks:", error)
    return []
  }
}

// Get task statistics
export function getAutomatedTasksStats(tasks: Task[]): TaskStats {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

    const stats: TaskStats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      byCategory: {},
      byPriority: {},
    }

    tasks.forEach((task) => {
      // Count by status
      if (task.status === "completed") stats.completed++
      else if (task.status === "in-progress") stats.inProgress++
      else if (task.status === "pending") stats.pending++

      // Check if overdue
      try {
        const dueDate = DateTime.fromISO(task.dueDate)
        if (task.status !== "completed" && dueDate < now) {
          stats.overdue++
        }
      } catch (error) {
        console.error("Error parsing due date:", error)
      }

      // Count by category
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1

      // Count by priority
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error("Error calculating stats:", error)
    return {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      byCategory: {},
      byPriority: {},
    }
  }
}

// Process automated tasks (placeholder function)
export function processAutomatedTasks(): void {
  console.log("Processing automated tasks...")
  // This function can be expanded to handle automated task processing
}

// Filter tasks by various criteria
export function filterTasks(
  tasks: Task[],
  filters: {
    status?: string
    priority?: string
    category?: string
    search?: string
    assignee?: string
    type?: string
  },
): Task[] {
  try {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.category && task.category !== filters.category) return false
      if (filters.assignee && task.assignee !== filters.assignee) return false

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const searchableText = `${task.title} ${task.description} ${task.category}`.toLowerCase()
        if (!searchableText.includes(searchLower)) return false
      }

      return true
    })
  } catch (error) {
    console.error("Error filtering tasks:", error)
    return []
  }
}

// Get tasks by category
export function getTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  try {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = []
        }
        acc[task.category].push(task)
        return acc
      },
      {} as Record<string, Task[]>,
    )
  } catch (error) {
    console.error("Error grouping tasks by category:", error)
    return {}
  }
}

// Get overdue tasks
export function getOverdueTasks(tasks: Task[]): Task[] {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

    return tasks.filter((task) => {
      if (task.status === "completed") return false
      try {
        const dueDate = DateTime.fromISO(task.dueDate)
        return dueDate < now
      } catch (error) {
        console.error("Error parsing due date:", error)
        return false
      }
    })
  } catch (error) {
    console.error("Error getting overdue tasks:", error)
    return []
  }
}

// Get upcoming tasks (due within next 7 days)
export function getUpcomingTasks(tasks: Task[], days = 7): Task[] {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    const futureDate = now.plus({ days })

    return tasks.filter((task) => {
      if (task.status === "completed") return false
      try {
        const dueDate = DateTime.fromISO(task.dueDate)
        return dueDate >= now && dueDate <= futureDate
      } catch (error) {
        console.error("Error parsing due date:", error)
        return false
      }
    })
  } catch (error) {
    console.error("Error getting upcoming tasks:", error)
    return []
  }
}

// Get urgent automated events that need attention
export function getUrgentAutomatedEvents(events: any[], tasks: Task[]): any[] {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

    return events
      .filter((event) => {
        try {
          const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
          const daysUntilEvent = eventDate.diff(now, "days").days
          return daysUntilEvent > 0 && daysUntilEvent <= 30
        } catch (error) {
          console.error("Error parsing event date:", error)
          return false
        }
      })
      .map((event) => {
        const eventTasks = tasks.filter((task) => task.eventId === event.id && task.isAutomated)
        const pendingTasks = eventTasks.filter((task) => task.status === "pending").length
        const daysUntilEvent = calculateDaysUntilEvent(event.date)

        return {
          id: event.id,
          venue: event.venue,
          country: getCountryFromVenue(event.venue || ""),
          daysUntilEvent,
          pendingTasks,
          requiresAttention: pendingTasks > 0 && daysUntilEvent <= 14,
        }
      })
      .filter((event) => event.requiresAttention)
      .sort((a, b) => a.daysUntilEvent - b.daysUntilEvent)
  } catch (error) {
    console.error("Error getting urgent automated events:", error)
    return []
  }
}
