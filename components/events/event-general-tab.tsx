"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { useToast } from "@/components/ui/use-toast"
import { Clock, AlertTriangle, CheckCircle, Save } from "lucide-react"
import type { Event } from "@/store/unified-event-store"

interface EventGeneralTabProps {
  event: Event
}

export function EventGeneralTab({ event }: EventGeneralTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(event)
  const { updateEvent, venues } = useUnifiedEventStore()
  const { toast } = useToast()

  const handleSave = () => {
    updateEvent(event.id, formData)
    setIsEditing(false)
    toast({
      title: "Evento actualizado",
      description: "Los cambios se han guardado correctamente.",
    })
  }

  const handleCancel = () => {
    setFormData(event)
    setIsEditing(false)
  }

  const canSellTickets = formData.hasLocalPermit && formData.hasAlcoholPermit

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Datos básicos del evento y configuración principal</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Editar</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del Evento</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              ) : (
                <p className="text-sm font-medium">{formData.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              {isEditing ? (
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              ) : (
                <p className="text-sm">{new Date(formData.date).toLocaleDateString("es-AR")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              {isEditing ? (
                <Select value={formData.venue} onValueChange={(value) => setFormData({ ...formData, venue: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.nombre}>
                        {venue.nombre} - {venue.direccion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{formData.venue}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Temática</Label>
              {isEditing ? (
                <Input
                  id="theme"
                  value={formData.theme || ""}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="ej: general, bosque, ia, muertos"
                />
              ) : (
                <p className="text-sm">{formData.theme || "No definida"}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{formData.description || "Sin descripción"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule and Logistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horarios y Logística
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingTime">Hora de Apertura</Label>
              {isEditing ? (
                <Input
                  id="openingTime"
                  type="time"
                  value={formData.openingTime || ""}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                />
              ) : (
                <p className="text-sm">{formData.openingTime || "No definida"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">Hora de Cierre</Label>
              {isEditing ? (
                <Input
                  id="closingTime"
                  type="time"
                  value={formData.closingTime || ""}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                />
              ) : (
                <p className="text-sm">{formData.closingTime || "No definida"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="setupStartTime">Inicio de Montaje</Label>
              {isEditing ? (
                <Input
                  id="setupStartTime"
                  type="time"
                  value={formData.setupStartTime || ""}
                  onChange={(e) => setFormData({ ...formData, setupStartTime: e.target.value })}
                />
              ) : (
                <p className="text-sm">{formData.setupStartTime || "No definida"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teardownTime">Fin de Desarme</Label>
              {isEditing ? (
                <Input
                  id="teardownTime"
                  type="time"
                  value={formData.teardownTime || ""}
                  onChange={(e) => setFormData({ ...formData, teardownTime: e.target.value })}
                />
              ) : (
                <p className="text-sm">{formData.teardownTime || "No definida"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permits and Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Habilitaciones y Capacidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Habilitación Local</Label>
                {isEditing ? (
                  <Select
                    value={formData.hasLocalPermit ? "true" : "false"}
                    onValueChange={(value) => setFormData({ ...formData, hasLocalPermit: value === "true" })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={formData.hasLocalPermit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {formData.hasLocalPermit ? "Vigente" : "Pendiente"}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label>Habilitación Alcohol</Label>
                {isEditing ? (
                  <Select
                    value={formData.hasAlcoholPermit ? "true" : "false"}
                    onValueChange={(value) => setFormData({ ...formData, hasAlcoholPermit: value === "true" })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={formData.hasAlcoholPermit ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {formData.hasAlcoholPermit ? "Vigente" : "Pendiente"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attendees">Capacidad Declarada</Label>
                {isEditing ? (
                  <Input
                    id="attendees"
                    type="number"
                    value={formData.attendees || ""}
                    onChange={(e) => setFormData({ ...formData, attendees: Number.parseInt(e.target.value) || 0 })}
                  />
                ) : (
                  <p className="text-sm">{formData.attendees || "No definida"} personas</p>
                )}
              </div>
            </div>
          </div>

          {/* Sale Status */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3">
              {canSellTickets ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">{canSellTickets ? "Habilitado para venta" : "Venta bloqueada"}</p>
                <p className="text-sm text-muted-foreground">
                  {canSellTickets
                    ? "Todas las habilitaciones están vigentes"
                    : "Faltan habilitaciones requeridas para habilitar la venta"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contactos de Producción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="producerName">Responsable</Label>
              {isEditing ? (
                <Input
                  id="producerName"
                  value={formData.producerContact?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      producerContact: {
                        ...formData.producerContact,
                        name: e.target.value,
                      },
                    })
                  }
                />
              ) : (
                <p className="text-sm">{formData.producerContact?.name || "No definido"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="producerPhone">Teléfono</Label>
              {isEditing ? (
                <Input
                  id="producerPhone"
                  value={formData.producerContact?.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      producerContact: {
                        ...formData.producerContact,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              ) : (
                <p className="text-sm">{formData.producerContact?.phone || "No definido"}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="producerEmail">Email</Label>
              {isEditing ? (
                <Input
                  id="producerEmail"
                  type="email"
                  value={formData.producerContact?.email || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      producerContact: {
                        ...formData.producerContact,
                        email: e.target.value,
                      },
                    })
                  }
                />
              ) : (
                <p className="text-sm">{formData.producerContact?.email || "No definido"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
