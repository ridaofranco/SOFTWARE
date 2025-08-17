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
  User,
  Phone,
  Mail,
  Edit,
  Download,
  MessageSquare,
  Calculator,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import TasksList from "@/components/tasks-list"

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
      <div className="container mx-auto p-6 text-center">
        <p>Cargando evento...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{venueName}</h1>
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
              <span className="text-gray-600">
                {new Date(event.date).toLocaleDateString("es-AR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
          <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="comunicacion">Comunicación</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p className="text-gray-600">{new Date(event.date).toLocaleDateString("es-AR")}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-gray-600">{venueName}</p>
                    <p className="text-sm text-gray-500">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Punto de carga/descarga</p>
                    <p className="text-gray-600">{event.loadingPoint}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Horarios</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Apertura: {event.openingTime}</p>
                      <p>Cierre: {event.closingTime}</p>
                      <p>Montaje: {event.setupStartTime}</p>
                      <p>Desarme: {event.teardownTime}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contacto del Productor */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto del Productor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.producerContact.name}</p>
                    <p className="text-sm text-gray-500">Productor responsable</p>
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

            {/* Permisos */}
            <Card>
              <CardHeader>
                <CardTitle>Permisos y Documentación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Permiso Local</span>
                  <Badge variant={event.hasLocalPermit ? "default" : "secondary"}>
                    {event.hasLocalPermit ? "Obtenido" : "Pendiente"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Permiso de Alcohol</span>
                  <Badge variant={event.hasAlcoholPermit ? "default" : "secondary"}>
                    {event.hasAlcoholPermit ? "Obtenido" : "Pendiente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            {event.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas del Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{event.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="proveedores">
          <Card>
            <CardHeader>
              <CardTitle>Proveedores Asignados</CardTitle>
              <CardDescription>{event.providers.length} proveedores para este evento</CardDescription>
            </CardHeader>
            <CardContent>
              {event.providers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay proveedores asignados</p>
                  <Link href={`/events/${event.id}/edit`}>
                    <Button>Agregar Proveedores</Button>
                  </Link>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presupuesto">
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
                      .reduce((sum, i) => sum + i.resultadoNegociacion, 0)
                      .toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">ARTE</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    $
                    {eventBudget
                      .filter((i) => i.area === "BOOKING")
                      .reduce((sum, i) => sum + i.resultadoNegociacion, 0)
                      .toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">BOOKING</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    $
                    {eventBudget
                      .filter((i) => i.area === "MARKETING")
                      .reduce((sum, i) => sum + i.resultadoNegociacion, 0)
                      .toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">MARKETING</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold">
                    ${eventBudget.reduce((sum, i) => sum + i.resultadoNegociacion, 0).toLocaleString("es-AR")}
                  </div>
                  <div className="text-xs text-gray-600">TOTAL</div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tareas">
          <Card>
            <CardHeader>
              <CardTitle>Tareas del Evento</CardTitle>
              <CardDescription>
                {eventTasks.filter((t) => t.status !== "completed").length} tareas pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TasksList eventId={event.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacion">
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
