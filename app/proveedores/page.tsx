"use client"

import { useState, useEffect } from "react"
import { useVendorStore } from "@/lib/vendor-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Search, Phone, Mail, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProveedoresPage() {
  const { vendors, addVendor, updateVendor, deleteVendor, initializeVendorsData } = useVendorStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [newProvider, setNewProvider] = useState({
    name: "",
    lastName: "",
    dni: "",
    birthDate: "",
    role: "",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "",
    email: "",
    phone: "",
  })
  const [editProvider, setEditProvider] = useState({
    name: "",
    lastName: "",
    dni: "",
    birthDate: "",
    role: "",
    category: "FIEBRE DISCO",
    location: "CAPITAL/BUENOS AIRES",
    contactName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    initializeVendorsData()
  }, [initializeVendorsData])

  const filteredProviders = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.role || !newProvider.contactName) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    addVendor({
      name: newProvider.name,
      lastName: newProvider.lastName || "",
      dni: newProvider.dni || "",
      birthDate: newProvider.birthDate || "",
      role: newProvider.role,
      category: newProvider.category,
      location: newProvider.location || "CAPITAL/BUENOS AIRES",
      contactName: newProvider.contactName,
      email: newProvider.email || "",
      phone: newProvider.phone || "",
    })

    toast({
      title: "Proveedor agregado",
      description: `${newProvider.name} ha sido agregado exitosamente`,
    })

    // Reset form
    setNewProvider({
      name: "",
      lastName: "",
      dni: "",
      birthDate: "",
      role: "",
      category: "FIEBRE DISCO",
      location: "CAPITAL/BUENOS AIRES",
      contactName: "",
      email: "",
      phone: "",
    })
    setShowAddForm(false)
  }

  const handleEditProvider = (provider: any) => {
    setEditProvider({
      name: provider.name,
      lastName: provider.lastName || "",
      dni: provider.dni || "",
      birthDate: provider.birthDate || "",
      role: provider.role,
      category: provider.category,
      location: provider.location,
      contactName: provider.contactName,
      email: provider.email || "",
      phone: provider.phone || "",
    })
    setEditingProvider(provider.id)
  }

  const handleUpdateProvider = () => {
    if (!editProvider.name || !editProvider.role || !editProvider.contactName) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    updateVendor(editingProvider!, {
      name: editProvider.name,
      lastName: editProvider.lastName,
      dni: editProvider.dni,
      birthDate: editProvider.birthDate,
      role: editProvider.role,
      category: editProvider.category,
      location: editProvider.location,
      contactName: editProvider.contactName,
      email: editProvider.email,
      phone: editProvider.phone,
    })

    toast({
      title: "Proveedor actualizado",
      description: `${editProvider.name} ha sido actualizado exitosamente`,
    })

    // Reset form
    setEditProvider({
      name: "",
      lastName: "",
      dni: "",
      birthDate: "",
      role: "",
      category: "FIEBRE DISCO",
      location: "CAPITAL/BUENOS AIRES",
      contactName: "",
      email: "",
      phone: "",
    })
    setEditingProvider(null)
  }

  const handleCancelEdit = () => {
    setEditingProvider(null)
    setEditProvider({
      name: "",
      lastName: "",
      dni: "",
      birthDate: "",
      role: "",
      category: "FIEBRE DISCO",
      location: "CAPITAL/BUENOS AIRES",
      contactName: "",
      email: "",
      phone: "",
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Proveedores</h1>
          <p className="text-gray-600">Administra tu red de proveedores con ratings y historial</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="ARTE">ARTE</SelectItem>
            <SelectItem value="BOOKING">BOOKING</SelectItem>
            <SelectItem value="MARKETING">MARKETING</SelectItem>
            <SelectItem value="FIEBRE DISCO">FIEBRE DISCO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Formulario de nuevo proveedor */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agregar Nuevo Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={newProvider.lastName}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Apellido del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={newProvider.dni}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, dni: e.target.value }))}
                  placeholder="DNI del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  value={newProvider.birthDate}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, birthDate: e.target.value }))}
                  placeholder="Fecha de nacimiento"
                />
              </div>
              <div>
                <Label htmlFor="role">Servicio/Rol *</Label>
                <Input
                  id="role"
                  value={newProvider.role}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="Ej: DJ, Iluminación, Sonido"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newProvider.category}
                  onValueChange={(value) => setNewProvider((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARTE">ARTE</SelectItem>
                    <SelectItem value="BOOKING">BOOKING</SelectItem>
                    <SelectItem value="MARKETING">MARKETING</SelectItem>
                    <SelectItem value="FIEBRE DISCO">FIEBRE DISCO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={newProvider.location}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ubicación"
                />
              </div>
              <div>
                <Label htmlFor="contactName">Nombre de Contacto *</Label>
                <Input
                  id="contactName"
                  value={newProvider.contactName}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Nombre de contacto"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={newProvider.email}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newProvider.phone}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Teléfono del proveedor"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProvider}>Agregar Proveedor</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario de editar proveedor */}
      {editingProvider && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Editar Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={editProvider.name}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Apellido</Label>
                <Input
                  id="edit-lastName"
                  value={editProvider.lastName}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Apellido del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="edit-dni">DNI</Label>
                <Input
                  id="edit-dni"
                  value={editProvider.dni}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, dni: e.target.value }))}
                  placeholder="DNI del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="edit-birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="edit-birthDate"
                  value={editProvider.birthDate}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, birthDate: e.target.value }))}
                  placeholder="Fecha de nacimiento"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Servicio/Rol *</Label>
                <Input
                  id="edit-role"
                  value={editProvider.role}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="Ej: DJ, Iluminación, Sonido"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Select
                  value={editProvider.category}
                  onValueChange={(value) => setEditProvider((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARTE">ARTE</SelectItem>
                    <SelectItem value="BOOKING">BOOKING</SelectItem>
                    <SelectItem value="MARKETING">MARKETING</SelectItem>
                    <SelectItem value="FIEBRE DISCO">FIEBRE DISCO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  value={editProvider.location}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ubicación"
                />
              </div>
              <div>
                <Label htmlFor="edit-contactName">Nombre de Contacto *</Label>
                <Input
                  id="edit-contactName"
                  value={editProvider.contactName}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Nombre de contacto"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editProvider.email}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={editProvider.phone}
                  onChange={(e) => setEditProvider((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Teléfono del proveedor"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProvider}>Actualizar Proveedor</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de proveedores */}
      {filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {vendors.length === 0 ? "No hay proveedores registrados" : "No se encontraron proveedores"}
            </h3>
            <p className="text-gray-600 mb-4">
              {vendors.length === 0
                ? "Comienza agregando tu primer proveedor"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {vendors.length === 0 && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Proveedor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {provider.name} {provider.lastName}
                    </CardTitle>
                    <CardDescription>{provider.role}</CardDescription>
                    <Badge variant="outline" className="mt-1">
                      {provider.category}
                    </Badge>
                    <Badge variant="secondary" className="mt-1 ml-2">
                      {provider.location}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Contacto */}
                <div className="flex items-center space-x-2">
                  {provider.email ? (
                    <Mail className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Phone className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm">{provider.email || provider.phone}</span>
                </div>

                {/* DNI */}
                {provider.dni && (
                  <div className="text-sm">
                    <strong>DNI:</strong> {provider.dni}
                  </div>
                )}

                {/* Fecha de nacimiento */}
                {provider.birthDate && (
                  <div className="text-sm">
                    <strong>Nacimiento:</strong> {provider.birthDate}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditProvider(provider)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("¿Estás seguro de eliminar este proveedor?")) {
                        deleteVendor(provider.id)
                        toast({
                          title: "Proveedor eliminado",
                          description: "El proveedor ha sido eliminado del sistema",
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
          ))}
        </div>
      )}
    </div>
  )
}
