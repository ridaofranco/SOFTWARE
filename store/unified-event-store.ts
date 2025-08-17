import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DateTime } from "luxon"

// Types
export interface Event {
  id: string
  title: string
  date: string
  venue: string
  venueId?: string
  status: "planning" | "confirmed" | "in-progress" | "completed" | "cancelled"
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
  truckArrivalTime?: string
  technicalTestsTime?: string
  loadingPoint?: string
  producerContact?: {
    name: string
    phone: string
    email: string
  }
  hasLocalPermit?: boolean
  hasAlcoholPermit?: boolean
  localPermitFile?: any
  alcoholPermitFile?: any
  notes?: string
  providers?: Provider[]
  createdAt?: string
  updatedAt?: string
}

export interface Venue {
  id: string
  nombre: string
  direccion: string
  capacidad?: number
  tipo?: string
  ciudad?: string
  pais?: string
  contacto?: string
  telefono?: string
  email?: string
  notas?: string
  location?: string
  capacity?: number
  type?: "club" | "salon" | "outdoor" | "teatro"
  contact?: string
  rating?: number
}

export interface Provider {
  id: string
  name: string
  category: string
  contact: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  rating?: number
  services?: string[]
  priceRange?: string
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
}

// Function to get current time in Argentina timezone
export const nowAR = () => DateTime.now().setZone("America/Argentina/Buenos_Aires")

// Function to filter events within the next 30 days
export const upcomingEvents30d = (events: Event[]) =>
  events.filter(
    (event) => DateTime.fromISO(event.date) >= nowAR() && DateTime.fromISO(event.date) <= nowAR().plus({ days: 30 }),
  )

// Initial data
const initialEvents: Event[] = [
  {
    id: "1",
    title: "Stadium",
    date: "2025-01-25",
    venue: "Stadium",
    venueId: "1",
    status: "confirmed",
    type: "propio",
    description: "Evento propio - Stadium",
    theme: "general",
    emoji: "🎵",
    address: "Buenos Aires, Argentina",
    openingTime: "00:30",
    closingTime: "06:00",
    setupStartTime: "18:00",
    teardownTime: "08:00",
    truckArrivalTime: "07:45",
    technicalTestsTime: "22:00",
    loadingPoint: "Entrada principal",
    producerContact: {
      name: "Franco",
      phone: "+54 11 1234-5678",
      email: "franco@der.com",
    },
    hasLocalPermit: true,
    hasAlcoholPermit: true,
    providers: [],
  },
  {
    id: "2",
    title: "Seasons",
    date: "2025-02-15",
    venue: "Seasons",
    venueId: "2",
    status: "confirmed",
    type: "propio",
    description: "Evento propio - Seasons",
    theme: "general",
    emoji: "🎵",
    address: "Buenos Aires, Argentina",
    openingTime: "00:30",
    closingTime: "06:00",
    setupStartTime: "18:00",
    teardownTime: "08:00",
    truckArrivalTime: "07:45",
    technicalTestsTime: "22:00",
    loadingPoint: "Entrada principal",
    producerContact: {
      name: "Franco",
      phone: "+54 11 1234-5678",
      email: "franco@der.com",
    },
    hasLocalPermit: true,
    hasAlcoholPermit: true,
    providers: [],
  },
]

const initialVenues: Venue[] = [
  {
    id: "1",
    nombre: "Stadium",
    direccion: "Buenos Aires, Argentina",
    capacidad: 1500,
    tipo: "club",
    ciudad: "Buenos Aires",
    pais: "Argentina",
    contacto: "info@stadium.com.ar",
    telefono: "+54 11 1234-5678",
    email: "info@stadium.com.ar",
    location: "Buenos Aires, Argentina",
    capacity: 1500,
    type: "club",
    contact: "info@stadium.com.ar",
    rating: 5,
  },
  {
    id: "2",
    nombre: "Seasons",
    direccion: "Buenos Aires, Argentina",
    capacidad: 600,
    tipo: "club",
    ciudad: "Buenos Aires",
    pais: "Argentina",
    contacto: "info@seasons.com.ar",
    telefono: "+54 11 9876-5432",
    email: "info@seasons.com.ar",
    location: "Buenos Aires, Argentina",
    capacity: 600,
    type: "club",
    contact: "info@seasons.com.ar",
    rating: 4,
  },
  {
    id: "3",
    nombre: "Amerika",
    direccion: "GASCON 1040 - C.A.B.A.",
    capacidad: 1500,
    tipo: "club",
    ciudad: "Buenos Aires",
    pais: "Argentina",
    contacto: "info@amerika.com.ar",
    telefono: "+54 11 5555-5555",
    email: "info@amerika.com.ar",
    location: "GASCON 1040 - C.A.B.A.",
    capacity: 1500,
    type: "club",
    contact: "info@amerika.com.ar",
    rating: 5,
  },
]

const initialProviders: Provider[] = [
  {
    id: "1",
    name: "DJ Elite",
    category: "BOOKING",
    contact: "dj@elite.com",
    phone: "+54 11 1111-1111",
    email: "dj@elite.com",
    rating: 5,
    services: ["DJ", "Música en vivo"],
    priceRange: "$$$",
    item: "DJ",
  },
  {
    id: "2",
    name: "Sound Engineer",
    category: "BOOKING",
    contact: "sound@engineer.com",
    phone: "+54 11 2222-2222",
    email: "sound@engineer.com",
    rating: 5,
    services: ["Sonido", "Mezcla en vivo"],
    priceRange: "$$$",
    item: "Sonidista",
  },
  {
    id: "3",
    name: "Iluminación Total",
    category: "ARTE",
    contact: "luz@total.com",
    phone: "+54 11 3333-3333",
    email: "luz@total.com",
    rating: 5,
    services: ["Diseño de iluminación", "Operación"],
    priceRange: "$$$",
    item: "Iluminador",
  },
]

export const useUnifiedEventStore = create<UnifiedEventStore>()(
  persist(
    (set, get) => ({
      // Initial state
      events: initialEvents,
      venues: initialVenues,
      providers: initialProviders,
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
          venues: [...state.venues, venue],
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

      deleteProvider: (id) => {
        const provider = get().providers.find((p) => p.id === id)
        set((state) => ({
          providers: state.providers.filter((provider) => provider.id !== id),
        }))
        return provider
      },

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
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastMessage: message.content,
                  lastActivity: message.timestamp,
                }
              : chat,
          ),
          chatMessages: [...state.chatMessages, message],
        })),
    }),
    {
      name: "unified-event-storage",
      version: 1,
    },
  ),
)
