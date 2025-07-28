"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useCallback } from "react"
import { CalendarIcon } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useEventStore } from "@/lib/event-service"

interface NewEventDialogProps {
  initialDate?: Date
}

export function NewEventDialog({ initialDate }: NewEventDialogProps) {
  const router = useRouter()
  const addEvent = useEventStore((state) => state.addEvent)

  const [startDate, setStartDate] = useState<Date | undefined>(initialDate)
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    venue: "",
    theme: "",
    notes: "",
  })

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!startDate || !formData.location || !formData.venue || !formData.theme) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      // Formatear fecha para el título y slug
      const dateStr = startDate ? format(startDate, "dd-MM", { locale: es }) : "fecha"
      const dateForTitle = startDate ? format(startDate, "dd/MM", { locale: es }) : "fecha"

      // Si hay fecha de fin, agregarla al título
      let title = `${formData.location.toUpperCase()} - ${dateForTitle}`
      let slug = `${formData.location.toLowerCase().replace(/\s+/g, "-")}-${dateStr}`

      if (endDate) {
        const endDateStr = format(endDate, "dd/MM", { locale: es })
        const endDateSlug = format(endDate, "dd-MM", { locale: es })
        title = `${formData.location.toUpperCase()} - ${dateForTitle} ; ${endDateStr}`
        slug = `${formData.location.toLowerCase().replace(/\s+/g, "-")}-${dateStr}-${endDateSlug}`
      }

      // Create the event in the store
      const eventId = addEvent({
        id: slug,
        title,
        location: formData.location.toUpperCase(),
        date: startDate.toISOString().split("T")[0],
        endDate: endDate ? endDate.toISOString().split("T")[0] : null,
        venue: formData.venue,
        theme: formData.theme,
        notes: formData.notes,
        status: "active",
        progress: 0,
        pendingTasks: 0,
        budget: 0,
        actual: 0,
        items: [],
      })

      // Cerrar el diálogo y mostrar mensaje de éxito
      setOpen(false)
      toast({
        title: "Evento creado",
        description: `Se ha creado el evento ${title} correctamente`,
      })

      // Limpiar el formulario
      setFormData({
        location: "",
        venue: "",
        theme: "",
        notes: "",
      })
      setStartDate(undefined)
      setEndDate(undefined)

      // Redirigir al usuario a la página del nuevo evento
      setTimeout(() => {
        router.push(`/events/${eventId}`)
      }, 500)
    },
    [startDate, endDate, formData, addEvent, router],
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nuevo Evento</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del nuevo evento. Todos los items base se crearán automáticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Ubicación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="HAEDO"
                className="col-span-3"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="venue" className="text-right">
                Venue <span className="text-red-500">*</span>
              </Label>
              <Input
                id="venue"
                placeholder="Auditorio Oeste"
                className="col-span-3"
                value={formData.venue}
                onChange={(e) => handleChange("venue", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme" className="text-right">
                Temática <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.theme} onValueChange={(value) => handleChange("theme", value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar temática" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Viaje al Puerto Desconocido">Viaje al Puerto Desconocido</SelectItem>
                  <SelectItem value="Shhangai Extasis">Shhangai Extasis</SelectItem>
                  <SelectItem value="Las Reliquias del Bosque Encantado">Las Reliquias del Bosque Encantado</SelectItem>
                  <SelectItem value="Por Encima de la Mente">Por Encima de la Mente</SelectItem>
                  <SelectItem value="Día de los Muertos">Día de los Muertos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Fecha Inicio <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => !startDate || date < startDate || isSameDay(date, startDate)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <Textarea
                id="notes"
                placeholder="Detalles adicionales del evento"
                className="col-span-3"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Crear Evento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
