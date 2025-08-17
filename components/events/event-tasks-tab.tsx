"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { useToast } from "@/components/ui/use-toast"
import { injectStandardTasks, getTasksByPriority, checkTaskReminders } from "@/lib/automated-tasks-service"
import { CheckSquare, Plus, AlertTriangle, Clock, User, Target } from "lucide-react"

interface EventTasksTabProps {
  eventId: string
}

export function EventTasksTab({ eventId }: EventTasksTabProps) {
  const [isInjecting, setIsInjecting] = useState(false)
  const { tasks, updateTask } = useUnifiedEventStore()
  const { toast } = useToast()

  const eventTasks = tasks.filter((task) => task.eventId === eventId)
  const automatedTasks = eventTasks.filter((task) => task.isAutomated)
  const manualTasks = eventTasks.filter((task) => !task.isAutomated)

  const tasksByPriority = getTasksByPriority(eventId)
  const reminders = checkTaskReminders().filter((r) => eventTasks.some((task) => task.id === r.taskId))

  const handleInjectTasks = async () => {
    setIsInjecting(true)
    try {
      const tasksCreated = injectStandardTasks(eventId)

      if (tasksCreated > 0) {
        toast({
          title: "Tareas inyectadas exitosamente",
          description: `Se crearon ${tasksCreated} tareas estándar para este evento.`,
        })
      } else {
        toast({
          title: "Tareas ya existentes",
          description: "Las tareas estándar ya fueron inyectadas para este evento.",
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "Error al inyectar tareas",
        description: "Hubo un problema al crear las tareas estándar.",
        variant: "destructive",
      })
    } finally {
      setIsInjecting(false)
    }
  }

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    updateTask(taskId, {
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    })

    toast({
      title: "Tarea actualizada",
      description: "El estado de la tarea se ha actualizado correctamente.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with injection button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Sistema de Tareas Automatizadas
              </CardTitle>
              <CardDescription>Inyección automática de tareas estándar con deadlines y recordatorios</CardDescription>
            </div>
            <Button onClick={handleInjectTasks} disabled={isInjecting} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              {isInjecting ? "Inyectando..." : "Inyectar Tareas Estándar"}
            </Button>
          </div>
        </CardHeader>

        {/* Task Statistics */}
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{automatedTasks.length}</div>
              <div className="text-sm text-gray-600">Automatizadas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {automatedTasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {automatedTasks.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{reminders.length}</div>
              <div className="text-sm text-gray-600">Alertas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Recordatorios y Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div
                  key={reminder.taskId}
                  className={`p-3 rounded-lg border-l-4 ${
                    reminder.urgency === "high"
                      ? "border-red-500 bg-red-50"
                      : reminder.urgency === "medium"
                        ? "border-orange-500 bg-orange-50"
                        : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <p className="text-sm font-medium">{reminder.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks organized by category */}
      <Tabs defaultValue="arte" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="arte">ARTE ({tasksByPriority.critical.length})</TabsTrigger>
          <TabsTrigger value="booking">BOOKING ({tasksByPriority.important.length})</TabsTrigger>
          <TabsTrigger value="marketing">MARKETING ({tasksByPriority.normal.length})</TabsTrigger>
          <TabsTrigger value="manual">MANUALES ({manualTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="arte">
          <TaskCategoryList
            tasks={automatedTasks.filter((t) => t.category === "ARTE")}
            onStatusChange={handleTaskStatusChange}
            title="Tareas de Arte y Producción"
            description="Dirección artística, escenografía, iluminación y efectos especiales"
          />
        </TabsContent>

        <TabsContent value="booking">
          <TaskCategoryList
            tasks={automatedTasks.filter((t) => t.category === "BOOKING")}
            onStatusChange={handleTaskStatusChange}
            title="Tareas de Booking y Logística"
            description="DJ, seguridad, personal técnico y gestión de accesos"
          />
        </TabsContent>

        <TabsContent value="marketing">
          <TaskCategoryList
            tasks={automatedTasks.filter((t) => t.category === "MARKETING")}
            onStatusChange={handleTaskStatusChange}
            title="Tareas de Marketing"
            description="Contenido, fotografía, merchandising y promoción"
          />
        </TabsContent>

        <TabsContent value="manual">
          <TaskCategoryList
            tasks={manualTasks}
            onStatusChange={handleTaskStatusChange}
            title="Tareas Manuales"
            description="Tareas creadas manualmente para este evento"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TaskCategoryListProps {
  tasks: any[]
  onStatusChange: (taskId: string, status: string) => void
  title: string
  description: string
}

function TaskCategoryList({ tasks, onStatusChange, title, description }: TaskCategoryListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No hay tareas en esta categoría</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === "pending"
                      ? "Pendiente"
                      : task.status === "in-progress"
                        ? "En Progreso"
                        : task.status === "completed"
                          ? "Completada"
                          : "Bloqueada"}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)} variant="outline">
                    {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {task.assignee}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Vence: {new Date(task.dueDate).toLocaleDateString("es-AR")}
                </div>
              </div>

              {task.questions && task.questions.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Preguntas guía:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {task.questions.slice(0, 3).map((question: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="w-3 h-3 mt-1 flex-shrink-0" />
                        {question}
                      </li>
                    ))}
                    {task.questions.length > 3 && (
                      <li className="text-xs italic">+{task.questions.length - 3} preguntas más...</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {task.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => onStatusChange(task.id, "in-progress")}>
                    Iniciar
                  </Button>
                )}
                {task.status === "in-progress" && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(task.id, "completed")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Completar
                  </Button>
                )}
                {task.status !== "completed" && (
                  <Button size="sm" variant="destructive" onClick={() => onStatusChange(task.id, "blocked")}>
                    Bloquear
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
