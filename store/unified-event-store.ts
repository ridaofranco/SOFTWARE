import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DateTime } from "luxon"

// Types
export interface Event {
  id: string
  title: string
  date: string
  venue: string
  status: "pending" | "confirmed" | "cancelled"
  type: "propio" | "privado" | "feriado"
  description?: string
  theme?: string
  emoji?: string
  budget?: number
  attendees?: number
  address?: string
  openingTime?: string
  closingTime?: string
  setupStartTime?: string
  teardownTime?: string
  loadingPoint?: string
  producerContact?: {
    name: string
    phone: string
    email: string
  }
  hasLocalPermit?: boolean
  hasAlcoholPermit?: boolean
  notes?: string
  providers?: any[]
  venueId?: string
}

export interface Venue {
  id: string
  nombre: string
  direccion: string // renamed from location to direccion for consistency
  capacity?: number
  type?: "club" | "salon" | "outdoor" | "teatro"
  contact?: string
  rating?: number
  permits?: {
    localPermit?: {
      hasPermit: boolean
      expiryDate?: string
      documentUrl?: string
      notes?: string
    }
    alcoholPermit?: {
      hasPermit: boolean
      expiryDate?: string
      documentUrl?: string
      notes?: string
    }
    firePermit?: {
      hasPermit: boolean
      expiryDate?: string
      documentUrl?: string
      notes?: string
    }
    capacityPermit?: {
      hasPermit: boolean
      expiryDate?: string
      documentUrl?: string
      maxCapacity?: number
      notes?: string
    }
  }
  lastInspectionDate?: string
  nextInspectionDate?: string
  notes?: string
}

export interface Provider {
  id: string
  name: string
  category: string
  contact: string
  rating?: number
  services: string[]
  priceRange: string
  item?: string
  price?: string
  paymentMethod?: string
  status?: string
  staff?: string
  insurance?: string
  deadline?: string
  observations?: string
  blocked?: boolean
  blockReason?: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  assignee: string
  dueDate: string
  eventId?: string
  category: string
  isAutomated?: boolean
  automatedTaskType?: "pasajes" | "hoteleria" | "aduana_ida" | "aduana_vuelta"
  daysUntilEvent?: number
  createdAt?: string
  updatedAt?: string
}

export interface Contract {
  id: string
  type: "bailarin" | "tecnico"
  name: string
  email: string
  phone: string
  rate: number
  status: "active" | "inactive" | "draft" | "sent" | "signed"
  startDate: string
  endDate?: string
  skills: string[]
  eventIds: string[]
  providerName?: string
  contractorName?: string
  amount?: number
  date?: string
}

export interface BudgetItem {
  id: string
  area: string
  item: string
  cantidad: number
  precioUnitario: number
  precioTotal: number
  resultadoNegociacion: number
  desviacion?: number
  status: "pending" | "approved" | "paid"
  vendor?: string
  eventId: string
  category?: string
  description?: string
  estimatedCost?: number
  actualCost?: number
}

export interface ChatMessage {
  id: string
  content: string
  message: string
  sender: string
  timestamp: string
  type: "text" | "file" | "image"
  eventId?: string
}

export interface Chat {
  id: string
  name: string
  participants: string[]
  messages: ChatMessage[]
  lastMessage?: string
  lastActivity: string
  eventId?: string
}

export const getArgentinaTime = () => {
  return DateTime.now().setZone("America/Argentina/Buenos_Aires")
}

export const getUpcoming30DaysEvents = (events: Event[]) => {
  const nowAR = getArgentinaTime()
  const thirtyDaysFromNow = nowAR.plus({ days: 30 })

  return events
    .filter((event) => {
      const eventDate = DateTime.fromISO(event.date).setZone("America/Argentina/Buenos_Aires")
      return eventDate >= nowAR && eventDate <= thirtyDaysFromNow
    })
    .sort((a, b) => {
      const dateA = DateTime.fromISO(a.date)
      const dateB = DateTime.fromISO(b.date)
      return dateA.toMillis() - dateB.toMillis()
    })
}

export const getEventCountdown = (eventDate: string) => {
  const nowAR = getArgentinaTime()
  const eventDateTime = DateTime.fromISO(eventDate).setZone("America/Argentina/Buenos_Aires")

  if (eventDateTime <= nowAR) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true }
  }

  const diff = eventDateTime.diff(nowAR, ["days", "hours", "minutes"])
  return {
    days: Math.floor(diff.days),
    hours: Math.floor(diff.hours),
    minutes: Math.floor(diff.minutes),
    isExpired: false,
  }
}

