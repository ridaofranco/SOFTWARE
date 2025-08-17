"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  AlertTriangle,
  Bot,
  Plus,
  BarChart3,
} from "lucide-react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { InjectStandardTasks } from "@/components/inject-standard-tasks"
import { getAutomatedTasksStats } from "@/lib/automated-tasks-service"
import { DateTime } from "luxon"
import { useToast } from "@/hooks/use-toast"

interface TasksListProps {
  eventId?: string
  showAutomatedOnly?: boolean
  className?: string
}

export function TasksList({ eventId, showAutomatedOnly = false, className }: TasksListProps) {
  const { tasks, updateTask, events } = useUnifiedEventStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [automatedFilter, setAutomatedFilter] = useState<string>(showAutomatedOnly ? "automated" : "all")
  const [showInjectDialog, setShowInjectDialog] = useState(false)

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Filter by event if specified
    if (eventId) {
      filtered = filtered.filter((task) => task.eventId === eventId)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter)
    }

    // Filter by assignee
    if (assigneeFilter !== "all") {
      filtered = filtered.filter((task) => task.assignee === assigneeFilter)
    }

    // Filter by automated
    if (automatedFilter === "automated") {
      filtered = filtered.filter((task) => task.isAutomated)
    } else if (automatedFilter === "manual") {
      filtered = filtered.filter((task) => !task.isAutomated)
    }

    return filtered.sort((a, b) => {
      // Sort by due date, then by priority
      if (a.dueDate && b.dueDate) {
        const dateA = DateTime.fromISO(a.dueDate)
        const dateB = DateTime.fromISO(b.dueDate)
        const dateDiff = dateA.toMillis() - dateB.toMillis()
        if (dateDiff !== 0) return dateDiff
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [tasks, eventId, searchTerm, statusFilter, priorityFilter, categoryFilter, assigneeFilter, automatedFilter])

  // Get unique values for filters
  const categories = useMemo(() => {
    const cats = [...new Set(tasks.map((task) => task.category))].filter(Boolean)
    return cats.sort()
  }, [tasks])

  const assignees = useMemo(() => {
    const assigns = [...new Set(tasks.map((task) => task.assignee))].filter(Boolean)
    return assigns.sort()
  }, [tasks])

  // Calculate statistics
  const stats = useMemo(() => {
    return getAutomatedTasksStats(filteredTasks, events)
  }, [filteredTasks, events])

  const overdueTasks = useMemo(() => {
    return filteredTasks.filter((task) => {
      if (task.status === "completed" || !task.dueDate) return false
      const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
      const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
      return dueDate < now
    })
  }, [filteredTasks])

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask(taskId, {
      status: newStatus as any,
      updatedAt: DateTime.now().setZone("America/Argentina/Buenos_Aires").toISO(),
    })

    toast({
      title: "Estado actualizado",
      description: `La tarea ha sido marcada como ${newStatus}`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const isOverdue = (task: any) => {
    if (task.status === "completed" || !task.dueDate) return false
    const dueDate = DateTime.fromISO(task.dueDate, { zone: "America/Argentina/Buenos_Aires" })
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    return dueDate < now
  }

  const formatDueDate = (dateString: string) => {
    const date = DateTime.fromISO(dateString, { zone: "America/Argentina/Buenos_Aires" })
    const now = DateTime.now().setZone("America/Argentina/Buenos_Aires")
    const diff = date.diff(now, "days").days

    if (Math.abs(diff) < 1) {
      return "Hoy"
    } else if (diff === 1) {
      return "Mañana"
    } else if (diff === -1) {
      return "Ayer"
    } else if (diff > 1 && diff <= 7) {
      return `En ${Math.ceil(diff)} días`
    } else if (diff < -1 && diff >= -7) {
      return `Hace ${Math.abs(Math.floor(diff))} días`
    } else {
      return date.toFormat("dd/MM/yyyy")
    }
  }

  const completionPercentage =
    filteredTasks.length > 0
      ? Math.round((filteredTasks.filter((t) => t.status === "completed").length / filteredTasks.length) * 100)
      : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics Card */}
      {filteredTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas de Tareas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredTasks.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredTasks.filter((t) => t.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredTasks.filter((t) => t.status === "in-progress").length}
                </div>
                <div className="text-xs text-muted-foreground">En progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {filteredTasks.filter((t) => t.status === "pending").length}
                </div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                <div className="text-xs text-muted-foreground">Vencidas</div>
              </div>
            </div>

            {filteredTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso general</span>
                  <span>{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </span>
            {eventId && (
              <Button onClick={() => setShowInjectDialog(true)} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Inyectar Tareas
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Asignado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los asignados</SelectItem>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={automatedFilter} onValueChange={setAutomatedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tareas</SelectItem>
                <SelectItem value="automated">Automáticas</SelectItem>
                <SelectItem value="manual">Manuales</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setPriorityFilter("all")
                setCategoryFilter("all")
                setAssigneeFilter("all")
                setAutomatedFilter(showAutomatedOnly ? "automated" : "all")
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tareas ({filteredTasks.length})</CardTitle>
          <CardDescription>
            {overdueTasks.length > 0 && (
              <span className="text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {overdueTasks.length} tarea{overdueTasks.length > 1 ? "s" : ""} vencida
                {overdueTasks.length > 1 ? "s" : ""}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron tareas con los filtros aplicados
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg space-y-3 ${isOverdue(task) ? "border-red-200 bg-red-50" : ""}`}
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={(checked) => {
                            handleStatusChange(task.id, checked ? "completed" : "pending")
                          }}
                        />
                        <h3
                          className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.title}
                        </h3>
                        {task.isAutomated && (
                          <Badge variant="outline" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        {isOverdue(task) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Vencida
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>

                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="w-32">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in-progress">En progreso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Task Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Categoría:</span>
                      <Badge variant="secondary" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>

                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{task.assignee}</span>
                      </div>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className={isOverdue(task) ? "text-red-600 font-medium" : ""}>
                          {formatDueDate(task.dueDate)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Actualizada:{" "}
                        {DateTime.fromISO(task.updatedAt || task.createdAt || new Date().toISOString()).toFormat(
                          "dd/MM/yyyy HH:mm",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inject Standard Tasks Dialog */}
      {showInjectDialog && eventId && (
        <InjectStandardTasks eventId={eventId} onClose={() => setShowInjectDialog(false)} />
      )}
    </div>
  )
}

export default TasksList
