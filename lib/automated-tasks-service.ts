import { DateTime } from "luxon"

// Types
export interface AutomatedTask {
  id: string
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  assignee: string
  dueDate: string
  estimatedHours: number
  isAutomated: boolean
  eventId: string
  createdAt: string
  updatedAt: string
  questions?: string[]
  requiresInternational?: boolean
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low"
  assignee: string
  daysBeforeEvent: number
  estimatedHours: number
  questions?: string[]
  requiresInternational?: boolean
}

export interface TaskStats {
  totalAutomatedTasks: number
  completedAutomatedTasks: number
  pendingAutomatedTasks: number
  upcomingEvents: number
}

// Standard Task Templates
export const STANDARD_TASK_TEMPLATES: TaskTemplate[] = [
  // Venue Management
  {
    id: "venue-booking",
    title: "Confirmar reserva del venue",
    description: "Verificar disponibilidad y confirmar la reserva del venue para la fecha del evento",
    category: "Venue Management",
    priority: "high",
    assignee: "Coordinador de Venue",
    daysBeforeEvent: 30,
    estimatedHours: 2,
    questions: ["¿El venue está disponible?", "¿Se firmó el contrato?", "¿Se pagó el depósito?"],
  },
  {
    id: "venue-setup",
    title: "Coordinar montaje del venue",
    description: "Planificar y coordinar el setup del venue incluyendo decoración y equipamiento",
    category: "Venue Management",
    priority: "high",
    assignee: "Coordinador de Venue",
    daysBeforeEvent: 7,
    estimatedHours: 4,
    questions: ["¿Está definido el layout?", "¿Se coordinó el acceso?", "¿Están los permisos listos?"],
  },
  {
    id: "venue-cleanup",
    title: "Organizar limpieza post-evento",
    description: "Coordinar la limpieza y desmontaje del venue después del evento",
    category: "Venue Management",
    priority: "medium",
    assignee: "Coordinador de Venue",
    daysBeforeEvent: -1,
    estimatedHours: 3,
  },

  // Technical Production
  {
    id: "sound-setup",
    title: "Configurar sistema de sonido",
    description: "Instalar y probar el sistema de sonido para el evento",
    category: "Technical Production",
    priority: "high",
    assignee: "Técnico de Sonido",
    daysBeforeEvent: 1,
    estimatedHours: 4,
    questions: ["¿Se probó el sistema?", "¿Hay backup disponible?", "¿Se hizo soundcheck?"],
  },
  {
    id: "lighting-setup",
    title: "Configurar iluminación",
    description: "Instalar y programar el sistema de iluminación del evento",
    category: "Technical Production",
    priority: "high",
    assignee: "Técnico de Luces",
    daysBeforeEvent: 1,
    estimatedHours: 3,
    questions: ["¿Está programada la secuencia?", "¿Se probaron todos los efectos?"],
  },
  {
    id: "equipment-check",
    title: "Verificar equipamiento técnico",
    description: "Revisar y probar todo el equipamiento técnico necesario",
    category: "Technical Production",
    priority: "medium",
    assignee: "Técnico General",
    daysBeforeEvent: 2,
    estimatedHours: 2,
  },

  // Catering & Logistics
  {
    id: "catering-menu",
    title: "Finalizar menú de catering",
    description: "Confirmar el menú final con el proveedor de catering",
    category: "Catering & Logistics",
    priority: "medium",
    assignee: "Coordinador de Catering",
    daysBeforeEvent: 14,
    estimatedHours: 2,
    questions: ["¿Se confirmaron las restricciones alimentarias?", "¿Está definida la cantidad?"],
  },
  {
    id: "transportation",
    title: "Coordinar transporte",
    description: "Organizar el transporte para artistas y equipo técnico",
    category: "Catering & Logistics",
    priority: "medium",
    assignee: "Coordinador de Logística",
    daysBeforeEvent: 7,
    estimatedHours: 3,
  },
  {
    id: "accommodation",
    title: "Confirmar alojamiento",
    description: "Verificar reservas de hotel para artistas y equipo",
    category: "Catering & Logistics",
    priority: "medium",
    assignee: "Coordinador de Logística",
    daysBeforeEvent: 14,
    estimatedHours: 1,
  },

  // Security & Safety
  {
    id: "security-plan",
    title: "Desarrollar plan de seguridad",
    description: "Crear y revisar el plan de seguridad del evento",
    category: "Security & Safety",
    priority: "high",
    assignee: "Jefe de Seguridad",
    daysBeforeEvent: 21,
    estimatedHours: 4,
    questions: ["¿Se identificaron los riesgos?", "¿Está el personal capacitado?"],
  },
  {
    id: "emergency-procedures",
    title: "Establecer procedimientos de emergencia",
    description: "Definir y comunicar los procedimientos de emergencia",
    category: "Security & Safety",
    priority: "high",
    assignee: "Jefe de Seguridad",
    daysBeforeEvent: 14,
    estimatedHours: 2,
  },

  // Marketing & Promotion
  {
    id: "social-media",
    title: "Campaña en redes sociales",
    description: "Ejecutar la campaña de marketing en redes sociales",
    category: "Marketing & Promotion",
    priority: "medium",
    assignee: "Community Manager",
    daysBeforeEvent: 30,
    estimatedHours: 10,
  },
  {
    id: "press-release",
    title: "Enviar comunicado de prensa",
    description: "Redactar y enviar comunicado de prensa a medios",
    category: "Marketing & Promotion",
    priority: "medium",
    assignee: "Responsable de Prensa",
    daysBeforeEvent: 21,
    estimatedHours: 3,
  },

  // Financial Management
  {
    id: "budget-review",
    title: "Revisar presupuesto final",
    description: "Hacer la revisión final del presupuesto del evento",
    category: "Financial Management",
    priority: "high",
    assignee: "Administrador",
    daysBeforeEvent: 7,
    estimatedHours: 2,
  },
  {
    id: "payment-processing",
    title: "Procesar pagos pendientes",
    description: "Gestionar todos los pagos pendientes a proveedores",
    category: "Financial Management",
    priority: "high",
    assignee: "Administrador",
    daysBeforeEvent: 3,
    estimatedHours: 3,
  },

  // Artistic Direction
  {
    id: "rehearsal-schedule",
    title: "Programar ensayos",
    description: "Coordinar horarios de ensayo con todos los artistas",
    category: "Artistic Direction",
    priority: "high",
    assignee: "Director Artístico",
    daysBeforeEvent: 14,
    estimatedHours: 2,
  },
  {
    id: "artist-coordination",
    title: "Coordinar con artistas",
    description: "Mantener comunicación constante con todos los artistas",
    category: "Artistic Direction",
    priority: "medium",
    assignee: "Director Artístico",
    daysBeforeEvent: 7,
    estimatedHours: 4,
  },

  // International Support
  {
    id: "visa-processing",
    title: "Gestionar visas de artistas",
    description: "Procesar y obtener visas necesarias para artistas internacionales",
    category: "International Support",
    priority: "high",
    assignee: "Coordinador Internacional",
    daysBeforeEvent: 60,
    estimatedHours: 8,
    requiresInternational: true,
    questions: ["¿Se enviaron los documentos?", "¿Se pagaron las tasas?", "¿Hay seguimiento del proceso?"],
  },
  {
    id: "customs-documentation",
    title: "Preparar documentación aduanera",
    description: "Preparar toda la documentación necesaria para equipos internacionales",
    category: "International Support",
    priority: "high",
    assignee: "Coordinador Internacional",
    daysBeforeEvent: 30,
    estimatedHours: 4,
    requiresInternational: true,
  },
  {
    id: "international-coordination",
    title: "Coordinar logística internacional",
    description: "Gestionar todos los aspectos logísticos para elementos internacionales",
    category: "International Support",
    priority: "medium",
    assignee: "Coordinador Internacional",
    daysBeforeEvent: 21,
    estimatedHours: 6,
    requiresInternational: true,
  },
]

