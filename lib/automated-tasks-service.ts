import { DateTime } from "luxon"

export interface AutomatedTask {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string
  estimatedHours: number
  assignee?: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  dependencies?: string[]
  isAutomated: boolean
  eventId: string
  createdAt: string
  updatedAt: string
  type: "automated" | "manual"
}

export interface TaskTemplate {
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  daysBeforeEvent: number
  estimatedHours: number
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

// Task templates organized by category
const TASK_TEMPLATES: TaskTemplate[] = [
  // Venue Management
  {
    title: "Confirmar disponibilidad del venue",
    description: "Verificar que el venue esté disponible en la fecha seleccionada",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 60,
    estimatedHours: 2,
  },
  {
    title: "Inspección técnica del venue",
    description: "Realizar inspección técnica de instalaciones, capacidad eléctrica y acústica",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 45,
    estimatedHours: 4,
  },
  {
    title: "Firmar contrato del venue",
    description: "Finalizar y firmar el contrato de alquiler del venue",
    category: "Venue Management",
    priority: "high",
    daysBeforeEvent: 40,
    estimatedHours: 3,
  },

  // Technical Production
  {
    title: "Planificar setup técnico",
    description: "Definir requerimientos de sonido, iluminación y escenografía",
    category: "Technical Production",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 6,
  },
  {
    title: "Contratar equipo técnico",
    description: "Contratar técnicos de sonido, iluminación y escenografía",
    category: "Technical Production",
    priority: "high",
    daysBeforeEvent: 25,
    estimatedHours: 4,
  },
  {
    title: "Prueba técnica general",
    description: "Realizar prueba completa de todos los sistemas técnicos",
    category: "Technical Production",
    priority: "urgent",
    daysBeforeEvent: 2,
    estimatedHours: 8,
  },

  // Catering & Logistics
  {
    title: "Seleccionar servicio de catering",
    description: "Elegir y contratar servicio de catering para el evento",
    category: "Catering & Logistics",
    priority: "medium",
    daysBeforeEvent: 21,
    estimatedHours: 3,
  },
  {
    title: "Planificar logística de transporte",
    description: "Organizar transporte para artistas, equipo y personal",
    category: "Catering & Logistics",
    priority: "medium",
    daysBeforeEvent: 14,
    estimatedHours: 4,
  },
  {
    title: "Coordinar montaje y desmontaje",
    description: "Planificar horarios y personal para montaje y desmontaje",
    category: "Catering & Logistics",
    priority: "high",
    daysBeforeEvent: 7,
    estimatedHours: 3,
  },

  // Security & Safety
  {
    title: "Contratar servicio de seguridad",
    description: "Contratar personal de seguridad según capacidad del evento",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 2,
  },
  {
    title: "Plan de evacuación y emergencias",
    description: "Desarrollar plan de evacuación y procedimientos de emergencia",
    category: "Security & Safety",
    priority: "high",
    daysBeforeEvent: 21,
    estimatedHours: 4,
  },
  {
    title: "Inspección de seguridad final",
    description: "Inspección final de todas las medidas de seguridad",
    category: "Security & Safety",
    priority: "urgent",
    daysBeforeEvent: 1,
    estimatedHours: 2,
  },

  // Marketing & Promotion
  {
    title: "Crear estrategia de marketing",
    description: "Desarrollar estrategia de promoción y marketing del evento",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 45,
    estimatedHours: 6,
  },
  {
    title: "Diseñar material promocional",
    description: "Crear flyers, posters y contenido para redes sociales",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 35,
    estimatedHours: 8,
  },
  {
    title: "Lanzar campaña de promoción",
    description: "Iniciar campaña de promoción en redes sociales y medios",
    category: "Marketing & Promotion",
    priority: "medium",
    daysBeforeEvent: 30,
    estimatedHours: 4,
  },

  // Financial Management
  {
    title: "Preparar presupuesto detallado",
    description: "Crear presupuesto completo con todos los costos del evento",
    category: "Financial Management",
    priority: "high",
    daysBeforeEvent: 50,
    estimatedHours: 4,
  },
  {
    title: "Gestionar pagos a proveedores",
    description: "Coordinar pagos y adelantos a todos los proveedores",
    category: "Financial Management",
    priority: "high",
    daysBeforeEvent: 15,
    estimatedHours: 3,
  },
  {
    title: "Reconciliación financiera final",
    description: "Revisar todos los gastos y ingresos del evento",
    category: "Financial Management",
    priority: "medium",
    daysBeforeEvent: -7,
    estimatedHours: 4,
  },

  // Artistic Direction
  {
    title: "Confirmar lineup de artistas",
    description: "Finalizar y confirmar todos los artistas del evento",
    category: "Artistic Direction",
    priority: "high",
    daysBeforeEvent: 35,
    estimatedHours: 3,
  },
  {
    title: "Coordinar ensayos",
    description: "Organizar ensayos técnicos con todos los artistas",
    category: "Artistic Direction",
    priority: "high",
    daysBeforeEvent: 7,
    estimatedHours: 6,
  },
  {
    title: "Briefing artístico final",
    description: "Reunión final con todos los artistas sobre el show",
    category: "Artistic Direction",
    priority: "high",
    daysBeforeEvent: 1,
    estimatedHours: 2,
  },

  // International Support
  {
    title: "Gestionar documentación de visa",
    description: "Ayudar con trámites de visa para artistas internacionales",
    category: "International Support",
    priority: "urgent",
    daysBeforeEvent: 90,
    estimatedHours: 8,
    condition: (event) => requiresCustoms(event),
  },
  {
    title: "Coordinar trámites aduaneros",
    description: "Gestionar documentación aduanera para equipos internacionales",
    category: "International Support",
    priority: "high",
    daysBeforeEvent: 30,
    estimatedHours: 6,
    condition: (event) => requiresCustoms(event),
  },
  {
    title: "Organizar transporte internacional",
    description: "Coordinar vuelos y transporte para artistas internacionales",
    category: "International Support",
    priority: "high",
    daysBeforeEvent: 21,
    estimatedHours: 4,
    condition: (event) => requiresCustoms(event),
  },
]

// Helper function to calculate days until event
export function calculateDaysUntilEvent(eventDate: string): number {
  try {
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    const event = DateTime.fromISO(eventDate).setZone("America/Argentina/Buenos_Aires")
    return Math.ceil(event.diff(now, "days").days)
  } catch (error) {
    console.error("Error calculating days until event:", error)
    return 0
  }
}

// Helper function to determine if event requires customs/visa support
export function requiresCustoms(event: any): boolean {
  if (!event) return false

  try {
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

    const eventText =
      `${event.title || ""} ${event.description || ""} ${event.venue?.name || ""} ${event.venue?.location || ""}`.toLowerCase()

    return (
      internationalKeywords.some((keyword) => eventText.includes(keyword)) ||
      getCountryFromVenue(event.venue) !== "Argentina"
    )
  } catch (error) {
    console.error("Error checking customs requirements:", error)
    return false
  }
}

// Helper function to extract country from venue
export function getCountryFromVenue(venue: any): string {
  if (!venue) return "Argentina"

  try {
    const location = venue.location || venue.address || ""
    const internationalCountries = [
      "Brazil",
      "Brasil",
      "Chile",
      "Uruguay",
      "Paraguay",
      "Bolivia",
      "Peru",
      "Colombia",
      "Ecuador",
      "Venezuela",
      "Mexico",
      "USA",
      "United States",
      "Canada",
      "Spain",
      "France",
      "Germany",
      "Italy",
    ]

    for (const country of internationalCountries) {
      if (location.toLowerCase().includes(country.toLowerCase())) {
        return country
      }
    }

    return "Argentina"
  } catch (error) {
    console.error("Error extracting country from venue:", error)
    return "Argentina"
  }
}

// Main function to generate automated tasks
export function generateAutomatedTasks(event: any): AutomatedTask[] {
  if (!event || !event.date) {
    console.warn("Event or event date is missing")
    return []
  }

  try {
    const tasks: AutomatedTask[] = []
    const eventDate = event.date
    const daysUntilEvent = calculateDaysUntilEvent(eventDate)

    TASK_TEMPLATES.forEach((template, index) => {
      // Check if template has a condition and if it's met
      if (template.condition && !template.condition(event)) {
        return
      }

      // Calculate due date
      const dueDate = DateTime.fromISO(eventDate)
        .setZone("America/Argentina/Buenos_Aires")
        .minus({ days: template.daysBeforeEvent })
        .toISO()

      // Only create tasks that are not overdue by more than 30 days
      const daysSinceDue = daysUntilEvent - template.daysBeforeEvent
      if (daysSinceDue < -30) {
        return
      }

      const task: AutomatedTask = {
        id: `auto-${event.id}-${index}`,
        title: template.title,
        description: template.description,
        category: template.category,
        priority: template.priority,
        dueDate: dueDate || "",
        estimatedHours: template.estimatedHours,
        status: "pending",
        isAutomated: true,
        eventId: event.id,
        type: "automated",
        createdAt: DateTime.now().setZone("America/Argentina/Buenos_Aires").toISO() || "",
        updatedAt: DateTime.now().setZone("America/Argentina/Buenos_Aires").toISO() || "",
      }

      tasks.push(task)
    })

    return tasks
  } catch (error) {
    console.error("Error generating automated tasks:", error)
    return []
  }
}

// Function to get automated tasks statistics
export function getAutomatedTasksStats(tasks: AutomatedTask[]): TaskStats {
  try {
    const automatedTasks = tasks.filter((task) => task.isAutomated)

    const stats: TaskStats = {
      total: automatedTasks.length,
      completed: automatedTasks.filter((t) => t.status === "completed").length,
      pending: automatedTasks.filter((t) => t.status === "pending").length,
      inProgress: automatedTasks.filter((t) => t.status === "in-progress").length,
      overdue: 0,
      byCategory: {},
      byPriority: {},
    }

    // Calculate overdue tasks
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    stats.overdue = automatedTasks.filter((task) => {
      if (task.status === "completed") return false
      try {
        const dueDate = DateTime.fromISO(task.dueDate).setZone("America/Argentina/Buenos_Aires")
        return dueDate < now
      } catch {
        return false
      }
    }).length

    // Group by category
    automatedTasks.forEach((task) => {
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1
    })

    return stats
  } catch (error) {
    console.error("Error calculating automated tasks stats:", error)
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

// Process automated tasks (placeholder for future implementation)
export function processAutomatedTasks(eventId: string): void {
  try {
    console.log(`Processing automated tasks for event: ${eventId}`)
    // Future implementation for task processing logic
  } catch (error) {
    console.error("Error processing automated tasks:", error)
  }
}

// Additional utility functions
export function filterTasks(tasks: AutomatedTask[], filters: any): AutomatedTask[] {
  try {
    return tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.category && task.category !== filters.category) return false
      if (filters.type && task.type !== filters.type) return false
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
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
      try {
        const dueDate = DateTime.fromISO(task.dueDate).setZone("America/Argentina/Buenos_Aires")
        return dueDate < now
      } catch {
        return false
      }
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
      try {
        const dueDate = DateTime.fromISO(task.dueDate).setZone("America/Argentina/Buenos_Aires")
        return dueDate >= now && dueDate <= futureDate
      } catch {
        return false
      }
    })
  } catch (error) {
    console.error("Error getting upcoming tasks:", error)
    return []
  }
}

export function getUrgentAutomatedEvents(events: any[]): any[] {
  try {
    return events.filter((event) => {
      if (!event.date) return false
      const daysUntil = calculateDaysUntilEvent(event.date)
      return daysUntil <= 30 && daysUntil >= 0
    })
  } catch (error) {
    console.error("Error getting urgent automated events:", error)
    return []
  }
}
