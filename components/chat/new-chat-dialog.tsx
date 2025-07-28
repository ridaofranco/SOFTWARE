"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatStore, useCurrentUser } from "@/lib/chat-service"
import { useEventStore } from "@/lib/event-service"

interface NewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
  const [chatType, setChatType] = useState<"direct" | "group" | "event">("direct")
  const [groupName, setGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")

  const currentUser = useCurrentUser()
  const users = useChatStore((state) => state.users)
  const events = useEventStore((state) => state.events)
  const createConversation = useChatStore((state) => state.createConversation)
  const setActiveConversation = useChatStore((state) => state.setActiveConversation)

  // Filtrar usuarios por búsqueda y excluir al usuario actual
  const filteredUsers = users
    .filter((user) => user.id !== currentUser.id)
    .filter((user) => {
      if (!searchTerm) return true
      return user.name.toLowerCase().includes(searchTerm.toLowerCase())
    })

  // Manejar selección de usuario
  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  // Crear nueva conversación
  const handleCreateChat = () => {
    if (chatType === "direct" && selectedUsers.length === 1) {
      // Conversación directa
      const newConversationId = createConversation({
        name: "",
        participants: [currentUser.id, selectedUsers[0]],
        unreadCount: 0,
        isGroup: false,
      })

      setActiveConversation(newConversationId)
    } else if (chatType === "group" && groupName && selectedUsers.length > 0) {
      // Conversación grupal
      const newConversationId = createConversation({
        name: groupName,
        participants: [currentUser.id, ...selectedUsers],
        unreadCount: 0,
        isGroup: true,
      })

      setActiveConversation(newConversationId)
    } else if (chatType === "event" && selectedEvent) {
      // Conversación de evento
      const event = events.find((e) => e.id === selectedEvent)
      if (event) {
        const newConversationId = createConversation({
          name: event.title,
          participants: [currentUser.id, ...selectedUsers],
          unreadCount: 0,
          isGroup: true,
          eventId: event.id,
        })

        setActiveConversation(newConversationId)
      }
    }

    // Limpiar y cerrar
    resetForm()
    onOpenChange(false)
  }

  // Resetear formulario
  const resetForm = () => {
    setGroupName("")
    setSearchTerm("")
    setSelectedUsers([])
    setSelectedEvent("")
    setChatType("direct")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva conversación</DialogTitle>
          <DialogDescription>
            Crea una nueva conversación directa, grupal o relacionada con un evento.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={chatType} onValueChange={(value) => setChatType(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="direct">Directa</TabsTrigger>
            <TabsTrigger value="group">Grupo</TabsTrigger>
            <TabsTrigger value="event">Evento</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-search">Seleccionar usuario</Label>
              <Input
                id="user-search"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-2">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setSelectedUsers([user.id])
                      }}
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => {
                          setSelectedUsers([user.id])
                        }}
                      />
                      <Avatar className="h-8 w-8">
                        {user.avatar ? <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} /> : null}
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Nombre del grupo</Label>
              <Input
                id="group-name"
                placeholder="Ej: Equipo de Marketing"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-search-group">Añadir participantes</Label>
              <Input
                id="user-search-group"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-2">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <Checkbox
                        id={`user-group-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserSelect(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        {user.avatar ? <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} /> : null}
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="event" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-select">Seleccionar evento</Label>
              <select
                id="event-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">Seleccionar un evento</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-search-event">Añadir participantes</Label>
              <Input
                id="user-search-event"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-2">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <Checkbox
                        id={`user-event-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserSelect(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        {user.avatar ? <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} /> : null}
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateChat}
            disabled={
              (chatType === "direct" && selectedUsers.length !== 1) ||
              (chatType === "group" && (!groupName || selectedUsers.length === 0)) ||
              (chatType === "event" && !selectedEvent)
            }
          >
            Crear conversación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
