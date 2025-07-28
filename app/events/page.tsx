"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, ChevronRight, Clock, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { NewEventDialog } from "@/components/new-event-dialog"
import { SimpleCalendar } from "@/components/simple-calendar"
import { useEventStore } from "@/lib/event-service"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { NavBar } from "@/components/nav-bar"
import { ExportButton } from "@/components/export-button"

export default function EventsPage() {
  const events = useEventStore((state) => state.events)
  const getActiveEvents = useEventStore((state) => state.getActiveEvents)
  const [activeEvents, setActiveEvents] = useState([])

  // Use effect to safely get active events
  useEffect(() => {
    setActiveEvents(getActiveEvents())
  }, [getActiveEvents, events])

  // Calcular días restantes hasta el evento
  const getDaysRemaining = (dateStr: string) => {
    try {
      const eventDate = new Date(dateStr)
      const today = new Date()
      const diffTime = eventDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      console.error("Error calculating days remaining:", error)
      return 0
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
            <div className="flex items-center gap-2">
              <ExportButton type="events" />
              <NewEventDialog />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEvents.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No hay eventos activos</CardTitle>
                  <CardDescription>Crea un nuevo evento para comenzar</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Utiliza el botón "Nuevo Evento" para crear un evento y comenzar a gestionarlo.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.theme}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(parseISO(event.date), "dd MMMM yyyy", { locale: es })}
                          {event.endDate && ` - ${format(parseISO(event.endDate), "dd MMMM yyyy", { locale: es })}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {event.venue}, {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Comienza en {getDaysRemaining(event.date)} días</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span>{event.progress}%</span>
                        </div>
                        <Progress value={event.progress} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          {event.status === "active"
                            ? "Activo"
                            : event.status === "completed"
                              ? "Completado"
                              : "Planificación"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{event.pendingTasks} tareas pendientes</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/events/${event.id}`}>
                        Ver Detalles
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}

            <Card>
              <CardHeader>
                <CardTitle>Calendario de Eventos</CardTitle>
                <CardDescription>Abril 2025</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SimpleCalendar />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
