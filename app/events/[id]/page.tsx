"use client"

import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Edit,
  Download,
  MessageSquare,
  Calculator,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AutomatedTasksWidget } from "@/components/automated-tasks-widget"

interface EventDetailPageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter()
  const { events, venues, tasks, budgetItems, chatMessages } = useUnifiedEventStore()
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    const foundEvent = events.find((e) => e.id === params.id)
    if (foundEvent) {
      setEvent(foundEvent)
    } else {
      router.push("/events")
    }
  }, [events, params.id, router])

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

  const venueName = event.venue || (event.venueId ? venues.find((v) => v.id === event.venueId)?.nombre : "")
  const eventTasks = tasks.filter((t) => t.eventId === event.id)
  const eventBudget = budgetItems.filter((b) => b.eventId === event.id)
  const eventMessages = chatMessages.filter((m) => m.eventId === event.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En Progreso"
      case "confirmed":
        return "Confirmado"
      default:
        return "Planificación"
    }
  }

  const totalBudget = eventBudget.reduce((sum, item) => sum + (item.resultadoNegociacion || item.precioTotal || 0), 0)
  const paidBudget = eventBudget
    .filter((item) => item.status === "paid" || item.estadoProduccion === "Completado")
    .reduce((sum, item) => sum + (item.resultadoNegociacion || item.precioTotal || 0), 0)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Eventos
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.title || venueName} {event.emoji}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-lg text-gray-700">{venueName}</span>
              </div>
              <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
              {event.type && <Badge variant="outline">{event.type}</Badge>}
            </div>
            <p className="text-gray-600 mt-1">
              {new Date(event.date).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="tasks">Tareas ({eventTasks.length})</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="communication">Comunicación</TabsTrigger>
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

                {(event.description || event.notes) && (
                  <div>
                    <p className="font-medium mb-2">Descripción</p>
                    <p className="text-gray-600">{event.description || event.notes}</p>
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
                  <Link href="/tasks">
                    <Button>Crear nueva tarea</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Gestión Presupuestaria</h3>
              <Link href={`/events/${event.id}/presupuesto`}>
                <Button>
                  <Calculator className="mr-2 h-4 w-4" />
                  Abrir Presupuesto Completo
                </Button>
              </Link>
            </div>
            <p className="text-gray-600">
              Administra todos los aspectos financieros de este evento con el sistema completo de presupuestos.
            </p>

            {/* Resumen rápido si hay items */}
            {eventBudget.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    $
                    {eventBudget
                      .filter((i) => i.area === "ARTE")
                      .reduce((sum, i) => sum + (i.resultadoNegociacion || 0), 0)
                      .toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">ARTE</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    $
                    {eventBudget
                      .filter((i) => i.area === "BOOKING")
                      .reduce((sum, i) => sum + (i.resultadoNegociacion || 0), 0)
                      .toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">BOOKING</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    $
                    {eventBudget
                      .filter((i) => i.area === "MARKETING")
                      .reduce((sum, i) => sum + (i.resultadoNegociacion || 0), 0)
                      .toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">MARKETING</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold">
                    ${eventBudget.reduce((sum, i) => sum + (i.resultadoNegociacion || 0), 0).toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">TOTAL</div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipo del Evento</CardTitle>
              <CardDescription>Personal y proveedores asignados</CardDescription>
            </CardHeader>
            <CardContent>
              {event.providers && event.providers.length > 0 ? (
                <div className="space-y-4">
                  {event.providers.map((provider: any) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-gray-500">{provider.item}</p>
                            <p className="text-sm text-gray-500">{provider.contact}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {provider.price && <p className="font-medium">${provider.price}</p>}
                        <Badge variant="outline" className="mt-1">
                          {provider.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay equipo asignado</h3>
                  <p className="text-gray-600 mb-4">Este evento aún no tiene proveedores o personal asignado.</p>
                  <Link href={`/events/${event.id}/edit`}>
                    <Button>Agregar Equipo</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comunicaciones</CardTitle>
              <CardDescription>Historial de mensajes y comunicaciones del evento</CardDescription>
            </CardHeader>
            <CardContent>
              {eventMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No hay mensajes registrados</p>
                  <Button>Enviar Primer Mensaje</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventMessages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{message.sender}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString("es-AR")}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
