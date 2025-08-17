import { useUnifiedEventStore } from "@/store/unified-event-store"
import type { Event } from "@/store/unified-event-store"

export interface ManualTemplate {
  id: string
  name: string
  role: string
  description: string
  sections: ManualSection[]
  defaultSchedule: ScheduleItem[]
}

export interface ManualSection {
  id: string
  title: string
  content: string
  variables: string[]
  required: boolean
}

export interface ScheduleItem {
  time: string
  activity: string
  responsible: string
  location?: string
  notes?: string
}

export interface GeneratedManual {
  id: string
  eventId: string
  templateId: string
  title: string
  content: string
  schedule: ScheduleItem[]
  metadata: {
    generatedAt: string
    eventData: any
    responses: Record<string, string>
  }
  collaborators: string[]
  version: number
  status: "draft" | "review" | "approved" | "published"
}

// Plantillas de manuales por rol
export const MANUAL_TEMPLATES: ManualTemplate[] = [
  {
    id: "asistente",
    name: "Manual del Asistente",
    role: "Asistente de Producción",
    description: "Guía completa para asistentes de producción durante el evento",
    sections: [
      {
        id: "intro",
        title: "Información General del Evento",
        content: `
# {{EVENT_TITLE}} - {{EVENT_DATE}}

**Venue:** {{VENUE_NAME}}
**Dirección:** {{VENUE_ADDRESS}}
**Horario:** {{OPENING_TIME}} - {{CLOSING_TIME}}
**Responsable:** {{PRODUCER_NAME}} ({{PRODUCER_PHONE}})

## Temática
{{EVENT_THEME}}

## Descripción
{{EVENT_DESCRIPTION}}
        `,
        variables: [
          "EVENT_TITLE",
          "EVENT_DATE",
          "VENUE_NAME",
          "VENUE_ADDRESS",
          "OPENING_TIME",
          "CLOSING_TIME",
          "PRODUCER_NAME",
          "PRODUCER_PHONE",
          "EVENT_THEME",
          "EVENT_DESCRIPTION",
        ],
        required: true,
      },
      {
        id: "schedule",
        title: "Cronograma del Evento",
        content: `
# Cronograma Detallado

## Montaje
- **{{SETUP_START_TIME}}**: Inicio de montaje
- **22:00**: Llegada del equipo técnico
- **23:00**: Pruebas de sonido e iluminación

## Evento
- **{{OPENING_TIME}}**: Apertura de puertas
- **03:00**: Serpiente (momento clave)
- **{{CLOSING_TIME}}**: Cierre oficial

## Desarme
- **{{TEARDOWN_TIME}}**: Inicio de desarme
        `,
        variables: ["SETUP_START_TIME", "OPENING_TIME", "CLOSING_TIME", "TEARDOWN_TIME"],
        required: true,
      },
      {
        id: "contacts",
        title: "Contactos de Emergencia",
        content: `
# Contactos Importantes

## Producción
- **Responsable:** {{PRODUCER_NAME}}
- **Teléfono:** {{PRODUCER_PHONE}}
- **Email:** {{PRODUCER_EMAIL}}

## Venue
- **Contacto:** {{VENUE_CONTACT}}

## Servicios de Emergencia
- **Paramédicos:** En sitio desde 00:00
- **Seguridad:** {{SECURITY_CONTACT}}
        `,
        variables: ["PRODUCER_NAME", "PRODUCER_PHONE", "PRODUCER_EMAIL", "VENUE_CONTACT", "SECURITY_CONTACT"],
        required: true,
      },
    ],
    defaultSchedule: [
      { time: "18:00", activity: "Inicio de montaje", responsible: "Equipo técnico", location: "Venue" },
      { time: "22:00", activity: "Llegada del equipo", responsible: "Todo el staff", location: "Venue" },
      { time: "23:00", activity: "Pruebas técnicas", responsible: "Sonidista/Iluminador", location: "Escenario" },
      { time: "00:30", activity: "Apertura de puertas", responsible: "Seguridad/Boletería", location: "Entrada" },
      { time: "03:00", activity: "Serpiente", responsible: "Actores/Producción", location: "Escenario" },
      { time: "06:00", activity: "Cierre", responsible: "Seguridad", location: "Todo el venue" },
      { time: "08:00", activity: "Fin de desarme", responsible: "Equipo técnico", location: "Venue" },
    ],
  },
  {
    id: "vj",
    name: "Manual del VJ",
    role: "Video Jockey",
    description: "Especificaciones técnicas y cronograma para el VJ",
    sections: [
      {
        id: "technical",
        title: "Especificaciones Técnicas",
        content: `
# Especificaciones Técnicas - VJ

## Equipo Requerido
- **Resolución:** {{SCREEN_RESOLUTION}}
- **Formato:** {{VIDEO_FORMAT}}
- **Conexión:** {{CONNECTION_TYPE}}

## Material Oficial
- Logos DER precargados
- Material de tour disponible
- Frecuencia de branding: cada 15 minutos

## Backup
- Segunda computadora configurada
- Media duplicada en múltiples dispositivos
        `,
        variables: ["SCREEN_RESOLUTION", "VIDEO_FORMAT", "CONNECTION_TYPE"],
        required: true,
      },
      {
        id: "schedule",
        title: "Cronograma VJ",
        content: `
# Cronograma Específico VJ

- **22:00**: Setup y pruebas
- **23:00**: Test con iluminación
- **00:30**: Inicio warm-up visuals
- **03:00**: Sincronización con Serpiente
- **06:00**: Fade out final
        `,
        variables: [],
        required: true,
      },
    ],
    defaultSchedule: [
      { time: "22:00", activity: "Setup VJ y pruebas", responsible: "VJ", location: "Cabina" },
      { time: "23:00", activity: "Sincronización con luces", responsible: "VJ/Iluminador", location: "Cabina" },
      { time: "00:30", activity: "Inicio warm-up visuals", responsible: "VJ", location: "Cabina" },
      { time: "03:00", activity: "Visuals para Serpiente", responsible: "VJ", location: "Cabina" },
      { time: "06:00", activity: "Fade out final", responsible: "VJ", location: "Cabina" },
    ],
  },
  {
    id: "sonidista",
    name: "Manual del Sonidista",
    role: "Ingeniero de Sonido",
    description: "Configuración técnica y cronograma de sonido",
    sections: [
      {
        id: "technical",
        title: "Configuración de Sonido",
        content: `
# Configuración Técnica - Sonido

## Equipo Principal
- **Consola:** {{MIXER_MODEL}}
- **PA System:** {{PA_SYSTEM}}
- **Monitores:** {{MONITOR_SETUP}}

## Configuración DJ
- **CDJ:** {{CDJ_MODEL}}
- **Mixer DJ:** {{DJ_MIXER}}
- **Conexiones:** {{DJ_CONNECTIONS}}

## Playlist Serpiente
- Track específico para 03:00
- Fade in/out coordinado con FX
        `,
        variables: ["MIXER_MODEL", "PA_SYSTEM", "MONITOR_SETUP", "CDJ_MODEL", "DJ_MIXER", "DJ_CONNECTIONS"],
        required: true,
      },
    ],
    defaultSchedule: [
      { time: "22:00", activity: "Setup consola y PA", responsible: "Sonidista", location: "FOH" },
      { time: "23:00", activity: "Prueba de sonido", responsible: "Sonidista/DJ", location: "FOH/Cabina" },
      { time: "00:30", activity: "Inicio música ambiente", responsible: "Sonidista", location: "FOH" },
      { time: "03:00", activity: "Track Serpiente", responsible: "Sonidista/DJ", location: "FOH" },
      { time: "06:00", activity: "Fade out final", responsible: "Sonidista", location: "FOH" },
    ],
  },
  {
    id: "boleteria",
    name: "Manual de Boletería",
    role: "Responsable de Boletería",
    description: "Procedimientos de venta y control de acceso",
    sections: [
      {
        id: "pricing",
        title: "Precios y Modalidades",
        content: `
# Precios y Modalidades de Pago

## Precios
- **General:** ${{ PRICE_GENERAL }}
- **VIP:** ${{ PRICE_VIP }}
- **Upgrade:** ${{ PRICE_UPGRADE }}

## Medios de Pago
- Efectivo
- Mercado Pago
- Transferencia

## Procedimientos
1. Verificar disponibilidad
2. Procesar pago
3. Entregar pulsera correspondiente
4. Registrar en planilla
        `,
        variables: ["PRICE_GENERAL", "PRICE_VIP", "PRICE_UPGRADE"],
        required: true,
      },
    ],
    defaultSchedule: [
      { time: "00:00", activity: "Setup caja y sistema", responsible: "Boletero", location: "Entrada" },
      { time: "00:30", activity: "Inicio de ventas", responsible: "Boletero", location: "Entrada" },
      { time: "06:00", activity: "Cierre de caja", responsible: "Boletero", location: "Entrada" },
      { time: "06:30", activity: "Arqueo final", responsible: "Boletero/Producción", location: "Oficina" },
    ],
  },
]

