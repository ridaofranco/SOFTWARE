import { DateTime } from "luxon"

export interface AutomatedTask {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string
  status: "pending" | "in-progress" | "completed"
  assignee?: string
  eventId: string
  createdAt: string
  updatedAt: string
  type: "automated" | "manual"
  estimatedHours?: number
  dependencies?: string[]
}

export interface TaskTemplate {
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  daysBeforeEvent: number
  estimatedHours?: number
  condition?: (event: any) => boolean
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

const TASK_TEMPLATES: TaskTemplate[] = [
  // Venue Management
  {
    title: "Confirmar disponibilidad del venue",
    description: "Verificar que el venue esté disponible en la fecha seleccionada",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 90,
    estimatedHours: 2,
  },
  {
    title: "Inspección técnica del venue",
    description: "Realizar inspección técnica de instalaciones, capacidad eléctrica y acústica",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 4,
  },
  {
    title: "Firmar contrato del venue",
    description: "Finalizar y firmar el contrato de alquiler del venue",
    category: "Venue Management",
    priority: "urgent",
    daysBeforeEvent: 75,
    estimatedHours: 3,
  },

  // Technical Production
  {
    title: "Planificar setup técnico",
    description: "Definir requerimientos de sonido, iluminación y escenografía",
    category: "Technical Production",
    priority: "high",
    daysBeforeEvent: 45,
    estimatedHours: 6,
  },
  {
    title: "Contratar equipo técnico",
    description: "Reservar y contratar equipos de sonido, iluminación y video",
    category: "Technical Production",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 4,
  },
  {
    title: "Prueba de sonido",
    description: "Realizar prueba de sonido y ajustes técnicos finales",
    category: "Technical Production",
    priority: "urgent",
    daysBeforeEvent: 1,
    estimatedHours: 3,
  },

  // Catering & Logistics
  {
    title: "Seleccionar servicio de catering",
    description: "Elegir y contratar servicio de catering según el número de asistentes",
    category: "Catering & Logistics",
    priority: "medium",
    daysBeforeEvent: 30,
    estimatedHours: 3,
    condition: (event) => event.attendees > 50,
  },
  {
    title: "Coordinar logística de transporte",
    description: "Organizar transporte para artistas y equipo técnico",
    category: "Catering & Logistics",
    priority: "medium",
    daysBeforeEvent: 15,
    estimatedHours: 2,
  },
  {
    title: "Preparar backstage",
    description: "Acondicionar área de backstage con catering y necesidades de artistas",
    category: "Catering & Logistics",
    priority: "medium",
    daysBeforeEvent: 1,
    estimatedHours: 2,
  },

  // Security & Safety
  {
    title: "Contratar seguridad",
    description: "Contratar personal de seguridad según el tamaño del evento",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 21,
    estimatedHours: 2,
    condition: (event) => event.attendees > 100,
  },
  {
    title: "Plan de evacuación",
    description: "Desarrollar y comunicar plan de evacuación de emergencia",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 14,
    estimatedHours: 3,
  },
  {
    title: "Inspección de seguridad",
    description: "Realizar inspección final de seguridad del venue",
    category: "Security & Safety",
    priority: "urgent",
    daysBeforeEvent: 1,
    estimatedHours: 2,
  },

  // Marketing & Promotion
  {
    title: "Crear material promocional",
    description: "Diseñar flyers, posters y contenido para redes sociales",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 60,
    estimatedHours: 8,
  },
  {
    title: "Lanzar campaña en redes sociales",
    description: "Iniciar campaña promocional en redes sociales",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 45,
    estimatedHours: 4,
  },
  {
    title: "Contactar medios locales",
    description: "Enviar comunicados de prensa a medios locales",
    category: "Marketing & Promotion",
    priority: "low",
    daysBeforeEvent: 30,
    estimatedHours: 3,
  },

  // Financial Management
  {
    title: "Preparar presupuesto detallado",
    description: "Crear presupuesto completo con todos los costos del evento",
    category: "Financial Management",
    priority: "high",
    daysBeforeEvent: 75,
    estimatedHours: 4,
  },
  {
    title: "Configurar sistema de ticketing",
    description: "Configurar plataforma de venta de entradas",
    category: "Financial Management",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 3,
  },
  {
    title: "Reconciliación financiera",
    description: "Revisar y reconciliar todos los gastos del evento",
    category: "Financial Management",
    priority: "medium",
    daysBeforeEvent: -7,
    estimatedHours: 3,
  },

  // Artistic Direction
  {
    title: "Confirmar lineup de artistas",
    description: "Finalizar y confirmar todos los artistas participantes",
    category: "Artistic Direction",
    priority: "urgent",
    daysBeforeEvent: 45,
    estimatedHours: 2,
  },
  {
    title: "Coordinar ensayos",
    description: "Programar y coordinar ensayos con todos los artistas",
    category: "Artistic Direction",
    priority: "high",
    daysBeforeEvent: 7,
    estimatedHours: 4,
  },
  {
    title: "Briefing artístico final",
    description: "Reunión final con artistas para coordinar detalles del show",
    category: "Artistic Direction",
    priority: "high",
    daysBeforeEvent: 1,
    estimatedHours: 2,
  },

  // International Support
  {
    title: "Gestionar documentación de visa",
    description: "Tramitar visas necesarias para artistas internacionales",
    category: "International Support",
    priority: "urgent",
    daysBeforeEvent: 90,
    estimatedHours: 6,
    condition: (event) => requiresCustoms(event),
  },
  {
    title: "Coordinar trámites aduaneros",
    description: "Gestionar permisos aduaneros para equipos internacionales",
    category: "International Support",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 4,
    condition: (event) => requiresCustoms(event),
  },
  {
    title: "Organizar alojamiento internacional",
    description: "Reservar hoteles y coordinar traslados para artistas internacionales",
    category: "International Support",
    priority: "medium",
    daysBeforeEvent: 30,
    estimatedHours: 3,
    condition: (event) => requiresCustoms(event),
  },
]

export function calculateDaysUntilEvent(eventDate: string): number {
  try {
    const event = DateTime.fromISO(eventDate, { zone: "America/Argentina/Buenos_Aires" })
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    return Math.ceil(event.diff(now, "days").days)
  } catch (error) {
    console.error("Error calculating days until event:", error)
    return 0
  }
}

export function requiresCustoms(event: any): boolean {
  if (!event) return false

  try {
    const venue = event.venue?.toLowerCase() || ""
    const description = event.description?.toLowerCase() || ""
    const title = event.title?.toLowerCase() || ""

    const internationalKeywords = [
      "internacional",
      "international",
      "extranjero",
      "foreign",
      "visa",
      "customs",
      "aduana",
      "embassy",
      "embajada",
      "passport",
      "pasaporte",
      "border",
      "frontera",
    ]

    const internationalCountries = [
      "usa",
      "united states",
      "estados unidos",
      "canada",
      "méxico",
      "mexico",
      "brasil",
      "brazil",
      "chile",
      "uruguay",
      "paraguay",
      "bolivia",
      "colombia",
      "venezuela",
      "peru",
      "ecuador",
      "spain",
      "españa",
      "france",
      "francia",
      "italy",
      "italia",
      "germany",
      "alemania",
      "uk",
      "reino unido",
      "england",
      "inglaterra",
    ]

    const textToCheck = `${venue} ${description} ${title}`

    return (
      internationalKeywords.some((keyword) => textToCheck.includes(keyword)) ||
      internationalCountries.some((country) => textToCheck.includes(country)) ||
      getCountryFromVenue(venue) !== "Argentina"
    )
  } catch (error) {
    console.error("Error checking customs requirements:", error)
    return false
  }
}

export function getCountryFromVenue(venue: string): string {
  if (!venue) return "Argentina"

  const venueText = venue.toLowerCase()

  const countryKeywords = {
    USA: ["usa", "united states", "estados unidos", "new york", "los angeles", "miami"],
    Canada: ["canada", "toronto", "vancouver", "montreal"],
    Mexico: ["méxico", "mexico", "ciudad de méxico", "guadalajara"],
    Brasil: ["brasil", "brazil", "são paulo", "rio de janeiro"],
    Chile: ["chile", "santiago", "valparaíso"],
    Uruguay: ["uruguay", "montevideo"],
    España: ["españa", "spain", "madrid", "barcelona"],
    Francia: ["france", "francia", "paris", "lyon"],
  }

  for (const [country, keywords] of Object.entries(countryKeywords)) {
    if (keywords.some((keyword) => venueText.includes(keyword))) {
      return country
    }
  }

  return "Argentina"
}

export function generateAutomatedTasks(event: any): AutomatedTask[] {
  if (!event || !event.date) {
    console.warn("Event or event date is missing")
    return []
  }

  try {
    const daysUntilEvent = calculateDaysUntilEvent(event.date)
    const tasks: AutomatedTask[] = []

    TASK_TEMPLATES.forEach((template, index) => {
      // Check if template condition is met (if exists)
      if (template.condition && !template.condition(event)) {
        return
      }

      // Calculate due date
      const dueDate = DateTime.fromISO(event.date, { zone: "America/Argentina/Buenos_Aires" })
        .minus({ days: template.daysBeforeEvent })
        .toISO()

      const task: AutomatedTask = {
        id: `auto-${event.id}-${index}`,
        title: template.title,
        description: template.description,
        category: template.category,
        priority: template.priority,
        dueDate: dueDate || event.date,
        status: "pending",
        eventId: event.id,
        createdAt: DateTime.now().setZone("America/Argentina/Buenos_Aires").toISO() || new Date().toISOString(),
        updatedAt: DateTime.now().setZone("America/Argentina/Buenos_Aires").toISO() || new Date().toISOString(),
        type: "automated",
        estimatedHours: template.estimatedHours,
      }

      tasks.push(task)
    })

    return tasks
  } catch (error) {
    console.error("Error generating automated tasks:", error)
    return []
  }
}

export function getAutomatedTasksStats(tasks: AutomatedTask[]): TaskStats {
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
      else stats.pending++

      // Count overdue
      const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
      if (dueDate.isValid && dueDate < now && task.status !== "completed") {
        stats.overdue++
      }

      // Count by category
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1

      // Count by priority
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error("Error calculating task stats:", error)
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

export function processAutomatedTasks(eventId: string): void {
  try {
    console.log(`Processing automated tasks for event: ${eventId}`)
    // This is a placeholder function for future implementation
    // Could include logic for:
    // - Sending notifications for overdue tasks
    // - Auto-updating task statuses based on conditions
    // - Generating reports
  } catch (error) {
    console.error("Error processing automated tasks:", error)
  }
}

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
  try {
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
  } catch (error) {
    console.error("Error filtering tasks:", error)
    return tasks
  }
}

export function getTasksByCategory(tasks: AutomatedTask[]): Record<string, AutomatedTask[]> {
  try {
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
  } catch (error) {
    console.error("Error grouping tasks by category:", error)
    return {}
  }
}

export function getOverdueTasks(tasks: AutomatedTask[]): AutomatedTask[] {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

    return tasks.filter((task) => {
      if (task.status === "completed") return false

      const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
      return dueDate.isValid && dueDate < now
    })
  } catch (error) {
    console.error("Error getting overdue tasks:", error)
    return []
  }
}

export function getUpcomingTasks(tasks: AutomatedTask[], days = 7): AutomatedTask[] {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    const futureDate = now.plus({ days })

    return tasks.filter((task) => {
      if (task.status === "completed") return false

      const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
      return dueDate.isValid && dueDate >= now && dueDate <= futureDate
    })
  } catch (error) {
    console.error("Error getting upcoming tasks:", error)
    return []
  }
}

export function getUrgentAutomatedEvents(events: any[]): any[] {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

    return events.filter((event) => {
      if (!event.date) return false

      const eventDate = DateTime.fromISO(event.date, { zone: "America/Argentina/Buenos_Aires" })
      const daysUntil = eventDate.diff(now, "days").days

      // Events within 30 days are considered urgent for automated task generation
      return daysUntil <= 30 && daysUntil >= 0
    })
  } catch (error) {
    console.error("Error getting urgent events:", error)
    return []
  }
}
