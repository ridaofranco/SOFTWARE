// Centralized data service for the event management system
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define types for our data models
export type ItemCategory = "Arte" | "Booking" | "Marketing"
export type ItemStatus = "Completado" | "En curso" | "No iniciado" | "Sin estado"
export type PaymentMethod =
  | "Efectivo - Antes del Evento"
  | "Efectivo - En el Evento"
  | "Efectivo - Post Evento"
  | "Transferencia - Antes del Evento"
  | "Transferencia - En el Evento"
  | "Transferencia - Post Evento"
  | "MercadoPago - Antes del Evento"
  | "MercadoPago - En el Evento"
  | "MercadoPago - Post Evento"
  | "Otro"
  | "NO VA"
  | string

export type BudgetItem = {
  id: string
  name: string
  budget: number
  closed: number
  negotiationResult: number
  deviation: number
  paymentMethod: PaymentMethod
  productionStatus: ItemStatus
  comments: string
  area: ItemCategory
  responsible: string
  contact: string
  document: string
  contingencyPlan: string
  eventId: string
}

export type Task = {
  id: string
  title: string
  description: string
  dueDate: string
  priority: "alta" | "media" | "baja"
  status: "completada" | "pendiente"
  eventId: string
  assignedTo: string
}

export type EventStatus = "active" | "completed" | "planning"

export type Event = {
  id: string
  title: string
  location: string
  date: string
  endDate?: string | null
  venue: string
  theme: string
  status: EventStatus
  progress: number
  pendingTasks: number
  budget: number
  actual: number
  notes?: string
  items: BudgetItem[]
}

// Create the store
interface EventStoreState {
  events: Event[]
  tasks: Task[]
  addEvent: (event: Omit<Event, "id"> & { id?: string }) => string
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void
  getEvent: (id: string) => Event | undefined
  getActiveEvents: () => Event[]
  getCompletedEvents: () => Event[]

  // Budget items methods
  addBudgetItem: (item: Omit<BudgetItem, "id"> & { id?: string }) => string
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void
  deleteBudgetItem: (id: string) => void
  getBudgetItemsByEvent: (eventId: string) => BudgetItem[]
  getBudgetItemsByArea: (eventId: string, area: ItemCategory) => BudgetItem[]

  // Task methods
  addTask: (task: Omit<Task, "id"> & { id?: string }) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByEvent: (eventId: string) => Task[]

  // Analytics methods
  getTotalBudgetAllEvents: () => number
  getTotalActualAllEvents: () => number
  getTotalDeviationAllEvents: () => number
  getTotalBudgetByEvent: (eventId: string) => number
  getTotalActualByEvent: (eventId: string) => number
  getTotalDeviationByEvent: (eventId: string) => number
  getBudgetByArea: (area: ItemCategory) => number
  getActualByArea: (area: ItemCategory) => number
}

// Define initial data
const initialEvents: Event[] = [
  {
    id: "haedo-25-04",
    title: "HAEDO - 25/04",
    location: "HAEDO",
    date: "2025-04-25",
    venue: "Auditorio Oeste",
    theme: "Viaje al Puerto Desconocido",
    status: "active",
    progress: 85,
    pendingTasks: 15,
    budget: 0, // Will be calculated from items
    actual: 0, // Will be calculated from items
    items: [],
  },
]

