import { DateTime } from "luxon"

// Definir los venues que requieren tareas automáticas
const INTERNATIONAL_VENUES = [
  // Uruguay
  "Montevideo",
  "Punta del Este",

  // Ecuador
  "Cuenca",
  "Quito",
  "Guayaquil",

  // Paraguay
  "Asunción",

  // Chile
  "Santiago",
  "Valparaiso",

  // Brasil
  "Sao Paulo",
  "Rio de Janeiro",

  // Bolivia
  "La Paz",
  "Santa Cruz",

  // Peru
  "Lima",
  "Cusco",

  // Colombia
  "Bogota",
  "Medellin",

  // Venezuela
  "Caracas",

  // Mexico
  "Ciudad de Mexico",
  "Guadalajara",

  // USA
  "Miami",
  "New York",

  // Spain
  "Madrid",
  "Barcelona",
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

// Función para obtener el país basado en el venue (EXPORTED)
export function getCountryFromVenue(venue: string, address?: string): string {
  const venueText = `${venue} ${address || ""}`.toLowerCase()

  if (venueText.includes("uruguay") || venueText.includes("montevideo") || venueText.includes("punta del este")) {
    return "Uruguay"
  }
  if (venueText.includes("chile") || venueText.includes("santiago") || venueText.includes("valparaiso")) {
    return "Chile"
  }
  if (
    venueText.includes("brasil") ||
    venueText.includes("brazil") ||
    venueText.includes("sao paulo") ||
    venueText.includes("rio de janeiro")
  ) {
    return "Brasil"
  }
  if (venueText.includes("paraguay") || venueText.includes("asuncion")) {
    return "Paraguay"
  }
  if (venueText.includes("bolivia") || venueText.includes("la paz") || venueText.includes("santa cruz")) {
    return "Bolivia"
  }
  if (venueText.includes("peru") || venueText.includes("lima") || venueText.includes("cusco")) {
    return "Peru"
  }
  if (venueText.includes("colombia") || venueText.includes("bogota") || venueText.includes("medellin")) {
    return "Colombia"
  }
  if (venueText.includes("ecuador") || venueText.includes("quito") || venueText.includes("guayaquil")) {
    return "Ecuador"
  }
  if (venueText.includes("venezuela") || venueText.includes("caracas")) {
    return "Venezuela"
  }
  if (venueText.includes("mexico") || venueText.includes("ciudad de mexico") || venueText.includes("guadalajara")) {
    return "Mexico"
  }
  if (
    venueText.includes("usa") ||
    venueText.includes("united states") ||
    venueText.includes("miami") ||
    venueText.includes("new york")
  ) {
    return "USA"
  }
  if (
    venueText.includes("spain") ||
    venueText.includes("españa") ||
    venueText.includes("madrid") ||
    venueText.includes("barcelona")
  ) {
    return "Spain"
  }

  return "Argentina" // Default
}

// Función para calcular días hasta el evento (EXPORTED)
export function calculateDaysUntilEvent(eventDate: string): number {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
  const event = DateTime.fromISO(eventDate).setZone("America/Argentina/Buenos_Aires")
  return Math.ceil(event.diff(now, "days").days)
}

// Función para determinar si requiere trámites aduaneros (EXPORTED)
export function requiresCustoms(venue: string, address?: string): boolean {
  const country = getCountryFromVenue(venue, address)
  return country !== "Argentina"
}

// Interface para tareas automáticas
export interface AutomatedTask {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  daysBeforeEvent: number
  assignee: string
  isAutomated: boolean
  eventId: string
  status: "pending" | "in-progress" | "completed"
  dueDate: string
  createdAt: string
}

// Interface for Event
export interface Event {
  id: string
  title?: string
  venue: string
  date: string
  address?: string
  status: string
}

// Interface for Task
export interface Task {
  id: string
  eventId: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  assignee: string
  dueDate: string
  isAutomated?: boolean
}

// Función principal para procesar tareas automáticas
export function processAutomatedTasks(): void {
  // Esta función necesita acceso al store, pero para evitar dependencias circulares
  // se implementará en el componente que la use
  console.log("processAutomatedTasks called - implement in component")
}

// Función para obtener tareas automáticas de un evento específico
export function getAutomatedTasksForEvent(eventId: string, tasks: Task[] = []): AutomatedTask[] {
  return tasks.filter((task) => task.eventId === eventId && task.isAutomated) || []
}

// Función para generar tareas automáticas (alias para compatibilidad)
export function generateAutomatedTasks(event: Event): AutomatedTask[] {
  const country = getCountryFromVenue(event.venue, event.address)
  const isInternational = requiresCustoms(event.venue, event.address)
  const daysUntilEvent = calculateDaysUntilEvent(event.date)

  const baseTasks: Omit<AutomatedTask, "id" | "eventId" | "dueDate" | "createdAt">[] = [
    // Logistics Tasks
    {
      title: "Confirmar transporte de equipos",
      description: "Coordinar y confirmar el transporte de todos los equipos técnicos al venue",
      category: "Logística",
      priority: "high",
      daysBeforeEvent: 7,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },
    {
      title: "Verificar accesos y horarios de carga",
      description: "Confirmar horarios de carga/descarga y accesos al venue",
      category: "Logística",
      priority: "high",
      daysBeforeEvent: 5,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },
    {
      title: "Preparar rider técnico",
      description: "Enviar rider técnico completo al venue y proveedores",
      category: "Técnico",
      priority: "medium",
      daysBeforeEvent: 10,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },

    // Production Tasks
    {
      title: "Confirmar lineup final",
      description: "Verificar y confirmar el lineup definitivo del evento",
      category: "Producción",
      priority: "high",
      daysBeforeEvent: 14,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },
    {
      title: "Coordinar pruebas de sonido",
      description: "Programar y coordinar las pruebas de sonido con todos los artistas",
      category: "Técnico",
      priority: "medium",
      daysBeforeEvent: 3,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },

    // Legal & Permits
    {
      title: "Verificar permisos municipales",
      description: "Confirmar que todos los permisos municipales están en orden",
      category: "Legal",
      priority: "high",
      daysBeforeEvent: 15,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },
    {
      title: "Revisar seguros del evento",
      description: "Verificar cobertura de seguros para el evento y equipos",
      category: "Legal",
      priority: "medium",
      daysBeforeEvent: 10,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },

    // Marketing Tasks
    {
      title: "Lanzar campaña de marketing final",
      description: "Activar la campaña de marketing de última semana",
      category: "Marketing",
      priority: "medium",
      daysBeforeEvent: 7,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },
    {
      title: "Preparar material de prensa",
      description: "Preparar kit de prensa y material para medios",
      category: "Marketing",
      priority: "low",
      daysBeforeEvent: 14,
      assignee: "Franco",
      isAutomated: true,
      status: "pending",
    },
  ]

  // Add international-specific tasks
  if (isInternational) {
    baseTasks.push(
      {
        title: "Gestionar documentación de aduana",
        description: `Preparar documentación para aduana - Destino: ${country}`,
        category: "Legal",
        priority: "high",
        daysBeforeEvent: 21,
        assignee: "Franco",
        isAutomated: true,
        status: "pending",
      },
      {
        title: "Coordinar transporte internacional",
        description: `Organizar transporte de equipos a ${country}`,
        category: "Logística",
        priority: "high",
        daysBeforeEvent: 14,
        assignee: "Franco",
        isAutomated: true,
        status: "pending",
      },
      {
        title: "Verificar requisitos de visa",
        description: `Confirmar requisitos de visa para el equipo en ${country}`,
        category: "Legal",
        priority: "medium",
        daysBeforeEvent: 30,
        assignee: "Franco",
        isAutomated: true,
        status: "pending",
      },
    )
  }

  // Generate tasks with proper dates and IDs
  return baseTasks.map((task, index) => {
    const dueDate = DateTime.fromISO(event.date)
      .setZone("America/Argentina/Buenos_Aires")
      .minus({ days: task.daysBeforeEvent })
      .toISODate()

    return {
      ...task,
      id: `auto-${event.id}-${index}`,
      eventId: event.id,
      dueDate: dueDate || event.date,
      createdAt: DateTime.now().setZone("America/Argentina/Buenos_Aires").toISODate() || new Date().toISOString(),
    }
  })
}

// Función para obtener estadísticas de tareas automáticas (EXPORTED)
export function getAutomatedTasksStats(tasks: Task[] = [], events: Event[] = []) {
  const automatedTasks = tasks.filter((task) => task.isAutomated)

  return {
    total: automatedTasks.length,
    pending: automatedTasks.filter((task) => task.status === "pending").length,
    inProgress: automatedTasks.filter((task) => task.status === "in-progress").length,
    completed: automatedTasks.filter((task) => task.status === "completed").length,
    overdue: automatedTasks.filter((task) => {
      const dueDate = DateTime.fromISO(task.dueDate).setZone("America/Argentina/Buenos_Aires")
      const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
      return task.status !== "completed" && dueDate < now
    }).length,
  }
}

// Función para obtener eventos que requieren atención urgente (EXPORTED)
export function getUrgentAutomatedEvents(tasks: Task[] = [], events: Event[] = []) {
  const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")

  return events.filter((event) => {
    const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
    const daysUntilEvent = eventDate.diff(now, "days").days

    // Events in the next 30 days that don't have automated tasks yet
    if (daysUntilEvent <= 30 && daysUntilEvent > 0) {
      const eventTasks = tasks.filter((task) => task.eventId === event.id && task.isAutomated)
      return eventTasks.length === 0
    }

    return false
  })
}

// Función para verificar si un evento necesita tareas automáticas (EXPORTED)
export function eventNeedsAutomation(venue: string, eventDate: string): boolean {
  const daysUntilEvent = calculateDaysUntilEvent(eventDate)
  return requiresAutomation(venue) && daysUntilEvent > 15 && daysUntilEvent <= 60
}

// Función para obtener el tipo de automatización requerida (EXPORTED)
export function getAutomationRequirements(venue: string): {
  needsPassages: boolean
  needsHotel: boolean
  needsCustoms: boolean
  country: string
} {
  const isInternational = isInternationalVenue(venue)
  const country = getCountryFromVenue(venue)

  return {
    needsPassages: isInternational || isArgentinaVenue(venue),
    needsHotel: isInternational || isArgentinaVenue(venue),
    needsCustoms: isInternational,
    country,
  }
}

// Standard task templates by category
export const STANDARD_TASK_TEMPLATES = {
  Logística: [
    {
      title: "Confirmar transporte de equipos",
      description: "Coordinar y confirmar el transporte de todos los equipos técnicos",
      priority: "high" as const,
      daysBeforeEvent: 7,
      assignee: "Franco",
    },
    {
      title: "Verificar accesos al venue",
      description: "Confirmar horarios y accesos de carga/descarga",
      priority: "high" as const,
      daysBeforeEvent: 5,
      assignee: "Franco",
    },
  ],
  Técnico: [
    {
      title: "Preparar rider técnico",
      description: "Enviar especificaciones técnicas completas",
      priority: "medium" as const,
      daysBeforeEvent: 10,
      assignee: "Franco",
    },
    {
      title: "Coordinar pruebas de sonido",
      description: "Programar soundcheck con todos los artistas",
      priority: "medium" as const,
      daysBeforeEvent: 3,
      assignee: "Franco",
    },
  ],
  Legal: [
    {
      title: "Verificar permisos municipales",
      description: "Confirmar todos los permisos están en orden",
      priority: "high" as const,
      daysBeforeEvent: 15,
      assignee: "Franco",
    },
    {
      title: "Revisar seguros del evento",
      description: "Verificar cobertura de seguros",
      priority: "medium" as const,
      daysBeforeEvent: 10,
      assignee: "Franco",
    },
  ],
  Marketing: [
    {
      title: "Lanzar campaña final",
      description: "Activar marketing de última semana",
      priority: "medium" as const,
      daysBeforeEvent: 7,
      assignee: "Franco",
    },
    {
      title: "Preparar kit de prensa",
      description: "Material para medios y prensa",
      priority: "low" as const,
      daysBeforeEvent: 14,
      assignee: "Franco",
    },
  ],
}
