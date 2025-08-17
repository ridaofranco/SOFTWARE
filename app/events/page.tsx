"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUnifiedEventStore, getArgentinaTime } from "@/store/unified-event-store"
import { CountdownDisplay } from "@/components/countdown-display"
import { Calendar, MapPin, Clock, Search, Filter, Plus, Eye, CheckSquare, UserCheck } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { DateTime } from "luxon"

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const { events, getUpcoming30DaysEvents } = useUnifiedEventStore()

  const upcomingEvents = getUpcoming30DaysEvents()
  const allRelevantEvents = events.filter((event) => event.type !== "feriado")

  const filteredAndSortedEvents = useMemo(() => {
    const eventsToFilter = statusFilter === "upcoming" ? upcomingEvents : allRelevantEvents

    const filtered = eventsToFilter.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.address && event.address.toLowerCase().includes(searchTerm.toLowerCase()))

      let matchesStatus = true
      if (statusFilter === "confirmed") matchesStatus = event.status === "confirmed"
      else if (statusFilter === "pending") matchesStatus = event.status === "pending"
      else if (statusFilter === "cancelled") matchesStatus = event.status === "cancelled"
      else if (statusFilter === "in-progress") {
        const nowAR = getArgentinaTime()
        const eventDate = DateTime.fromISO(event.date, { zone: "America/Argentina/Buenos_Aires" })
        const isToday = eventDate.hasSame(nowAR, "day")
        matchesStatus = isToday && event.status === "confirmed"
      }

      const matchesType = typeFilter === "all" || event.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    // Ordenar eventos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return a.date.localeCompare(b.date)
        case "title":
          return a.title.localeCompare(b.title)
        case "venue":
          return a.venue.localeCompare(b.venue)
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [allRelevantEvents, upcomingEvents, searchTerm, statusFilter, typeFilter, sortBy])

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "propio":
        return "bg-blue-100 text-blue-800"
      case "privado":
        return "bg-purple-100 text-purple-800"
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

  const getTypeText = (type: string) => {
    switch (type) {
      case "propio":
        return "Propio"
      case "privado":
        return "Privado"
      default:
        return type
    }
  }

  const totalEvents = allRelevantEvents.length
  const upcomingCount = upcomingEvents.length
  const confirmedEvents = allRelevantEvents.filter((e) => e.status === "confirmed").length
  const pendingEvents = allRelevantEvents.filter((e) => e.status === "pending").length
  const ownEvents = allRelevantEvents.filter((e) => e.type === "propio").length
  const privateEvents = allRelevantEvents.filter((e) => e.type === "privado").length

  const nowAR = getArgentinaTime()
  const inProgressEvents = allRelevantEvents.filter((event) => {
    const eventDate = DateTime.fromISO(event.date, { zone: "America/Argentina/Buenos_Aires" })
    return eventDate.hasSame(nowAR, "day") && event.status === "confirmed"
  }).length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Eventos</h1>
          <p className="text-muted-foreground">
            {upcomingCount} próximos (30 días) • {totalEvents} total • {confirmedEvents} confirmados • {pendingEvents}{" "}
            pendientes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/events/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 30d</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Ventana operativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Curso</CardTitle>
            <Badge className="bg-orange-500">{inProgressEvents}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inProgressEvents}</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <Badge className="bg-green-500">{confirmedEvents}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedEvents}</div>
            <p className="text-xs text-muted-foreground">
              {totalEvents > 0 ? Math.round((confirmedEvents / totalEvents) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Badge className="bg-yellow-500">{pendingEvents}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingEvents}</div>
            <p className="text-xs text-muted-foreground">
              {totalEvents > 0 ? Math.round((pendingEvents / totalEvents) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propios</CardTitle>
            <Badge className="bg-blue-500">{ownEvents}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{ownEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos DER</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privados</CardTitle>
            <Badge className="bg-purple-500">{privateEvents}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{privateEvents}</div>
            <p className="text-xs text-muted-foreground">Terceros</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, venue, ciudad..."
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="upcoming">Próximos 30d</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in-progress">En Curso</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="propio">Propios</SelectItem>
                <SelectItem value="privado">Privados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="title">Nombre</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="status">Estado</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setTypeFilter("all")
                setSortBy("date")
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedEvents.length > 0 ? (
          filteredAndSortedEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{event.emoji || "🎵"}</span>
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        {format(parseISO(event.date), "EEEE, d MMMM yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <CountdownDisplay eventDate={event.date} variant="compact" />
                    <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                    <Badge className={getTypeColor(event.type)} variant="outline">
                      {getTypeText(event.type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue}</span>
                  </div>
                )}

                {event.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.address}</span>
                  </div>
                )}

                {event.openingTime && event.closingTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.openingTime} - {event.closingTime}
                    </span>
                  </div>
                )}

                {event.theme && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {event.theme}
                    </Badge>
                  </div>
                )}

                {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}

                <div className="flex gap-2 pt-2">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalle
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}?tab=tasks`}>
                    <Button variant="ghost" size="sm" title="Abrir Tareas">
                      <CheckSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}?tab=providers`}>
                    <Button variant="ghost" size="sm" title="Abrir Proveedores">
                      <UserCheck className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "No hay eventos que coincidan con los criterios seleccionados"}
                </p>
                <Link href="/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nuevo Evento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Información adicional */}
      {filteredAndSortedEvents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              Mostrando {filteredAndSortedEvents.length} eventos
              {statusFilter === "upcoming" && " de los próximos 30 días"}
              <br />
              Hora Argentina: {nowAR.toFormat("dd/MM/yyyy HH:mm")} (GMT-3)
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
