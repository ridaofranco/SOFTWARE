"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Clock, User, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { events, venues, providers, updateEvent } = useUnifiedEventStore()
  const { toast } = useToast()

  const event = events?.find((e) => e.id === eventId)

  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    venue: "",
    venueId: "none",
    address: "",
    loadingPoint: "",
    producerContact: {
      name: "Franco",
      email: "contacto@derp.com.ar",
      phone: "+54 9 11 7154-0675",
    },
    hasLocalPermit: false,
    localPermitFile: null,
    hasAlcoholPermit: false,
    alcoholPermitFile: null,
    truckArrivalTime: "07:45",
    setupStartTime: "10:30",
    technicalTestsTime: "22:00",
    openingTime: "00:30",
    closingTime: "04:00",
    teardownTime: "07:00",
    providers: [] as any[],
    status: "planning" as const,
    budget: 0,
    notes: "",
  })

  // Load event data when component mounts
  useEffect(() => {
    if (event) {
      setEventData({
        title: event.title || "",
        date: event.date || "",
        venue: event.venue || "",
        venueId: event.venueId || "none",
        address: event.address || "",
        loadingPoint: event.loadingPoint || "",
        producerContact: event.producerContact || {
          name: "Franco",
          email: "contacto@derp.com.ar",
          phone: "+54 9 11 7154-0675",
        },
        hasLocalPermit: event.hasLocalPermit || false,
        localPermitFile: event.localPermitFile || null,
        hasAlcoholPermit: event.hasAlcoholPermit || false,
        alcoholPermitFile: event.alcoholPermitFile || null,
        truckArrivalTime: event.truckArrivalTime || "07:45",
        setupStartTime: event.setupStartTime || "10:30",
        technicalTestsTime: event.technicalTestsTime || "22:00",
        openingTime: event.openingTime || "00:30",
        closingTime: event.closingTime || "04:00",
        teardownTime: event.teardownTime || "07:00",
        providers: event.providers || [],
        status: event.status || "planning",
        budget: event.budget || 0,
        notes: event.notes || "",
      })
    }
  }, [event])

  const handleVenueSelect = (venueId: string) => {
    if (venueId === "none") {
      setEventData((prev) => ({
        ...prev,
        venue: "",
        venueId: "none",
        address: "",
      }))
      return
    }

    const venue = venues?.find((v) => v.id === venueId)
    if (venue) {
      setEventData((prev) => ({
        ...prev,
        venue: venue.nombre,
        venueId: venue.id,
        address: venue.direccion || venue.location || "",
      }))
    }
  }

  const handleProviderToggle = (providerId: string) => {
    const provider = providers?.find((p) => p.id === providerId)
    if (!provider) return

    const isSelected = eventData.providers.some((p) => p.id === providerId)

    if (isSelected) {
      setEventData((prev) => ({
        ...prev,
        providers: prev.providers.filter((p) => p.id !== providerId),
      }))
    } else {
      setEventData((prev) => ({
        ...prev,
        providers: [
          ...prev.providers,
          {
            ...provider,
            price: "",
            paymentMethod: "Transferencia",
            status: "Confirmado",
            staff: "",
            insurance: "",
            deadline: "",
            observations: "",
          },
        ],
      }))
    }
  }

  const handleSubmit = () => {
    if (!eventData.title || !eventData.date || !eventData.venue) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios (título, fecha, venue)",
        variant: "destructive",
      })
      return
    }

    const updatedEvent = {
      ...eventData,
      venueId: eventData.venueId === "none" ? "" : eventData.venueId,
      budget: eventData.providers.reduce((sum, p) => sum + (Number.parseFloat(p.price) || 0), 0),
    }

    updateEvent(eventId, updatedEvent)

    toast({
      title: "¡Evento actualizado!",
      description: `${eventData.title} ha sido actualizado exitosamente`,
    })

    router.push(`/events/${eventId}`)
  }

  // Loading state
  if (!events || events.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando...</h2>
          <p className="text-gray-600 mb-4">Cargando información del evento</p>
        </div>
      </div>
    )
  }

  // Event not found
  if (!event) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600 mb-4">El evento que intentas editar no existe</p>
          <Link href="/events">
            <Button>Volver a Eventos</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/events/${eventId}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Evento
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Evento</h1>
      </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título del Evento *</Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) => setEventData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Fiesta de Año Nuevo 2025"
                />
              </div>
              <div>
                <Label htmlFor="date">Fecha del Evento *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue *</Label>
              <Select value={eventData.venueId} onValueChange={handleVenueSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Seleccionar venue</SelectItem>
                  {venues?.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.nombre} - {venue.direccion || venue.location}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="loadingPoint">Punto de Carga/Descarga</Label>
              <Input
                id="loadingPoint"
                value={eventData.loadingPoint}
                onChange={(e) => setEventData((prev) => ({ ...prev, loadingPoint: e.target.value }))}
                placeholder="Ej: Entrada principal, Dock de carga"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas del Evento</Label>
              <Textarea
                id="notes"
                value={eventData.notes}
                onChange={(e) => setEventData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional, requerimientos especiales, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacto del Productor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Contacto del Productor
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="producerName">Nombre</Label>
              <Input
                id="producerName"
                value={eventData.producerContact.name}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    producerContact: { ...prev.producerContact, name: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="producerEmail">Email</Label>
              <Input
                id="producerEmail"
                type="email"
                value={eventData.producerContact.email}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    producerContact: { ...prev.producerContact, email: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="producerPhone">Teléfono</Label>
              <Input
                id="producerPhone"
                value={eventData.producerContact.phone}
                onChange={(e) =>
                  setEventData((prev) => ({
                    ...prev,
                    producerContact: { ...prev.producerContact, phone: e.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Configuración de Horarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="truckArrival">Llegada Camión</Label>
                <Input
                  id="truckArrival"
                  type="time"
                  value={eventData.truckArrivalTime}
                  onChange={(e) => setEventData((prev) => ({ ...prev, truckArrivalTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="setupStart">Inicio Montaje</Label>
                <Input
                  id="setupStart"
                  type="time"
                  value={eventData.setupStartTime}
                  onChange={(e) => setEventData((prev) => ({ ...prev, setupStartTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="technicalTests">Pruebas Técnicas</Label>
                <Input
                  id="technicalTests"
                  type="time"
                  value={eventData.technicalTestsTime}
                  onChange={(e) => setEventData((prev) => ({ ...prev, technicalTestsTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="opening">Apertura</Label>
                <Input
                  id="opening"
                  type="time"
                  value={eventData.openingTime}
                  onChange={(e) => setEventData((prev) => ({ ...prev, openingTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="closing">Cierre</Label>
                <Input
                  id="closing"
                  type="time"
                  value={eventData.closingTime}
                  onChange={(e) => setEventData((prev) => ({ ...prev, closingTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="teardown">Desarme</Label>
                <Input
                  id="teardown"
                  type="time"
                  value={eventData.teardownTime}
                  onChange={(e) => setEventData((prev) => ({ ...prev, teardownTime: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permisos */}
        <Card>
          <CardHeader>
            <CardTitle>Permisos y Habilitaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="localPermit"
                checked={eventData.hasLocalPermit}
                onCheckedChange={(checked) => setEventData((prev) => ({ ...prev, hasLocalPermit: checked as boolean }))}
              />
              <Label htmlFor="localPermit">Permiso local obtenido</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alcoholPermit"
                checked={eventData.hasAlcoholPermit}
                onCheckedChange={(checked) =>
                  setEventData((prev) => ({ ...prev, hasAlcoholPermit: checked as boolean }))
                }
              />
              <Label htmlFor="alcoholPermit">Permiso de alcohol obtenido</Label>
            </div>
          </CardContent>
        </Card>

        {/* Proveedores */}
        <Card>
          <CardHeader>
            <CardTitle>Proveedores Asignados</CardTitle>
            <CardDescription>Selecciona los proveedores para este evento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers?.map((provider) => {
                const isSelected = eventData.providers.some((p) => p.id === provider.id)
                return (
                  <div key={provider.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={provider.id}
                      checked={isSelected}
                      onCheckedChange={() => handleProviderToggle(provider.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={provider.id} className="font-medium">
                        {provider.name}
                      </Label>
                      <p className="text-sm text-gray-500">{provider.item}</p>
                      <p className="text-xs text-gray-400">{provider.contact}</p>
                    </div>
                  </div>
                )
              }) || []}
            </div>
          </CardContent>
        </Card>

        {/* Estado del Evento */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={eventData.status}
              onValueChange={(value: any) => setEventData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planificación</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <Link href={`/events/${eventId}`}>
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
