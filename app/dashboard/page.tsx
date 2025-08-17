"use client"

import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, CheckCircle, Clock, MapPin, AlertTriangle, Calendar } from "lucide-react"
import Link from "next/link"
import TasksList from "@/components/tasks-list"
import { AutomatedTasksWidget } from "@/components/automated-tasks-widget"
import { CountdownWidget } from "@/components/countdown-widget"
import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"

export default function DashboardPage() {
  const { events, tasks } = useUnifiedEventStore()

  // Estadísticas generales
  const totalEvents = events.length
  const confirmedEvents = events.filter((e) => e.status === "confirmed").length
  const pendingEvents = events.filter((e) => e.status === "pending").length

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length

  // Próximos eventos (siguientes 30 días) - SIEMPRE mostrar 30 días
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate >= today && eventDate <= thirtyDaysFromNow
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Tareas críticas (próximos 7 días y vencidas)
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const criticalTasks = tasks
    .filter((task) => {
      const dueDate = new Date(task.dueDate)
      return (dueDate <= sevenDaysFromNow || dueDate < today) && task.status !== "completed"
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const getEventUrgency = (eventDate: string) => {
    const daysUntil = differenceInDays(new Date(eventDate), today)
    if (daysUntil < 0) return { color: "bg-gray-100 text-gray-600", label: "Pasado" }
    if (daysUntil === 0) return { color: "bg-red-100 text-red-700", label: "HOY" }
    if (daysUntil === 1) return { color: "bg-orange-100 text-orange-700", label: "MAÑANA" }
    if (daysUntil <= 7) return { color: "bg-yellow-100 text-yellow-700", label: `${daysUntil} días` }
    if (daysUntil <= 14) return { color: "bg-blue-100 text-blue-700", label: `${daysUntil} días` }
    return { color: "bg-green-100 text-green-700", label: `${daysUntil} días` }
  }

  const getTaskUrgency = (dueDate: string) => {
    const taskDate = new Date(dueDate)
    const daysUntil = differenceInDays(taskDate, today)

    if (daysUntil < 0) return { color: "bg-red-100 text-red-700 border-red-200", label: "VENCIDA", icon: AlertTriangle }
    if (daysUntil === 0) return { color: "bg-orange-100 text-orange-700 border-orange-200", label: "HOY", icon: Clock }
    if (daysUntil === 1)
      return { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "MAÑANA", icon: Clock }
    if (daysUntil <= 7)
      return { color: "bg-blue-100 text-blue-700 border-blue-200", label: `${daysUntil}d`, icon: Calendar }
    return { color: "bg-gray-100 text-gray-600 border-gray-200", label: `${daysUntil}d`, icon: Calendar }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Gestión de eventos y tareas - Vista de 30 días</p>
      </div>

      {/* Estadísticas principales - Solo eventos y tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos (30 días)</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {upcomingEvents.filter((e) => e.status === "confirmed").length} confirmados
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                {upcomingEvents.filter((e) => e.status === "pending").length} pendientes
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Tareas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-2">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {completedTasks} ✓
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                {inProgressTasks} →
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                {pendingTasks} ○
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget de tareas automáticas */}
      <div className="mb-8">
        <AutomatedTasksWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Próximos eventos - Más espacio */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Próximos 30 Días
              </span>
              <Link href="/events">
                <Button variant="outline" size="sm">
                  Ver calendario
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No hay eventos programados en los próximos 30 días</p>
                <Link href="/events/new">
                  <Button className="mt-4">Crear Evento</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const urgency = getEventUrgency(event.date)
                  const eventDate = new Date(event.date)

                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge className={urgency.color}>{urgency.label}</Badge>
                          <Badge variant={event.status === "confirmed" ? "default" : "secondary"}>
                            {event.status === "confirmed" ? "Confirmado" : "Pendiente"}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.venue}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(eventDate, "EEEE, dd 'de' MMMM", { locale: es })}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CountdownWidget
                          eventDate={event.date}
                          eventTitle={event.title}
                          eventVenue={event.venue}
                          compact
                        />
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas críticas - Menos espacio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                Tareas Críticas
              </span>
              <Link href="/tareas">
                <Button variant="outline" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                <p className="text-green-600 text-sm font-medium">¡Todo al día!</p>
                <p className="text-gray-500 text-xs">No hay tareas críticas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalTasks.slice(0, 8).map((task) => {
                  const urgency = getTaskUrgency(task.dueDate)
                  const relatedEvent = events.find((e) => e.id === task.eventId)
                  const UrgencyIcon = urgency.icon

                  return (
                    <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                        <Badge className={`${urgency.color} text-xs`}>
                          <UrgencyIcon className="w-3 h-3 mr-1" />
                          {urgency.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{task.assignee}</span>
                          {relatedEvent && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-20">{relatedEvent.venue}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {task.isAutomated && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs px-1 py-0">
                              🤖
                            </Badge>
                          )}
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {task.priority === "high" ? "!" : task.priority === "medium" ? "•" : "·"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {criticalTasks.length > 8 && (
                  <div className="text-center pt-2">
                    <Link href="/tareas">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Ver {criticalTasks.length - 8} tareas más
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gestión rápida de tareas - Compacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestión Rápida de Tareas</span>
            <Link href="/tareas">
              <Button variant="outline" size="sm">
                Gestión completa
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TasksList compact={true} showFilters={false} />
        </CardContent>
      </Card>
    </div>
  )
}
