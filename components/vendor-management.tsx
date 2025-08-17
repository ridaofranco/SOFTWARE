"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Star, Edit, Trash2, FileText, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVendorStore, type Vendor, type VendorContract, type VendorReview } from "@/lib/vendor-service"
import { useEventStore } from "@/lib/event-service"

export function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [vendorContracts, setVendorContracts] = useState<VendorContract[]>([])
  const [vendorReviews, setVendorReviews] = useState<VendorReview[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [newVendor, setNewVendor] = useState<Omit<Vendor, "id" | "createdAt" | "updatedAt">>({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    category: "venue",
    notes: "",
  })

  const [newReview, setNewReview] = useState<Omit<VendorReview, "id" | "createdAt">>({
    vendorId: "",
    eventId: "",
    rating: 5,
    comment: "",
    createdBy: "Usuario Actual", // En un sistema real, esto vendría del usuario autenticado
  })

  const [newContract, setNewContract] = useState<Omit<VendorContract, "id" | "createdAt" | "updatedAt">>({
    vendorId: "",
    eventId: "",
    description: "",
    amount: 0,
    startDate: new Date().toISOString().split("T")[0],
    status: "draft",
  })

  const { toast } = useToast()

  // Obtener métodos del store de proveedores
  const {
    getAllVendors,
    addVendor,
    updateVendor,
    deleteVendor,
    getContractsByVendor,
    getReviewsByVendor,
    addReview,
    addContract,
  } = useVendorStore()

  // Obtener eventos para los selectores
  const events = useEventStore((state) => state.events)

  // Cargar proveedores al montar el componente
  useEffect(() => {
    const loadVendors = () => {
      const allVendors = getAllVendors()
      setVendors(allVendors)
      setFilteredVendors(allVendors)
    }

    loadVendors()
  }, [getAllVendors])

  // Filtrar proveedores cuando cambia el término de búsqueda o la categoría
  useEffect(() => {
    let filtered = [...vendors]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(term) ||
          vendor.contactName.toLowerCase().includes(term) ||
          vendor.email.toLowerCase().includes(term),
      )
    }

    // Filtrar por categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter((vendor) => vendor.category === categoryFilter)
    }

    setFilteredVendors(filtered)
  }, [vendors, searchTerm, categoryFilter])

  // Cargar contratos y reseñas cuando se selecciona un proveedor
  useEffect(() => {
    if (selectedVendor) {
      const contracts = getContractsByVendor(selectedVendor.id)
      const reviews = getReviewsByVendor(selectedVendor.id)

      setVendorContracts(contracts)
      setVendorReviews(reviews)

      // Inicializar formularios con el proveedor seleccionado
      setNewReview((prev) => ({ ...prev, vendorId: selectedVendor.id }))
      setNewContract((prev) => ({ ...prev, vendorId: selectedVendor.id }))
    }
  }, [selectedVendor, getContractsByVendor, getReviewsByVendor])

  // Añadir un nuevo proveedor
  const handleAddVendor = () => {
    try {
      const vendorId = addVendor(newVendor)

      // Actualizar la lista de proveedores
      const allVendors = getAllVendors()
      setVendors(allVendors)

      // Limpiar el formulario
      setNewVendor({
        name: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        category: "venue",
        notes: "",
      })

      // Cerrar el diálogo
      setIsAddDialogOpen(false)

      toast({
        title: "Proveedor añadido",
        description: "El proveedor se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el proveedor",
        variant: "destructive",
      })
    }
  }

  // Actualizar un proveedor existente
  const handleUpdateVendor = () => {
    if (!selectedVendor) return

    try {
      updateVendor(selectedVendor.id, newVendor)

      // Actualizar la lista de proveedores
      const allVendors = getAllVendors()
      setVendors(allVendors)

      // Actualizar el proveedor seleccionado
      const updatedVendor = allVendors.find((v) => v.id === selectedVendor.id) || null
      setSelectedVendor(updatedVendor)

      // Cerrar el diálogo
      setIsEditDialogOpen(false)

      toast({
        title: "Proveedor actualizado",
        description: "El proveedor se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el proveedor",
        variant: "destructive",
      })
    }
  }

  // Eliminar un proveedor
  const handleDeleteVendor = (vendorId: string) => {
    try {
      deleteVendor(vendorId)

      // Actualizar la lista de proveedores
      const allVendors = getAllVendors()
      setVendors(allVendors)

      // Si el proveedor eliminado era el seleccionado, deseleccionarlo
      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor(null)
      }

      toast({
        title: "Proveedor eliminado",
        description: "El proveedor se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive",
      })
    }
  }

  // Añadir una reseña
  const handleAddReview = () => {
    if (!selectedVendor || !newReview.eventId) return

    try {
      addReview(newReview)

      // Actualizar las reseñas del proveedor
      const reviews = getReviewsByVendor(selectedVendor.id)
      setVendorReviews(reviews)

      // Actualizar la lista de proveedores (para actualizar la calificación)
      const allVendors = getAllVendors()
      setVendors(allVendors)

      // Actualizar el proveedor seleccionado
      const updatedVendor = allVendors.find((v) => v.id === selectedVendor.id) || null
      setSelectedVendor(updatedVendor)

      // Limpiar el formulario
      setNewReview({
        vendorId: selectedVendor.id,
        eventId: "",
        rating: 5,
        comment: "",
        createdBy: "Usuario Actual",
      })

      // Cerrar el diálogo
      setIsReviewDialogOpen(false)

      toast({
        title: "Reseña añadida",
        description: "La reseña se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir reseña:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir la reseña",
        variant: "destructive",
      })
    }
  }

  // Añadir un contrato
  const handleAddContract = () => {
    if (!selectedVendor || !newContract.eventId) return

    try {
      addContract(newContract)

      // Actualizar los contratos del proveedor
      const contracts = getContractsByVendor(selectedVendor.id)
      setVendorContracts(contracts)

      // Limpiar el formulario
      setNewContract({
        vendorId: selectedVendor.id,
        eventId: "",
        description: "",
        amount: 0,
        startDate: new Date().toISOString().split("T")[0],
        status: "draft",
      })

      // Cerrar el diálogo
      setIsContractDialogOpen(false)

      toast({
        title: "Contrato añadido",
        description: "El contrato se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir contrato:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el contrato",
        variant: "destructive",
      })
    }
  }

  // Renderizar estrellas para la calificación
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  // Renderizar el estado del contrato
  const renderContractStatus = (status: VendorContract["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Borrador</Badge>
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "signed":
        return <Badge variant="success">Firmado</Badge>
      case "completed":
        return <Badge variant="default">Completado</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar proveedores..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="catering">Catering</SelectItem>
              <SelectItem value="decoration">Decoración</SelectItem>
              <SelectItem value="entertainment">Entretenimiento</SelectItem>
              <SelectItem value="photography">Fotografía</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="lighting">Iluminación</SelectItem>
              <SelectItem value="transport">Transporte</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Añadir Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Proveedor</DialogTitle>
              <DialogDescription>Añade un nuevo proveedor a tu directorio.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contactName" className="text-right">
                  Contacto
                </Label>
                <Input
                  id="contactName"
                  value={newVendor.contactName}
                  onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoría
                </Label>
                <Select
                  value={newVendor.category}
                  onValueChange={(value) => setNewVendor({ ...newVendor, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="decoration">Decoración</SelectItem>
                    <SelectItem value="entertainment">Entretenimiento</SelectItem>
                    <SelectItem value="photography">Fotografía</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="lighting">Iluminación</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Dirección
                </Label>
                <Input
                  id="address"
                  value={newVendor.address || ""}
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  value={newVendor.notes || ""}
                  onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddVendor} disabled={!newVendor.name || !newVendor.email || !newVendor.phone}>
                Añadir Proveedor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">No se encontraron proveedores</h3>
                  <p className="text-sm text-muted-foreground">
                    No hay proveedores que coincidan con tu búsqueda. Intenta con otros términos o añade un nuevo
                    proveedor.
                  </p>
                  <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Proveedor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedVendor?.id === vendor.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedVendor(vendor)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{vendor.name}</CardTitle>
                  <Badge>{vendor.category}</Badge>
                </div>
                <CardDescription>{vendor.contactName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.address && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{vendor.address}</span>
                    </div>
                  )}
                  {vendor.rating !== undefined && (
                    <div className="flex items-center">
                      <div className="flex mr-2">{renderStars(vendor.rating)}</div>
                      <span>{vendor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedVendor(vendor)
                    setNewVendor({
                      name: vendor.name,
                      contactName: vendor.contactName,
                      email: vendor.email,
                      phone: vendor.phone,
                      address: vendor.address || "",
                      category: vendor.category,
                      notes: vendor.notes || "",
                    })
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
                      handleDeleteVendor(vendor.id)
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {selectedVendor && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalles del Proveedor: {selectedVendor.name}</CardTitle>
              {selectedVendor.rating !== undefined && (
                <div className="flex items-center">
                  <div className="flex mr-2">{renderStars(selectedVendor.rating)}</div>
                  <span>{selectedVendor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <CardDescription>Información detallada, contratos y reseñas del proveedor seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="contracts">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contracts">Contratos</TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              </TabsList>
              <TabsContent value="contracts" className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Contratos</h3>
                  <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Contrato
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nuevo Contrato</DialogTitle>
                        <DialogDescription>Crea un nuevo contrato con este proveedor.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="contract-event" className="text-right">
                            Evento
                          </Label>
                          <Select
                            value={newContract.eventId}
                            onValueChange={(value) => setNewContract({ ...newContract, eventId: value })}
                          >
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
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="contract-description" className="text-right">
                            Descripción
                          </Label>
                          <Textarea
                            id="contract-description"
                            value={newContract.description}
                            onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="contract-amount" className="text-right">
                            Monto
                          </Label>
                          <Input
                            id="contract-amount"
                            type="number"
                            value={newContract.amount}
                            onChange={(e) => setNewContract({ ...newContract, amount: Number(e.target.value) })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="contract-start-date" className="text-right">
                            Fecha Inicio
                          </Label>
                          <Input
                            id="contract-start-date"
                            type="date"
                            value={newContract.startDate}
                            onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="contract-status" className="text-right">
                            Estado
                          </Label>
                          <Select
                            value={newContract.status}
                            onValueChange={(value: VendorContract["status"]) =>
                              setNewContract({ ...newContract, status: value })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Borrador</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="signed">Firmado</SelectItem>
                              <SelectItem value="completed">Completado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContractDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddContract}
                          disabled={!newContract.eventId || !newContract.description || newContract.amount <= 0}
                        >
                          Añadir Contrato
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {vendorContracts.length === 0 ? (
                  <div className="rounded-md border p-6 text-center">
                    <p className="text-sm text-muted-foreground">No hay contratos registrados para este proveedor.</p>
                    <Button className="mt-4" size="sm" onClick={() => setIsContractDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Contrato
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendorContracts.map((contract) => (
                      <Card key={contract.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>
                              {events.find((e) => e.id === contract.eventId)?.title || "Evento desconocido"}
                            </CardTitle>
                            {renderContractStatus(contract.status)}
                          </div>
                          <CardDescription>{contract.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Monto:</span>
                              <span>${contract.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Fecha de inicio:</span>
                              <span>{new Date(contract.startDate).toLocaleDateString()}</span>
                            </div>
                            {contract.endDate && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Fecha de fin:</span>
                                <span>{new Date(contract.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Reseñas</h3>
                  <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Reseña
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Añadir Nueva Reseña</DialogTitle>
                        <DialogDescription>Evalúa tu experiencia con este proveedor.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="review-event" className="text-right">
                            Evento
                          </Label>
                          <Select
                            value={newReview.eventId}
                            onValueChange={(value) => setNewReview({ ...newReview, eventId: value })}
                          >
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
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="review-rating" className="text-right">
                            Calificación
                          </Label>
                          <div className="col-span-3 flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="review-comment" className="text-right">
                            Comentario
                          </Label>
                          <Textarea
                            id="review-comment"
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddReview} disabled={!newReview.eventId || !newReview.comment}>
                          Añadir Reseña
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {vendorReviews.length === 0 ? (
                  <div className="rounded-md border p-6 text-center">
                    <p className="text-sm text-muted-foreground">No hay reseñas para este proveedor.</p>
                    <Button className="mt-4" size="sm" onClick={() => setIsReviewDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Reseña
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendorReviews.map((review) => (
                      <Card key={review.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>
                              {events.find((e) => e.id === review.eventId)?.title || "Evento desconocido"}
                            </CardTitle>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <CardDescription>
                            Por {review.createdBy} - {new Date(review.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>Actualiza la información de este proveedor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nombre
              </Label>
              <Input
                id="edit-name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-contactName" className="text-right">
                Contacto
              </Label>
              <Input
                id="edit-contactName"
                value={newVendor.contactName}
                onChange={(e) => setNewVendor({ ...newVendor, contactName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="edit-phone"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Categoría
              </Label>
              <Select
                value={newVendor.category}
                onValueChange={(value) => setNewVendor({ ...newVendor, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="decoration">Decoración</SelectItem>
                  <SelectItem value="entertainment">Entretenimiento</SelectItem>
                  <SelectItem value="photography">Fotografía</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="lighting">Iluminación</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Dirección
              </Label>
              <Input
                id="edit-address"
                value={newVendor.address || ""}
                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notas
              </Label>
              <Textarea
                id="edit-notes"
                value={newVendor.notes || ""}
                onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateVendor} disabled={!newVendor.name || !newVendor.email || !newVendor.phone}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
