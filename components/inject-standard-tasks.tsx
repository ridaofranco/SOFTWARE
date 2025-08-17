"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { generateStandardTasksForEvent, STANDARD_TASKS_CATALOG, getTasksByCategory } from "@/lib/standard-tasks-service"
import { Plus, Zap, AlertTriangle, Clock, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function InjectStandardTasks() {
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { events, addTask } = useUnifiedEventStore()
  const { toast } = useToast()

  // Filtrar eventos futuros
  const futureEvents = events
    .filter((event) => new Date(event.date) > new Date() && event.type !== "feriado")
    .sort((a, b) => a.date.localeCompare(b.date))

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const handleInjectTasks = async () => {
    if (!selectedEventId || !selectedEvent) {
      toast({
        title: "Error",
        description: "Por favor selecciona un evento",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const standardTasks = generateStandardTasksForEvent(selectedEventId, selectedEvent.date, selectedEvent.title)

      // Agregar todas las tareas al store
      standardTasks.forEach((task) => {
        addTask(task)
      })

      toast({
        title: "¡Tareas inyectadas exitosamente!",
        description: `Se agregaron ${standardTasks.length} tareas estándar para ${selectedEvent.title}`,
      })

      setIsOpen(false)
      setSelectedEventId("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al inyectar las tareas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const tasksByCategory = getTasksByCategory(
    STANDARD_TASKS_CATALOG.map((st) => ({
      id: st.id,
      title: st.title,
      description: st.description,
      status: "pending" as const,
      priority: st.priority,
      assignee: st.assignee,
      dueDate: "",
      category: st.category,
      isAutomated: false,
    })),
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAssigneeColor = (assignee: string) => {
    switch (assignee) {
      case "FRANCO":
        return "bg-blue-100 text-blue-800"
      case "PABLO":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Zap className="w-4 h-4 mr-2" />
          Inyectar Tareas Estándar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Inyectar Tareas Estándar
          </DialogTitle>
          <DialogDescription>
            Selecciona un evento para agregar automáticamente todas las tareas estándar de producción. Incluye{" "}
            {STANDARD_TASKS_CATALOG.length} tareas organizadas por categorías.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de evento */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Evento</label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un evento futuro..." />
              </SelectTrigger>
              <SelectContent>
                {futureEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex items-center gap-2">
                      <span>{event.emoji}</span>
                      <span>{event.title}</span>
                      <span className="text-muted-foreground">
                        ({new Date(event.date).toLocaleDateString("es-AR")})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vista previa de tareas por categoría */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Vista Previa de Tareas ({STANDARD_TASKS_CATALOG.length} total)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tasksByCategory).map(([category, tasks]) => (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      {category}
                      <Badge variant="outline">{tasks.length} tareas</Badge>
                    </CardTitle>
                    <CardDescription>
                      {category === "ARTE" && "Dirección artística, escenografía, iluminación"}
                      {category === "BOOKING" && "DJ, sonido, seguridad, staff"}
                      {category === "MARKETING" && "Concepto, diseño, redes sociales"}
                      {category === "EXTRAS" && "Permisos, seguros, limpieza"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tasks.slice(0, 3).map((task) => {
                      const standardTask = STANDARD_TASKS_CATALOG.find(
                        (st) => st.id === task.id.replace("standard-", "").split("-")[2],
                      )
                      return (
                        <div key={task.id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1">{task.title}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {task.priority}
                            </Badge>
                            <Badge className={getAssigneeColor(task.assignee)} variant="secondary">
                              <User className="w-3 h-3 mr-1" />
                              {task.assignee}
                            </Badge>
                            {standardTask && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {standardTask.daysBeforeEvent}d
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {tasks.length > 3 && (
                      <div className="text-xs text-muted-foreground">+{tasks.length - 3} tareas más...</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Qué incluye?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>25 tareas estándar</strong> organizadas por categorías
              </li>
              <li>
                • <strong>Fechas límite automáticas</strong> basadas en días antes del evento
              </li>
              <li>
                • <strong>Responsables asignados</strong> (Franco/Pablo) según especialidad
              </li>
              <li>
                • <strong>Preguntas guía</strong> para cada tarea
              </li>
              <li>
                • <strong>Prioridades definidas</strong> (críticas ≤15 días, importantes ≤14 días)
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleInjectTasks}
              disabled={!selectedEventId || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Inyectando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Inyectar {STANDARD_TASKS_CATALOG.length} Tareas
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
