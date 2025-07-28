"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useEventStore } from "@/lib/event-service"
import { format, parseISO, differenceInDays, isFuture } from "date-fns"
import { es } from "date-fns/locale"

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "info" | "warning" | "success" | "error"
  link?: string
}

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const events = useEventStore((state) => state.events)
  const tasks = useEventStore((state) => state.tasks)

  // Generate notifications based on events and tasks
  useEffect(() => {
    const newNotifications: Notification[] = []

    // Add notifications for upcoming events (within 7 days)
    events.forEach((event) => {
      try {
        const eventDate = parseISO(event.date)
        const today = new Date()
        const daysDifference = differenceInDays(eventDate, today)

        if (isFuture(eventDate) && daysDifference <= 7) {
          newNotifications.push({
            id: `event-${event.id}`,
            title: "Evento próximo",
            message: `El evento "${event.title}" comenzará el ${format(eventDate, "dd/MM/yyyy", { locale: es })}`,
            date: new Date().toISOString(),
            read: false,
            type: "info",
            link: `/events/${event.id}`,
          })
        }
      } catch (error) {
        console.error("Error parsing date:", error)
      }
    })

    // Add notifications for tasks with high priority
    tasks
      .filter((task) => task.priority === "alta" && task.status === "pendiente")
      .forEach((task) => {
        newNotifications.push({
          id: `task-${task.id}`,
          title: "Tarea prioritaria",
          message: `La tarea "${task.title}" requiere atención inmediata`,
          date: new Date().toISOString(),
          read: false,
          type: "warning",
          link: "/tasks",
        })
      })

    // Add budget warnings
    events.forEach((event) => {
      if (event.actual > event.budget * 1.1) {
        // 10% over budget
        newNotifications.push({
          id: `budget-${event.id}`,
          title: "Alerta de presupuesto",
          message: `El evento "${event.title}" ha superado el presupuesto en más del 10%`,
          date: new Date().toISOString(),
          read: false,
          type: "error",
          link: `/events/${event.id}`,
        })
      }
    })

    setNotifications(newNotifications)
    setUnreadCount(newNotifications.filter((n) => !n.read).length)
  }, [events, tasks])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-normal" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 ${notification.read ? "opacity-70" : "font-medium"}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`text-sm ${
                      notification.type === "error"
                        ? "text-red-500"
                        : notification.type === "warning"
                          ? "text-yellow-500"
                          : notification.type === "success"
                            ? "text-green-500"
                            : "text-primary"
                    }`}
                  >
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(notification.date), "dd/MM HH:mm", { locale: es })}
                  </span>
                </div>
                <p className="mt-1 text-xs">{notification.message}</p>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
