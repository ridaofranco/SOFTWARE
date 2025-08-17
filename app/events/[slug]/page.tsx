"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Users, Phone, Mail, AlertCircle, CheckCircle, Edit } from "lucide-react"
import Link from "next/link"
import { AutomatedTasksWidget } from "@/components/automated-tasks-widget"

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.slug as string
  const { events, tasks, budgetItems } = useUnifiedEventStore()
  const [event, setEvent] = useState<any>(null)
  const [eventTasks, setEventTasks] = useState<any[]>([])
  const [eventBudget, setEventBudget] = useState<any[]>([])

  useEffect(() => {
    // Buscar el evento
    const foundEvent = events.find((e) => e.id === eventId)
    setEvent(foundEvent)

    // Buscar tareas relacionadas
    const relatedTasks = tasks.filter((task) => task.eventId === eventId)
    setEventTasks(relatedTasks)

    // Buscar presupuesto relacionado
    const relatedBudget = budgetItems.filter((item) => item.eventId === eventId)
    setEventBudget(relatedBudget)
  }, [eventId, events, tasks, budgetItems])

  if (!event) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Evento no encontrado</h3>
          <p className="text-gray-600 mb-4">El evento que buscas no existe o ha sido eliminado.</p>
          <Link href="/events">
            <Button>Volver a eventos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const totalBudget = eventBudget.reduce((sum, item) => sum + item.precioTotal, 0)
  const paidBudget = eventBudget
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.precioTotal, 0)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title} {event.emoji}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-lg text-gray-700">{event.venue}</span>
              </div>
              <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
              <Badge variant="outline">{event.type}</Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="tasks">Tareas ({eventTasks.length})</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p className="text-gray-600">{new Date(event.date).toLocaleDateString("es-AR")}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Horarios</p>
                    <p className="text-gray-600">
                      Apertura: {event.openingTime} - Cierre: {event.closingTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      Setup: {event.setupStartTime} - Desmontaje: {event.teardownTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-gray-600">{event.address}</p>
                    <p className="text-sm text-gray-500">Punto de carga: {event.loadingPoint}</p>
                  </div>
                </div>

                {event.description && (
                  <div>
                    <p className="font-medium mb-2">Descripción</p>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contacto del productor */}
            {event.producerContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Contacto del Productor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{event.producerContact.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-600">{event.producerContact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-gray-600">{event.producerContact.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permisos */}
            <Card>
              <CardHeader>
                <CardTitle>Permisos y Documentación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Permiso Local</span>
                  <div className="flex items-center space-x-2">
                    {event.hasLocalPermit ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={event.hasLocalPermit ? "text-green-600" : "text-red-600"}>
                      {event.hasLocalPermit ? "Obtenido" : "Pendiente"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Permiso de Alcohol</span>
                  <div className="flex items-center space-x-2">
                    {event.hasAlcoholPermit ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={event.hasAlcoholPermit ? "text-green-600" : "text-red-600"}>
                      {event.hasAlcoholPermit ? "Obtenido" : "Pendiente"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Tareas totales</span>
                  <span className="font-medium">{eventTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tareas completadas</span>
                  <span className="font-medium text-green-600">
                    {eventTasks.filter((t) => t.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Presupuesto total</span>
                  <span className="font-medium">${totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Presupuesto pagado</span>
                  <span className="font-medium text-green-600">${paidBudget.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Widget de tareas automáticas */}
          <AutomatedTasksWidget eventId={event.id} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tareas del Evento</CardTitle>
              <CardDescription>Todas las tareas relacionadas con este evento</CardDescription>
            </CardHeader>
            <CardContent>
              {eventTasks.length > 0 ? (
                <div className="space-y-4">
                  {eventTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {task.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : task.status === "in-progress" ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Vence: {new Date(task.dueDate).toLocaleDateString("es-AR")}</span>
                            <span>Asignado: {task.assignee}</span>
                            <span>Categoría: {task.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                        </Badge>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "default"
                              : task.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
                  <p className="text-gray-600 mb-4">Este evento aún no tiene tareas asignadas.</p>
                  <Link href="/tareas">
                    <Button>Crear nueva tarea</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Presupuesto del Evento</CardTitle>
              <CardDescription>Desglose de costos y gastos</CardDescription>
            </CardHeader>
            <CardContent>
              {eventBudget.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Presupuesto Total</p>
                      <p className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Pagado</p>
                      <p className="text-2xl font-bold text-green-600">${paidBudget.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Pendiente</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${(totalBudget - paidBudget).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {eventBudget.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.item}</h4>
                          <p className="text-sm text-gray-600">
                            {item.area} • Cantidad: {item.cantidad} • Precio unitario: $
                            {item.precioUnitario.toLocaleString()}
                          </p>
                          {item.vendor && <p className="text-xs text-gray-500">Proveedor: {item.vendor}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.precioTotal.toLocaleString()}</p>
                          <Badge
                            variant={
                              item.status === "paid" ? "default" : item.status === "approved" ? "secondary" : "outline"
                            }
                          >
                            {item.status === "paid" ? "Pagado" : item.status === "approved" ? "Aprobado" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay presupuesto</h3>
                  <p className="text-gray-600 mb-4">Este evento aún no tiene items de presupuesto.</p>
                  <Link href="/budget">
                    <Button>Agregar items de presupuesto</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipo del Evento</CardTitle>
              <CardDescription>Personal y proveedores asignados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Equipo en desarrollo</h3>
                <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
