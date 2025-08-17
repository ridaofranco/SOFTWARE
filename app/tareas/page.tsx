"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  Target,
  TrendingUp,
} from "lucide-react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import {
  generateAutomatedTasks,
  getAutomatedTasksStats,
  filterTasks,
  getOverdueTasks,
  getUpcomingTasks,
  calculateDaysUntilEvent,
  type Task,
  type TaskStats,
} from "@/lib/automated-tasks-service"

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusIcons = {
  pending: Circle,
  "in-progress": PlayCircle,
  completed: CheckCircle,
  cancelled: AlertTriangle,
}

export default function TasksPage() {
  const { toast } = useToast()
  const { events, tasks, addTask, updateTask } = useUnifiedEventStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>("")

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "General",
    assignee: "",
    dueDate: "",
    estimatedHours: 1,
  })

  // Generate automated tasks for events that don't have them
  useEffect(() => {
    events.forEach((event) => {
      const eventTasks = tasks.filter((task) => task.eventId === event.id && task.isAutomated)
      if (eventTasks.length === 0 && event.date) {
        const daysUntilEvent = calculateDaysUntilEvent(event.date)
        if (daysUntilEvent > 0 && daysUntilEvent <= 365) {
          const automatedTasks = generateAutomatedTasks(event)
          automatedTasks.forEach((task) => {
            addTask(task)
          })

          if (automatedTasks.length > 0) {
            toast({
              title: "Tareas automáticas generadas",
              description: `Se generaron ${automatedTasks.length} tareas para ${event.title}`,
            })
          }
        }
      }
    })
  }, [events, tasks, addTask, toast])

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, {
      status: statusFilter === "all" ? undefined : statusFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      type: typeFilter === "all" ? undefined : typeFilter,
      search: searchTerm || undefined,
    })
  }, [tasks, searchTerm, statusFilter, priorityFilter, categoryFilter, typeFilter])

  // Get task statistics
  const taskStats: TaskStats = useMemo(() => {
    return getAutomatedTasksStats(filteredTasks)
  }, [filteredTasks])

  // Get overdue and upcoming tasks
  const overdueTasks = useMemo(() => getOverdueTasks(filteredTasks), [filteredTasks])
  const upcomingTasks = useMemo(() => getUpcomingTasks(filteredTasks, 7), [filteredTasks])

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(tasks.map((task) => task.category)))
    return cats.sort()
  }, [tasks])

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "El título de la tarea es requerido",
        variant: "destructive",
      })
      return
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      assignee: newTask.assignee || undefined,
      dueDate: newTask.dueDate || new Date().toISOString(),
      status: "pending",
      eventId: selectedEvent || undefined,
      isAutomated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedHours: newTask.estimatedHours,
    }

    addTask(task)

    // Reset form
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "General",
      assignee: "",
      dueDate: "",
      estimatedHours: 1,
    })
    setSelectedEvent("")
    setIsNewTaskDialogOpen(false)

    toast({
      title: "Tarea creada",
      description: "La tarea se ha creado exitosamente",
    })
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      updateTask(taskId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Tarea actualizada",
        description: `Estado cambiado a ${newStatus}`,
      })
    }
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusIcons[task.status]
    const event = events.find((e) => e.id === task.eventId)
    const isOverdue = overdueTasks.some((t) => t.id === task.id)

    return (
      <Card className={`transition-all hover:shadow-md ${isOverdue ? "border-red-200 bg-red-50" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                {task.title}
                {task.isAutomated && (
                  <Badge variant="outline" className="text-xs">
                    Auto
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">{task.description}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
              <Badge className={statusColors[task.status]}>{task.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
                {task.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {task.estimatedHours}h
                  </div>
                )}
                {task.assignee && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {task.assignee}
                  </div>
                )}
              </div>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Vencida
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {task.category}
                </Badge>
                {event && (
                  <Badge variant="outline" className="text-xs">
                    {event.title}
                  </Badge>
                )}
              </div>

              <div className="flex gap-1">
                {task.status !== "completed" && (
                  <>
                    {task.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                      >
                        Iniciar
                      </Button>
                    )}
                    {task.status === "in-progress" && (
                      <Button size="sm" variant="outline" onClick={() => handleUpdateTaskStatus(task.id, "completed")}>
                        Completar
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
          <p className="text-gray-600 mt-1">Administra todas las tareas de tus eventos</p>
        </div>

        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
              <DialogDescription>Crea una nueva tarea manual para gestionar tu evento</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la tarea"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción detallada"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask((prev) => ({ ...prev, priority: value }))}
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

                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask((prev) => ({ ...prev, category: value }))}
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
              </div>

              <div>
                <Label htmlFor="event">Evento (opcional)</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignee">Asignado a</Label>
                  <Input
                    id="assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, assignee: e.target.value }))}
                    placeholder="Nombre del responsable"
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Fecha límite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedHours">Horas estimadas</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={newTask.estimatedHours}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, estimatedHours: Number.parseFloat(e.target.value) || 1 }))
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTask} className="flex-1">
                  Crear Tarea
                </Button>
                <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">{taskStats.completed} completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completionPercentage}%</div>
            <Progress value={taskStats.completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Tareas activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="automated">Automáticas</SelectItem>
                  <SelectItem value="manual">Manuales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setPriorityFilter("all")
                  setCategoryFilter("all")
                  setTypeFilter("all")
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">Vencidas ({overdueTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay tareas</h3>
                <p className="text-gray-500 text-center">No se encontraron tareas con los filtros aplicados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">¡Excelente!</h3>
                <p className="text-gray-500 text-center">No tienes tareas vencidas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Sin tareas próximas</h3>
                <p className="text-gray-500 text-center">No tienes tareas programadas para los próximos 7 días.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tareas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(taskStats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / taskStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tareas por Prioridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(taskStats.byPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={priorityColors[priority as keyof typeof priorityColors]}>{priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${(count / taskStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
