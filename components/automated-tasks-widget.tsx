"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Calendar, Users, MapPin, Clock, CheckCircle, AlertTriangle, TrendingUp, Zap, Globe } from "lucide-react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import {
  generateAutomatedTasks,
  calculateDaysUntilEvent,
  getAutomatedTasksStats,
  requiresCustoms,
  getCountryFromVenue,
} from "@/lib/automated-tasks-service"

interface AutomatedTasksWidgetProps {
  eventId?: string
  className?: string
}

export function AutomatedTasksWidget({ eventId, className }: AutomatedTasksWidgetProps) {
  const { events, tasks, addTask } = useUnifiedEventStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  useEffect(() => {
    if (eventId) {
      const event = events.find((e) => e.id === eventId)
      setSelectedEvent(event || null)
    }
  }, [eventId, events])

  useEffect(() => {
    const taskStats = getAutomatedTasksStats(tasks, events)
    setStats(taskStats)
  }, [tasks, events])

  const handleGenerateTasks = async () => {
    if (!selectedEvent) return

    setIsGenerating(true)
    try {
      const newTasks = generateAutomatedTasks(selectedEvent)

      // Add tasks to store
      newTasks.forEach((task) => {
        addTask(task)
      })

      // Update stats
      const updatedStats = getAutomatedTasksStats([...tasks, ...newTasks], events)
      setStats(updatedStats)
    } catch (error) {
      console.error("Error generating tasks:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const daysUntilEvent = selectedEvent ? calculateDaysUntilEvent(selectedEvent.date) : 0
  const isInternational = selectedEvent ? requiresCustoms(selectedEvent.venue) : false
  const eventCountry = selectedEvent ? getCountryFromVenue(selectedEvent.venue) : "Argentina"

  const recentAutomatedTasks = tasks
    .filter((task) => task.isAutomated && (!eventId || task.eventId === eventId))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Event Information */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedEvent.title}
            </CardTitle>
            <CardDescription>Información del evento y generación automática de tareas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {daysUntilEvent > 0 ? `${daysUntilEvent} días restantes` : "Evento pasado"}
                </span>
              </div>
              {selectedEvent.attendees && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedEvent.attendees} asistentes</span>
                </div>
              )}
              {selectedEvent.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedEvent.venue}</span>
                </div>
              )}
            </div>

            {/* International Event Alert */}
            {isInternational && (
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Evento internacional detectado en {eventCountry}. Se generarán tareas adicionales para gestión de
                  visas, documentación aduanera y coordinación internacional.
                </AlertDescription>
              </Alert>
            )}

            {/* Generate Tasks Button */}
            <Button onClick={handleGenerateTasks} disabled={isGenerating || daysUntilEvent < 0} className="w-full">
              <Bot className="h-4 w-4 mr-2" />
              {isGenerating ? "Generando tareas..." : "Generar tareas automáticas"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && stats.totalAutomatedTasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estadísticas de Tareas Automáticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso general</span>
                <span>{Math.round((stats.completedAutomatedTasks / stats.totalAutomatedTasks) * 100)}%</span>
              </div>
              <Progress value={(stats.completedAutomatedTasks / stats.totalAutomatedTasks) * 100} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAutomatedTasks}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedAutomatedTasks}</div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingAutomatedTasks}</div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.upcomingEvents}</div>
                <div className="text-xs text-muted-foreground">Eventos próximos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Automated Tasks */}
      {recentAutomatedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Tareas Generadas Recientemente
            </CardTitle>
            <CardDescription>Últimas tareas creadas automáticamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAutomatedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{task.title}</h4>
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
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{task.category}</p>
                    {task.assignee && <p className="text-xs text-muted-foreground">Asignado a: {task.assignee}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {task.status === "pending" && task.dueDate && (
                      <div className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Alert */}
      {stats && stats.pendingAutomatedTasks > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes {stats.pendingAutomatedTasks} tarea{stats.pendingAutomatedTasks > 1 ? "s" : ""} pendiente
            {stats.pendingAutomatedTasks > 1 ? "s" : ""}. Revisa la lista de tareas para actualizar su estado.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
