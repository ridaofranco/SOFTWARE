"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { toast } from "@/hooks/use-toast"
import { CalendarDays, Clock, Plus } from "lucide-react"
import { format, addDays, parseISO } from "date-fns"
import { es } from "date-fns/locale"

// Fecha de corte para mostrar eventos - 15 de agosto 2025 en adelante
const FECHA_MOSTRAR_DESDE = "2025-08-15"

// Temáticas disponibles
const TEMATICAS = {
  pirata: { nombre: "Pirata", emoji: "🏴‍☠️" },
  sueño: { nombre: "Sueño", emoji: "🌙" },
  bosque: { nombre: "Bosque", emoji: "🍄" },
  ia: { nombre: "IA", emoji: "🧬" },
  shanghai: { nombre: "Shanghai", emoji: "🐲" },
  muertos: { nombre: "Muertos", emoji: "💀" },
  general: { nombre: "General", emoji: "🎵" },
  navidad: { nombre: "Navidad", emoji: "🎄" },
  año_nuevo: { nombre: "Año Nuevo", emoji: "🎉" },
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    venue: "",
    type: "propio" as "propio" | "privado" | "feriado",
    theme: "general",
    description: "",
    status: "pending" as "pending" | "confirmed" | "cancelled",
  })

  const { events, venues, addEvent, addVenue } = useUnifiedEventStore()

  // Filtrar eventos desde el 15 de agosto 2025 en adelante (manteniendo feriados para el calendario)
  const eventsToShow = events.filter((event) => {
    // Mostrar feriados siempre (para el calendario visual)
    if (event.type === "feriado") return true
    // Mostrar eventos desde el 15 de agosto en adelante
    return event.date >= FECHA_MOSTRAR_DESDE
  })

  // Obtener eventos del próximo mes (solo eventos, no feriados)
  const getUpcomingEvents = () => {
    const today = new Date()
    const nextMonth = addDays(today, 30)

    return events
      .filter((event) => {
        const eventDate = parseISO(event.date)
        return (
          eventDate >= today && eventDate <= nextMonth && event.date >= FECHA_MOSTRAR_DESDE && event.type !== "feriado"
        )
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5)
  }

  // Función para obtener el color del evento según el tipo
  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case "propio":
        return "#10b981" // Verde
      case "privado":
        return "#374151" // Gris oscuro
      case "feriado":
        return "#f59e0b" // Naranja
      default:
        return "#3b82f6" // Azul
    }
  }

  // Función para manejar click en día
  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const existingEvents = eventsToShow.filter((event) => event.date === dateStr && event.type !== "feriado")

    if (existingEvents.length === 0 && dateStr >= FECHA_MOSTRAR_DESDE) {
      setSelectedDate(date)
      setNewEvent({
        title: "",
        venue: "",
        type: "propio",
        theme: "general",
        description: "",
        status: "pending",
      })
      setIsDialogOpen(true)
    }
  }

  // Función para crear evento individual
  const handleCreateEvent = () => {
    if (!selectedDate || !newEvent.title) return

    const eventId = `event-${Date.now()}`
    const dateStr = format(selectedDate, "yyyy-MM-dd")

    const event = {
      id: eventId,
      title: newEvent.title,
      date: dateStr,
      venue: newEvent.venue,
      status: newEvent.status,
      type: newEvent.type,
      description: newEvent.description,
      theme: newEvent.theme,
      emoji: TEMATICAS[newEvent.theme as keyof typeof TEMATICAS]?.emoji || "🎵",
      address: "Buenos Aires, Argentina",
      openingTime: "00:30",
      closingTime: "06:00",
      setupStartTime: "18:00",
      teardownTime: "08:00",
      loadingPoint: "Entrada principal",
      producerContact: {
        name: "Franco",
        phone: "+54 11 1234-5678",
        email: "franco@der.com",
      },
      hasLocalPermit: false,
      hasAlcoholPermit: false,
      providers: [],
    }

    addEvent(event)

    toast({
      title: "Evento creado",
      description: `${newEvent.title} ha sido agregado al calendario`,
    })

    setIsDialogOpen(false)
    setNewEvent({
      title: "",
      venue: "",
      type: "propio",
      theme: "general",
      description: "",
      status: "pending",
    })
  }

  const upcomingEvents = getUpcomingEvents()

  // Contar eventos por estado (solo eventos visibles, no feriados)
  const eventosVisibles = events.filter((event) => event.date >= FECHA_MOSTRAR_DESDE && event.type !== "feriado")
  const eventosPendientes = eventosVisibles.filter((event) => event.status === "pending").length
  const eventosConfirmados = eventosVisibles.filter((event) => event.status === "confirmed").length

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario DER 2025</h1>
          <p className="text-muted-foreground">
            Eventos desde 15 Agosto 2025 • {eventosPendientes} pendientes • {eventosConfirmados} confirmados
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendario Anual 2025
              </CardTitle>
              <CardDescription>🟢 Propios • ⚫ Privados • 🟠 Feriados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={es}
                  modifiers={{
                    eventDay: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return eventsToShow.some((event) => event.date === dateStr)
                    },
                    propioEvent: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return eventsToShow.some((event) => event.date === dateStr && event.type === "propio")
                    },
                    privadoEvent: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return eventsToShow.some((event) => event.date === dateStr && event.type === "privado")
                    },
                    feriadoEvent: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      return eventsToShow.some((event) => event.date === dateStr && event.type === "feriado")
                    },
                  }}
                  modifiersStyles={{
                    propioEvent: {
                      backgroundColor: "#10b981",
                      color: "white",
                      fontWeight: "bold",
                    },
                    privadoEvent: {
                      backgroundColor: "#374151",
                      color: "white",
                      fontWeight: "bold",
                    },
                    feriadoEvent: {
                      backgroundColor: "#f59e0b",
                      color: "white",
                      fontWeight: "bold",
                    },
                  }}
                  onDayClick={handleDayClick}
                />
              </div>

              {/* Eventos del día seleccionado */}
              {selectedDate && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">{format(selectedDate, "EEEE, d MMMM yyyy", { locale: es })}</h3>
                  {(() => {
                    const dateStr = format(selectedDate, "yyyy-MM-dd")
                    const dayEvents = eventsToShow.filter((event) => event.date === dateStr)

                    if (dayEvents.length > 0) {
                      return (
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-2">
                              <Badge
                                style={{
                                  backgroundColor: getEventColor(event.type),
                                  color: "white",
                                }}
                              >
                                {event.emoji} {event.title}
                              </Badge>
                              {event.venue && <span className="text-sm text-muted-foreground">@ {event.venue}</span>}
                              {event.type !== "feriado" && (
                                <Badge variant="outline" className="text-xs">
                                  {event.status === "pending" ? "PENDIENTE" : "CONFIRMADO"}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    } else {
                      return (
                        <p className="text-sm text-muted-foreground">
                          {dateStr >= FECHA_MOSTRAR_DESDE
                            ? "No hay eventos programados"
                            : "Eventos anteriores al 15 de agosto no se muestran"}
                        </p>
                      )
                    }
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>Los siguientes 5 eventos desde el 15 de agosto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{event.emoji}</span>
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(event.date), "d MMM", { locale: es })}
                        {event.venue && ` • ${event.venue}`}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge
                        style={{
                          backgroundColor: getEventColor(event.type),
                          color: "white",
                        }}
                        variant="secondary"
                      >
                        {event.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {event.status === "pending" ? "PENDIENTE" : "OK"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay eventos próximos desde el 15 de agosto
                </p>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas 2025</CardTitle>
              <CardDescription>Desde el 15 de agosto en adelante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Eventos Pendientes</span>
                <Badge className="bg-yellow-500">{eventosPendientes}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Eventos Confirmados</span>
                <Badge className="bg-green-500">{eventosConfirmados}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Eventos Propios</span>
                <Badge className="bg-green-500">{eventosVisibles.filter((e) => e.type === "propio").length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Eventos Privados</span>
                <Badge className="bg-gray-800">{eventosVisibles.filter((e) => e.type === "privado").length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Feriados (info)</span>
                <Badge className="bg-orange-500">{events.filter((e) => e.type === "feriado").length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Total Eventos</span>
                <Badge variant="outline">{eventosVisibles.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para crear evento individual */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>
            <DialogDescription>
              {selectedDate && `Para el ${format(selectedDate, "d MMMM yyyy", { locale: es })}`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Nombre del Evento</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ej: AMK Halloween"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="venue">Venue</Label>
              <Select value={newEvent.venue} onValueChange={(value) => setNewEvent({ ...newEvent, venue: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amerika">Amerika</SelectItem>
                  <SelectItem value="Forest Dan">Forest Dan</SelectItem>
                  <SelectItem value="Auditorio Sur">Auditorio Sur</SelectItem>
                  <SelectItem value="Seasons">Seasons</SelectItem>
                  <SelectItem value="Normandina">Normandina</SelectItem>
                  <SelectItem value="Wasabi">Wasabi</SelectItem>
                  <SelectItem value="Medusa">Medusa</SelectItem>
                  <SelectItem value="Oasis">Oasis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Evento</Label>
              <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propio">🟢 Propio</SelectItem>
                  <SelectItem value="privado">⚫ Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="theme">Temática</Label>
              <Select value={newEvent.theme} onValueChange={(value) => setNewEvent({ ...newEvent, theme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMATICAS).map(([key, tema]) => (
                    <SelectItem key={key} value={key}>
                      {tema.emoji} {tema.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descripción del evento..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEvent} disabled={!newEvent.title}>
              Crear Evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
