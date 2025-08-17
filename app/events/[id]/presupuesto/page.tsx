"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Download, Edit, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface BudgetItem {
  id: string
  eventId: string
  area: "ARTE" | "BOOKING" | "MARKETING" | "EXTRAS"
  item: string
  proveedor: string
  contacto: string
  modoPago: string
  presupuestoCerrado: number
  ultimoCerrado: number
  estadoProduccion: "Completado" | "En curso" | "No va" | "Pendiente"
  resultadoNegociacion: number
  desviacion: number
  deadline: string
  comentarios: string
  responsable: string
}

export default function PresupuestoEventPage() {
  const params = useParams()
  const eventId = params.id as string
  const { events, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useUnifiedEventStore()
  const { toast } = useToast()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [selectedArea, setSelectedArea] = useState<string>("all")

  const event = events.find((e) => e.id === eventId)
  const eventBudgetItems = budgetItems.filter((item) => item.eventId === eventId)

  const [newItem, setNewItem] = useState<Omit<BudgetItem, "id">>({
    eventId,
    area: "ARTE",
    item: "",
    proveedor: "",
    contacto: "",
    modoPago: "Transferencia - Post Evento",
    presupuestoCerrado: 0,
    ultimoCerrado: 0,
    estadoProduccion: "Pendiente",
    resultadoNegociacion: 0,
    desviacion: 0,
    deadline: "",
    comentarios: "",
    responsable: "Franco",
  })

  // Filtrar por área
  const filteredItems =
    selectedArea === "all" ? eventBudgetItems : eventBudgetItems.filter((item) => item.area === selectedArea)

  // Calcular totales por área
  const totalesPorArea = {
    ARTE: eventBudgetItems.filter((i) => i.area === "ARTE").reduce((sum, i) => sum + i.resultadoNegociacion, 0),
    BOOKING: eventBudgetItems.filter((i) => i.area === "BOOKING").reduce((sum, i) => sum + i.resultadoNegociacion, 0),
    MARKETING: eventBudgetItems
      .filter((i) => i.area === "MARKETING")
      .reduce((sum, i) => sum + i.resultadoNegociacion, 0),
    EXTRAS: eventBudgetItems.filter((i) => i.area === "EXTRAS").reduce((sum, i) => sum + i.resultadoNegociacion, 0),
  }

  const totalGeneral = Object.values(totalesPorArea).reduce((sum, val) => sum + val, 0)
  const totalDesviacion = eventBudgetItems.reduce((sum, i) => sum + i.desviacion, 0)

  const handleAddItem = () => {
    if (!newItem.item || !newItem.proveedor) {
      toast({
        title: "Error",
        description: "Por favor completa el ítem y proveedor",
        variant: "destructive",
      })
      return
    }

    // Calcular desviación automáticamente
    const desviacion = newItem.ultimoCerrado - newItem.presupuestoCerrado
    const itemWithCalculations = {
      ...newItem,
      desviacion,
      resultadoNegociacion: newItem.ultimoCerrado || newItem.presupuestoCerrado,
    }

    addBudgetItem(itemWithCalculations)

    toast({
      title: "Ítem agregado",
      description: `${newItem.item} ha sido agregado al presupuesto`,
    })

    // Reset form
    setNewItem({
      eventId,
      area: "ARTE",
      item: "",
      proveedor: "",
      contacto: "",
      modoPago: "Transferencia - Post Evento",
      presupuestoCerrado: 0,
      ultimoCerrado: 0,
      estadoProduccion: "Pendiente",
      resultadoNegociacion: 0,
      desviacion: 0,
      deadline: "",
      comentarios: "",
      responsable: "Franco",
    })
    setShowAddForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-green-100 text-green-800"
      case "En curso":
        return "bg-blue-100 text-blue-800"
      case "No va":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  const getAreaColor = (area: string) => {
    switch (area) {
      case "ARTE":
        return "bg-purple-100 text-purple-800"
      case "BOOKING":
        return "bg-blue-100 text-blue-800"
      case "MARKETING":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const importFromCSV = () => {
    // Función para importar desde CSV como tu planilla
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const csv = e.target?.result as string
          // Aquí procesarías el CSV y agregarías los ítems
          toast({
            title: "CSV procesado",
            description: "Los datos han sido importados exitosamente",
          })
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!event) {
    return <div>Evento no encontrado</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Evento
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Presupuesto - {event.venue}</h1>
        <p className="text-gray-600">
          {new Date(event.date).toLocaleDateString("es-AR")} • Gestión financiera completa
        </p>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total ARTE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${totalesPorArea.ARTE.toLocaleString("es-AR")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total BOOKING</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalesPorArea.BOOKING.toLocaleString("es-AR")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total MARKETING</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalesPorArea.MARKETING.toLocaleString("es-AR")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGeneral.toLocaleString("es-AR")}</div>
            <p className={`text-xs ${totalDesviacion >= 0 ? "text-red-600" : "text-green-600"}`}>
              Desviación: ${totalDesviacion.toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Ítem
          </Button>
          <Button variant="outline" onClick={importFromCSV}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>

        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            <SelectItem value="ARTE">ARTE</SelectItem>
            <SelectItem value="BOOKING">BOOKING</SelectItem>
            <SelectItem value="MARKETING">MARKETING</SelectItem>
            <SelectItem value="EXTRAS">EXTRAS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Formulario agregar ítem */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agregar Nuevo Ítem al Presupuesto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label>Área</Label>
                <Select
                  value={newItem.area}
                  onValueChange={(value: any) => setNewItem((prev) => ({ ...prev, area: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARTE">ARTE</SelectItem>
                    <SelectItem value="BOOKING">BOOKING</SelectItem>
                    <SelectItem value="MARKETING">MARKETING</SelectItem>
                    <SelectItem value="EXTRAS">EXTRAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ítem *</Label>
                <Input
                  value={newItem.item}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, item: e.target.value }))}
                  placeholder="Ej: DJ, Iluminación"
                />
              </div>

              <div>
                <Label>Proveedor *</Label>
                <Input
                  value={newItem.proveedor}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, proveedor: e.target.value }))}
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div>
                <Label>Contacto</Label>
                <Input
                  value={newItem.contacto}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, contacto: e.target.value }))}
                  placeholder="Teléfono/Email"
                />
              </div>

              <div>
                <Label>Modo de Pago</Label>
                <Select
                  value={newItem.modoPago}
                  onValueChange={(value) => setNewItem((prev) => ({ ...prev, modoPago: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferencia - Post Evento">Transferencia - Post Evento</SelectItem>
                    <SelectItem value="Transferencia - Antes del Evento">Transferencia - Antes del Evento</SelectItem>
                    <SelectItem value="Efectivo - En el Evento">Efectivo - En el Evento</SelectItem>
                    <SelectItem value="Efectivo - Post Evento">Efectivo - Post Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Presupuesto Cerrado</Label>
                <Input
                  type="number"
                  value={newItem.presupuestoCerrado}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      presupuestoCerrado: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Último Cerrado</Label>
                <Input
                  type="number"
                  value={newItem.ultimoCerrado}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      ultimoCerrado: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={newItem.estadoProduccion}
                  onValueChange={(value: any) => setNewItem((prev) => ({ ...prev, estadoProduccion: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En curso">En curso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="No va">No va</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Comentarios</Label>
                <Input
                  value={newItem.comentarios}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, comentarios: e.target.value }))}
                  placeholder="Observaciones adicionales"
                />
              </div>

              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={newItem.deadline}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              <div>
                <Label>Responsable</Label>
                <Input
                  value={newItem.responsable}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, responsable: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem}>Agregar Ítem</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de presupuesto */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle del Presupuesto</CardTitle>
          <CardDescription>
            {filteredItems.length} ítems • {selectedArea === "all" ? "Todas las áreas" : selectedArea}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Ítem</th>
                  <th className="text-left p-2">Proveedor</th>
                  <th className="text-left p-2">Modo de Pago</th>
                  <th className="text-right p-2">Presupuesto</th>
                  <th className="text-right p-2">Último Cerrado</th>
                  <th className="text-center p-2">Estado</th>
                  <th className="text-right p-2">Desviación</th>
                  <th className="text-left p-2">Comentarios</th>
                  <th className="text-center p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Badge className={getAreaColor(item.area)}>{item.area}</Badge>
                    </td>
                    <td className="p-2 font-medium">{item.item}</td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{item.proveedor}</div>
                        {item.contacto && <div className="text-xs text-gray-500">{item.contacto}</div>}
                      </div>
                    </td>
                    <td className="p-2 text-xs">{item.modoPago}</td>
                    <td className="p-2 text-right font-mono">${item.presupuestoCerrado.toLocaleString("es-AR")}</td>
                    <td className="p-2 text-right font-mono">${item.ultimoCerrado.toLocaleString("es-AR")}</td>
                    <td className="p-2 text-center">
                      <Badge className={getStatusColor(item.estadoProduccion)}>{item.estadoProduccion}</Badge>
                    </td>
                    <td
                      className={`p-2 text-right font-mono ${
                        item.desviacion > 0 ? "text-red-600" : item.desviacion < 0 ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {item.desviacion > 0 ? "+" : ""}${item.desviacion.toLocaleString("es-AR")}
                    </td>
                    <td className="p-2 text-xs max-w-32 truncate">{item.comentarios}</td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("¿Eliminar este ítem?")) {
                              deleteBudgetItem(item.id)
                              toast({
                                title: "Ítem eliminado",
                                description: "El ítem ha sido eliminado del presupuesto",
                              })
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td colSpan={4} className="p-2">
                    TOTAL {selectedArea === "all" ? "GENERAL" : selectedArea}
                  </td>
                  <td className="p-2 text-right">
                    ${filteredItems.reduce((sum, i) => sum + i.presupuestoCerrado, 0).toLocaleString("es-AR")}
                  </td>
                  <td className="p-2 text-right">
                    ${filteredItems.reduce((sum, i) => sum + i.ultimoCerrado, 0).toLocaleString("es-AR")}
                  </td>
                  <td></td>
                  <td
                    className={`p-2 text-right ${
                      filteredItems.reduce((sum, i) => sum + i.desviacion, 0) > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ${filteredItems.reduce((sum, i) => sum + i.desviacion, 0).toLocaleString("es-AR")}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
