"use client"

import { useState, useRef, useEffect } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Users, Calendar, Search, Plus, Phone, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
  const { chatMessages, events, addChatMessage } = useUnifiedEventStore()
  const { toast } = useToast()

  const [selectedChannel, setSelectedChannel] = useState("general")
  const [newMessage, setNewMessage] = useState("")
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<"event" | "provider" | "general">("general")
  const [newChannelEventId, setNewChannelEventId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Canales predefinidos
  const chatChannels = [
    {
      id: "general",
      name: "General",
      type: "general" as const,
      participants: ["Franco"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "team",
      name: "Equipo DER",
      type: "general" as const,
      participants: ["Franco", "Asistente"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "providers",
      name: "Proveedores",
      type: "provider" as const,
      participants: ["Franco"],
      createdAt: new Date().toISOString(),
    },
  ]

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, selectedChannel])

  // Filtrar mensajes del canal seleccionado
  const channelMessages = chatMessages
    .filter(
      (msg) =>
        msg.eventId === selectedChannel ||
        (selectedChannel === "general" && !msg.eventId) ||
        (selectedChannel === "team" && !msg.eventId) ||
        (selectedChannel === "providers" && !msg.eventId),
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Obtener información del canal seleccionado
  const currentChannel = chatChannels.find((ch) => ch.id === selectedChannel)
  const relatedEvent =
    selectedChannel !== "general" && selectedChannel !== "team" && selectedChannel !== "providers"
      ? events.find((e) => e.id === selectedChannel)
      : null

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return

    const message = {
      eventId:
        selectedChannel === "general" || selectedChannel === "team" || selectedChannel === "providers"
          ? ""
          : selectedChannel,
      sender: "Franco", // En una app real, esto vendría del usuario logueado
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: "message" as const,
    }

    addChatMessage(message)
    setNewMessage("")

    toast({
      title: "Mensaje enviado",
      description: "Tu mensaje ha sido enviado",
    })
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar className="w-4 h-4" />
      case "provider":
        return <Users className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-6">
        {/* Sidebar - Lista de canales */}
        <div className="w-80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Conversaciones</h2>
            <Button size="sm" onClick={() => setShowNewChannel(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Nuevo
            </Button>
          </div>

          {/* Buscador */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de canales */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {chatChannels
              .filter((channel) => channel.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((channel) => {
                const channelMessageCount = chatMessages.filter(
                  (msg) =>
                    (channel.id === "general" && !msg.eventId) ||
                    (channel.id === "team" && !msg.eventId) ||
                    (channel.id === "providers" && !msg.eventId) ||
                    msg.eventId === channel.id,
                ).length
                const lastMessage = chatMessages
                  .filter(
                    (msg) =>
                      (channel.id === "general" && !msg.eventId) ||
                      (channel.id === "team" && !msg.eventId) ||
                      (channel.id === "providers" && !msg.eventId) ||
                      msg.eventId === channel.id,
                  )
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

                return (
                  <div
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChannel === channel.id
                        ? "bg-orange-100 border-orange-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getChannelIcon(channel.type)}
                        <span className="font-medium text-sm">{channel.name}</span>
                      </div>
                      {channelMessageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {channelMessageCount}
                        </Badge>
                      )}
                    </div>

                    {lastMessage && (
                      <div className="text-xs text-gray-600 truncate">
                        <span className="font-medium">{lastMessage.sender}:</span> {lastMessage.message}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
                      {channel.type === "event" && relatedEvent && <span>Evento: {relatedEvent.venue}</span>}
                      {channel.type === "general" && <span>Canal general</span>}
                      {channel.type === "provider" && <span>Proveedores</span>}
                    </div>
                  </div>
                )
              })}

            {/* Canales de eventos */}
            {events.map((event) => {
              const eventMessageCount = chatMessages.filter((msg) => msg.eventId === event.id).length
              const lastMessage = chatMessages
                .filter((msg) => msg.eventId === event.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

              if (eventMessageCount === 0 && !event.venue.toLowerCase().includes(searchTerm.toLowerCase())) {
                return null
              }

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedChannel(event.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel === event.id ? "bg-orange-100 border-orange-300" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm">{event.venue}</span>
                    </div>
                    {eventMessageCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {eventMessageCount}
                      </Badge>
                    )}
                  </div>

                  {lastMessage && (
                    <div className="text-xs text-gray-600 truncate">
                      <span className="font-medium">{lastMessage.sender}:</span> {lastMessage.message}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-1">
                    Evento: {new Date(event.date).toLocaleDateString("es-AR")}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center space-x-2">
                      {getChannelIcon(currentChannel?.type || "general")}
                      <span>{currentChannel?.name || relatedEvent?.venue}</span>
                    </h3>
                    {relatedEvent && (
                      <p className="text-sm text-gray-600">
                        Evento: {relatedEvent.venue} - {new Date(relatedEvent.date).toLocaleDateString("es-AR")}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {channelMessages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                    <p>No hay mensajes en esta conversación</p>
                    <p className="text-sm">¡Envía el primer mensaje!</p>
                  </div>
                ) : (
                  channelMessages.map((message, index) => {
                    const showDate =
                      index === 0 || formatDate(message.timestamp) !== formatDate(channelMessages[index - 1].timestamp)

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center py-2">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${message.sender === "Franco" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === "Franco" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {message.sender !== "Franco" && (
                              <p className="text-xs font-medium mb-1 opacity-75">{message.sender}</p>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === "Franco" ? "text-orange-100" : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No channel selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-600 mb-4">Elige una conversación existente para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