// Utility Functions
export function calculateDaysUntilEvent(eventDate: string): number {
  const event = DateTime.fromISO(eventDate).setZone("America/Argentina/Buenos_Aires")
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  return Math.ceil(event.diff(now, "days").days)
}

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

export function generateAutomatedTasks(event: any): AutomatedTask[] {
  const tasks: AutomatedTask[] = []
  const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  const isInternational = requiresCustoms(event.venue || "")

  // Filter templates based on event requirements
  const applicableTemplates = STANDARD_TASK_TEMPLATES.filter((template) => {
    if (template.requiresInternational && !isInternational) {
      return false
    }
    return true
  })

  // Generate tasks from templates
  applicableTemplates.forEach((template, index) => {
    const dueDate = eventDate.minus({ days: template.daysBeforeEvent })

    const task: AutomatedTask = {
      id: `auto-${event.id}-${template.id}-${index}`,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      status: "pending",
      assignee: template.assignee,
      dueDate: dueDate.toISO()!,
      estimatedHours: template.estimatedHours,
      isAutomated: true,
      eventId: event.id,
      createdAt: now.toISO()!,
      updatedAt: now.toISO()!,
      questions: template.questions,
      requiresInternational: template.requiresInternational,
    }

    tasks.push(task)
  })

  return tasks
}

