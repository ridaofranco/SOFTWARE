"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Calendar, Clock, AlertTriangle, CheckCircle, Zap, Target, TrendingUp } from "lucide-react"
import {
  generateAutomatedTasks,
  getAutomatedTasksStats,
  getUrgentAutomatedEvents,
  calculateDaysUntilEvent,
  requiresCustoms,
  getCountryFromVenue,
} from "@/lib/automated-tasks-service"
import { useToast } from "@/hooks/use-toast"

interface AutomatedTasksWidgetProps {
  eventId: string
}

export function AutomatedTasksWidget({ eventId }: AutomatedTasksWidgetProps) {
  const { events, tasks, addTask } = useUnifiedEventStore()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const event = events.find((e) => e.id === eventId)
  if (!event) return null

  const eventTasks = tasks.filter((t) => t.eventId === eventId)
  const automatedTasks = eventTasks.filter((t) => t.isAutomated)
  const stats = getAutomatedTasksStats(tasks, events)
  const urgentEvents = getUrgentAutomatedEvents(tasks, events)

  const daysUntilEvent = calculateDaysUntilEvent(event.date)
  const isInternational = requiresCustoms(event.venue, event.address)
  const country = getCountryFromVenue(event.venue, event.address)

  const handleGenerateAutomatedTasks = async () => {
    setIsGenerating(true)

    try {
      const newTasks = generateAutomatedTasks(event)

      // Add each task to the store
      for (const task of newTasks) {
        addTask({
          id: task.id,
          eventId: task.eventId,
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: task.status,
          assignee: task.assignee,
          dueDate: task.dueDate,
          isAutomated: true,
          createdAt: task.createdAt,
        })
      }

      toast({
        title: "¡Tareas automáticas generadas!",
        description: `Se crearon ${newTasks.length} tareas automáticas para ${event.venue}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron generar las tareas automáticas",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span>Asistente de Tareas Automáticas</span>
          </CardTitle>
          <CardDescription>
            Sistema inteligente de generación de tareas basado en el tipo de evento y ubicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{daysUntilEvent}</div>
              <div className="text-sm text-gray-600">días hasta el evento</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{automatedTasks.length}</div>
              <div className="text-sm text-gray-600">tareas automáticas</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {automatedTasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">completadas</div>
            </div>
          </div>

          {/* Event Analysis */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Tipo de evento:</span>
              <Badge variant="outline">{isInternational ? "Internacional" : "Nacional"}</Badge>
            </div>

            {isInternational && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">País de destino:</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {country}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Requiere aduana:</span>
              <Badge variant={isInternational ? "destructive" : "default"}>{isInternational ? "Sí" : "No"}</Badge>
            </div>
          </div>

          {/* Action Button */}
          {automatedTasks.length === 0 ? (
            <Button onClick={handleGenerateAutomatedTasks} disabled={isGenerating} className="w-full" size="lg">
              <Zap className="mr-2 h-4 w-4" />
              {isGenerating ? "Generando tareas..." : "Generar Tareas Automáticas"}
            </Button>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ya se generaron {automatedTasks.length} tareas automáticas para este evento.
                {automatedTasks.filter((t) => t.status === "pending").length > 0 && (
                  <span className="block mt-1 text-orange-600">
                    {automatedTasks.filter((t) => t.status === "pending").length} tareas pendientes de completar.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tasks Preview */}
      {automatedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Tareas Automáticas Activas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automatedTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {task.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : task.status === "in-progress" ? (
                      <Clock className="h-4 w-4 text-blue-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Vence: {new Date(task.dueDate).toLocaleDateString("es-AR")} • {task.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                      🤖
                    </Badge>
                  </div>
                </div>
              ))}

              {automatedTasks.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    Ver todas las tareas ({automatedTasks.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Stats */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estadísticas Globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">{stats.pending}</div>
                <div className="text-xs text-gray-600">Pendientes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-xs text-gray-600">En progreso</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-gray-600">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
