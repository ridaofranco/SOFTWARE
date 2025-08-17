"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Download, MapPin, Search, Check, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useEventStore } from "@/lib/event-service"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImportExcelDialog } from "@/components/import-excel-dialog"
import { NavBar } from "@/components/nav-bar"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Tipo para la celda que está siendo editada
type EditingCell = {
  itemId: string
  field: string
  value: any
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const getEvent = useEventStore((state) => state.getEvent)
  const getBudgetItemsByEvent = useEventStore((state) => state.getBudgetItemsByEvent)
  const updateBudgetItem = useEventStore((state) => state.updateBudgetItem)
  const [event, setEvent] = useState(null)
  const [budgetItems, setBudgetItems] = useState([])
  const [activeTab, setActiveTab] = useState("items")
  const [searchQuery, setSearchQuery] = useState("")
  const [areaFilter, setAreaFilter] = useState("todas")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [itemTabs, setItemTabs] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const slug = params.slug as string

  useEffect(() => {
    // Fetch the event from our store
    const foundEvent = getEvent(slug)

    if (foundEvent) {
      setEvent(foundEvent)
      setBudgetItems(getBudgetItemsByEvent(slug))
    } else {
      // If no event is found, show error and redirect
      toast({
        title: "Error",
        description: "No se encontró el evento solicitado",
        variant: "destructive",
      })

      // Redirect to events page
      setTimeout(() => {
        router.push("/events")
      }, 2000)
    }
  }, [slug, router, getEvent, getBudgetItemsByEvent])

  // Función para manejar la importación completada
  const handleImportComplete = () => {
    // Recargar el evento para mostrar los nuevos datos
    const updatedEvent = getEvent(slug)
    if (updatedEvent) {
      setEvent(updatedEvent)
      setBudgetItems(getBudgetItemsByEvent(slug))
    }
  }

  // Filtrar items según la pestaña activa, búsqueda y filtros
  const filteredItems = budgetItems.filter((item) => {
    // Filtro por pestaña (categoría)
    if (activeTab !== "items" && item.area.toLowerCase() !== activeTab.toLowerCase()) {
      return false
    }

    // Filtro por búsqueda
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.responsible.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filtro por área
    if (areaFilter !== "todas" && item.area !== areaFilter) {
      return false
    }

    // Filtro por estado
    if (statusFilter !== "todos" && item.productionStatus !== statusFilter) {
      return false
    }

    return true
  })

  // Calcular totales para los items filtrados
  const totalBudget = filteredItems.reduce((sum, item) => sum + item.budget, 0)
  const totalClosed = filteredItems.reduce((sum, item) => sum + item.closed, 0)
  const totalNegotiationResult = totalBudget - totalClosed
  const totalDeviation = totalBudget > 0 ? (totalNegotiationResult / totalBudget) * 100 : 0

  // Función para iniciar la edición de una celda
  const startEditing = (itemId: string, field: string, value: any) => {
    setEditingCell({ itemId, field, value })
    // Enfocar el input después de renderizarlo
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 10)
  }

  // Función para guardar los cambios
  const saveEdit = () => {
    if (!editingCell) return

    const { itemId, field, value } = editingCell
    const item = budgetItems.find((item) => item.id === itemId)

    if (!item) return

    // Convertir a número si es un campo numérico
    let finalValue = value
    if (field === "budget" || field === "closed") {
      finalValue = Number.parseFloat(value) || 0
    }

    // Actualizar el item
    updateBudgetItem(itemId, { [field]: finalValue })

    // Actualizar la lista local
    setBudgetItems(getBudgetItemsByEvent(slug))

    // Limpiar el estado de edición
    setEditingCell(null)

    // Mostrar notificación
    toast({
      title: "Cambio guardado",
      description: `Se actualizó el campo ${field} del ítem ${item.name}`,
    })
  }

  // Función para cancelar la edición
  const cancelEdit = () => {
    setEditingCell(null)
  }

  // Manejar teclas en el input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCell) return
    setEditingCell({ ...editingCell, value: e.target.value })
  }

  // Manejar cambios en el select
  const handleSelectChange = (value: string) => {
    if (!editingCell) return
    setEditingCell({ ...editingCell, value })
    // Guardar automáticamente al seleccionar
    setTimeout(() => saveEdit(), 10)
  }

  // Función para renderizar una celda editable
  const renderEditableCell = (
    item: any,
    field: string,
    type: "text" | "number" | "select" = "text",
    options?: string[],
  ) => {
    const isEditing = editingCell?.itemId === item.id && editingCell?.field === field
    const value = item[field]

    // Si está en modo edición, mostrar el input o select apropiado
    if (isEditing) {
      if (type === "select" && options) {
        return (
          <div className="flex items-center">
            <Select
              value={editingCell.value}
              onValueChange={handleSelectChange}
              onOpenChange={(open) => {
                if (!open) setTimeout(() => saveEdit(), 100)
              }}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

      return (
        <div className="flex items-center">
          <Input
            ref={inputRef}
            type={type}
            value={editingCell.value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={saveEdit}
            className="h-8 w-full"
          />
          <div className="flex ml-2">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    // Si no está en modo edición, mostrar el valor con formato
    let displayValue: React.ReactNode = value

    // Formatear según el tipo de campo
    if (field === "budget" || field === "closed") {
      displayValue = `$${value.toLocaleString()}`
    } else if (field === "negotiationResult") {
      const className = value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : ""
      displayValue = (
        <span className={className}>
          {value > 0 ? "+" : ""}
          {`$${value.toLocaleString()}`}
        </span>
      )
    } else if (field === "productionStatus") {
      displayValue = (
        <Badge variant={value === "Completado" ? "success" : value === "En curso" ? "warning" : "secondary"}>
          {value || "No iniciado"}
        </Badge>
      )
    }

    // Hacer que la celda sea clickeable para editar
    return (
      <div
        className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
        onClick={() => startEditing(item.id, field, value)}
      >
        {displayValue}
      </div>
    )
  }

  // Función para alternar la expansión de un ítem
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))

    // Si no hay una pestaña activa para este ítem, establecer la pestaña predeterminada
    if (!itemTabs[itemId]) {
      setItemTabs((prev) => ({
        ...prev,
        [itemId]: "presupuesto",
      }))
    }
  }

  // Función para cambiar la pestaña activa de un ítem
  const setItemActiveTab = (itemId: string, tab: string) => {
    setItemTabs((prev) => ({
      ...prev,
      [itemId]: tab,
    }))
  }

  // Función para guardar notas o tareas
  const saveItemDetails = (itemId: string, field: string, value: string) => {
    updateBudgetItem(itemId, { [field]: value })

    // Actualizar la lista local
    setBudgetItems(getBudgetItemsByEvent(slug))

    toast({
      title: "Cambios guardados",
      description: `Se actualizaron los detalles del ítem`,
    })
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Cargando evento...</h2>
            <p className="text-muted-foreground">Si el evento no existe, serás redirigido a la lista de eventos.</p>
          </div>
        </main>
      </div>
    )
  }

  // Contar items por área
  const arteCount = budgetItems.filter((item) => item.area === "Arte").length
  const bookingCount = budgetItems.filter((item) => item.area === "Booking").length
  const marketingCount = budgetItems.filter((item) => item.area === "Marketing").length

  // Contar items por estado
  const noIniciadoCount = budgetItems.filter((item) => item.productionStatus === "No iniciado").length

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/events">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(event.date), "dd/MM/yyyy", { locale: es })}
                    {event.endDate && ` - ${format(parseISO(event.endDate), "dd/MM/yyyy", { locale: es })}`}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ImportExcelDialog eventId={event.id} onImportComplete={handleImportComplete} />
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <Tabs defaultValue="presupuesto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
            </TabsList>

            <TabsContent value="presupuesto" className="mt-4">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Presupuesto Total */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Presupuesto Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">$ {event.budget.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Cerrado: $ {event.actual.toLocaleString()}(
                        {event.budget > 0
                          ? `${(((event.budget - event.actual) / event.budget) * 100).toFixed(2)}%`
                          : "0%"}
                        )
                      </p>
                    </CardContent>
                  </Card>

                  {/* Items por Área */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Items por Área</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Badge variant="secondary" className="px-3 py-1">
                        Arte: {arteCount}
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1">
                        Booking: {bookingCount}
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1">
                        Marketing: {marketingCount}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Estado de Producción */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Estado de Producción</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary" className="px-3 py-1">
                        No iniciado: {noIniciadoCount}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs y Tabla de Items */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Tabs de categorías */}
                      <div className="border-b">
                        <div className="flex flex-wrap -mb-px">
                          <button
                            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                              activeTab === "items"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                            }`}
                            onClick={() => setActiveTab("items")}
                          >
                            Items
                          </button>
                          <button
                            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                              activeTab === "arte"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                            }`}
                            onClick={() => setActiveTab("arte")}
                          >
                            Arte
                          </button>
                          <button
                            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                              activeTab === "booking"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                            }`}
                            onClick={() => setActiveTab("booking")}
                          >
                            Booking
                          </button>
                          <button
                            className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                              activeTab === "marketing"
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                            }`}
                            onClick={() => setActiveTab("marketing")}
                          >
                            Marketing
                          </button>
                        </div>
                      </div>

                      {/* Filtros y búsqueda */}
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por nombre o responsable..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select value={areaFilter} onValueChange={setAreaFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Todas las áreas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas las áreas</SelectItem>
                            <SelectItem value="Arte">Arte</SelectItem>
                            <SelectItem value="Booking">Booking</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Todos los estados" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos los estados</SelectItem>
                            <SelectItem value="Completado">Completado</SelectItem>
                            <SelectItem value="En curso">En curso</SelectItem>
                            <SelectItem value="No iniciado">No iniciado</SelectItem>
                            <SelectItem value="Sin estado">Sin estado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tabla de items */}
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-8"></TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-right">Presupuesto</TableHead>
                              <TableHead className="text-right">Cerrado</TableHead>
                              <TableHead className="text-right">Resultado Negociación</TableHead>
                              <TableHead>Modo de Pago</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Área</TableHead>
                              <TableHead>Responsable</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={9} className="text-center py-6">
                                  No se encontraron items que coincidan con los filtros
                                </TableCell>
                              </TableRow>
                            ) : (
                              <>
                                {filteredItems.map((item) => (
                                  <React.Fragment key={item.id}>
                                    <TableRow>
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => toggleItemExpansion(item.id)}
                                          className="h-6 w-6"
                                        >
                                          {expandedItems[item.id] ? (
                                            <ChevronUp className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TableCell>
                                      <TableCell>{renderEditableCell(item, "name")}</TableCell>
                                      <TableCell className="text-right">
                                        {renderEditableCell(item, "budget", "number")}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {renderEditableCell(item, "closed", "number")}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {renderEditableCell(item, "negotiationResult")}
                                      </TableCell>
                                      <TableCell>{renderEditableCell(item, "paymentMethod", "text")}</TableCell>
                                      <TableCell>
                                        {renderEditableCell(item, "productionStatus", "select", [
                                          "Completado",
                                          "En curso",
                                          "No iniciado",
                                          "Sin estado",
                                        ])}
                                      </TableCell>
                                      <TableCell>
                                        {renderEditableCell(item, "area", "select", ["Arte", "Booking", "Marketing"])}
                                      </TableCell>
                                      <TableCell>{renderEditableCell(item, "responsible")}</TableCell>
                                    </TableRow>
                                    {expandedItems[item.id] && (
                                      <TableRow>
                                        <TableCell colSpan={9} className="p-0 border-t-0">
                                          <div className="bg-muted/30 p-4">
                                            <div className="bg-background rounded-md shadow-sm">
                                              <div className="flex border-b">
                                                <button
                                                  className={`px-4 py-2 text-sm font-medium ${
                                                    itemTabs[item.id] === "presupuesto"
                                                      ? "bg-background border-b-2 border-primary text-primary"
                                                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                                  }`}
                                                  onClick={() => setItemActiveTab(item.id, "presupuesto")}
                                                >
                                                  Presupuesto
                                                </button>
                                                <button
                                                  className={`px-4 py-2 text-sm font-medium ${
                                                    itemTabs[item.id] === "tareas"
                                                      ? "bg-background border-b-2 border-primary text-primary"
                                                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                                  }`}
                                                  onClick={() => setItemActiveTab(item.id, "tareas")}
                                                >
                                                  Tareas
                                                </button>
                                                <button
                                                  className={`px-4 py-2 text-sm font-medium ${
                                                    itemTabs[item.id] === "notas"
                                                      ? "bg-background border-b-2 border-primary text-primary"
                                                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                                  }`}
                                                  onClick={() => setItemActiveTab(item.id, "notas")}
                                                >
                                                  Notas
                                                </button>
                                              </div>
                                              <div className="p-4">
                                                {itemTabs[item.id] === "presupuesto" && (
                                                  <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      <div>
                                                        <h4 className="text-sm font-medium mb-2">
                                                          Detalles del Presupuesto
                                                        </h4>
                                                        <div className="space-y-2">
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                              Presupuesto:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                              ${item.budget.toLocaleString()}
                                                            </span>
                                                          </div>
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                              Cerrado:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                              ${item.closed.toLocaleString()}
                                                            </span>
                                                          </div>
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                              Resultado:
                                                            </span>
                                                            <span
                                                              className={`text-sm font-medium ${
                                                                item.negotiationResult > 0
                                                                  ? "text-green-600"
                                                                  : item.negotiationResult < 0
                                                                    ? "text-red-600"
                                                                    : ""
                                                              }`}
                                                            >
                                                              {item.negotiationResult > 0 ? "+" : ""}$
                                                              {item.negotiationResult.toLocaleString()}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div>
                                                        <h4 className="text-sm font-medium mb-2">
                                                          Información Adicional
                                                        </h4>
                                                        <div className="space-y-2">
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                              Responsable:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                              {item.responsible || "No asignado"}
                                                            </span>
                                                          </div>
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                              Estado:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                              <Badge
                                                                variant={
                                                                  item.productionStatus === "Completado"
                                                                    ? "success"
                                                                    : item.productionStatus === "En curso"
                                                                      ? "warning"
                                                                      : "secondary"
                                                                }
                                                              >
                                                                {item.productionStatus || "No iniciado"}
                                                              </Badge>
                                                            </span>
                                                          </div>
                                                          <div className="grid grid-cols-2 gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                              Modo de Pago:
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                              {item.paymentMethod || "No especificado"}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                                {itemTabs[item.id] === "tareas" && (
                                                  <div className="space-y-4">
                                                    <h4 className="text-sm font-medium">Tareas Relacionadas</h4>

                                                    {/* Formulario para agregar tareas */}
                                                    <form
                                                      className="grid grid-cols-1 md:grid-cols-3 gap-3"
                                                      onSubmit={(e) => {
                                                        e.preventDefault()
                                                        const form = e.currentTarget
                                                        const formData = new FormData(form)
                                                        const taskText = formData.get("taskText") as string
                                                        const responsible = formData.get("responsible") as string
                                                        const priority = formData.get("priority") as string

                                                        if (!taskText.trim()) return

                                                        // Obtener tareas existentes o inicializar array
                                                        const existingTasks = item.tasks ? JSON.parse(item.tasks) : []

                                                        // Crear ID único para la tarea
                                                        const taskId = `task-${Date.now()}`

                                                        // Agregar nueva tarea al ítem
                                                        const newTask = {
                                                          id: taskId,
                                                          text: taskText,
                                                          responsible,
                                                          priority,
                                                          completed: false,
                                                          createdAt: new Date().toISOString(),
                                                        }

                                                        const updatedTasks = [...existingTasks, newTask]

                                                        // Guardar tareas actualizadas en el ítem
                                                        saveItemDetails(item.id, "tasks", JSON.stringify(updatedTasks))

                                                        // Añadir la tarea al sistema general de tareas
                                                        const addTask = useEventStore.getState().addTask
                                                        addTask({
                                                          id: taskId,
                                                          title: taskText,
                                                          description: `Tarea relacionada con el ítem: ${item.name}`,
                                                          dueDate: new Date(
                                                            Date.now() + 7 * 24 * 60 * 60 * 1000,
                                                          ).toISOString(), // Por defecto una semana después
                                                          priority: priority as "alta" | "media" | "baja",
                                                          status: "pendiente",
                                                          eventId: event.id,
                                                          assignedTo: responsible || "Sin asignar",
                                                        })

                                                        // Mostrar notificación
                                                        toast({
                                                          title: "Tarea agregada",
                                                          description:
                                                            "La tarea se ha agregado correctamente al ítem y al sistema general de tareas",
                                                        })

                                                        // Resetear el formulario
                                                        form.reset()
                                                      }}
                                                    >
                                                      <Input
                                                        name="taskText"
                                                        placeholder="Agregar nueva tarea..."
                                                        className="text-sm"
                                                        required
                                                      />
                                                      <Select name="responsible">
                                                        <SelectTrigger className="text-sm">
                                                          <SelectValue placeholder="Responsable" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="JUANO">JUANO</SelectItem>
                                                          <SelectItem value="PABLO">PABLO</SelectItem>
                                                          <SelectItem value="FRANCO">FRANCO</SelectItem>
                                                          <SelectItem value="FUNKILLER">FUNKILLER</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                      <div className="flex gap-2">
                                                        <Select name="priority" defaultValue="media">
                                                          <SelectTrigger className="text-sm">
                                                            <SelectValue placeholder="Prioridad" />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value="alta">Alta</SelectItem>
                                                            <SelectItem value="media">Media</SelectItem>
                                                            <SelectItem value="baja">Baja</SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                        <Button type="submit" size="sm" className="px-2">
                                                          Agregar
                                                        </Button>
                                                      </div>
                                                    </form>

                                                    {/* Lista de tareas */}
                                                    <div className="space-y-2 mt-4">
                                                      {item.tasks && JSON.parse(item.tasks).length > 0 ? (
                                                        <div className="border rounded-md divide-y">
                                                          {JSON.parse(item.tasks).map((task, index) => (
                                                            <div
                                                              key={task.id || index}
                                                              className="p-2 flex items-center justify-between"
                                                            >
                                                              <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                  id={`task-${task.id}`}
                                                                  checked={task.completed}
                                                                  onCheckedChange={(checked) => {
                                                                    const tasks = JSON.parse(item.tasks)
                                                                    tasks[index].completed = checked
                                                                    saveItemDetails(
                                                                      item.id,
                                                                      "tasks",
                                                                      JSON.stringify(tasks),
                                                                    )

                                                                    // Actualizar el estado de la tarea en el sistema general
                                                                    const updateTask =
                                                                      useEventStore.getState().updateTask
                                                                    const taskId = task.id
                                                                    if (taskId) {
                                                                      updateTask(taskId, {
                                                                        status: checked ? "completada" : "pendiente",
                                                                      })
                                                                    }
                                                                  }}
                                                                />
                                                                <label
                                                                  htmlFor={`task-${task.id}`}
                                                                  className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                                                >
                                                                  {task.text}
                                                                </label>
                                                              </div>
                                                              <div className="flex items-center gap-2">
                                                                {task.responsible && (
                                                                  <Badge variant="outline" className="text-xs">
                                                                    {task.responsible}
                                                                  </Badge>
                                                                )}
                                                                {task.priority && (
                                                                  <Badge
                                                                    variant={
                                                                      task.priority === "alta"
                                                                        ? "destructive"
                                                                        : task.priority === "media"
                                                                          ? "warning"
                                                                          : "secondary"
                                                                    }
                                                                    className="text-xs"
                                                                  >
                                                                    {task.priority}
                                                                  </Badge>
                                                                )}
                                                                <Button
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  className="h-6 w-6"
                                                                  onClick={() => {
                                                                    const tasks = JSON.parse(item.tasks)
                                                                    const taskToDelete = tasks[index]
                                                                    const updatedTasks = tasks.filter(
                                                                      (_, i) => i !== index,
                                                                    )
                                                                    saveItemDetails(
                                                                      item.id,
                                                                      "tasks",
                                                                      JSON.stringify(updatedTasks),
                                                                    )

                                                                    // Eliminar la tarea del sistema general
                                                                    const deleteTask =
                                                                      useEventStore.getState().deleteTask
                                                                    if (taskToDelete.id) {
                                                                      deleteTask(taskToDelete.id)

                                                                      toast({
                                                                        title: "Tarea eliminada",
                                                                        description:
                                                                          "La tarea se ha eliminado del ítem y del sistema general de tareas",
                                                                      })
                                                                    }
                                                                  }}
                                                                >
                                                                  <X className="h-3 w-3" />
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      ) : (
                                                        <div className="text-sm text-muted-foreground text-center py-4">
                                                          No hay tareas. Agrega una nueva tarea usando el formulario.
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}

                                                {itemTabs[item.id] === "notas" && (
                                                  <div className="space-y-4">
                                                    <h4 className="text-sm font-medium">Notas</h4>
                                                    <Textarea
                                                      placeholder="Escribe notas sobre este ítem..."
                                                      className="min-h-[120px] text-sm"
                                                      defaultValue={item.notes || ""}
                                                      onBlur={(e) => saveItemDetails(item.id, "notes", e.target.value)}
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </React.Fragment>
                                ))}
                                {/* Fila de totales */}
                                <TableRow className="font-medium">
                                  <TableCell></TableCell>
                                  <TableCell>TOTAL</TableCell>
                                  <TableCell className="text-right">${totalBudget.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">${totalClosed.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">
                                    <span
                                      className={
                                        totalNegotiationResult > 0
                                          ? "text-green-600"
                                          : totalNegotiationResult < 0
                                            ? "text-red-600"
                                            : ""
                                      }
                                    >
                                      {totalNegotiationResult > 0 ? "+" : ""}${totalNegotiationResult.toLocaleString()}
                                    </span>
                                  </TableCell>
                                  <TableCell colSpan={4}></TableCell>
                                </TableRow>
                              </>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detalles" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Evento</CardTitle>
                  <CardDescription>Información detallada sobre este evento.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Información General</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Título:</span>
                          <span className="col-span-2">{event.title}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Ubicación:</span>
                          <span className="col-span-2">{event.location}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Venue:</span>
                          <span className="col-span-2">{event.venue}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Temática:</span>
                          <span className="col-span-2">{event.theme}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Fecha:</span>
                          <span className="col-span-2">
                            {format(parseISO(event.date), "dd/MM/yyyy", { locale: es })}
                            {event.endDate && ` - ${format(parseISO(event.endDate), "dd/MM/yyyy", { locale: es })}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Estado:</span>
                          <span className="col-span-2">
                            {event.status === "active"
                              ? "Activo"
                              : event.status === "completed"
                                ? "Completado"
                                : "Planificación"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Progreso y Presupuesto</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Progreso:</span>
                          <span className="col-span-2">{event.progress}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Tareas pendientes:</span>
                          <span className="col-span-2">{event.pendingTasks}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Presupuesto:</span>
                          <span className="col-span-2">${event.budget.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Gasto real:</span>
                          <span className="col-span-2">${event.actual.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium">Desviación:</span>
                          <span
                            className={`col-span-2 ${event.budget > event.actual ? "text-green-600" : "text-red-600"}`}
                          >
                            {event.budget > 0
                              ? `${(((event.budget - event.actual) / event.budget) * 100).toFixed(2)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {event.notes && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Notas</h3>
                      <div className="rounded-md border p-4">
                        <p>{event.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