export function getAutomatedTasksStats(tasks: any[], events?: any[]): TaskStats {
  const automatedTasks = tasks.filter((task) => task.isAutomated)

  const stats: TaskStats = {
    totalAutomatedTasks: automatedTasks.length,
    completedAutomatedTasks: automatedTasks.filter((task) => task.status === "completed").length,
    pendingAutomatedTasks: automatedTasks.filter((task) => task.status === "pending").length,
    upcomingEvents: 0,
  }

  if (events) {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    stats.upcomingEvents = events.filter((event) => {
      const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
      return eventDate > now && eventDate <= now.plus({ days: 30 })
    }).length
  }

  return stats
}

export function getUrgentAutomatedEvents(events: any[], tasks: any[]): any[] {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

  return events
    .filter((event) => {
      const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
      const daysUntilEvent = eventDate.diff(now, "days").days
      return daysUntilEvent > 0 && daysUntilEvent <= 30
    })
    .map((event) => {
      const eventTasks = tasks.filter((task) => task.eventId === event.id && task.isAutomated)
      const pendingTasks = eventTasks.filter((task) => task.status === "pending").length
      const daysUntilEvent = Math.ceil(DateTime.fromISO(event.date).diff(now, "days").days)

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
}

// Process automated tasks - this is the missing function
export function processAutomatedTasks(): void {
  // This function would typically interact with the store
  // For now, it's a placeholder that can be called without errors
  console.log("Processing automated tasks...")

  // In a real implementation, this would:
  // 1. Get all events from the store
  // 2. Check which events need automated tasks
  // 3. Generate tasks for events that don't have them yet
  // 4. Update overdue tasks
  // 5. Send notifications for urgent tasks

  // Since we can't access the store directly from here,
  // this function serves as a placeholder for the import
}

// Additional utility functions for task management
export function filterTasks(
  tasks: any[],
  filters: {
    status?: string
    priority?: string
    category?: string
    assignee?: string
    eventId?: string
    isAutomated?: boolean
    search?: string
  },
): any[] {
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.category && task.category !== filters.category) return false
    if (filters.assignee && task.assignee !== filters.assignee) return false
    if (filters.eventId && task.eventId !== filters.eventId) return false
    if (filters.isAutomated !== undefined && task.isAutomated !== filters.isAutomated) return false

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(searchLower)
      const matchesDescription = task.description.toLowerCase().includes(searchLower)
      const matchesCategory = task.category.toLowerCase().includes(searchLower)

      if (!matchesTitle && !matchesDescription && !matchesCategory) return false
    }

    return true
  })
}

export function getTasksByCategory(tasks: any[]): Record<string, any[]> {
  const tasksByCategory: Record<string, any[]> = {}

  tasks.forEach((task) => {
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = []
    }
    tasksByCategory[task.category].push(task)
  })

  return tasksByCategory
}

export function getOverdueTasks(tasks: any[]): any[] {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

  return tasks.filter((task) => {
    if (task.status === "completed" || !task.dueDate) return false
    const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
    return dueDate < now
  })
}

export function getUpcomingTasks(tasks: any[], days = 7): any[] {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  const futureDate = now.plus({ days })

  return tasks.filter((task) => {
    if (task.status === "completed" || !task.dueDate) return false
    const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
    return dueDate >= now && dueDate <= futureDate
  })
}
