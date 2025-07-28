"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type BudgetItem, useEventStore } from "@/lib/event-service"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"

interface BudgetManagementProps {
  eventId?: string
}

export function BudgetManagement({ eventId }: BudgetManagementProps) {
  const { events, addBudgetItem, updateBudgetItem, deleteBudgetItem, getBudgetItemsByEvent } = useEventStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null)
  const [items, setItems] = useState<BudgetItem[]>([])
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalActual: 0,
    variance: 0,
    percentSpent: 0,
  })

  const [formData, setFormData] = useState<Omit<BudgetItem, "id">>({
    eventId: eventId || "",
    name: "",
    budget: 0,
    closed: 0,
    negotiationResult: 0,
    deviation: 0,
    paymentMethod: "",
    productionStatus: "No iniciado",
    comments: "",
    area: "Arte",
    responsible: "",
    contact: "",
    document: "",
    contingencyPlan: "",
    eventId: eventId || "",
  })

  // Load items and calculate summary
  useEffect(() => {
    if (eventId) {
      const eventItems = getBudgetItemsByEvent(eventId)
      setItems(eventItems)

      // Calculate summary
      const totalBudget = eventItems.reduce((sum, item) => sum + item.budget, 0)
      const totalActual = eventItems.reduce((sum, item) => sum + item.closed, 0)
      const variance = totalBudget - totalActual
      const percentSpent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0

      setSummary({
        totalBudget,
        totalActual,
        variance,
        percentSpent,
      })
    } else {
      // If no eventId, get all items from all events
      const allItems: BudgetItem[] = []
      let totalBudget = 0
      let totalActual = 0

      events.forEach((event) => {
        allItems.push(...event.items)
        totalBudget += event.budget
        totalActual += event.actual
      })

      setItems(allItems)

      const variance = totalBudget - totalActual
      const percentSpent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0

      setSummary({
        totalBudget,
        totalActual,
        variance,
        percentSpent,
      })
    }
  }, [eventId, events, getBudgetItemsByEvent])

  // Handle form field changes - IMPROVED
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleAddItem = useCallback(() => {
    addBudgetItem({
      ...formData,
      eventId: eventId || formData.eventId,
    })

    setIsAddDialogOpen(false)
    toast({
      title: "Item agregado",
      description: "El item ha sido agregado exitosamente al presupuesto.",
    })

    // Reset form
    setFormData({
      eventId: eventId || "",
      name: "",
      budget: 0,
      closed: 0,
      negotiationResult: 0,
      deviation: 0,
      paymentMethod: "",
      productionStatus: "No iniciado",
      comments: "",
      area: "Arte",
      responsible: "",
      contact: "",
      document: "",
      contingencyPlan: "",
    })
  }, [formData, eventId, addBudgetItem])

  const handleEditItem = useCallback(() => {
    if (selectedItem) {
      updateBudgetItem(selectedItem.id, formData)
      setIsEditDialogOpen(false)
      toast({
        title: "Item actualizado",
        description: "El item ha sido actualizado exitosamente.",
      })
      setSelectedItem(null)

      // Reset form
      setFormData({
        eventId: eventId || "",
        name: "",
        budget: 0,
        closed: 0,
        negotiationResult: 0,
        deviation: 0,
        paymentMethod: "",
        productionStatus: "No iniciado",
        comments: "",
        area: "Arte",
        responsible: "",
        contact: "",
        document: "",
        contingencyPlan: "",
      })
    }
  }, [selectedItem, formData, updateBudgetItem, eventId])

  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteBudgetItem(id)
      toast({
        title: "Item eliminado",
        description: "El item ha sido eliminado exitosamente.",
      })
    },
    [deleteBudgetItem],
  )

  const openEditDialog = useCallback((item: BudgetItem) => {
    setSelectedItem(item)
    setFormData({
      eventId: item.eventId,
      name: item.name,
      budget: item.budget,
      closed: item.closed,
      negotiationResult: item.negotiationResult,
      deviation: item.deviation,
      paymentMethod: item.paymentMethod,
      productionStatus: item.productionStatus,
      comments: item.comments,
      area: item.area,
      responsible: item.responsible,
      contact: item.contact,
      document: item.document,
      contingencyPlan: item.contingencyPlan,
    })
    setIsEditDialogOpen(true)
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Presupuesto</CardTitle>
          <CardDescription>Visión general de la asignación y gasto del presupuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Presupuesto Total</div>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Total Gastado</div>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalActual)}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Varianza</div>
              <div className={`text-2xl font-bold ${summary.variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(summary.variance)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Porcentaje Gastado</div>
              <div className="text-2xl font-bold">{summary.percentSpent.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Items de Presupuesto</CardTitle>
            <CardDescription>Gestiona tus items de presupuesto y gastos</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Item de Presupuesto</DialogTitle>
                <DialogDescription>Agrega un nuevo item para seguir los gastos.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {!eventId && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="eventId" className="text-right">
                      Evento
                    </Label>
                    <Select value={formData.eventId} onValueChange={(value) => handleFormChange("eventId", value)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="area" className="text-right">
                    Área
                  </Label>
                  <Select value={formData.area} onValueChange={(value) => handleFormChange("area", value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arte">Arte</SelectItem>
                      <SelectItem value="Booking">Booking</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget" className="text-right">
                    Presupuesto
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleFormChange("budget", Number.parseFloat(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="closed" className="text-right">
                    Gasto Real
                  </Label>
                  <Input
                    id="closed"
                    type="number"
                    value={formData.closed}
                    onChange={(e) => handleFormChange("closed", Number.parseFloat(e.target.value) || 0)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productionStatus" className="text-right">
                    Estado
                  </Label>
                  <Select
                    value={formData.productionStatus}
                    onValueChange={(value) => handleFormChange("productionStatus", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completado">Completado</SelectItem>
                      <SelectItem value="En curso">En curso</SelectItem>
                      <SelectItem value="No iniciado">No iniciado</SelectItem>
                      <SelectItem value="Sin estado">Sin estado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="responsible" className="text-right">
                    Responsable
                  </Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => handleFormChange("responsible", e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem}>Agregar Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="text-right">Presupuesto</TableHead>
                <TableHead className="text-right">Gasto Real</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No se encontraron items de presupuesto. Agrega tu primer item.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.area}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.budget)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.closed)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          item.productionStatus === "Completado"
                            ? "bg-green-100 text-green-800"
                            : item.productionStatus === "En curso"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.productionStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item de Presupuesto</DialogTitle>
            <DialogDescription>Actualiza los detalles de este item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-area" className="text-right">
                Área
              </Label>
              <Select value={formData.area} onValueChange={(value) => handleFormChange("area", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arte">Arte</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-budget" className="text-right">
                Presupuesto
              </Label>
              <Input
                id="edit-budget"
                type="number"
                value={formData.budget}
                onChange={(e) => handleFormChange("budget", Number.parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-closed" className="text-right">
                Gasto Real
              </Label>
              <Input
                id="edit-closed"
                type="number"
                value={formData.closed}
                onChange={(e) => handleFormChange("closed", Number.parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Estado
              </Label>
              <Select
                value={formData.productionStatus}
                onValueChange={(value) => handleFormChange("productionStatus", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completado">Completado</SelectItem>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="No iniciado">No iniciado</SelectItem>
                  <SelectItem value="Sin estado">Sin estado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-responsible" className="text-right">
                Responsable
              </Label>
              <Input
                id="edit-responsible"
                value={formData.responsible}
                onChange={(e) => handleFormChange("responsible", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditItem}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