// Función para generar variables del evento
export function extractEventVariables(event: Event): Record<string, string> {
  return {
    EVENT_TITLE: event.title || "",
    EVENT_DATE: new Date(event.date).toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    VENUE_NAME: event.venue || "",
    VENUE_ADDRESS: event.address || "",
    OPENING_TIME: event.openingTime || "00:30",
    CLOSING_TIME: event.closingTime || "06:00",
    SETUP_START_TIME: event.setupStartTime || "18:00",
    TEARDOWN_TIME: event.teardownTime || "08:00",
    PRODUCER_NAME: event.producerContact?.name || "",
    PRODUCER_PHONE: event.producerContact?.phone || "",
    PRODUCER_EMAIL: event.producerContact?.email || "",
    EVENT_THEME: event.theme || "general",
    EVENT_DESCRIPTION: event.description || "",
    // Valores por defecto técnicos
    SCREEN_RESOLUTION: "1920x1080",
    VIDEO_FORMAT: "MP4/MOV",
    CONNECTION_TYPE: "HDMI/SDI",
    MIXER_MODEL: "Por definir",
    PA_SYSTEM: "Sistema del venue",
    MONITOR_SETUP: "Monitores de cabina",
    CDJ_MODEL: "CDJ-2000NXS2",
    DJ_MIXER: "DJM-900NXS2",
    DJ_CONNECTIONS: "USB/RCA",
    PRICE_GENERAL: "15000",
    PRICE_VIP: "25000",
    PRICE_UPGRADE: "10000",
    VENUE_CONTACT: "Contacto del venue",
    SECURITY_CONTACT: "Jefe de seguridad",
  }
}

