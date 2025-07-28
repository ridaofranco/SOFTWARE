import { create } from "zustand"
import { persist } from "zustand/middleware"

// Definición de tipos para el chat
export type MessageType = "text" | "image" | "file" | "notification"

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: MessageType
  read: boolean
  conversationId: string
  eventId?: string
  fileUrl?: string
  fileName?: string
}

export interface ChatConversation {
  id: string
  name: string
  participants: string[]
  lastMessage?: ChatMessage
  unreadCount: number
  isGroup: boolean
  eventId?: string
  createdAt: string
  updatedAt: string
}

export interface ChatUser {
  id: string
  name: string
  avatar: string
  role: string
  status: "online" | "offline" | "away"
  lastSeen?: string
}

// Estado del chat
interface ChatState {
  conversations: ChatConversation[]
  messages: Record<string, ChatMessage[]>
  users: ChatUser[]
  activeConversationId: string | null

  // Métodos para gestionar conversaciones
  createConversation: (conversation: Omit<ChatConversation, "id" | "createdAt" | "updatedAt">) => string
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void
  deleteConversation: (id: string) => void
  setActiveConversation: (id: string | null) => void

  // Métodos para gestionar mensajes
  sendMessage: (message: Omit<ChatMessage, "id" | "timestamp" | "read">) => string
  markMessageAsRead: (messageId: string) => void
  markConversationAsRead: (conversationId: string) => void
  deleteMessage: (messageId: string) => void

  // Métodos para gestionar usuarios
  addUser: (user: Omit<ChatUser, "id">) => string
  updateUserStatus: (userId: string, status: ChatUser["status"]) => void

  // Métodos para consultas
  getConversationsByUser: (userId: string) => ChatConversation[]
  getConversationsByEvent: (eventId: string) => ChatConversation[]
  getMessagesByConversation: (conversationId: string) => ChatMessage[]
  getUnreadMessagesCount: (userId: string) => number
}

