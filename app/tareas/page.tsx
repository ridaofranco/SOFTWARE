"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Calendar, User, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Play, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TareasPage() {
  const { tasks, events, addTask, updateTask, deleteTask } = useUnifiedEventStore()
  const { toast } = useToast()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending" as "pending" | "in-progress" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    assignee: "Franco",
    dueDate: "",
    eventId: "none",
    category: "General",
  })

  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    status: "pending" as "pending" | "in-progress" | "completed",
    priority: "medium" as "low" | "medium" | "high",
    assignee: "",
    dueDate: "",
    eventId: "",
    category: "",
  })

  // Filtrar tareas
  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority

    // Filtro por tipo (manual vs automática)
    const typeMatch =
      filterType === "all" ||
      (filterType === "manual" && !task.isAutomated) ||
      (filterType === "automated" && task.isAutomated)

    // Filtro por búsqueda
    const searchMatch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase())

    return statusMatch && priorityMatch && typeMatch && searchMatch
  })

  // Estadísticas
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
  const automatedTasks = tasks.filter((t) => t.isAutomated).length

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "Por favor completa el título y fecha de vencimiento",
        variant: "destructive",
      })
      return
    }

    const taskToAdd = {
      id: `task-${Date.now()}`,
      ...newTask,
      eventId: newTask.eventId === "none" ? undefined : newTask.eventId,
      isAutomated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addTask(taskToAdd)

    toast({
      title: "Tarea creada",
      description: `${newTask.title} ha sido agregada`,
    })

    // Reset form
    setNewTask({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignee: "Franco",
      dueDate: "",
      eventId: "none",
      category: "General",
    })
    setShowAddForm(false)
  }

  const handleStatusChange = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    updateTask(taskId, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    toast({
      title: "Estado actualizado",
      description: "La tarea ha sido actualizada",
    })
  }

  const handleEditTask = (task: any) => {
    setEditTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      eventId: task.eventId || "",
      category: task.category,
    })
    setEditingTask(task.id)
  }

  const handleSaveEdit = () => {
    if (!editTask.title || !editTask.dueDate) {
      toast({
        title: "Error",
        description: "Por favor completa el título y fecha de vencimiento",
        variant: "destructive",
      })
      return
    }

    updateTask(editingTask!, {
      ...editTask,
      updatedAt: new Date().toISOString(),
    })

    toast({
      title: "Tarea actualizada",
      description: "Los cambios han sido guardados",
    })

    setEditingTask(null)
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Tareas</h1>
        <p className="text-gray-600">Organiza y supervisa todas las tareas del equipo</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">🤖 Automáticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{automatedTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>

        <div className="relative flex-1">
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="in-progress">En progreso</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="manual">Tareas Manuales</SelectItem>
              <SelectItem value="automated">🤖 Tareas Automáticas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Formulario nueva tarea */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nueva Tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Título *</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la tarea"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Descripción</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada de la tarea"
                />
              </div>

              <div>
                <Label>Prioridad</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setNewTask((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Asignado a</Label>
                <Input
                  value={newTask.assignee}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, assignee: e.target.value }))}
                />
              </div>

              <div>
                <Label>Fecha de vencimiento *</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div>
                <Label>Categoría</Label>
                <Input
                  value={newTask.category}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="Ej: Producción, Logística, etc."
                />
              </div>

              <div className="md:col-span-2">
                <Label>Evento relacionado</Label>
                <Select
                  value={newTask.eventId}
                  onValueChange={(value) => setNewTask((prev) => ({ ...prev, eventId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin evento asociado</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.venue} - {new Date(event.date).toLocaleDateString("es-AR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTask}>Crear Tarea</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de edición */}
      <Dialog open={editingTask !== null} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={editTask.title}
                onChange={(e) => setEditTask((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la tarea"
              />
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                value={editTask.description}
                onChange={(e) => setEditTask((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción detallada de la tarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prioridad</Label>
                <Select
                  value={editTask.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setEditTask((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={editTask.status}
                  onValueChange={(value: "pending" | "in-progress" | "completed") =>
                    setEditTask((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asignado a</Label>
                <Input
                  value={editTask.assignee}
                  onChange={(e) => setEditTask((prev) => ({ ...prev, assignee: e.target.value }))}
                />
              </div>

              <div>
                <Label>Fecha de vencimiento *</Label>
                <Input
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Categoría</Label>
              <Input
                value={editTask.category}
                onChange={(e) => setEditTask((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Ej: Producción, Logística, etc."
              />
            </div>

            <div>
              <Label>Evento relacionado</Label>
              <Select
                value={editTask.eventId}
                onValueChange={(value) => setEditTask((prev) => ({ ...prev, eventId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin evento asociado</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.venue} - {new Date(event.date).toLocaleDateString("es-AR")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const relatedEvent = events.find((e) => e.id === task.eventId)
            const overdue = isOverdue(task.dueDate)

            return (
              <Card
                key={task.id}
                className={`${overdue && task.status !== "completed" ? "border-red-200 bg-red-50" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status === "completed"
                            ? "Completada"
                            : task.status === "in-progress"
                              ? "En progreso"
                              : "Pendiente"}
                        </Badge>
                        {task.isAutomated && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            🤖 Automática
                          </Badge>
                        )}
                        {overdue && task.status !== "completed" && <Badge variant="destructive">Vencida</Badge>}
                      </div>

                      {task.description && <p className="text-gray-600 mb-3">{task.description}</p>}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.assignee}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(task.dueDate).toLocaleDateString("es-AR")}
                        </div>
                        {relatedEvent && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {relatedEvent.venue}
                          </div>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botones de cambio de estado */}
                      {task.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(task.id, "in-progress")}>
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}

                      {task.status === "in-progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(task.id, "completed")}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      )}

                      {task.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(task.id, "pending")}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          <Square className="w-4 h-4 mr-1" />
                          Reabrir
                        </Button>
                      )}

                      <Button size="sm" variant="outline" onClick={() => handleEditTask(task)}>
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("¿Eliminar esta tarea?")) {
                            deleteTask(task.id)
                            toast({
                              title: "Tarea eliminada",
                              description: "La tarea ha sido eliminada",
                            })
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
              <p className="text-gray-600 mb-4">
                {filterStatus !== "all" || filterPriority !== "all" || filterType !== "all" || searchQuery
                  ? "No hay tareas que coincidan con los filtros seleccionados"
                  : "Crea tu primera tarea para comenzar"}
              </p>
              {(filterStatus !== "all" || filterPriority !== "all" || filterType !== "all" || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterPriority("all")
                    setFilterType("all")
                    setSearchQuery("")
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
