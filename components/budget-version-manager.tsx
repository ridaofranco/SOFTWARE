"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, FileText, CheckCircle, XCircle, Copy, Plus } from "lucide-react"
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
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useBudgetVersionStore, type BudgetVersion } from "@/lib/budget-version-service"
import { useEventStore } from "@/lib/event-service"

interface BudgetVersionManagerProps {
  eventId: string
}

export function BudgetVersionManager({ eventId }: BudgetVersionManagerProps) {
  const [versions, setVersions] = useState<BudgetVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<BudgetVersion | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [newVersionData, setNewVersionData] = useState({
    name: "",
    description: "",
  })
  const [approvalComment, setApprovalComment] = useState("")

  const { toast } = useToast()

  // Obtener métodos del store de versiones
  const { getVersionsByEvent, createVersion, requestApproval, approveVersion, rejectVersion, getApprovalsByVersion } =
    useBudgetVersionStore()

  // Obtener métodos del store de eventos
  const { getBudgetItemsByEvent, getEvent } = useEventStore()

  // Cargar versiones al montar el componente
  useEffect(() => {
    if (!eventId) return

    const loadVersions = () => {
      const eventVersions = getVersionsByEvent(eventId)
      setVersions(eventVersions)
    }

    loadVersions()
  }, [eventId, getVersionsByEvent])

  // Crear una nueva versión
  const handleCreateVersion = () => {
    if (!eventId || !newVersionData.name) return

    try {
      // Obtener los items actuales del evento
      const currentItems = getBudgetItemsByEvent(eventId)
      const event = getEvent(eventId)

      if (!event) {
        toast({
          title: "Error",
          description: "No se pudo encontrar el evento",
          variant: "destructive",
        })
        return
      }

      // Crear la nueva versión
      const versionId = createVersion({
        eventId,
        name: newVersionData.name,
        description: newVersionData.description,
        items: [...currentItems], // Clonar los items actuales
        createdBy: "Usuario Actual", // En un sistema real, esto vendría del usuario autenticado
        status: "draft",
      })

      // Actualizar la lista de versiones
      const eventVersions = getVersionsByEvent(eventId)
      setVersions(eventVersions)

      // Limpiar el formulario
      setNewVersionData({
        name: "",
        description: "",
      })

      // Cerrar el diálogo
      setIsCreateDialogOpen(false)

      toast({
        title: "Versión creada",
        description: "La versión del presupuesto se ha creado correctamente",
      })
    } catch (error) {
      console.error("Error al crear versión:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la versión del presupuesto",
        variant: "destructive",
      })
    }
  }

  // Solicitar aprobación para una versión
  const handleRequestApproval = () => {
    if (!selectedVersion) return

    try {
      requestApproval(
        selectedVersion.id,
        "Usuario Actual", // En un sistema real, esto vendría del usuario autenticado
        approvalComment,
      )

      // Actualizar la lista de versiones
      const eventVersions = getVersionsByEvent(eventId)
      setVersions(eventVersions)

      // Limpiar el formulario
      setApprovalComment("")

      // Cerrar el diálogo
      setIsApprovalDialogOpen(false)

      toast({
        title: "Solicitud enviada",
        description: "La solicitud de aprobación se ha enviado correctamente",
      })
    } catch (error) {
      console.error("Error al solicitar aprobación:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de aprobación",
        variant: "destructive",
      })
    }
  }

  // Aprobar una versión
  const handleApproveVersion = (versionId: string) => {
    try {
      // Obtener la aprobación pendiente para esta versión
      const approvals = getApprovalsByVersion(versionId)
      const pendingApproval = approvals.find((a) => a.status === "pending")

      if (!pendingApproval) {
        toast({
          title: "Error",
          description: "No hay solicitudes de aprobación pendientes para esta versión",
          variant: "destructive",
        })
        return
      }

      approveVersion(
        pendingApproval.id,
        "Aprobador", // En un sistema real, esto vendría del usuario autenticado con rol de aprobador
        "Presupuesto aprobado",
      )

      // Actualizar la lista de versiones
      const eventVersions = getVersionsByEvent(eventId)
      setVersions(eventVersions)

      toast({
        title: "Versión aprobada",
        description: "La versión del presupuesto ha sido aprobada",
      })
    } catch (error) {
      console.error("Error al aprobar versión:", error)
      toast({
        title: "Error",
        description: "No se pudo aprobar la versión del presupuesto",
        variant: "destructive",
      })
    }
  }

  // Rechazar una versión
  const handleRejectVersion = (versionId: string) => {
    try {
      // Obtener la aprobación pendiente para esta versión
      const approvals = getApprovalsByVersion(versionId)
      const pendingApproval = approvals.find((a) => a.status === "pending")

      if (!pendingApproval) {
        toast({
          title: "Error",
          description: "No hay solicitudes de aprobación pendientes para esta versión",
          variant: "destructive",
        })
        return
      }

      rejectVersion(
        pendingApproval.id,
        "Aprobador", // En un sistema real, esto vendría del usuario autenticado con rol de aprobador
        "Presupuesto rechazado",
      )

      // Actualizar la lista de versiones
      const eventVersions = getVersionsByEvent(eventId)
      setVersions(eventVersions)

      toast({
        title: "Versión rechazada",
        description: "La versión del presupuesto ha sido rechazada",
      })
    } catch (error) {
      console.error("Error al rechazar versión:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar la versión del presupuesto",
        variant: "destructive",
      })
    }
  }

  // Renderizar el estado de la versión
  const renderVersionStatus = (status: BudgetVersion["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Borrador</Badge>
      case "pending":
        return <Badge variant="secondary">Pendiente de aprobación</Badge>
      case "approved":
        return <Badge variant="success">Aprobado</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Versiones de Presupuesto</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Versión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Versión de Presupuesto</DialogTitle>
              <DialogDescription>Crea una nueva versión del presupuesto para este evento.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="version-name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="version-name"
                  value={newVersionData.name}
                  onChange={(e) => setNewVersionData({ ...newVersionData, name: e.target.value })}
                  placeholder="Ej: Versión 1.0"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="version-description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="version-description"
                  value={newVersionData.description}
                  onChange={(e) => setNewVersionData({ ...newVersionData, description: e.target.value })}
                  placeholder="Describe esta versión del presupuesto"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateVersion} disabled={!newVersionData.name}>
                Crear Versión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {versions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-1 text-lg font-medium">No hay versiones</h3>
              <p className="text-sm text-muted-foreground">
                No hay versiones de presupuesto para este evento. Crea tu primera versión.
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Versión
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {versions.map((version) => (
            <Card key={version.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{version.name}</CardTitle>
                  {renderVersionStatus(version.status)}
                </div>
                <CardDescription>{version.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Creada el {format(new Date(version.createdAt), "dd/MM/yyyy", { locale: es })}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(version.createdAt), "HH:mm", { locale: es })}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{version.items.length} items</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Ver Detalles
                </Button>

                {version.status === "draft" && (
                  <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setSelectedVersion(version)}>
                        Solicitar Aprobación
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Aprobación</DialogTitle>
                        <DialogDescription>Solicita la aprobación para esta versión del presupuesto.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="approval-comment" className="text-right">
                            Comentario
                          </Label>
                          <Textarea
                            id="approval-comment"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            placeholder="Añade un comentario para el aprobador"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleRequestApproval}>Enviar Solicitud</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {version.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRejectVersion(version.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                    <Button size="sm" onClick={() => handleApproveVersion(version.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