// Default budget items for each category
export const getDefaultItems = (eventId: string): BudgetItem[] => {
  let id = 1
  const createItem = (name: string, area: ItemCategory): BudgetItem => ({
    id: `${eventId}-item-${id++}`,
    name,
    budget: 0,
    closed: 0,
    negotiationResult: 0,
    deviation: 0,
    paymentMethod: "",
    productionStatus: "No iniciado",
    comments: "",
    area,
    responsible: "",
    contact: "",
    document: "",
    contingencyPlan: "",
    eventId,
  })

  // Arte items
  const arteItems = [
    "Dirección de artistas",
    "VJ",
    "Glitter",
    "Peinados",
    "Tattoo",
    "Maquillaje",
    "Escenografía",
    "Pantallas",
    "Pista",
    "Fx",
    "Máquina de Humo",
    "Luces Extras",
    "Iluminador",
    "Asistente de Iluminación",
    "Sonidista",
    "Agregados sonido",
    "Bola Disco",
    "Presentación",
    "Actores + Serpiente",
    "Escenario extra",
    "Riggers",
    "Peones Carga y Descarga",
    "Peones Pista",
    "Peon de Escenografía",
    "Flete",
    "Depósito",
    "Ignifugado",
    "Personal eléctrico armado",
    "Movilidad",
    "Productos de limpieza",
    "Tintorería",
  ].map((name) => createItem(name, "Arte"))

  // Booking items
  const bookingItems = [
    "DJ",
    "Armado de Lista",
    "CDJ",
    "Boletero",
    "CDJ Falsa",
    "Cabina DJ",
    "Validadores QR",
    "Seguro de accidentes personales",
    "Paramédicos",
    "Ambulancia",
    "Precintos (Pulseras)",
    "Asistente de producción",
    "Asistentes",
    "Aduana",
    "Hospedaje",
    "Viáticos",
    "Grupo electrógeno",
    "Gasoil Generador",
    "Consumo en venue",
    "Camareras extra",
    "Policías",
    "Seguridad",
    "Espacio Públicos",
    "SADAIC",
    "ADICAPIF",
    "Horas extra personal - Montaje",
    "Limpieza de pista",
    "Asistente de puerta",
  ].map((name) => createItem(name, "Booking"))

  // Marketing items
  const marketingItems = [
    "Creadora de contenido",
    "Filmaker",
    "Fotografia",
    "Merch",
    "PR",
    "Consumo Influencers",
    "Impresiones y Señalética",
  ].map((name) => createItem(name, "Marketing"))

  return [...arteItems, ...bookingItems, ...marketingItems]
}

// Initial tasks
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Confirmar permisos municipales",
    description: "Verificar que todos los permisos estén aprobados para HAEDO",
    dueDate: "2025-04-15",
    priority: "media",
    status: "completada",
    eventId: "haedo-25-04",
    assignedTo: "Juan Pérez",
  },
  {
    id: "task-2",
    title: "Finalizar diseño de flyers",
    description: "Aprobar diseño final de flyers para promoción en redes",
    dueDate: "2025-04-10",
    priority: "media",
    status: "pendiente",
    eventId: "haedo-25-04",
    assignedTo: "María López",
  },
  {
    id: "task-3",
    title: "Coordinar transporte de equipos",
    description: "Organizar logística para traslado de equipos de sonido",
    dueDate: "2025-04-22",
    priority: "baja",
    status: "pendiente",
    eventId: "haedo-25-04",
    assignedTo: "Diego Fernández",
  },
]

// Initialize haedo event with default items
const haedoEvent = initialEvents.find((e) => e.id === "haedo-25-04")
if (haedoEvent) {
  const haedoItems = getDefaultItems(haedoEvent.id)

  // Set a few values for the haedo event
  haedoItems.forEach((item) => {
    if (item.name === "VJ") {
      item.budget = 100000
      item.closed = 140000
      item.negotiationResult = -40000
      item.deviation = -40
      item.productionStatus = "Completado"
      item.paymentMethod = "Transferencia - Post Evento"
      item.responsible = "JUANO"
      item.contact = "FRANCO"
    } else if (item.name === "Glitter") {
      item.budget = 120000
      item.closed = 60000
      item.negotiationResult = 60000
      item.deviation = 50
      item.productionStatus = "Completado"
      item.paymentMethod = "Efectivo - En el Evento"
      item.responsible = "PABLO"
      item.comments = "Que no se vaya sin cobrar"
    } else if (item.name === "DJ") {
      item.budget = 60000
      item.closed = 120000
      item.negotiationResult = -60000
      item.deviation = -100
      item.productionStatus = "Completado"
      item.responsible = "FUNKILLER"
    }
  })

  haedoEvent.items = haedoItems

  // Calculate budget and actual totals
  haedoEvent.budget = haedoItems.reduce((sum, item) => sum + item.budget, 0)
  haedoEvent.actual = haedoItems.reduce((sum, item) => sum + item.closed, 0)
}

