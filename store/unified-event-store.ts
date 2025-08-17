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
      events: [],
      venues: [],
      providers: [],
      tasks: [],
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
