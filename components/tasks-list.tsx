"use client"

import { useState } from "react"
import { CalendarClock, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useEventStore } from "@/lib/event-service"

interface TasksListProps {
  limit?: number
  eventId?: string
}

export function TasksList({ limit = 0, eventId }: TasksListProps) {
  const allTasks = useEventStore((state) => state.tasks)
  const events = useEventStore((state) => state.events)
  const addTask = useEventStore((state) => state.addTask)
  const updateTask = useEventStore((state) => state.updateTask)

  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "media",
    status: "pendiente",
    eventId: eventId || "",
    assignedTo: "",
  })

  // Filter tasks if eventId is provided
  const tasks = eventId ? allTasks.filter((task) => task.eventId === eventId) : allTasks

  // Apply limit if provided
  const displayedTasks = limit > 0 ? tasks.slice(0, limit) : tasks

  const handleTaskComplete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      updateTask(taskId, {
        status: task.status === "completada" ? "pendiente" : "completada",
      })
    }
  }

  const handleAddTask = () => {
    addTask({
      ...newTask,
      id: `task-${Date.now()}`,
    })

    setNewTaskOpen(false)
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "media",
      status: "pendiente",
      eventId: eventId || "",
      assignedTo: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          {limit > 0 && (
            <p className="text-sm text-muted-foreground">
              Mostrando {Math.min(limit, displayedTasks.length)} de {tasks.length} tareas
            </p>
          )}
        </div>
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Título de la tarea"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descripción detallada"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Fecha límite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event">Evento</Label>
                  <Select value={newTask.eventId} onValueChange={(value) => setNewTask({ ...newTask, eventId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                      <SelectItem value="general">General (Todos los eventos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedTo">Asignado a</Label>
                  <Input
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>
              <Button onClick={handleAddTask} className="mt-2">
                Crear Tarea
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {displayedTasks.length === 0 ? (
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground">No hay tareas pendientes</p>
          </div>
        ) : (
          displayedTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start space-x-4 rounded-md border p-4 ${
                task.status === "completada" ? "bg-muted/50" : ""
              }`}
            >
              <Checkbox
                checked={task.status === "completada"}
                onCheckedChange={() => handleTaskComplete(task.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium ${task.status === "completada" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </p>
                  <Badge
                    variant={
                      task.priority === "alta" ? "destructive" : task.priority === "media" ? "default" : "outline"
                    }
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(task.dueDate), "dd MMM yyyy", { locale: es })}
                    </span>
                    {task.eventId && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {events.find((e) => e.id === task.eventId)?.title || "General"}
                      </span>
                    )}
                  </div>
                  <span>{task.assignedTo}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