// Datos iniciales para el chat
const initialUsers: ChatUser[] = [
  {
    id: "user-1",
    name: "María López",
    avatar: "/machine-learning-concept.png",
    role: "Art Director",
    status: "online",
  },
  {
    id: "user-2",
    name: "Carlos Rodríguez",
    avatar: "/abstract-color-run.png",
    role: "Booking Manager",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
  {
    id: "user-3",
    name: "Ana Martínez",
    avatar: "/abstract-am.png",
    role: "Stage Designer",
    status: "away",
    lastSeen: new Date(Date.now() - 900000).toISOString(), // 15 minutos atrás
  },
  {
    id: "user-4",
    name: "Juan Pérez",
    avatar: "/stylized-jp-initials.png",
    role: "Lighting Technician",
    status: "online",
  },
  {
    id: "user-5",
    name: "Laura Gómez",
    avatar: "/abstract-lg.png",
    role: "Marketing Director",
    status: "offline",
    lastSeen: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
  },
]

// Conversaciones iniciales
const initialConversations: ChatConversation[] = [
  {
    id: "conv-1",
    name: "Equipo de Arte",
    participants: ["user-1", "user-3", "user-4"],
    unreadCount: 2,
    isGroup: true,
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 1 semana atrás
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
  {
    id: "conv-2",
    name: "Booking y Marketing",
    participants: ["user-2", "user-5"],
    unreadCount: 0,
    isGroup: true,
    createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 semanas atrás
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
  },
  {
    id: "conv-3",
    name: "HAEDO - 25/04",
    participants: ["user-1", "user-2", "user-3", "user-4", "user-5"],
    unreadCount: 5,
    isGroup: true,
    eventId: "haedo-25-04",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
    updatedAt: new Date().toISOString(),
  },
]

// Mensajes iniciales
const initialMessages: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "msg-1",
      senderId: "user-1",
      senderName: "María López",
      content: "Necesitamos finalizar el diseño del escenario para HAEDO",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      type: "text",
      read: true,
      conversationId: "conv-1",
    },
    {
      id: "msg-2",
      senderId: "user-3",
      senderName: "Ana Martínez",
      content: "Ya tengo los bocetos listos, los comparto mañana en la reunión",
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 horas atrás
      type: "text",
      read: true,
      conversationId: "conv-1",
    },
    {
      id: "msg-3",
      senderId: "user-4",
      senderName: "Juan Pérez",
      content: "Necesito saber cuántos puntos de iluminación vamos a necesitar",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
      type: "text",
      read: false,
      conversationId: "conv-1",
    },
  ],
  "conv-2": [
    {
      id: "msg-4",
      senderId: "user-2",
      senderName: "Carlos Rodríguez",
      content: "¿Cómo va la campaña de marketing para el evento de HAEDO?",
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      type: "text",
      read: true,
      conversationId: "conv-2",
    },
    {
      id: "msg-5",
      senderId: "user-5",
      senderName: "Laura Gómez",
      content: "Ya tenemos 500 confirmaciones en el evento de Facebook",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      type: "text",
      read: true,
      conversationId: "conv-2",
    },
  ],
  "conv-3": [
    {
      id: "msg-6",
      senderId: "user-1",
      senderName: "María López",
      content: "Bienvenidos al chat del evento HAEDO - 25/04",
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
      type: "notification",
      read: true,
      conversationId: "conv-3",
      eventId: "haedo-25-04",
    },
    {
      id: "msg-7",
      senderId: "user-2",
      senderName: "Carlos Rodríguez",
      content: "Acabo de confirmar con el venue, tenemos acceso desde las 10:00 AM",
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      type: "text",
      read: true,
      conversationId: "conv-3",
      eventId: "haedo-25-04",
    },
    {
      id: "msg-8",
      senderId: "user-3",
      senderName: "Ana Martínez",
      content: "Aquí están los planos del escenario",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      type: "file",
      read: false,
      conversationId: "conv-3",
      eventId: "haedo-25-04",
      fileUrl: "/architectural-blueprint-details.png",
      fileName: "escenario-haedo.pdf",
    },
    {
      id: "msg-9",
      senderId: "user-5",
      senderName: "Laura Gómez",
      content: "La campaña en redes sociales comienza mañana",
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 horas atrás
      type: "text",
      read: false,
      conversationId: "conv-3",
      eventId: "haedo-25-04",
    },
    {
      id: "msg-10",
      senderId: "user-4",
      senderName: "Juan Pérez",
      content: "Necesito confirmación sobre el equipo de sonido",
      timestamp: new Date().toISOString(),
      type: "text",
      read: false,
      conversationId: "conv-3",
      eventId: "haedo-25-04",
    },
  ],
}

// Actualizar las conversaciones con el último mensaje
initialConversations.forEach((conversation) => {
  const conversationMessages = initialMessages[conversation.id] || []
  if (conversationMessages.length > 0) {
    const lastMessage = conversationMessages[conversationMessages.length - 1]
    conversation.lastMessage = lastMessage
  }
})