// Create and export the store
export const useEventStore = create<EventStoreState>()(
  persist(
    (set, get) => ({
      events: initialEvents,
      tasks: initialTasks,

      // Event methods
      addEvent: (eventData) => {
        const id = eventData.id || `event-${Date.now()}`
        const newEvent: Event = {
          id,
          title: eventData.title,
          location: eventData.location,
          date: eventData.date,
          endDate: eventData.endDate,
          venue: eventData.venue,
          theme: eventData.theme,
          status: eventData.status || "planning",
          progress: eventData.progress || 0,
          pendingTasks: eventData.pendingTasks || 0,
          budget: 0,
          actual: 0,
          notes: eventData.notes,
          items: [],
        }

        // Add default items if not provided
        if (!eventData.items || eventData.items.length === 0) {
          newEvent.items = getDefaultItems(id)
        } else {
          newEvent.items = eventData.items
        }

        // Calculate budget and actual totals
        newEvent.budget = newEvent.items.reduce((sum, item) => sum + item.budget, 0)
        newEvent.actual = newEvent.items.reduce((sum, item) => sum + item.closed, 0)

        set((state) => ({
          events: [...state.events, newEvent],
        }))

        return id
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) => (event.id === id ? { ...event, ...updates } : event)),
        }))
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          tasks: state.tasks.filter((task) => task.eventId !== id),
        }))
      },

      getEvent: (id) => {
        return get().events.find((event) => event.id === id)
      },

      // Memoize these functions to prevent unnecessary re-renders
      getActiveEvents: () => {
        return get().events.filter((event) => event.status === "active")
      },

      getCompletedEvents: () => {
        return get().events.filter((event) => event.status === "completed")
      },

      // Budget item methods
      addBudgetItem: (itemData) => {
        const id = itemData.id || `item-${Date.now()}`
        const newItem: BudgetItem = {
          id,
          ...itemData,
          negotiationResult: itemData.budget - itemData.closed,
          deviation: itemData.budget > 0 ? ((itemData.budget - itemData.closed) / itemData.budget) * 100 : 0,
        }

        // Add the item
        set((state) => {
          const updatedEvents = state.events.map((event) => {
            if (event.id === itemData.eventId) {
              const updatedItems = [...event.items, newItem]

              // Recalculate event budget and actual
              const budget = updatedItems.reduce((sum, item) => sum + item.budget, 0)
              const actual = updatedItems.reduce((sum, item) => sum + item.closed, 0)

              return {
                ...event,
                items: updatedItems,
                budget,
                actual,
              }
            }
            return event
          })

          return { events: updatedEvents }
        })

        return id
      },

      updateBudgetItem: (id, updates) => {
        set((state) => {
          const updatedEvents = state.events.map((event) => {
            // Check if this event contains the item
            const itemIndex = event.items.findIndex((item) => item.id === id)
            if (itemIndex === -1) return event

            // Create updated items array
            const updatedItems = [...event.items]

            // Apply updates
            const oldItem = updatedItems[itemIndex]
            const newItem = { ...oldItem, ...updates }

            // Recalculate negotiationResult and deviation if budget or closed changed
            if (updates.budget !== undefined || updates.closed !== undefined) {
              newItem.negotiationResult = newItem.budget - newItem.closed
              newItem.deviation = newItem.budget > 0 ? (newItem.negotiationResult / newItem.budget) * 100 : 0
            }

            updatedItems[itemIndex] = newItem

            // Recalculate event budget and actual
            const budget = updatedItems.reduce((sum, item) => sum + item.budget, 0)
            const actual = updatedItems.reduce((sum, item) => sum + item.closed, 0)

            return {
              ...event,
              items: updatedItems,
              budget,
              actual,
            }
          })

          return { events: updatedEvents }
        })
      },

      deleteBudgetItem: (id) => {
        set((state) => {
          const updatedEvents = state.events.map((event) => {
            // Check if this event contains the item
            if (!event.items.some((item) => item.id === id)) return event

            // Filter out the deleted item
            const updatedItems = event.items.filter((item) => item.id !== id)

            // Recalculate event budget and actual
            const budget = updatedItems.reduce((sum, item) => sum + item.budget, 0)
            const actual = updatedItems.reduce((sum, item) => sum + item.closed, 0)

            return {
              ...event,
              items: updatedItems,
              budget,
              actual,
            }
          })

          return { events: updatedEvents }
        })
      },

      getBudgetItemsByEvent: (eventId) => {
        const event = get().events.find((e) => e.id === eventId)
        return event ? event.items : []
      },

      getBudgetItemsByArea: (eventId, area) => {
        const event = get().events.find((e) => e.id === eventId)
        return event ? event.items.filter((item) => item.area === area) : []
      },

      // Task methods
      addTask: (taskData) => {
        const id = taskData.id || `task-${Date.now()}`
        const newTask: Task = {
          id,
          ...taskData,
        }

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))

        // Update event pending tasks count
        if (taskData.eventId) {
          const event = get().getEvent(taskData.eventId)
          if (event) {
            get().updateEvent(taskData.eventId, {
              pendingTasks: event.pendingTasks + 1,
            })
          }
        }

        return id
      },

      updateTask: (id, updates) => {
        set((state) => {
          // Get the old task to check status changes
          const oldTask = state.tasks.find((t) => t.id === id)

          const updatedTasks = state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))

          // If status changed from pending to completed or vice versa, update event
          if (oldTask && updates.status && oldTask.status !== updates.status) {
            const event = get().getEvent(oldTask.eventId)
            if (event) {
              // If becoming completed, reduce pending count
              // If becoming pending, increase pending count
              const pendingChange = updates.status === "completada" ? -1 : 1

              get().updateEvent(oldTask.eventId, {
                pendingTasks: Math.max(0, event.pendingTasks + pendingChange),
              })
            }
          }

          return { tasks: updatedTasks }
        })
      },

      deleteTask: (id) => {
        const taskToDelete = get().tasks.find((t) => t.id === id)

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))

        // Update event pending tasks count if task was pending
        if (taskToDelete && taskToDelete.status === "pendiente") {
          const event = get().getEvent(taskToDelete.eventId)
          if (event) {
            get().updateEvent(taskToDelete.eventId, {
              pendingTasks: Math.max(0, event.pendingTasks - 1),
            })
          }
        }
      },

      getTasksByEvent: (eventId) => {
        return get().tasks.filter((task) => task.eventId === eventId)
      },

      // Analytics methods
      getTotalBudgetAllEvents: () => {
        return get().events.reduce((sum, event) => sum + event.budget, 0)
      },

      getTotalActualAllEvents: () => {
        return get().events.reduce((sum, event) => sum + event.actual, 0)
      },

      getTotalDeviationAllEvents: () => {
        const totalBudget = get().getTotalBudgetAllEvents()
        const totalActual = get().getTotalActualAllEvents()
        return totalBudget > 0 ? ((totalBudget - totalActual) / totalBudget) * 100 : 0
      },

      getTotalBudgetByEvent: (eventId) => {
        const event = get().getEvent(eventId)
        return event ? event.budget : 0
      },

      getTotalActualByEvent: (eventId) => {
        const event = get().getEvent(eventId)
        return event ? event.actual : 0
      },

      getTotalDeviationByEvent: (eventId) => {
        const event = get().getEvent(eventId)
        if (!event) return 0

        return event.budget > 0 ? ((event.budget - event.actual) / event.budget) * 100 : 0
      },

      getBudgetByArea: (area) => {
        return get().events.reduce((sum, event) => {
          const areaItems = event.items.filter((item) => item.area === area)
          return sum + areaItems.reduce((itemSum, item) => itemSum + item.budget, 0)
        }, 0)
      },

      getActualByArea: (area) => {
        return get().events.reduce((sum, event) => {
          const areaItems = event.items.filter((item) => item.area === area)
          return sum + areaItems.reduce((itemSum, item) => itemSum + item.closed, 0)
        }, 0)
      },
    }),
    {
      name: "event-management-store",
    },
  ),
)
