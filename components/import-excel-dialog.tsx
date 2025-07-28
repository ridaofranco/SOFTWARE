"use client"

import type React from "react"

import { useState } from "react"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  readExcelFile,
  detectDataType,
  importEventsFromJson,
  importBudgetItemsFromJson,
  importTasksFromJson,
} from "@/lib/excel-import"
import { useEventStore } from "@/lib/event-service"

interface ImportExcelDialogProps {
  eventId?: string
  onImportComplete?: () => void
}

export function ImportExcelDialog({ eventId, onImportComplete }: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importType, setImportType] = useState<"events" | "budgetItems" | "tasks" | "">("")
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    count: number
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const { toast } = useToast()
  const events = useEventStore((state) => state.events)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setImportResult(null)
    setProgress(0)

    try {
      // Leer el archivo Excel
      const jsonData = await readExcelFile(selectedFile)

      // Mostrar una vista previa de los datos
      setPreviewData(jsonData.slice(0, 5))

      // Detectar automáticamente el tipo de datos
      const detectedType = detectDataType(jsonData)
      if (detectedType !== "unknown") {
        setImportType(detectedType)
      }
    } catch (error) {
      console.error("Error al leer el archivo Excel:", error)
      toast({
        title: "Error al leer el archivo",
        description: "No se pudo leer el archivo Excel. Asegúrate de que sea un archivo válido.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    if (!file || !importType) return

    setIsImporting(true)
    setProgress(10)

    try {
      // Leer el archivo Excel
      const jsonData = await readExcelFile(file)
      setProgress(30)

      let importedIds: string[] = []
      let successMessage = ""

      // Importar según el tipo seleccionado
      if (importType === "events") {
        importedIds = await importEventsFromJson(jsonData)
        successMessage = `Se importaron ${importedIds.length} eventos correctamente.`
      } else if (importType === "budgetItems" && eventId) {
        importedIds = await importBudgetItemsFromJson(jsonData, eventId)
        successMessage = `Se importaron ${importedIds.length} items de presupuesto correctamente.`
      } else if (importType === "tasks" && eventId) {
        importedIds = await importTasksFromJson(jsonData, eventId)
        successMessage = `Se importaron ${importedIds.length} tareas correctamente.`
      } else {
        throw new Error("Configuración de importación inválida")
      }

      setProgress(100)

      // Mostrar resultado
      setImportResult({
        success: true,
        message: successMessage,
        count: importedIds.length,
      })

      // Notificar al usuario
      toast({
        title: "Importación exitosa",
        description: successMessage,
      })

      // Notificar al componente padre
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error("Error al importar datos:", error)

      setImportResult({
        success: false,
        message: `Error al importar datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
        count: 0,
      })

      toast({
        title: "Error en la importación",
        description: "No se pudieron importar los datos. Por favor, verifica el archivo e intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreviewData(null)
    setImportResult(null)
    setProgress(0)
    setImportType("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Importar datos desde Excel</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel para importar eventos, items de presupuesto o tareas.
          </DialogDescription>
        </DialogHeader>

        {!importResult ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="excel-file" className="text-right">
                  Archivo Excel
                </Label>
                <div className="col-span-3">
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isImporting}
                  />
                </div>
              </div>

              {file && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="import-type" className="text-right">
                    Tipo de datos
                  </Label>
                  <Select
                    value={importType}
                    onValueChange={(value: "events" | "budgetItems" | "tasks") => setImportType(value)}
                    disabled={isImporting}
                  >
                    <SelectTrigger className="col-span-3" id="import-type">
                      <SelectValue placeholder="Selecciona el tipo de datos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="events">Eventos</SelectItem>
                      <SelectItem value="budgetItems" disabled={!eventId}>
                        Items de presupuesto
                      </SelectItem>
                      <SelectItem value="tasks" disabled={!eventId}>
                        Tareas
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {previewData && previewData.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  <Label>Vista previa (primeras 5 filas):</Label>
                  <div className="max-h-40 overflow-auto rounded border p-2 text-xs">
                    <pre>{JSON.stringify(previewData, null, 2)}</pre>
                  </div>
                </div>
              )}

              {isImporting && (
                <div className="grid grid-cols-1 gap-2">
                  <Label>Progreso:</Label>
                  <Progress value={progress} className="h-2 w-full" />
                </div>
              )}

              {!eventId && importType === "budgetItems" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atención</AlertTitle>
                  <AlertDescription>
                    Para importar items de presupuesto, debes seleccionar un evento primero.
                  </AlertDescription>
                </Alert>
              )}

              {!eventId && importType === "tasks" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atención</AlertTitle>
                  <AlertDescription>Para importar tareas, debes seleccionar un evento primero.</AlertDescription>
                </Alert>
              )}

              {eventId && importType === "events" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Información</AlertTitle>
                  <AlertDescription>
                    Estás importando eventos mientras estás en el contexto de un evento específico. Los eventos se
                    importarán como nuevos eventos independientes.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || !importType || isImporting || (importType !== "events" && !eventId)}
              >
                {isImporting ? "Importando..." : "Importar"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="grid gap-4 py-4">
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{importResult.success ? "Importación exitosa" : "Error en la importación"}</AlertTitle>
              <AlertDescription>{importResult.message}</AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
              <Button variant="outline" onClick={resetForm}>
                Importar otro archivo
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
