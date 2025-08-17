import type { Task } from "@/store/unified-event-store"
import { DateTime } from "luxon"

export interface StandardTask {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  assignee: "FRANCO" | "PABLO"
  daysBeforeEvent: number
  questions: string[]
  isCritical: boolean
}

// CATÁLOGO COMPLETO DE TAREAS ESTÁNDAR
export const STANDARD_TASKS_CATALOG: StandardTask[] = [
  // ARTE - 8 tareas
  {
    id: "arte-direccion",
    title: "Dirección de Artistas",
    description: "Coordinar y dirigir todos los aspectos artísticos del evento",
    category: "ARTE",
    priority: "high",
    assignee: "FRANCO",
    daysBeforeEvent: 30,
    questions: [
      "¿Qué concepto artístico queremos transmitir?",
      "¿Cuántos artistas necesitamos?",
      "¿Hay algún tema específico para el evento?",
    ],
    isCritical: true,
  },
  {
    id: "arte-escenografia",
    title: "Escenografía",
    description: "Diseñar y montar la escenografía del evento",
    category: "ARTE",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 21,
    questions: [
      "¿Qué elementos escenográficos necesitamos?",
      "¿Cuál es el presupuesto para escenografía?",
      "¿Hay restricciones del venue?",
    ],
    isCritical: true,
  },
  {
    id: "arte-iluminacion",
    title: "Iluminación",
    description: "Diseñar y operar el sistema de iluminación",
    category: "ARTE",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 14,
    questions: [
      "¿Qué tipo de ambiente lumínico queremos crear?",
      "¿Necesitamos efectos especiales de luz?",
      "¿El venue tiene limitaciones eléctricas?",
    ],
    isCritical: true,
  },
  {
    id: "arte-vj",
    title: "VJ (Video Jockey)",
    description: "Coordinar visuales y contenido audiovisual en vivo",
    category: "ARTE",
    priority: "medium",
    assignee: "FRANCO",
    daysBeforeEvent: 14,
    questions: [
      "¿Qué tipo de visuales queremos proyectar?",
      "¿Hay pantallas disponibles en el venue?",
      "¿Necesitamos contenido personalizado?",
    ],
    isCritical: false,
  },
  {
    id: "arte-fx",
    title: "Efectos Especiales",
    description: "Planificar y ejecutar efectos especiales durante el evento",
    category: "ARTE",
    priority: "medium",
    assignee: "PABLO",
    daysBeforeEvent: 10,
    questions: [
      "¿Qué tipo de efectos queremos usar?",
      "¿Hay restricciones de seguridad?",
      "¿Necesitamos permisos especiales?",
    ],
    isCritical: false,
  },
  {
    id: "arte-maquillaje",
    title: "Maquillaje y Caracterización",
    description: "Coordinar servicios de maquillaje para artistas",
    category: "ARTE",
    priority: "low",
    assignee: "FRANCO",
    daysBeforeEvent: 7,
    questions: [
      "¿Cuántos artistas necesitan maquillaje?",
      "¿Hay un estilo específico requerido?",
      "¿Necesitamos caracterización especial?",
    ],
    isCritical: false,
  },
  {
    id: "arte-vestuario",
    title: "Vestuario",
    description: "Coordinar vestuario y styling para artistas",
    category: "ARTE",
    priority: "low",
    assignee: "FRANCO",
    daysBeforeEvent: 7,
    questions: [
      "¿Qué estilo de vestuario necesitamos?",
      "¿Los artistas traen su propio vestuario?",
      "¿Hay cambios de vestuario durante el show?",
    ],
    isCritical: false,
  },
  {
    id: "arte-performance",
    title: "Performance y Shows",
    description: "Coordinar performances especiales y shows en vivo",
    category: "ARTE",
    priority: "medium",
    assignee: "FRANCO",
    daysBeforeEvent: 14,
    questions: [
      "¿Qué tipo de performances queremos incluir?",
      "¿Necesitamos ensayos previos?",
      "¿Hay requisitos técnicos especiales?",
    ],
    isCritical: false,
  },

  // BOOKING - 7 tareas
  {
    id: "booking-dj",
    title: "Booking DJ Principal",
    description: "Contratar y coordinar con el DJ principal del evento",
    category: "BOOKING",
    priority: "high",
    assignee: "FRANCO",
    daysBeforeEvent: 45,
    questions: [
      "¿Qué estilo musical queremos para el evento?",
      "¿Hay algún DJ específico en mente?",
      "¿Cuál es el presupuesto para el DJ?",
    ],
    isCritical: true,
  },
  {
    id: "booking-sonido",
    title: "Sistema de Sonido",
    description: "Contratar y configurar el sistema de sonido",
    category: "BOOKING",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 21,
    questions: [
      "¿Qué potencia de sonido necesitamos?",
      "¿El venue tiene sistema propio?",
      "¿Necesitamos sonido en múltiples áreas?",
    ],
    isCritical: true,
  },
  {
    id: "booking-sonidista",
    title: "Sonidista",
    description: "Contratar ingeniero de sonido para el evento",
    category: "BOOKING",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 14,
    questions: [
      "¿Necesitamos sonidista con experiencia específica?",
      "¿Habrá múltiples artistas que requieran mezcla?",
      "¿Se necesita grabación del evento?",
    ],
    isCritical: true,
  },
  {
    id: "booking-seguridad",
    title: "Seguridad",
    description: "Contratar equipo de seguridad para el evento",
    category: "BOOKING",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 14,
    questions: [
      "¿Cuántas personas esperamos?",
      "¿Hay zonas VIP que proteger?",
      "¿Necesitamos seguridad especializada?",
    ],
    isCritical: true,
  },
  {
    id: "booking-staff",
    title: "Staff General",
    description: "Contratar personal de apoyo para el evento",
    category: "BOOKING",
    priority: "medium",
    assignee: "FRANCO",
    daysBeforeEvent: 10,
    questions: [
      "¿Cuánto personal necesitamos?",
      "¿Qué roles específicos requerimos?",
      "¿Necesitamos personal bilingüe?",
    ],
    isCritical: false,
  },
  {
    id: "booking-catering",
    title: "Catering",
    description: "Coordinar servicios de catering para staff y artistas",
    category: "BOOKING",
    priority: "medium",
    assignee: "FRANCO",
    daysBeforeEvent: 7,
    questions: [
      "¿Para cuántas personas necesitamos catering?",
      "¿Hay restricciones alimentarias?",
      "¿Necesitamos servicio durante todo el evento?",
    ],
    isCritical: false,
  },
  {
    id: "booking-transporte",
    title: "Transporte",
    description: "Coordinar transporte para artistas y equipo",
    category: "BOOKING",
    priority: "medium",
    assignee: "PABLO",
    daysBeforeEvent: 7,
    questions: [
      "¿Cuántas personas necesitan transporte?",
      "¿Hay equipos pesados que transportar?",
      "¿Necesitamos vehículos especiales?",
    ],
    isCritical: false,
  },

  // MARKETING - 6 tareas
  {
    id: "marketing-concepto",
    title: "Concepto de Marketing",
    description: "Desarrollar el concepto y estrategia de marketing",
    category: "MARKETING",
    priority: "high",
    assignee: "FRANCO",
    daysBeforeEvent: 60,
    questions: [
      "¿Cuál es el mensaje principal del evento?",
      "¿Quién es nuestro público objetivo?",
      "¿Qué canales de marketing usaremos?",
    ],
    isCritical: true,
  },
  {
    id: "marketing-diseño",
    title: "Diseño Gráfico",
    description: "Crear identidad visual y materiales gráficos",
    category: "MARKETING",
    priority: "high",
    assignee: "FRANCO",
    daysBeforeEvent: 30,
    questions: [
      "¿Qué estilo visual queremos transmitir?",
      "¿Necesitamos logo específico para el evento?",
      "¿Qué materiales gráficos requerimos?",
    ],
    isCritical: true,
  },
  {
    id: "marketing-redes",
    title: "Redes Sociales",
    description: "Gestionar campaña en redes sociales",
    category: "MARKETING",
    priority: "high",
    assignee: "FRANCO",
    daysBeforeEvent: 21,
    questions: [
      "¿En qué plataformas nos enfocaremos?",
      "¿Qué tipo de contenido crearemos?",
      "¿Necesitamos influencers o colaboraciones?",
    ],
    isCritical: true,
  },
  {
    id: "marketing-fotografia",
    title: "Fotografía",
    description: "Contratar fotógrafo para el evento",
    category: "MARKETING",
    priority: "medium",
    assignee: "FRANCO",
    daysBeforeEvent: 14,
    questions: [
      "¿Qué tipo de fotografías necesitamos?",
      "¿Necesitamos fotos durante todo el evento?",
      "¿Hay momentos específicos que capturar?",
    ],
    isCritical: false,
  },
  {
    id: "marketing-video",
    title: "Video y Filmación",
    description: "Coordinar filmación y producción de video",
    category: "MARKETING",
    priority: "medium",
    assignee: "FRANCO",
    daysBeforeEvent: 14,
    questions: [
      "¿Necesitamos video promocional o recap?",
      "¿Qué duración debe tener el video?",
      "¿Hay restricciones de filmación en el venue?",
    ],
    isCritical: false,
  },
  {
    id: "marketing-merchandising",
    title: "Merchandising",
    description: "Desarrollar y producir merchandising del evento",
    category: "MARKETING",
    priority: "low",
    assignee: "FRANCO",
    daysBeforeEvent: 21,
    questions: [
      "¿Qué productos de merchandising queremos?",
      "¿Cuál es el presupuesto para merchandising?",
      "¿Dónde venderemos los productos?",
    ],
    isCritical: false,
  },

  // EXTRAS - 4 tareas
  {
    id: "extras-permisos",
    title: "Permisos y Habilitaciones",
    description: "Gestionar todos los permisos necesarios",
    category: "EXTRAS",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 30,
    questions: [
      "¿Qué permisos específicos necesitamos?",
      "¿Hay restricciones municipales?",
      "¿Necesitamos permisos de música?",
    ],
    isCritical: true,
  },
  {
    id: "extras-seguros",
    title: "Seguros",
    description: "Contratar seguros para el evento",
    category: "EXTRAS",
    priority: "high",
    assignee: "PABLO",
    daysBeforeEvent: 21,
    questions: [
      "¿Qué tipo de cobertura necesitamos?",
      "¿Hay requisitos específicos del venue?",
      "¿Necesitamos seguro para equipos?",
    ],
    isCritical: true,
  },
  {
    id: "extras-limpieza",
    title: "Limpieza",
    description: "Coordinar servicios de limpieza pre y post evento",
    category: "EXTRAS",
    priority: "medium",
    assignee: "PABLO",
    daysBeforeEvent: 7,
    questions: [
      "¿Necesitamos limpieza antes del evento?",
      "¿Qué nivel de limpieza post-evento requerimos?",
      "¿Hay áreas específicas que requieren atención especial?",
    ],
    isCritical: false,
  },
  {
    id: "extras-contingencia",
    title: "Plan de Contingencia",
    description: "Desarrollar plan de contingencia para emergencias",
    category: "EXTRAS",
    priority: "medium",
    assignee: "PABLO",
    daysBeforeEvent: 14,
    questions: [
      "¿Cuáles son los riesgos principales?",
      "¿Tenemos plan de evacuación?",
      "¿Hay contactos de emergencia definidos?",
    ],
    isCritical: false,
  },
]

