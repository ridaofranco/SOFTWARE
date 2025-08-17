"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Filter, Clock, CheckCircle, AlertTriangle, User, Calendar, Bot, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InjectStandardTasks } from "./inject-standard-tasks"

interface TasksListProps {
  eventId?: string
  showEventFilter?: boolean
}

export default function TasksList({ eventId, showEventFilter = false }: TasksListProps) {
  const { tasks, events, updateTask, deleteTask } = useUnifiedEventStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [showInjectDialog, setShowInjectDialog] = useState(false)

  // Filter tasks based on eventId if provided
  const filteredTasks = tasks.filter((task) => {
    if (eventId && task.eventId !== eventId) return false

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter
    const matchesAssignee = assigneeFilter === "all" || task.assignee === assigneeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee
  })

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask(taskId, { status: newStatus as any })
    toast({
      title: "Estado actualizado",
      description: "El estado de la tarea ha sido actualizado",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId)
    return event ? event.title || event.venue : "Evento desconocido"
  }

  // Get unique values for filters
  const uniqueCategories = [...new Set(tasks.map((t) => t.category))]
  const uniqueAssignees = [...new Set(tasks.map((t) => t.assignee))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{eventId ? "Tareas del Evento" : "Gestión de Tareas"}</h2>
          <p className="text-gray-600">
            {filteredTasks.length} tareas {eventId ? "para este evento" : "en total"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowInjectDialog(true)} variant="outline">
            <Zap className="mr-2 h-4 w-4" />
            Inyectar Tareas Estándar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                {uniqueCategories.map((category) => (
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
                {uniqueAssignees.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
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
            <CardContent className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                priorityFilter !== "all" ||
                categoryFilter !== "all" ||
                assigneeFilter !== "all"
                  ? "No se encontraron tareas con los filtros aplicados"
                  : "Aún no hay tareas creadas"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear primera tarea
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={(checked) => handleStatusChange(task.id, checked ? "completed" : "pending")}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        {task.isAutomated && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            <Bot className="w-3 h-3 mr-1" />
                            Automática
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{task.description}</p>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Vence: {new Date(task.dueDate).toLocaleDateString("es-AR")}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{task.assignee}</span>
                        </div>

                        <Badge variant="outline">{task.category}</Badge>

                        {showEventFilter && <Badge variant="secondary">{getEventName(task.eventId)}</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                    </Badge>

                    <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                      <SelectTrigger className="w-32">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Inject Standard Tasks Dialog */}
      {showInjectDialog && <InjectStandardTasks eventId={eventId} onClose={() => setShowInjectDialog(false)} />}
    </div>
  )
}

// Named export for compatibility
export { TasksList }
