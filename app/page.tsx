"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUnifiedEventStore, upcomingEvents30d, nowAR } from "@/store/unified-event-store"
import { Calendar, MapPin, Clock, Plus, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { DateTime } from "luxon"
import Link from "next/link"
import { CountdownDisplay } from "@/components/countdown-display"
import { AutomatedTasksWidget } from "@/components/automated-tasks-widget"
import TasksList from "@/components/tasks-list"

export default function DashboardPage() {
  const { events, tasks, venues } = useUnifiedEventStore()
  const [currentTime, setCurrentTime] = useState(nowAR())

  // Actualizar la hora cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(nowAR())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Obtener eventos de los próximos 30 días
  const upcomingEvents = upcomingEvents30d(events)

  // Estadísticas
  const confirmedEvents = upcomingEvents.filter((e) => e.status === "confirmed").length
  const pendingEvents = upcomingEvents.filter((e) => e.status === "pending").length
  const ownEvents = upcomingEvents.filter((e) => e.type === "propio").length
  const privateEvents = upcomingEvents.filter((e) => e.type === "privado").length

  // Tareas urgentes (próximas a vencer)
  const urgentTasks = tasks.filter((task) => {
    const dueDate = DateTime.fromISO(task.dueDate)
    const daysUntilDue = dueDate.diff(currentTime, "days").days
    return daysUntilDue <= 7 && task.status !== "completed"
  })

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getVenueName = (event: any) => {
    return event.venue || (event.venueId ? venues.find((v) => v.id === event.venueId)?.nombre : "Sin venue")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con hora actual de Argentina */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard DER</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {currentTime.toFormat("EEEE, dd MMMM yyyy - HH:mm", { locale: "es" })} (AR)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/events/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas de próximos 30 días */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 30 días</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Eventos totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedEvents}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents.length > 0 ? Math.round((confirmedEvents / upcomingEvents.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents.length > 0 ? Math.round((pendingEvents / upcomingEvents.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propios</CardTitle>
            <Badge className="bg-blue-500">{ownEvents}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ownEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos DER</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTasks.length}</div>
            <p className="text-xs text-muted-foreground">Vencen en 7 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Eventos próximos con countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Eventos (30 días)
            </CardTitle>
            <CardDescription>Eventos confirmados y pendientes en los próximos 30 días</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay eventos próximos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No hay eventos programados en los próximos 30 días
                </p>
                <Link href="/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingEvents.slice(0, 8).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{event.emoji}</span>
                      <h4 className="font-medium">{getVenueName(event)}</h4>
                      <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {DateTime.fromISO(event.date).toFormat("dd/MM/yyyy", { locale: "es" })}
                      </span>
                      {event.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CountdownDisplay targetDate={event.date} />
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
            {upcomingEvents.length > 8 && (
              <div className="text-center pt-4">
                <Link href="/events">
                  <Button variant="outline">Ver todos los eventos ({upcomingEvents.length})</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Tareas Urgentes
            </CardTitle>
            <CardDescription>Tareas que vencen en los próximos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <TasksList compact={true} showFilters={false} />
          </CardContent>
        </Card>
      </div>

      {/* Widget de tareas automáticas */}
      <AutomatedTasksWidget />
    </div>
  )
}
