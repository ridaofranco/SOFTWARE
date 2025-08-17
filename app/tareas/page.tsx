"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Filter, Search, Plus, CheckCircle, AlertCircle, Circle, Pause } from "lucide-react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import {
  generateAutomatedTasks,
  getAutomatedTasksStats,
  filterTasks,
  getOverdueTasks,
  getUpcomingTasks,
  type Task,
} from "@/lib/automated-tasks-service"
import { useToast } from "@/hooks/use-toast"

export default function TasksPage() {
  const { events, tasks, addTask, updateTask, deleteTask } = useUnifiedEventStore()
  const { toast } = useToast()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "medium" as const,
    dueDate: "",
    estimatedHours: 1,
    assignee: "",
    eventId: "",
  })

  // Generate automated tasks for events that don't have them
  useEffect(() => {
    try {
      events.forEach((event) => {
        const eventTasks = tasks.filter((task) => task.eventId === event.id)
        const hasAutomatedTasks = eventTasks.some((task) => task.isAutomated)

        if (!hasAutomatedTasks && event.date) {
          const automatedTasks = generateAutomatedTasks(event)
          automatedTasks.forEach((task) => {
            addTask(task)
          })
        }
      })
    } catch (error) {
      console.error("Error generating automated tasks:", error)
    }
  }, [events, tasks, addTask])

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    try {
      return filterTasks(tasks, {
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: searchTerm || undefined,
      })
    } catch (error) {
      console.error("Error filtering tasks:", error)
      return []
    }
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, typeFilter])

  // Get task statistics
  const stats = useMemo(() => getAutomatedTasksStats(filteredTasks), [filteredTasks])
  const overdueTasks = useMemo(() => getOverdueTasks(filteredTasks), [filteredTasks])
  const upcomingTasks = useMemo(() => getUpcomingTasks(filteredTasks), [filteredTasks])

  // Get unique categories for filters
  const categories = useMemo(() => Array.from(new Set(tasks.map((task) => task.category))), [tasks])

  // Handle task status update
  const handleStatusUpdate = (taskId: string, newStatus: Task["status"]) => {
    try {
      const now = new Date().toISOString()
      updateTask(taskId, {
        status: newStatus,
        updatedAt: now,
      })

      toast({
        title: "Tarea actualizada",
        description: `Estado cambiado a ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      })
    }
  }

  // Handle new task creation
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "Título y fecha de vencimiento son requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      const now = new Date().toISOString()
      const task: Task = {
        id: `manual-${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority,
        status: "pending",
        dueDate: newTask.dueDate,
        estimatedHours: newTask.estimatedHours,
        assignee: newTask.assignee || undefined,
        isAutomated: false,
        eventId: newTask.eventId,
        createdAt: now,
        updatedAt: now,
      }

      addTask(task)
      setShowNewTaskForm(false)
      setNewTask({
        title: "",
        description: "",
        category: "General",
        priority: "medium",
        dueDate: "",
        estimatedHours: 1,
        assignee: "",
        eventId: "",
      })

      toast({
        title: "Tarea creada",
        description: "Nueva tarea agregada exitosamente",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive",
      })
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Pause className="h-4 w-4 text-blue-500" />
      case "pending":
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (task.status === "completed") return false
    try {
      const now = new Date()
      const dueDate = new Date(task.dueDate)
      return dueDate < now
    } catch (error) {
      console.error("Error checking if task is overdue:", error)
      return false
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR")
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
          <p className="text-muted-foreground">Administra tareas automáticas y manuales para tus eventos</p>
        </div>
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.completed} completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Pause className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">{stats.pending} pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in-progress">En progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Circle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tareas</h3>
              <p className="text-muted-foreground text-center">
                No se encontraron tareas que coincidan con los filtros seleccionados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const event = events.find((e) => e.id === task.eventId)
              const isTaskOverdue = isOverdue(task)

              return (
                <Card key={task.id} className={`${isTaskOverdue ? "border-red-200 bg-red-50" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <CardDescription className="mt-1">{task.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge variant="outline">{task.isAutomated ? "Automática" : "Manual"}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Vence: {formatDate(task.dueDate)}
                          {isTaskOverdue && <span className="text-red-600 ml-1">(Vencida)</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimatedHours || 1}h estimadas</span>
                      </div>
                      {task.assignee && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{task.assignee}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{task.category}</Badge>
                        {event && <Badge variant="outline">{event.title}</Badge>}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status !== "completed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(task.id, "in-progress")}
                              disabled={task.status === "in-progress"}
                            >
                              En Progreso
                            </Button>
                            <Button size="sm" onClick={() => handleStatusUpdate(task.id, "completed")}>
                              Completar
                            </Button>
                          </>
                        )}
                        {task.status === "completed" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(task.id, "pending")}>
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nueva Tarea</CardTitle>
              <CardDescription>Crear una nueva tarea manual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Título de la tarea"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Descripción de la tarea"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Venue Management">Venue Management</SelectItem>
                      <SelectItem value="Technical Production">Technical Production</SelectItem>
                      <SelectItem value="Catering & Logistics">Catering & Logistics</SelectItem>
                      <SelectItem value="Security & Safety">Security & Safety</SelectItem>
                      <SelectItem value="Marketing & Promotion">Marketing & Promotion</SelectItem>
                      <SelectItem value="Financial Management">Financial Management</SelectItem>
                      <SelectItem value="Artistic Direction">Artistic Direction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Prioridad</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha de vencimiento</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Horas estimadas</label>
                  <Input
                    type="number"
                    min="1"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Evento</label>
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
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Asignado a (opcional)</label>
                <Input
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTask}>Crear Tarea</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
