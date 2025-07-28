"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Send, Paperclip, ImageIcon, Smile, MoreVertical, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatStore, useCurrentUser, type ChatMessage } from "@/lib/chat-service"
import { format, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function ChatMessages() {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = useCurrentUser()
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const conversations = useChatStore((state) => state.conversations)
  const getMessagesByConversation = useChatStore((state) => state.getMessagesByConversation)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const markConversationAsRead = useChatStore((state) => state.markConversationAsRead)
  const users = useChatStore((state) => state.users)

  const activeConversation = conversations.find((conv) => conv.id === activeConversationId)
  const messages = activeConversationId ? getMessagesByConversation(activeConversationId) : []

  // Marcar mensajes como leídos cuando se abre la conversación
  useEffect(() => {
    if (activeConversationId) {
      markConversationAsRead(activeConversationId)
    }
  }, [activeConversationId, markConversationAsRead])

  // Scroll al último mensaje cuando se reciben nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim() || !activeConversationId) return

    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: message,
      conversationId: activeConversationId,
      type: "text",
      eventId: activeConversation?.eventId,
    })

    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {}

    messages.forEach((message) => {
      const date = new Date(message.timestamp)
      const dateKey = format(date, "yyyy-MM-dd")

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(message)
    })

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }))
  }

  const messageGroups = groupMessagesByDate(messages)

  // Formatear fecha para mostrar
  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)

    if (isToday(date)) {
      return "Hoy"
    } else if (isYesterday(date)) {
      return "Ayer"
    } else {
      return format(date, "d 'de' MMMM, yyyy", { locale: es })
    }
  }

  // Obtener usuario por ID
  const getUserById = (userId: string) => {
    return users.find((user) => user.id === userId)
  }

  // Renderizar un mensaje
  const renderMessage = (message: ChatMessage) => {
    const isCurrentUser = message.senderId === currentUser.id
    const sender = getUserById(message.senderId)
    const messageTime = format(new Date(message.timestamp), "HH:mm")

    return (
      <div key={message.id} className={cn("flex items-start gap-2 mb-4", isCurrentUser ? "flex-row-reverse" : "")}>
        <Avatar className="h-8 w-8 mt-0.5">
          {sender?.avatar ? <AvatarImage src={sender.avatar || "/placeholder.svg"} alt={sender.name} /> : null}
          <AvatarFallback>
            {sender?.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className={cn("flex flex-col max-w-[70%]", isCurrentUser ? "items-end" : "items-start")}>
          {!isCurrentUser && (
            <span className="text-xs font-medium text-muted-foreground mb-1">{message.senderName}</span>
          )}

          {message.type === "text" && (
            <div
              className={cn("rounded-lg px-3 py-2", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          )}

          {message.type === "image" && (
            <div className={cn("rounded-lg overflow-hidden", isCurrentUser ? "bg-primary" : "bg-muted")}>
              <img
                src={message.fileUrl || "/placeholder.svg"}
                alt="Imagen compartida"
                className="max-w-full h-auto max-h-60 object-contain"
              />
              {message.content && (
                <div className={cn("px-3 py-2", isCurrentUser ? "text-primary-foreground" : "")}>
                  <p>{message.content}</p>
                </div>
              )}
            </div>
          )}

          {message.type === "file" && (
            <div
              className={cn(
                "rounded-lg px-3 py-2 flex items-center gap-2",
                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <FileText className="h-5 w-5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{message.fileName}</p>
                {message.content && <p className="text-sm truncate">{message.content}</p>}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}

          {message.type === "notification" && (
            <div className="bg-muted/50 text-muted-foreground rounded-lg px-3 py-2 text-sm">
              <p>{message.content}</p>
            </div>
          )}

          <span className="text-xs text-muted-foreground mt-1">{messageTime}</span>
        </div>
      </div>
    )
  }

  if (!activeConversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Selecciona una conversación</h3>
        <p className="text-muted-foreground">
          Elige una conversación existente o crea una nueva para comenzar a chatear.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Encabezado de la conversación */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {activeConversation?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{activeConversation?.name}</h3>
            <p className="text-xs text-muted-foreground">{activeConversation?.participants.length} participantes</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Área de mensajes */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date}>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    {formatMessageDate(group.date)}
                  </span>
                </div>
              </div>
              {group.messages.map(renderMessage)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Área de entrada de mensajes */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente MessageSquare para el estado vacío
function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
