import { DateTime } from "luxon"

export interface AutomatedTask {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  dueDate: string
  estimatedHours: number
  assignee?: string
  dependencies?: string[]
  isAutomated: boolean
  eventId: string
  createdAt: string
  updatedAt: string
  type: "automated" | "manual"
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
  dependencies?: string[]
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

// Standard task templates organized by category
const TASK_TEMPLATES: TaskTemplate[] = [
  // Venue Management
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
    id: "venue-visit",
    title: "Visita técnica al venue",
    description: "Realizar visita técnica para evaluar instalaciones y requerimientos",
    category: "Venue Management",
    priority: "medium",
    daysBeforeEvent: 45,
    estimatedHours: 3,
    dependencies: ["venue-booking"],
    tags: ["venue", "technical"],
  },
  {
    id: "venue-contract",
    title: "Firmar contrato del venue",
    description: "Revisar y firmar el contrato de alquiler del venue",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 50,
    estimatedHours: 1,
    dependencies: ["venue-booking"],
    tags: ["venue", "contract"],
  },

  // Technical Production
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

  // Catering & Logistics
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
    dependencies: ["catering-menu"],
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

  // Security & Safety
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

  // Marketing & Promotion
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
    dependencies: ["marketing-strategy"],
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

  // Financial Management
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

  // Artistic Direction
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
    dependencies: ["artistic-concept"],
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
    dependencies: ["performer-booking"],
    tags: ["rehearsal", "schedule"],
  },

  // International Support
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

  // Check if venue location suggests international event
  const venue = event.venue
  if (venue && typeof venue === "object" && venue.location) {
    const location = venue.location.toLowerCase()
    // Check for international indicators
    if (
      location.includes("international") ||
      location.includes("embassy") ||
      location.includes("consulate") ||
      location.includes("airport")
    ) {
      return true
    }
  }

  // Check event title/description for international keywords
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
  ]

  return internationalKeywords.some((keyword) => title.includes(keyword) || description.includes(keyword))
}

// Generate automated tasks based on event parameters
export function generateAutomatedTasks(event: any): AutomatedTask[] {
  if (!event || !event.date) {
    return []
  }

  const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  const isInternational = isInternationalEvent(event)
  const attendees = event.attendees || 0
  const eventType = event.type?.toLowerCase() || "general"

  const applicableTasks = TASK_TEMPLATES.filter((template) => {
    // Check conditions
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
      dependencies: template.dependencies,
      isAutomated: true,
      eventId: event.id,
      createdAt: now.toISO() || "",
      updatedAt: now.toISO() || "",
      type: "automated" as const,
      tags: template.tags,
    }
  })
}

// Get task statistics
export function getAutomatedTasksStats(tasks: AutomatedTask[]): TaskStats {
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
    const dueDate = DateTime.fromISO(task.dueDate)
    if (task.status !== "completed" && dueDate < now) {
      stats.overdue++
    }

    // Count by category
    stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1

    // Count by priority
    stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
  })

  return stats
}

// Process automated tasks (placeholder function)
export function processAutomatedTasks(eventId: string): void {
  console.log(`Processing automated tasks for event: ${eventId}`)
  // This function can be expanded to handle automated task processing
  // For now, it's a placeholder to prevent import errors
}

// Filter tasks by various criteria
export function filterTasks(
  tasks: AutomatedTask[],
  filters: {
    status?: string
    priority?: string
    category?: string
    search?: string
    assignee?: string
    type?: string
  },
): AutomatedTask[] {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.category && task.category !== filters.category) return false
    if (filters.assignee && task.assignee !== filters.assignee) return false
    if (filters.type && task.type !== filters.type) return false

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const searchableText = `${task.title} ${task.description} ${task.category}`.toLowerCase()
      if (!searchableText.includes(searchLower)) return false
    }

    return true
  })
}

// Get tasks by category
export function getTasksByCategory(tasks: AutomatedTask[]): Record<string, AutomatedTask[]> {
  return tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = []
      }
      acc[task.category].push(task)
      return acc
    },
    {} as Record<string, AutomatedTask[]>,
  )
}

// Get overdue tasks
export function getOverdueTasks(tasks: AutomatedTask[]): AutomatedTask[] {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

  return tasks.filter((task) => {
    if (task.status === "completed") return false
    const dueDate = DateTime.fromISO(task.dueDate)
    return dueDate < now
  })
}

// Get upcoming tasks (due within next 7 days)
export function getUpcomingTasks(tasks: AutomatedTask[], days = 7): AutomatedTask[] {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  const futureDate = now.plus({ days })

  return tasks.filter((task) => {
    if (task.status === "completed") return false
    const dueDate = DateTime.fromISO(task.dueDate)
    return dueDate >= now && dueDate <= futureDate
  })
}
