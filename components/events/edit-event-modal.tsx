"use client"

import { useState, useEffect } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface EditEventModalProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function EditEventModal({ eventId, isOpen, onClose }: EditEventModalProps) {
  const { events, venues, updateEvent } = useUnifiedEventStore()
  const { toast } = useToast()

  const event = events.find((e) => e.id === eventId)

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    venue: "",
    venueId: "none", // Cambié de "" a "none"
    status: "planning" as const,
  })

  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title || "",
        date: event.date || "",
        venue: event.venue || "",
        venueId: event.venueId || "none",
        status: event.status || "planning",
      })
    }
  }, [event, isOpen])

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.venue) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    // Convertir "none" a string vacío si es necesario
    const updateData = {
      ...formData,
      venueId: formData.venueId === "none" ? "" : formData.venueId,
    }

    updateEvent(eventId, updateData)

    toast({
      title: "Evento actualizado",
      description: "Los cambios han sido guardados exitosamente",
    })

    onClose()
  }

  const handleVenueSelect = (venueId: string) => {
    if (venueId === "none") {
      setFormData((prev) => ({
        ...prev,
        venue: "",
        venueId: "none",
      }))
      return
    }

    const venue = venues.find((v) => v.id === venueId)
    if (venue) {
      setFormData((prev) => ({
        ...prev,
        venue: venue.nombre,
        venueId: venue.id,
      }))
    }
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>Modifica los datos básicos del evento</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Evento</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="venue">Venue</Label>
            <Select value={formData.venueId} onValueChange={handleVenueSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Seleccionar venue</SelectItem>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
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
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
