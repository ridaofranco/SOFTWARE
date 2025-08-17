"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, MapPin, AlertTriangle } from "lucide-react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { processAutomatedTasks, getAutomatedTasksStats, getUrgentAutomatedEvents } from "@/lib/automated-tasks-service"

interface AutomatedTasksWidgetProps {
  compact?: boolean
  eventId?: string
}

export function AutomatedTasksWidget({ compact = false, eventId }: AutomatedTasksWidgetProps) {
  const { tasks, updateTask } = useUnifiedEventStore()
  const [hasProcessedTasks, setHasProcessedTasks] = useState(false)
  const [stats, setStats] = useState({
    totalAutomatedTasks: 0,
    pendingAutomatedTasks: 0,
    completedAutomatedTasks: 0,
    eventsWithAutomation: 0,
    upcomingEvents: 0,
  })
  const [urgentEvents, setUrgentEvents] = useState<any[]>([])

  // Procesar tareas automáticas solo una vez
  useEffect(() => {
    if (!hasProcessedTasks) {
      processAutomatedTasks()
      setHasProcessedTasks(true)
    }
  }, [hasProcessedTasks])

  // Actualizar estadísticas cuando cambien las tareas
  useEffect(() => {
    const newStats = getAutomatedTasksStats()
    setStats(newStats)

    const urgent = getUrgentAutomatedEvents()
    setUrgentEvents(urgent)
  }, [tasks])

  // Si es para un evento específico, filtrar tareas
  const eventTasks = eventId
    ? tasks.filter((task) => task.eventId === eventId && task.isAutomated)
    : tasks.filter((task) => task.isAutomated)

  const handleTaskStatusChange = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    updateTask(taskId, { status: newStatus })
  }

  if (compact && eventId) {
    // Vista compacta para evento específico
    const pendingTasks = eventTasks.filter((task) => task.status === "pending")
    const completedTasks = eventTasks.filter((task) => task.status === "completed")
    const progress = eventTasks.length > 0 ? (completedTasks.length / eventTasks.length) * 100 : 0

    if (eventTasks.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">No hay tareas automáticas para este evento</div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🤖 Tareas Automáticas
            <Badge variant="outline">{eventTasks.length}</Badge>
          </CardTitle>
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-muted-foreground">
            {completedTasks.length} de {eventTasks.length} completadas
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventTasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex-1">
                <div className="font-medium text-sm">{task.title}</div>
                <div className="text-xs text-muted-foreground">
                  Vence: {new Date(task.dueDate).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    task.status === "completed" ? "default" : task.status === "in-progress" ? "secondary" : "outline"
                  }
                  className="text-xs"
                >
                  {task.status === "completed" ? "✓" : task.status === "in-progress" ? "⏳" : "⏸"}
                </Badge>
                {task.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => handleTaskStatusChange(task.id, "in-progress")}>
                    Iniciar
                  </Button>
                )}
                {task.status === "in-progress" && (
                  <Button size="sm" variant="outline" onClick={() => handleTaskStatusChange(task.id, "completed")}>
                    Completar
                  </Button>
                )}
              </div>
            </div>
          ))}
          {eventTasks.length > 3 && (
            <div className="text-center text-sm text-muted-foreground">+{eventTasks.length - 3} tareas más</div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Vista completa para dashboard
  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">{stats.totalAutomatedTasks}</div>
            <div className="text-sm text-muted-foreground">Total Automáticas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingAutomatedTasks}</div>
            <div className="text-sm text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completedAutomatedTasks}</div>
            <div className="text-sm text-muted-foreground">Completadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.eventsWithAutomation}</div>
            <div className="text-sm text-muted-foreground">Eventos con Tareas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{urgentEvents.length}</div>
            <div className="text-sm text-muted-foreground">Eventos Urgentes</div>
          </CardContent>
        </Card>
      </div>

      {/* Eventos que requieren atención urgente */}
      {urgentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Eventos que Requieren Atención Urgente
            </CardTitle>
            <CardDescription>Eventos en los próximos 30 días con tareas automáticas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">{event.venue}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString("es-AR")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.daysUntilEvent} días restantes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{event.pendingTasks} pendientes</Badge>
                    <Badge variant="secondary">{event.automatedTasks} total</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
