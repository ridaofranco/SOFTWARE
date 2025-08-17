"use client"

import { useState, useEffect } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { useVendorStore } from "@/lib/vendor-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Stepper } from "@/components/gestion-rapida/stepper"
import { ProviderCard } from "@/components/gestion-rapida/provider-card"
import { VenueCard } from "@/components/gestion-rapida/venue-card"
import { Calendar, User, FileText, Download, Copy, ArrowRight, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateCronograma, generateAllMensajes, formatDate } from "@/utils/generators"

export default function GestionRapidaPage() {
  // Usar el store unificado para venues y eventos
  const { venues, addEvent } = useUnifiedEventStore()

  // Usar el store de vendors para proveedores
  const { vendors: providers, initializeVendorsData } = useVendorStore()

  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  const [eventData, setEventData] = useState({
    date: "",
    venue: "",
    venueId: "",
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
    notes: "",
  })

  useEffect(() => {
    // Inicializar datos de proveedores si no existen
    if (!providers || providers.length === 0) {
      initializeVendorsData()
    }
  }, [providers, initializeVendorsData])

  const handleVenueSelect = (venueId: string) => {
    const venue = venues?.find((v) => v.id === venueId)
    if (venue) {
      setSelectedVenue(venueId)
      setEventData((prev) => ({
        ...prev,
        venue: venue.nombre,
        venueId: venue.id,
        address: venue.location,
      }))
    }
  }

  const handleProviderToggle = (providerId: string) => {
    const provider = providers?.find((p) => p.id === providerId)
    if (!provider) return

    if (selectedProviders.includes(providerId)) {
      setSelectedProviders((prev) => prev.filter((id) => id !== providerId))
      setEventData((prev) => ({
        ...prev,
        providers: prev.providers.filter((p) => p.id !== providerId),
      }))
    } else {
      setSelectedProviders((prev) => [...prev, providerId])
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

  const handleProviderUpdate = (providerId: string, field: string, value: string) => {
    setEventData((prev) => ({
      ...prev,
      providers: prev.providers.map((p) => (p.id === providerId ? { ...p, [field]: value } : p)),
    }))
  }

  const handleCreateEvent = () => {
    if (!eventData.date || !eventData.venue) {
      toast({
        title: "Error",
        description: "Por favor completa la fecha y venue del evento",
        variant: "destructive",
      })
      return
    }

    const newEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      title: `${eventData.venue} - ${formatDate(new Date(eventData.date))}`,
      status: "confirmed" as const,
      type: "propio" as const,
      budget: eventData.providers.reduce((sum, p) => sum + (Number.parseFloat(p.price) || 0), 0),
    }

    addEvent(newEvent)

    toast({
      title: "¡Evento creado!",
      description: `El evento en ${eventData.venue} ha sido creado exitosamente`,
    })

    // Reset form
    setCurrentStep(1)
    setSelectedVenue("")
    setSelectedProviders([])
    setEventData({
      date: "",
      venue: "",
      venueId: "",
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
      providers: [],
      notes: "",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "El contenido ha sido copiado al portapapeles",
    })
  }

  const filteredProviders =
    providers?.filter((provider) => {
      if (categoryFilter === "ALL") return true
      return provider.category === categoryFilter
    }) || []

  const categories = ["ALL", "ARTE", "BOOKING", "MARKETING", "FIEBRE DISCO"]

  // Loading state
  if (!venues || !providers) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión Rápida de Eventos</h1>
        <p className="text-gray-600">Crea eventos de forma rápida y eficiente con nuestro wizard paso a paso</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper currentStep={currentStep} totalSteps={4} onStepChange={setCurrentStep} />
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Datos Generales del Evento
              </CardTitle>
              <CardDescription>Información básica del evento y configuración de horarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fecha del evento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="eventDate">Fecha del Evento</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData((prev) => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="loadingPoint">Punto de Carga/Descarga</Label>
                  <Input
                    id="loadingPoint"
                    value={eventData.loadingPoint}
                    onChange={(e) => setEventData((prev) => ({ ...prev, loadingPoint: e.target.value }))}
                    placeholder="Ej: MUJICA - Depósito principal"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Selección de Venue */}
              <div>
                <Label>Seleccionar Venue</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {venues.map((venue) => (
                    <div
                      key={venue.id}
                      onClick={() => handleVenueSelect(venue.id)}
                      className={`cursor-pointer transition-all ${
                        selectedVenue === venue.id ? "ring-2 ring-orange-500" : ""
                      }`}
                    >
                      <VenueCard venue={venue} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Horarios */}
              <div>
                <Label className="text-base font-medium">Configuración de Horarios</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="truckArrival" className="text-sm">
                      Llegada Camión
                    </Label>
                    <Input
                      id="truckArrival"
                      type="time"
                      value={eventData.truckArrivalTime}
                      onChange={(e) => setEventData((prev) => ({ ...prev, truckArrivalTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="setupStart" className="text-sm">
                      Inicio Montaje
                    </Label>
                    <Input
                      id="setupStart"
                      type="time"
                      value={eventData.setupStartTime}
                      onChange={(e) => setEventData((prev) => ({ ...prev, setupStartTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="technicalTests" className="text-sm">
                      Pruebas Técnicas
                    </Label>
                    <Input
                      id="technicalTests"
                      type="time"
                      value={eventData.technicalTestsTime}
                      onChange={(e) => setEventData((prev) => ({ ...prev, technicalTestsTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="opening" className="text-sm">
                      Apertura
                    </Label>
                    <Input
                      id="opening"
                      type="time"
                      value={eventData.openingTime}
                      onChange={(e) => setEventData((prev) => ({ ...prev, openingTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="closing" className="text-sm">
                      Cierre
                    </Label>
                    <Input
                      id="closing"
                      type="time"
                      value={eventData.closingTime}
                      onChange={(e) => setEventData((prev) => ({ ...prev, closingTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teardown" className="text-sm">
                      Desarme
                    </Label>
                    <Input
                      id="teardown"
                      type="time"
                      value={eventData.teardownTime}
                      onChange={(e) => setEventData((prev) => ({ ...prev, teardownTime: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Permisos */}
              <div>
                <Label className="text-base font-medium">Permisos y Habilitaciones</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="localPermit"
                      checked={eventData.hasLocalPermit}
                      onCheckedChange={(checked) =>
                        setEventData((prev) => ({ ...prev, hasLocalPermit: checked as boolean }))
                      }
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
                </div>
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="notes">Notas del Evento</Label>
                <Textarea
                  id="notes"
                  value={eventData.notes}
                  onChange={(e) => setEventData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales, requerimientos especiales, etc."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} disabled={!eventData.date || !eventData.venue}>
                  Siguiente: Proveedores
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Selección de Proveedores
              </CardTitle>
              <CardDescription>Selecciona y configura los proveedores para este evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtros por categoría */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category === "ALL" ? "TODOS" : category}
                  </Button>
                ))}
              </div>

              {/* Grid de proveedores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => handleProviderToggle(provider.id)}
                    className={`cursor-pointer transition-all ${
                      selectedProviders.includes(provider.id) ? "ring-2 ring-orange-500" : ""
                    }`}
                  >
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>

              {filteredProviders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay proveedores disponibles para esta categoría</p>
                </div>
              )}

              {/* Proveedores seleccionados */}
              {selectedProviders.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Proveedores Seleccionados ({selectedProviders.length})</h3>
                  <div className="space-y-4">
                    {eventData.providers.map((provider) => (
                      <Card key={provider.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="font-medium">
                              {provider.name} {provider.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{provider.role}</p>
                          </div>
                          <div>
                            <Label htmlFor={`price-${provider.id}`} className="text-sm">
                              Precio
                            </Label>
                            <Input
                              id={`price-${provider.id}`}
                              value={provider.price}
                              onChange={(e) => handleProviderUpdate(provider.id, "price", e.target.value)}
                              placeholder="$0"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`payment-${provider.id}`} className="text-sm">
                              Forma de Pago
                            </Label>
                            <Select
                              value={provider.paymentMethod}
                              onValueChange={(value) => handleProviderUpdate(provider.id, "paymentMethod", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Transferencia">Transferencia</SelectItem>
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`observations-${provider.id}`} className="text-sm">
                              Observaciones
                            </Label>
                            <Input
                              id={`observations-${provider.id}`}
                              value={provider.observations}
                              onChange={(e) => handleProviderUpdate(provider.id, "observations", e.target.value)}
                              placeholder="Notas adicionales"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button onClick={() => setCurrentStep(3)} disabled={selectedProviders.length === 0}>
                  Siguiente: Vista Previa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Vista previa del evento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Vista Previa del Evento
                </CardTitle>
                <CardDescription>Revisa todos los detalles antes de crear el evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Información General</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Fecha:</strong> {new Date(eventData.date).toLocaleDateString("es-AR")}
                      </p>
                      <p>
                        <strong>Venue:</strong> {eventData.venue}
                      </p>
                      <p>
                        <strong>Dirección:</strong> {eventData.address}
                      </p>
                      <p>
                        <strong>Punto de carga:</strong> {eventData.loadingPoint}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Horarios</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Llegada camión:</strong> {eventData.truckArrivalTime}
                      </p>
                      <p>
                        <strong>Inicio montaje:</strong> {eventData.setupStartTime}
                      </p>
                      <p>
                        <strong>Apertura:</strong> {eventData.openingTime}
                      </p>
                      <p>
                        <strong>Cierre:</strong> {eventData.closingTime}
                      </p>
                      <p>
                        <strong>Desarme:</strong> {eventData.teardownTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Proveedores ({eventData.providers.length})</h4>
                  <div className="space-y-2">
                    {eventData.providers.map((provider) => (
                      <div key={provider.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {provider.name} {provider.lastName} - {provider.role}
                        </span>
                        <span className="text-sm font-medium">${provider.price || "0"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium">
                      Total: $
                      {eventData.providers
                        .reduce((sum, p) => sum + (Number.parseFloat(p.price) || 0), 0)
                        .toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cronograma generado */}
            <Card>
              <CardHeader>
                <CardTitle>Cronograma Operativo</CardTitle>
                <CardDescription>Cronograma automático generado para el evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {generateCronograma(eventData, eventData.venue)}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-transparent"
                  onClick={() => copyToClipboard(generateCronograma(eventData, eventData.venue))}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Cronograma
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                Siguiente: Crear Evento
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5" />
                Crear y Exportar
              </CardTitle>
              <CardDescription>Finaliza la creación del evento y exporta los documentos necesarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen final */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">¡Evento Listo para Crear!</h4>
                <p className="text-sm text-green-700">
                  Todos los datos están completos. Haz clic en "Crear Evento" para guardarlo en el sistema.
                </p>
              </div>

              {/* Acciones de exportación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  onClick={() => copyToClipboard(generateCronograma(eventData, eventData.venue))}
                >
                  <Copy className="h-6 w-6 mb-2" />
                  Copiar Cronograma
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col bg-transparent"
                  onClick={() => copyToClipboard(generateAllMensajes(eventData, eventData.venue, "Franco"))}
                >
                  <Copy className="h-6 w-6 mb-2" />
                  Copiar Mensajes
                </Button>
              </div>

              {/* Botón principal */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button onClick={handleCreateEvent} size="lg" className="bg-green-600 hover:bg-green-700">
                  <FileText className="mr-2 h-5 w-5" />
                  Crear Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
