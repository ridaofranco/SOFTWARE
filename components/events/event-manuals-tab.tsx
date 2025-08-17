"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  generateManual,
  exportManual,
  MANUAL_TEMPLATES,
  initializeCollaboration,
  type GeneratedManual,
} from "@/lib/manuals"
import { FileText, Users, MessageSquare, Eye, Plus, FileDown, Share } from "lucide-react"
import { useCollaboration } from "@/hooks/use-collaboration"
import { PresenceIndicator } from "@/components/collaboration/presence-indicator"
import { CommentsPanel } from "@/components/collaboration/comments-panel"

interface EventManualsTabProps {
  eventId: string
}

export function EventManualsTab({ eventId }: EventManualsTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [generatedManuals, setGeneratedManuals] = useState<GeneratedManual[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewManual, setPreviewManual] = useState<GeneratedManual | null>(null)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState(false)
  const [activeManualId, setActiveManualId] = useState<string | null>(null)

  const { toast } = useToast()

  const collaboration = useCollaboration(activeManualId || `event-${eventId}`)

  const handleGenerateManual = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Selecciona una plantilla",
        description: "Debes seleccionar una plantilla antes de generar el manual.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const manual = generateManual(eventId, selectedTemplate, responses)

      if (manual) {
        setGeneratedManuals((prev) => [...prev, manual])
        setPreviewManual(manual)

        // Inicializar colaboración
        initializeCollaboration(manual.id)

        toast({
          title: "Manual generado exitosamente",
          description: `Se ha creado el ${manual.title} con toda la información del evento.`,
        })
      } else {
        throw new Error("No se pudo generar el manual")
      }
    } catch (error) {
      toast({
        title: "Error al generar manual",
        description: "Hubo un problema al crear el manual. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportManual = (manual: GeneratedManual, format: "docx" | "pdf" | "markdown") => {
    try {
      const exportedContent = exportManual(manual, format)

      // Crear y descargar archivo
      const blob = new Blob([exportedContent], {
        type:
          format === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : format === "pdf"
              ? "application/pdf"
              : "text/markdown",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${manual.title}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Manual exportado",
        description: `El manual se ha exportado correctamente en formato ${format.toUpperCase()}.`,
      })
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "Hubo un problema al exportar el manual.",
        variant: "destructive",
      })
    }
  }

  const handleStartCollaboration = (manual: GeneratedManual) => {
    setActiveManualId(manual.id)
    setShowComments(true)
    toast({
      title: "Colaboración iniciada",
      description: `Ahora puedes colaborar en tiempo real en ${manual.title}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "review":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Publicado"
      case "approved":
        return "Aprobado"
      case "review":
        return "En Revisión"
      default:
        return "Borrador"
    }
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 space-y-6 ${showComments ? "pr-4" : ""}`}>
        {/* Header with generation controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generación Automática de Manuales
                </CardTitle>
                <CardDescription>
                  Genera manuales automáticos con colaboración en tiempo real para diferentes roles
                </CardDescription>
              </div>
              {collaboration.isConnected && (
                <PresenceIndicator
                  users={collaboration.getActiveUsers().map((p) => ({
                    user: p.user,
                    isActive: p.isActive,
                    lastSeen: p.lastSeen,
                  }))}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template">Seleccionar Plantilla</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un rol para generar el manual" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUAL_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGenerateManual}
                  disabled={isGenerating || !selectedTemplate}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generando..." : "Generar Manual"}
                </Button>
              </div>
            </div>

            {selectedTemplate && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Información de la Plantilla</h4>
                <p className="text-sm text-muted-foreground">
                  {MANUAL_TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Manuals List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Manuales Generados ({generatedManuals.length})</span>
              <div className="flex items-center gap-2">
                {generatedManuals.length > 0 && (
                  <Badge variant="outline">
                    {generatedManuals.filter((m) => m.status === "published").length} publicados
                  </Badge>
                )}
                {collaboration.isConnected && (
                  <Badge variant="outline" className="text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    Conectado
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedManuals.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay manuales generados</h3>
                <p className="text-muted-foreground mb-4">Genera tu primer manual seleccionando una plantilla arriba</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedManuals.map((manual) => (
                  <div key={manual.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{manual.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Generado el {new Date(manual.metadata.generatedAt).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(manual.status)}>{getStatusText(manual.status)}</Badge>
                        <Badge variant="outline">v{manual.version}</Badge>
                        {activeManualId === manual.id && (
                          <Badge variant="outline" className="text-blue-600">
                            <Users className="w-3 h-3 mr-1" />
                            Activo
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {manual.collaborators.length} colaboradores
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {activeManualId === manual.id
                          ? `${collaboration.getUnresolvedComments().length} comentarios`
                          : "Colaboración disponible"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setPreviewManual(manual)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Vista Previa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{manual.title}</DialogTitle>
                            <DialogDescription>Vista previa del manual generado</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                              {manual.content}
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm" onClick={() => handleExportManual(manual, "docx")}>
                        <FileDown className="w-4 h-4 mr-1" />
                        DOCX
                      </Button>

                      <Button variant="outline" size="sm" onClick={() => handleExportManual(manual, "pdf")}>
                        <FileDown className="w-4 h-4 mr-1" />
                        PDF
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartCollaboration(manual)}
                        className={activeManualId === manual.id ? "bg-blue-50 text-blue-600" : ""}
                      >
                        <Share className="w-4 h-4 mr-1" />
                        {activeManualId === manual.id ? "Colaborando" : "Colaborar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Collaboration Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Colaboración en Tiempo Real
            </CardTitle>
            <CardDescription>
              {collaboration.isConnected
                ? "Sistema de colaboración activo - edita, comenta y colabora en tiempo real"
                : "Conectando sistema de colaboración..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">Edición Simultánea</h4>
                <p className="text-sm text-muted-foreground">
                  {collaboration.getActiveUsers().length > 0
                    ? `${collaboration.getActiveUsers().length} usuarios activos`
                    : "Múltiples usuarios editando en tiempo real"}
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Comentarios</h4>
                <p className="text-sm text-muted-foreground">
                  {collaboration.comments.length > 0
                    ? `${collaboration.getUnresolvedComments().length} comentarios activos`
                    : "Sistema de comentarios con @menciones"}
                </p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Historial</h4>
                <p className="text-sm text-muted-foreground">Control de versiones y auditoría</p>
              </div>
            </div>

            {activeManualId && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowComments(!showComments)} className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showComments ? "Ocultar" : "Mostrar"} Panel de Comentarios
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showComments && activeManualId && (
        <CommentsPanel
          comments={collaboration.comments}
          onAddComment={collaboration.addComment}
          onReplyToComment={collaboration.replyToComment}
          onResolveComment={collaboration.resolveComment}
          currentUser={collaboration.currentUser}
        />
      )}
    </div>
  )
}
