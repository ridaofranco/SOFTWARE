"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Plus, Search, Calendar, Users, Edit, Trash2, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VenuesPage() {
  const { venues, events, addVenue, updateVenue, deleteVenue } = useUnifiedEventStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const [newVenue, setNewVenue] = useState({
    nombre: "",
    direccion: "",
    capacity: "",
    type: "",
    notes: "",
  })

  // Filtrar venues
  const filteredVenues = venues.filter(
    (venue) =>
      venue.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.direccion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddVenue = () => {
    if (!newVenue.nombre || !newVenue.direccion) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre y dirección del venue",
        variant: "destructive",
      })
      return
    }

    addVenue({
      nombre: newVenue.nombre,
      direccion: newVenue.direccion,
      capacity: Number.parseInt(newVenue.capacity) || undefined,
      type: newVenue.type || undefined,
    })

    toast({
      title: "Venue agregado",
      description: `${newVenue.nombre} ha sido agregado exitosamente`,
    })

    // Reset form
    setNewVenue({
      nombre: "",
      direccion: "",
      capacity: "",
      type: "",
      notes: "",
    })
    setShowAddForm(false)
  }

  const getVenueEvents = (venueId: string) => {
    return events.filter(
      (event) => event.venueId === venueId || event.venue === venues.find((v) => v.id === venueId)?.nombre,
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Venues</h1>
          <p className="text-gray-600">Administra y selecciona venues para tus eventos</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Venue
        </Button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar venues por nombre o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Formulario de nuevo venue */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agregar Nuevo Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del Venue *</Label>
                <Input
                  id="nombre"
                  value={newVenue.nombre}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: AMERIKA, THE BOW"
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  value={newVenue.direccion}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección completa"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacidad</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newVenue.capacity}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Número de personas"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de Venue</Label>
                <Input
                  id="type"
                  value={newVenue.type}
                  onChange={(e) => setNewVenue((prev) => ({ ...prev, type: e.target.value }))}
                  placeholder="Ej: Club, Teatro, Salón"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={newVenue.notes}
                onChange={(e) => setNewVenue((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Información adicional sobre el venue"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddVenue}>Agregar Venue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de venues */}
      {filteredVenues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {venues.length === 0 ? "No hay venues registrados" : "No se encontraron venues"}
            </h3>
            <p className="text-gray-600 mb-4">
              {venues.length === 0 ? "Comienza agregando tu primer venue" : "Intenta ajustar los términos de búsqueda"}
            </p>
            {venues.length === 0 && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Venue
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
            const venueEvents = getVenueEvents(venue.id)
            const recentEvents = venueEvents
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)

            return (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{venue.nombre}</CardTitle>
                      <div className="flex items-start space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <CardDescription className="text-sm">{venue.direccion}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Información adicional */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    {venue.capacity && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{venue.capacity} personas</span>
                      </div>
                    )}
                    {venue.type && <span className="bg-gray-100 px-2 py-1 rounded text-xs">{venue.type}</span>}
                  </div>

                  {/* Eventos recientes */}
                  {recentEvents.length > 0 && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Eventos recientes ({venueEvents.length})
                      </h4>
                      <div className="space-y-1">
                        {recentEvents.map((event) => (
                          <div key={event.id} className="text-xs text-gray-600">
                            {new Date(event.date).toLocaleDateString("es-AR")}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (venueEvents.length > 0) {
                          toast({
                            title: "No se puede eliminar",
                            description: "Este venue tiene eventos asociados",
                            variant: "destructive",
                          })
                          return
                        }

                        if (confirm("¿Estás seguro de eliminar este venue?")) {
                          deleteVenue(venue.id)
                          toast({
                            title: "Venue eliminado",
                            description: "El venue ha sido eliminado del sistema",
                          })
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