// Crear y exportar el store
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: initialConversations,
      messages: initialMessages,
      users: initialUsers,
      activeConversationId: null,

      // Métodos para gestionar conversaciones
      createConversation: (conversationData) => {
        const id = `conv-${Date.now()}`
        const newConversation: ChatConversation = {
          id,
          ...conversationData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          conversations: [...state.conversations, newConversation],
          messages: {
            ...state.messages,
            [id]: [],
          },
        }))

        return id
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === id
              ? { ...conversation, ...updates, updatedAt: new Date().toISOString() }
              : conversation,
          ),
        }))
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conversation) => conversation.id !== id),
          messages: Object.fromEntries(
            Object.entries(state.messages).filter(([conversationId]) => conversationId !== id),
          ),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }))
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id })

        // Si hay una conversación activa, marcar todos sus mensajes como leídos
        if (id) {
          get().markConversationAsRead(id)
        }
      },

      // Métodos para gestionar mensajes
      sendMessage: (messageData) => {
        const id = `msg-${Date.now()}`
        const timestamp = new Date().toISOString()

        const newMessage: ChatMessage = {
          id,
          ...messageData,
          timestamp,
          read: false,
        }

        const { conversationId } = newMessage

        set((state) => {
          // Actualizar mensajes
          const conversationMessages = state.messages[conversationId] || []
          const updatedMessages = {
            ...state.messages,
            [conversationId]: [...conversationMessages, newMessage],
          }

          // Actualizar conversación
          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                lastMessage: newMessage,
                updatedAt: timestamp,
                unreadCount: conversation.unreadCount + 1,
              }
            }
            return conversation
          })

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          }
        })

        return id
      },

      markMessageAsRead: (messageId) => {
        set((state) => {
          let conversationId: string | null = null
          let updatedUnreadCount = 0

          // Buscar el mensaje y actualizarlo
          const updatedMessages = { ...state.messages }

          for (const [convId, messages] of Object.entries(updatedMessages)) {
            const messageIndex = messages.findIndex((msg) => msg.id === messageId)

            if (messageIndex !== -1) {
              conversationId = convId

              // Si el mensaje ya está marcado como leído, no hacer nada
              if (messages[messageIndex].read) {
                return state
              }

              // Actualizar el mensaje
              updatedMessages[convId] = [
                ...messages.slice(0, messageIndex),
                { ...messages[messageIndex], read: true },
                ...messages.slice(messageIndex + 1),
              ]

              // Calcular nuevo unreadCount
              updatedUnreadCount = updatedMessages[convId].filter((msg) => !msg.read).length

              break
            }
          }

          // Si no se encontró el mensaje, no hacer nada
          if (!conversationId) {
            return state
          }

          // Actualizar la conversación
          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                unreadCount: updatedUnreadCount,
              }
            }
            return conversation
          })

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          }
        })
      },

      markConversationAsRead: (conversationId) => {
        set((state) => {
          // Verificar si la conversación existe
          if (!state.messages[conversationId]) {
            return state
          }

          // Marcar todos los mensajes como leídos
          const updatedMessages = {
            ...state.messages,
            [conversationId]: state.messages[conversationId].map((message) => ({
              ...message,
              read: true,
            })),
          }

          // Actualizar la conversación
          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                unreadCount: 0,
              }
            }
            return conversation
          })

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          }
        })
      },

      deleteMessage: (messageId) => {
        set((state) => {
          let conversationId: string | null = null
          let lastMessage: ChatMessage | undefined

          // Buscar el mensaje y eliminarlo
          const updatedMessages = { ...state.messages }

          for (const [convId, messages] of Object.entries(updatedMessages)) {
            const messageIndex = messages.findIndex((msg) => msg.id === messageId)

            if (messageIndex !== -1) {
              conversationId = convId

              // Eliminar el mensaje
              updatedMessages[convId] = [...messages.slice(0, messageIndex), ...messages.slice(messageIndex + 1)]

              // Actualizar último mensaje
              if (updatedMessages[convId].length > 0) {
                lastMessage = updatedMessages[convId][updatedMessages[convId].length - 1]
              }

              break
            }
          }

          // Si no se encontró el mensaje, no hacer nada
          if (!conversationId) {
            return state
          }

          // Actualizar la conversación
          const updatedConversations = state.conversations.map((conversation) => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                lastMessage,
                unreadCount: updatedMessages[conversationId].filter((msg) => !msg.read).length,
              }
            }
            return conversation
          })

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          }
        })
      },

      // Métodos para gestionar usuarios
      addUser: (userData) => {
        const id = `user-${Date.now()}`
        const newUser: ChatUser = {
          id,
          ...userData,
        }

        set((state) => ({
          users: [...state.users, newUser],
        }))

        return id
      },

      updateUserStatus: (userId, status) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status,
                  lastSeen: status === "offline" ? new Date().toISOString() : user.lastSeen,
                }
              : user,
          ),
        }))
      },

      // Métodos para consultas
      getConversationsByUser: (userId) => {
        return get().conversations.filter((conversation) => conversation.participants.includes(userId))
      },

      getConversationsByEvent: (eventId) => {
        return get().conversations.filter((conversation) => conversation.eventId === eventId)
      },

      getMessagesByConversation: (conversationId) => {
        return get().messages[conversationId] || []
      },

      getUnreadMessagesCount: (userId) => {
        const userConversations = get().getConversationsByUser(userId)
        return userConversations.reduce((count, conversation) => count + conversation.unreadCount, 0)
      },
    }),
    {
      name: "chat-store",
    },
  ),
)

// Hook para obtener el usuario actual (simulado)
export function useCurrentUser() {
  // En una aplicación real, esto vendría de un sistema de autenticación
  return useChatStore((state) => state.users[0])
}
