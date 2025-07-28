"use client"

import { useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EditItemDialog({ item, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [editedItem, setEditedItem] = useState({ ...item })

  const handleChange = (field, value) => {
    setEditedItem((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNumberChange = (field, value) => {
    const numValue = value === "" ? 0 : Number.parseFloat(value)
    setEditedItem((prev) => ({
      ...prev,
      [field]: numValue,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Calcular resultado de negociación y desviación
    const negotiationResult = editedItem.budget - editedItem.closed
    const deviation = editedItem.budget > 0 ? (negotiationResult / editedItem.budget) * 100 : 0

    // Actualizar los campos calculados
    const updatedItem = {
      ...editedItem,
      negotiationResult,
      deviation,
    }

    onUpdate(updatedItem)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Modifica los detalles del item. Haz clic en guardar cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={editedItem.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Presupuesto
              </Label>
              <Input
                id="budget"
                type="number"
                value={editedItem.budget}
                onChange={(e) => handleNumberChange("budget", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="closed" className="text-right">
                Cerrado
              </Label>
              <Input
                id="closed"
                type="number"
                value={editedItem.closed}
                onChange={(e) => handleNumberChange("closed", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Modo de Pago
              </Label>
              <Input
                id="paymentMethod"
                value={editedItem.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Select
                value={editedItem.productionStatus}
                onValueChange={(value) => handleChange("productionStatus", value)}
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
              <Label htmlFor="area" className="text-right">
                Área
              </Label>
              <Select value={editedItem.area} onValueChange={(value) => handleChange("area", value)}>
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
              <Label htmlFor="responsible" className="text-right">
                Responsable
              </Label>
              <Input
                id="responsible"
                value={editedItem.responsible}
                onChange={(e) => handleChange("responsible", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contacto
              </Label>
              <Input
                id="contact"
                value={editedItem.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comments" className="text-right">
                Comentarios
              </Label>
              <Textarea
                id="comments"
                value={editedItem.comments}
                onChange={(e) => handleChange("comments", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                Documento/Link
              </Label>
              <Input
                id="document"
                value={editedItem.document}
                onChange={(e) => handleChange("document", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contingencyPlan" className="text-right">
                Plan de Contingencia
              </Label>
              <Textarea
                id="contingencyPlan"
                value={editedItem.contingencyPlan}
                onChange={(e) => handleChange("contingencyPlan", e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