interface UnifiedEventStore {
  // State
  events: Event[]
  venues: Venue[]
  providers: Provider[]
  tasks: Task[]
  contracts: Contract[]
  budgetItems: BudgetItem[]
  chats: Chat[]
  chatMessages: ChatMessage[]

  // Event actions
  addEvent: (event: Event) => void
  updateEvent: (id: string, event: Partial<Event>) => void
  deleteEvent: (id: string) => void
  getEvent: (id: string) => Event | undefined

  // Venue actions
  addVenue: (venue: Venue) => void
  updateVenue: (id: string, venue: Partial<Venue>) => void
  deleteVenue: (id: string) => void
  getVenue: (id: string) => Venue | undefined

  // Provider actions
  addProvider: (provider: Partial<Provider>) => void
  updateProvider: (id: string, provider: Partial<Provider>) => void
  deleteProvider: (id: string) => void
  getProvider: (id: string) => Provider | undefined
  rateProvider: (id: string, rating: number) => void
  blockProvider: (id: string, reason: string) => void

  // Task actions
  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTask: (id: string) => Task | undefined

  // Contract actions
  addContract: (contract: Contract) => void
  updateContract: (id: string, contract: Partial<Contract>) => void
  deleteContract: (id: string) => void
  getContract: (id: string) => Contract | undefined

  // Budget actions
  addBudgetItem: (item: BudgetItem) => void
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void
  deleteBudgetItem: (id: string) => void
  getBudgetItem: (id: string) => BudgetItem | undefined

  // Chat actions
  addChat: (chat: Chat) => void
  updateChat: (id: string, chat: Partial<Chat>) => void
  deleteChat: (id: string) => void
  getChat: (id: string) => Chat | undefined
  addMessage: (chatId: string, message: ChatMessage) => void

  getUpcoming30DaysEvents: () => Event[]
  getArgentinaTime: () => DateTime

  getVenuesWithExpiringPermits: () => Venue[]
  getVenuePermitStatus: (venueId: string) => {
    hasValidPermits: boolean
    expiringPermits: string[]
    expiredPermits: string[]
  }
  validateVenueForEvent: (
    venueId: string,
    eventDate: string,
  ) => {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }
}

