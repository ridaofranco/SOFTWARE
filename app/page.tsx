"use client"

import { useEffect, useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CountdownDisplay } from "@/components/countdown-display"
import { AutomatedTasksWidget } from "@/components/automated-tasks-widget"
import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const getUpcoming30DaysEvents = useUnifiedEventStore((state) => state.getUpcoming30DaysEvents)
  const getArgentinaTime = useUnifiedEventStore((state) => state.getArgentinaTime)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateData = () => {
      const events = getUpcoming30DaysEvents()
      setUpcomingEvents(events)

      const nowAR = getArgentinaTime()
      setCurrentTime(nowAR.toFormat("dd/MM/yyyy HH:mm"))
    }

    // Initial load
    updateData()

    // Update every minute to recalculate 30-day window and current time
    const interval = setInterval(updateData, 60000)

    return () => clearInterval(interval)
  }, [getUpcoming30DaysEvents, getArgentinaTime])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "propio":
        return "bg-blue-100 text-blue-800"
      case "privado":
        return "bg-purple-100 text-purple-800"
      case "feriado":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Eventos</h1>
          <p className="text-muted-foreground">Próximos 30 días • Hora Argentina: {currentTime}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            GMT-3 (Buenos Aires)
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Eventos (30 días)
            </CardTitle>
            <CardDescription>{upcomingEvents.length} eventos programados en los próximos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay eventos programados en los próximos 30 días
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{event.emoji || "🎵"}</span>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                        </div>
                        <CountdownDisplay eventDate={event.date} variant="compact" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === "confirmed"
                            ? "Confirmado"
                            : event.status === "pending"
                              ? "Pendiente"
                              : "Cancelado"}
                        </Badge>
                        <Badge className={getTypeColor(event.type)}>
                          {event.type === "propio" ? "Propio" : event.type === "privado" ? "Privado" : "Feriado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString("es-AR")}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {event.venue}
                          </div>
                        )}
                        {event.openingTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Apertura: {event.openingTime}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/events/${event.id}`}>Ver Detalle</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/events/${event.id}/presupuesto`}>Presupuesto</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing automated tasks widget */}
      <AutomatedTasksWidget showAll={true} compact={true} />
    </div>
  )
}
