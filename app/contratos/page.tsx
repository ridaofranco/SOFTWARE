"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, User, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function ContratosPage() {
  const { contracts = [], events = [] } = useUnifiedEventStore()
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar contratos con verificaciones de seguridad
  const filteredContracts = contracts.filter((contract) => {
    const providerName = contract.providerName?.toLowerCase() || contract.name?.toLowerCase() || ""
    const contractorName = contract.contractorName?.toLowerCase() || ""
    const searchLower = searchTerm.toLowerCase()

    return (
      providerName.includes(searchLower) ||
      contractorName.includes(searchLower) ||
      contract.type?.toLowerCase().includes(searchLower) ||
      contract.status?.toLowerCase().includes(searchLower)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bailarin":
        return "Bailarín"
      case "tecnico":
        return "Técnico"
      default:
        return type || "N/A"
    }
  }

  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId)
    return event?.title || "Evento no encontrado"
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contratos</h1>
          <p className="text-gray-600">Gestión de contratos de bailarines y técnicos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contratos/bailarin">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Contrato Bailarín
            </Button>
          </Link>
          <Link href="/contratos/tecnico">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Contrato Técnico
            </Button>
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar contratos por nombre, tipo o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Firmados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter((c) => c.status === "signed" || c.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter((c) => c.status === "draft" || c.status === "sent").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${contracts.reduce((sum, c) => sum + (c.amount || c.rate || 0), 0).toLocaleString("es-AR")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de contratos */}
      <div className="space-y-4">
        {filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {contract.providerName || contract.name || "Sin nombre"}
                      </h3>
                      <Badge className={getStatusColor(contract.status || "draft")}>
                        {contract.status === "signed" && "Firmado"}
                        {contract.status === "sent" && "Enviado"}
                        {contract.status === "draft" && "Borrador"}
                        {contract.status === "active" && "Activo"}
                        {contract.status === "inactive" && "Inactivo"}
                        {!contract.status && "Sin estado"}
                      </Badge>
                      <Badge variant="outline">{getTypeLabel(contract.type)}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {contract.email || "No especificado"}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span> {contract.phone || "No especificado"}
                      </div>
                      <div>
                        <span className="font-medium">Monto:</span> $
                        {(contract.amount || contract.rate || 0).toLocaleString("es-AR")}
                      </div>
                    </div>
                    {contract.eventIds && contract.eventIds.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600">Eventos:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contract.eventIds.slice(0, 3).map((eventId) => (
                            <Badge key={eventId} variant="secondary" className="text-xs">
                              {getEventName(eventId)}
                            </Badge>
                          ))}
                          {contract.eventIds.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{contract.eventIds.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {contract.skills && contract.skills.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-600">Habilidades:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contract.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {contract.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{contract.skills.length - 4} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "No se encontraron contratos que coincidan con tu búsqueda."
                  : "Comienza creando tu primer contrato."}
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/contratos/bailarin">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Contrato Bailarín
                  </Button>
                </Link>
                <Link href="/contratos/tecnico">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Contrato Técnico
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