export const useUnifiedEventStore = create<UnifiedEventStore>()(
  persist(
    (set, get) => ({
      // Initial state
      events: [
        {
          id: "event-1",
          title: "Noche Electrónica - Warehouse",
          date: "2025-01-25",
          venue: "Warehouse Club",
          venueId: "venue-1",
          status: "confirmed",
          type: "propio",
          description: "Evento de música electrónica con DJs internacionales",
          theme: "Underground Electronic",
          emoji: "🎵",
          budget: 150000,
          attendees: 800,
          address: "Av. Corrientes 1234, CABA",
          openingTime: "00:30",
          closingTime: "06:00",
          setupStartTime: "22:00",
          teardownTime: "08:00",
          loadingPoint: "Puerta trasera - Dock 2",
          producerContact: {
            name: "Franco Martinez",
            phone: "+54 11 1234-5678",
            email: "franco@eventos.com",
          },
          hasLocalPermit: true,
          hasAlcoholPermit: true,
          notes: "Evento confirmado con lineup internacional",
        },
        {
          id: "event-2",
          title: "Fiesta Privada - Cumpleaños VIP",
          date: "2025-01-30",
          venue: "Salón Dorado",
          venueId: "venue-2",
          status: "pending",
          type: "privado",
          description: "Celebración privada para 200 invitados",
          theme: "Elegante Dorado",
          emoji: "🥂",
          budget: 80000,
          attendees: 200,
          address: "Puerto Madero, CABA",
          openingTime: "21:00",
          closingTime: "03:00",
          setupStartTime: "18:00",
          teardownTime: "05:00",
          producerContact: {
            name: "Pablo Rodriguez",
            phone: "+54 11 9876-5432",
            email: "pablo@eventos.com",
          },
          hasLocalPermit: true,
          hasAlcoholPermit: false,
          notes: "Pendiente confirmación de catering",
        },
        {
          id: "event-3",
          title: "Festival de Verano",
          date: "2025-02-15",
          venue: "Parque Centenario",
          venueId: "venue-3",
          status: "confirmed",
          type: "propio",
          description: "Festival al aire libre con múltiples escenarios",
          theme: "Summer Vibes",
          emoji: "☀️",
          budget: 300000,
          attendees: 2000,
          address: "Parque Centenario, CABA",
          openingTime: "16:00",
          closingTime: "02:00",
          setupStartTime: "10:00",
          teardownTime: "06:00",
          producerContact: {
            name: "Franco Martinez",
            phone: "+54 11 1234-5678",
            email: "franco@eventos.com",
          },
          hasLocalPermit: true,
          hasAlcoholPermit: true,
          notes: "Requiere coordinación con múltiples proveedores",
        },
      ],

      venues: [
        {
          id: "venue-1",
          nombre: "Warehouse Club",
          direccion: "Av. Corrientes 1234, CABA",
          capacity: 1000,
          type: "club",
          contact: "warehouse@club.com",
          rating: 4.5,
          permits: {
            localPermit: {
              hasPermit: true,
              expiryDate: "2025-06-15",
              documentUrl: "/docs/warehouse-local-permit.pdf",
              notes: "Renovado recientemente",
            },
            alcoholPermit: {
              hasPermit: true,
              expiryDate: "2025-03-20",
              documentUrl: "/docs/warehouse-alcohol-permit.pdf",
              notes: "Próximo a vencer",
            },
            firePermit: {
              hasPermit: true,
              expiryDate: "2025-08-10",
              documentUrl: "/docs/warehouse-fire-permit.pdf",
            },
            capacityPermit: {
              hasPermit: true,
              expiryDate: "2025-12-31",
              maxCapacity: 1000,
              notes: "Capacidad máxima verificada",
            },
          },
          lastInspectionDate: "2024-12-01",
          nextInspectionDate: "2025-06-01",
          notes: "Venue principal para eventos electrónicos",
        },
        {
          id: "venue-2",
          nombre: "Salón Dorado",
          direccion: "Puerto Madero, CABA",
          capacity: 300,
          type: "salon",
          contact: "eventos@salonDorado.com",
          rating: 4.8,
          permits: {
            localPermit: {
              hasPermit: true,
              expiryDate: "2025-04-15",
              documentUrl: "/docs/salon-local-permit.pdf",
            },
            alcoholPermit: {
              hasPermit: false,
              notes: "En trámite de renovación",
            },
            firePermit: {
              hasPermit: true,
              expiryDate: "2025-07-20",
            },
          },
          notes: "Ideal para eventos privados elegantes",
        },
        {
          id: "venue-3",
          nombre: "Parque Centenario",
          direccion: "Parque Centenario, CABA",
          capacity: 5000,
          type: "outdoor",
          contact: "permisos@gcba.gov.ar",
          rating: 4.2,
          permits: {
            localPermit: {
              hasPermit: true,
              expiryDate: "2025-12-31",
              notes: "Permiso anual del GCBA",
            },
            alcoholPermit: {
              hasPermit: true,
              expiryDate: "2025-12-31",
            },
            firePermit: {
              hasPermit: true,
              expiryDate: "2025-12-31",
            },
          },
          notes: "Espacio público - requiere permisos especiales",
        },
      ],

      providers: [
        {
          id: "provider-1",
          name: "DJ Martín Electro",
          category: "BOOKING",
          contact: "martin@djelectro.com",
          rating: 4.7,
          services: ["DJ Set", "Música Electrónica", "House", "Techno"],
          priceRange: "$$$",
          item: "DJ Principal",
          price: "$25000",
          paymentMethod: "Transferencia",
          status: "Confirmado",
          staff: "1 DJ + 1 Técnico",
          insurance: "Cobertura completa",
          deadline: "2025-01-20",
          observations: "Requiere rider técnico específico",
        },
        {
          id: "provider-2",
          name: "Iluminación Pro",
          category: "ARTE",
          contact: "info@iluminacionpro.com",
          rating: 4.5,
          services: ["Iluminación LED", "Moving Lights", "Láser", "Humo"],
          priceRange: "$$$$",
          item: "Setup Completo Iluminación",
          price: "$45000",
          paymentMethod: "50% Adelanto",
          status: "Cotización",
          staff: "2 Técnicos",
          insurance: "Equipos asegurados",
          deadline: "2025-01-22",
          observations: "Incluye operador durante evento",
        },
        {
          id: "provider-3",
          name: "Seguridad Total",
          category: "BOOKING",
          contact: "operaciones@seguridadtotal.com",
          rating: 4.3,
          services: ["Seguridad", "Control Acceso", "Vigilancia"],
          priceRange: "$$",
          item: "8 Agentes de Seguridad",
          price: "$18000",
          paymentMethod: "Transferencia",
          status: "Disponibilidad",
          staff: "8 Agentes",
          insurance: "Responsabilidad civil",
          deadline: "2025-01-25",
          observations: "Experiencia en eventos nocturnos",
        },
      ],

      tasks: [
        {
          id: "task-1",
          title: "Confirmar DJ Principal",
          description: "Contactar y confirmar disponibilidad del DJ para el evento del 25/01",
          status: "completed",
          priority: "high",
          assignee: "FRANCO",
          dueDate: "2025-01-20",
          eventId: "event-1",
          category: "BOOKING",
          isAutomated: true,
          createdAt: "2025-01-15",
          updatedAt: "2025-01-18",
        },
        {
          id: "task-2",
          title: "Setup Iluminación y Sonido",
          description: "Coordinar instalación de equipos de iluminación y sonido",
          status: "in-progress",
          priority: "high",
          assignee: "PABLO",
          dueDate: "2025-01-24",
          eventId: "event-1",
          category: "ARTE",
          isAutomated: true,
          createdAt: "2025-01-15",
        },
        {
          id: "task-3",
          title: "Confirmar Catering",
          description: "Definir menú y confirmar servicio de catering para evento privado",
          status: "pending",
          priority: "medium",
          assignee: "FRANCO",
          dueDate: "2025-01-28",
          eventId: "event-2",
          category: "EXTRAS DE PRODUCCIÓN",
          isAutomated: true,
          createdAt: "2025-01-16",
        },
      ],

      contracts: [],
      budgetItems: [],
      chats: [],
      chatMessages: [],

      // Event actions
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      updateEvent: (id, eventUpdate) =>
        set((state) => ({
          events: state.events.map((event) => (event.id === id ? { ...event, ...eventUpdate } : event)),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        })),

      getEvent: (id) => get().events.find((event) => event.id === id),

      // Venue actions
      addVenue: (venue) =>
        set((state) => ({
          venues: [...state.venues, { ...venue, id: `venue-${Date.now()}` }],
        })),

      updateVenue: (id, venueUpdate) =>
        set((state) => ({
          venues: state.venues.map((venue) => (venue.id === id ? { ...venue, ...venueUpdate } : venue)),
        })),

      deleteVenue: (id) =>
        set((state) => ({
          venues: state.venues.filter((venue) => venue.id !== id),
        })),

      getVenue: (id) => get().venues.find((venue) => venue.id === id),

      // Provider actions
      addProvider: (providerData) => {
        const id = `provider-${Date.now()}`
        const newProvider: Provider = {
          id,
          name: providerData.name || "",
          category: providerData.category || "ARTE",
          contact: providerData.contact || "",
          rating: providerData.rating || 0,
          services: providerData.services || [],
          priceRange: providerData.priceRange || "$$",
          item: providerData.item || "",
          price: providerData.price || "",
          paymentMethod: providerData.paymentMethod || "Transferencia",
          status: providerData.status || "Disponibilidad",
          staff: providerData.staff || "",
          insurance: providerData.insurance || "",
          deadline: providerData.deadline || "",
          observations: providerData.observations || "",
          blocked: false,
          blockReason: "",
        }

        set((state) => ({
          providers: [...state.providers, newProvider],
        }))
      },

      updateProvider: (id, providerUpdate) =>
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === id ? { ...provider, ...providerUpdate } : provider,
          ),
        })),

      deleteProvider: (id) =>
        set((state) => ({
          providers: state.providers.filter((provider) => provider.id !== id),
        })),

      getProvider: (id) => get().providers.find((provider) => provider.id === id),

      rateProvider: (id, rating) =>
        set((state) => ({
          providers: state.providers.map((provider) => (provider.id === id ? { ...provider, rating } : provider)),
        })),

      blockProvider: (id, reason) =>
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === id ? { ...provider, blocked: true, blockReason: reason } : provider,
          ),
        })),

      // Task actions
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, taskUpdate) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...taskUpdate } : task)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      getTask: (id) => get().tasks.find((task) => task.id === id),

      // Contract actions
      addContract: (contract) =>
        set((state) => ({
          contracts: [...state.contracts, contract],
        })),

      updateContract: (id, contractUpdate) =>
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === id ? { ...contract, ...contractUpdate } : contract,
          ),
        })),

      deleteContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((contract) => contract.id !== id),
        })),

      getContract: (id) => get().contracts.find((contract) => contract.id === id),

      // Budget actions
      addBudgetItem: (item) =>
        set((state) => ({
          budgetItems: [...state.budgetItems, item],
        })),

      updateBudgetItem: (id, itemUpdate) =>
        set((state) => ({
          budgetItems: state.budgetItems.map((item) => (item.id === id ? { ...item, ...itemUpdate } : item)),
        })),

      deleteBudgetItem: (id) =>
        set((state) => ({
          budgetItems: state.budgetItems.filter((item) => item.id !== id),
        })),

      getBudgetItem: (id) => get().budgetItems.find((item) => item.id === id),

      // Chat actions
      addChat: (chat) =>
        set((state) => ({
          chats: [...state.chats, chat],
        })),

      updateChat: (id, chatUpdate) =>
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === id ? { ...chat, ...chatUpdate } : chat)),
        })),

      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
        })),

      getChat: (id) => get().chats.find((chat) => chat.id === id),

      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat,
          ),
        })),

      // Utility functions
      getUpcoming30DaysEvents: () => getUpcoming30DaysEvents(get().events),
      getArgentinaTime: () => getArgentinaTime(),

      getVenuesWithExpiringPermits: () => {
        const venues = get().venues
        const today = DateTime.now().setZone("America/Argentina/Buenos_Aires")
        const warningDays = 30 // Alert 30 days before expiry

        return venues.filter((venue) => {
          if (!venue.permits) return false

          const permits = Object.values(venue.permits)
          return permits.some((permit) => {
            if (!permit?.expiryDate) return false
            const expiryDate = DateTime.fromISO(permit.expiryDate)
            const daysUntilExpiry = expiryDate.diff(today, "days").days
            return daysUntilExpiry <= warningDays && daysUntilExpiry >= 0
          })
        })
      },

      getVenuePermitStatus: (venueId: string) => {
        const venue = get().venues.find((v) => v.id === venueId)
        if (!venue?.permits) {
          return {
            hasValidPermits: false,
            expiringPermits: [],
            expiredPermits: [],
          }
        }

        const today = DateTime.now().setZone("America/Argentina/Buenos_Aires")
        const warningDays = 30
        const expiringPermits: string[] = []
        const expiredPermits: string[] = []

        Object.entries(venue.permits).forEach(([permitType, permit]) => {
          if (!permit?.expiryDate) return

          const expiryDate = DateTime.fromISO(permit.expiryDate)
          const daysUntilExpiry = expiryDate.diff(today, "days").days

          if (daysUntilExpiry < 0) {
            expiredPermits.push(permitType)
          } else if (daysUntilExpiry <= warningDays) {
            expiringPermits.push(permitType)
          }
        })

        return {
          hasValidPermits: expiredPermits.length === 0,
          expiringPermits,
          expiredPermits,
        }
      },

      validateVenueForEvent: (venueId: string, eventDate: string) => {
        const venue = get().venues.find((v) => v.id === venueId)
        const warnings: string[] = []
        const errors: string[] = []

        if (!venue) {
          errors.push("Venue no encontrado")
          return { isValid: false, warnings, errors }
        }

        if (!venue.permits) {
          warnings.push("No hay información de permisos para este venue")
          return { isValid: true, warnings, errors }
        }

        const eventDateTime = DateTime.fromISO(eventDate)

        Object.entries(venue.permits).forEach(([permitType, permit]) => {
          if (!permit?.hasPermit) {
            warnings.push(`Falta permiso: ${permitType}`)
            return
          }

          if (permit.expiryDate) {
            const expiryDate = DateTime.fromISO(permit.expiryDate)
            if (eventDateTime > expiryDate) {
              errors.push(`Permiso ${permitType} vencido para la fecha del evento`)
            } else if (expiryDate.diff(eventDateTime, "days").days <= 7) {
              warnings.push(`Permiso ${permitType} vence cerca de la fecha del evento`)
            }
          }
        })

        return {
          isValid: errors.length === 0,
          warnings,
          errors,
        }
      },
    }),
    {
      name: "unified-event-store",
    },
  ),
)