// Función para reemplazar variables en el contenido
export function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g")
    result = result.replace(regex, value)
  })
  return result
}

// Función principal para generar manual
export function generateManual(
  eventId: string,
  templateId: string,
  responses: Record<string, string> = {},
): GeneratedManual | null {
  const { events, tasks, providers } = useUnifiedEventStore.getState()

  const event = events.find((e) => e.id === eventId)
  const template = MANUAL_TEMPLATES.find((t) => t.id === templateId)

  if (!event || !template) return null

  const eventVariables = extractEventVariables(event)
  const allVariables = { ...eventVariables, ...responses }

  // Generar contenido procesando todas las secciones
  let fullContent = `# ${template.name}\n\n`
  fullContent += `**Evento:** ${event.title}\n`
  fullContent += `**Fecha:** ${eventVariables.EVENT_DATE}\n`
  fullContent += `**Rol:** ${template.role}\n\n`

  template.sections.forEach((section) => {
    fullContent += `\n## ${section.title}\n\n`
    fullContent += replaceVariables(section.content, allVariables)
    fullContent += "\n\n"
  })

  // Agregar cronograma
  fullContent += "\n## Cronograma\n\n"
  template.defaultSchedule.forEach((item) => {
    fullContent += `- **${item.time}**: ${item.activity}`
    if (item.responsible) fullContent += ` (${item.responsible})`
    if (item.location) fullContent += ` - ${item.location}`
    if (item.notes) fullContent += ` - ${item.notes}`
    fullContent += "\n"
  })

  // Agregar información de tareas relacionadas
  const eventTasks = tasks.filter((t) => t.eventId === eventId)
  if (eventTasks.length > 0) {
    fullContent += "\n## Tareas Relacionadas\n\n"
    eventTasks.forEach((task) => {
      fullContent += `- **${task.title}** (${task.assignee}) - ${task.status}\n`
    })
  }

  return {
    id: `manual-${eventId}-${templateId}-${Date.now()}`,
    eventId,
    templateId,
    title: `${template.name} - ${event.title}`,
    content: fullContent,
    schedule: template.defaultSchedule,
    metadata: {
      generatedAt: new Date().toISOString(),
      eventData: event,
      responses,
    },
    collaborators: [eventVariables.PRODUCER_NAME || "Productor"],
    version: 1,
    status: "draft",
  }
}

// Función para exportar a diferentes formatos
export function exportManual(manual: GeneratedManual, format: "docx" | "pdf" | "markdown"): string {
  switch (format) {
    case "markdown":
      return manual.content
    case "docx":
      // En una implementación real, usaríamos una librería como docx
      return `Exportación DOCX no implementada. Contenido:\n\n${manual.content}`
    case "pdf":
      // En una implementación real, usaríamos una librería como jsPDF
      return `Exportación PDF no implementada. Contenido:\n\n${manual.content}`
    default:
      return manual.content
  }
}

// Función para obtener estadísticas de manuales
export function getManualsStats(eventId?: string) {
  // En una implementación real, esto vendría del store
  return {
    totalManuals: 0,
    draftManuals: 0,
    publishedManuals: 0,
    collaborators: 0,
  }
}

// Función para simular colaboración en tiempo real
export function initializeCollaboration(manualId: string) {
  // En una implementación real, esto inicializaría WebSockets o similar
  console.log(`Inicializando colaboración para manual ${manualId}`)

  return {
    addCollaborator: (userId: string) => console.log(`Agregado colaborador ${userId}`),
    removeCollaborator: (userId: string) => console.log(`Removido colaborador ${userId}`),
    addComment: (text: string, position: number) => console.log(`Comentario agregado: ${text}`),
    updateContent: (content: string) => console.log(`Contenido actualizado`),
    getPresence: () => ({ users: [], cursors: [] }),
  }
}
