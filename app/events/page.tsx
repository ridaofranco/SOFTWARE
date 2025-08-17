"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Calendar, MapPin, Clock, Users, Search, Filter, Plus } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

// Fecha de corte para mostrar eventos - 15 de agosto 2025 en adelante
const FECHA_MOSTRAR_DESDE = "2025-08-15"

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const { events } = useUnifiedEventStore()

  // Filtrar eventos desde el 15 de agosto 2025 en adelante (excluyendo feriados)
  const eventsToShow = events.filter((event) => {
    return event.date >= FECHA_MOSTRAR_DESDE && event.type !== "feriado"
  })

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = eventsToShow.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || event.status === statusFilter
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
  }, [eventsToShow, searchTerm, statusFilter, typeFilter, sortBy])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "propio":
        return "bg-blue-500"
      case "privado":
        return "bg-purple-500"
      case "feriado":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
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
      case "feriado":
        return "Feriado"
      default:
        return type
    }
  }

  // Estadísticas
  const totalEvents = eventsToShow.length
  const confirmedEvents = eventsToShow.filter((e) => e.status === "confirmed").length
  const pendingEvents = eventsToShow.filter((e) => e.status === "pending").length
  const ownEvents = eventsToShow.filter((e) => e.type === "propio").length
  const privateEvents = eventsToShow.filter((e) => e.type === "privado").length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos DER 2025</h1>
          <p className="text-muted-foreground">
            Eventos desde 15 Agosto 2025 • {totalEvents} eventos • {confirmedEvents} confirmados • {pendingEvents}{" "}
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Desde 15 agosto</p>
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

      {/* Filtros y Búsqueda */}
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
                placeholder="Buscar eventos..."
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
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="confirmed">Confirmados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
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

      {/* Lista de Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedEvents.length > 0 ? (
          filteredAndSortedEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{event.emoji}</span>
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        {format(parseISO(event.date), "EEEE, d MMMM yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
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

                {event.openingTime && event.closingTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.openingTime} - {event.closingTime}
                    </span>
                  </div>
                )}

                {event.attendees && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} asistentes</span>
                  </div>
                )}

                {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}

                <div className="flex gap-2 pt-2">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Ver Detalles
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Editar
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
                    : "No hay eventos programados desde el 15 de agosto 2025"}
                </p>
                <Link href="/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Evento
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
              Mostrando {filteredAndSortedEvents.length} de {totalEvents} eventos desde el 15 de agosto 2025
              <br />
              Los eventos anteriores al 15 de agosto están archivados y no se muestran
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
