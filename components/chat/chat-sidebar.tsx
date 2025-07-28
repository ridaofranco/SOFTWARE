"use client"

import { useState } from "react"
import { Search, Plus, Users, Calendar, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChatStore, useCurrentUser, type ChatConversation } from "@/lib/chat-service"
import { useEventStore } from "@/lib/event-service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { NewChatDialog } from "@/components/chat/new-chat-dialog"
import { useMediaQuery } from "@/hooks/use-mobile"

export function ChatSidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const currentUser = useCurrentUser()
  const conversations = useChatStore((state) => state.conversations)
  const users = useChatStore((state) => state.users)
  const events = useEventStore((state) => state.events)
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const setActiveConversation = useChatStore((state) => state.setActiveConversation)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true
    return conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Agrupar conversaciones por tipo
  const directConversations = filteredConversations.filter(
    (conversation) => !conversation.isGroup && !conversation.eventId,
  )
  const groupConversations = filteredConversations.filter(
    (conversation) => conversation.isGroup && !conversation.eventId,
  )
  const eventConversations = filteredConversations.filter((conversation) => conversation.eventId)

  // Obtener nombre de la conversación
  const getConversationName = (conversation: ChatConversation) => {
    if (conversation.name) return conversation.name

    // Si es una conversación directa, mostrar el nombre del otro usuario
    if (!conversation.isGroup) {
      const otherParticipantId = conversation.participants.find((id) => id !== currentUser.id)
      if (otherParticipantId) {
        const otherUser = users.find((user) => user.id === otherParticipantId)
        return otherUser ? otherUser.name : "Usuario desconocido"
      }
    }

    // Si es una conversación de evento, mostrar el nombre del evento
    if (conversation.eventId) {
      const event = events.find((event) => event.id === conversation.eventId)
      return event ? event.title : "Evento desconocido"
    }

    return "Conversación sin nombre"
  }

  // Obtener avatar para la conversación
  const getConversationAvatar = (conversation: ChatConversation) => {
    // Si es una conversación directa, mostrar el avatar del otro usuario
    if (!conversation.isGroup) {
      const otherParticipantId = conversation.participants.find((id) => id !== currentUser.id)
      if (otherParticipantId) {
        const otherUser = users.find((user) => user.id === otherParticipantId)
        return otherUser ? otherUser.avatar : ""
      }
    }

    // Para grupos y eventos, usar iniciales
    return ""
  }

  // Obtener iniciales para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Renderizar una conversación
  const renderConversation = (conversation: ChatConversation) => {
    const name = getConversationName(conversation)
    const avatar = getConversationAvatar(conversation)
    const isActive = activeConversationId === conversation.id
    const lastMessageTime = conversation.lastMessage
      ? formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true, locale: es })
      : ""

    return (
      <div
        key={conversation.id}
        className={`flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors ${
          isActive ? "bg-accent" : "hover:bg-muted"
        }`}
        onClick={() => setActiveConversation(conversation.id)}
      >
        <Avatar className="h-10 w-10">
          {avatar ? <AvatarImage src={avatar || "/placeholder.svg"} alt={name} /> : null}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{name}</span>
            {conversation.unreadCount > 0 && (
              <Badge variant="default" className="ml-2 px-1 py-0 min-w-5 h-5 flex items-center justify-center">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">
              {conversation.lastMessage
                ? conversation.lastMessage.type === "text"
                  ? conversation.lastMessage.content
                  : conversation.lastMessage.type === "image"
                    ? "Imagen"
                    : conversation.lastMessage.type === "file"
                      ? "Archivo"
                      : "Notificación"
                : "No hay mensajes"}
            </span>
            <span className="ml-1 whitespace-nowrap">{lastMessageTime}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full ${isMobile ? "w-full" : "w-80"} flex-col border-r`}>
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        <Button size="icon" variant="ghost" onClick={() => setIsNewChatOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative px-4 pb-4">
        <Search className="absolute left-7 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversaciones..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="direct" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <Plus className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 p-0">
          <ScrollArea className={`${isMobile ? "h-[calc(100vh-13rem)]" : "h-[calc(100vh-13rem)]"}`}>
            <div className="p-4 space-y-4">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No se encontraron conversaciones</p>
                </div>
              ) : (
                filteredConversations.map(renderConversation)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="direct" className="flex-1 p-0">
          <ScrollArea className={`${isMobile ? "h-[calc(100vh-13rem)]" : "h-[calc(100vh-13rem)]"}`}>
            <div className="p-4 space-y-4">
              {directConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay conversaciones directas</p>
                </div>
              ) : (
                directConversations.map(renderConversation)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups" className="flex-1 p-0">
          <ScrollArea className={`${isMobile ? "h-[calc(100vh-13rem)]" : "h-[calc(100vh-13rem)]"}`}>
            <div className="p-4 space-y-4">
              {groupConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay conversaciones grupales</p>
                </div>
              ) : (
                groupConversations.map(renderConversation)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="events" className="flex-1 p-0">
          <ScrollArea className={`${isMobile ? "h-[calc(100vh-13rem)]" : "h-[calc(100vh-13rem)]"}`}>
            <div className="p-4 space-y-4">
              {eventConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay conversaciones de eventos</p>
                </div>
              ) : (
                eventConversations.map(renderConversation)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground">{currentUser.role}</div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <NewChatDialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen} />
    </div>
  )
}