export function generateStandardTasksForEvent(eventId: string, eventDate: string, eventTitle: string): Task[] {
  const tasks: Task[] = []
  const eventDateTime = DateTime.fromISO(eventDate)

  STANDARD_TASKS_CATALOG.forEach((standardTask) => {
    const dueDate = eventDateTime.minus({ days: standardTask.daysBeforeEvent })

    const task: Task = {
      id: `standard-${eventId}-${standardTask.id}-${Date.now()}`,
      title: `${standardTask.title} - ${eventTitle}`,
      description: `${standardTask.description}\n\nPreguntas clave:\n${standardTask.questions.map((q) => `• ${q}`).join("\n")}`,
      status: "pending",
      priority: standardTask.priority,
      assignee: standardTask.assignee,
      dueDate: dueDate.toISODate() || eventDate,
      eventId: eventId,
      category: standardTask.category,
      isAutomated: false,
      createdAt: DateTime.now().toISO() || new Date().toISOString(),
      updatedAt: DateTime.now().toISO() || new Date().toISOString(),
    }

    tasks.push(task)
  })

  return tasks
}

export function getTasksByCategory(tasks: Task[]) {
  const categories = {
    ARTE: tasks.filter((t) => t.category === "ARTE"),
    BOOKING: tasks.filter((t) => t.category === "BOOKING"),
    MARKETING: tasks.filter((t) => t.category === "MARKETING"),
    EXTRAS: tasks.filter((t) => t.category === "EXTRAS"),
  }

  return categories
}

export function getCriticalTasks(): StandardTask[] {
  return STANDARD_TASKS_CATALOG.filter((task) => task.isCritical)
}

export function getTasksForTimeframe(days: number): StandardTask[] {
  return STANDARD_TASKS_CATALOG.filter((task) => task.daysBeforeEvent <= days)
}
