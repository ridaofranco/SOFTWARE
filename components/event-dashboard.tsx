"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEventStore, type BudgetItem, type Task } from "@/lib/event-service"
import { EventBudgetDetails } from "@/components/event-budget-details"
import { TasksList } from "@/components/tasks-list"
import { ImportExcelDialog } from "@/components/import-excel-dialog"
import { Download, RefreshCw } from "lucide-react"
import { exportBudgetItemsToCSV, exportTasksToCSV } from "@/lib/excel-export"
import { useToast } from "@/components/ui/use-toast"

interface EventDashboardProps {
  eventId: string
}

export default function EventDashboard({ eventId }: EventDashboardProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const getBudgetItemsByEvent = useEventStore((state) => state.getBudgetItemsByEvent)
  const getTasksByEvent = useEventStore((state) => state.getTasksByEvent)
  const getEvent = useEventStore((state) => state.getEvent)

  // Cargar datos del evento
  useEffect(() => {
    if (!eventId) return

    const loadEventData = () => {
      setIsLoading(true)

      try {
        // Obtener items de presupuesto
        const items = getBudgetItemsByEvent(eventId)
        setBudgetItems(items)

        // Obtener tareas
        const eventTasks = getTasksByEvent(eventId)
        setTasks(eventTasks)
      } catch (error) {
        console.error("Error al cargar datos del evento:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del evento",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEventData()
  }, [eventId, getBudgetItemsByEvent, getTasksByEvent, toast])

  // Función para refrescar los datos
  const refreshData = () => {
    if (!eventId) return

    try {
      // Obtener items de presupuesto
      const items = getBudgetItemsByEvent(eventId)
      setBudgetItems(items)

      // Obtener tareas
      const eventTasks = getTasksByEvent(eventId)
      setTasks(eventTasks)

      toast({
        title: "Datos actualizados",
        description: "Los datos del evento se han actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al refrescar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      })
    }
  }

  // Función para exportar datos
  const handleExportBudget = () => {
    try {
      const event = getEvent(eventId)
      if (event && budgetItems.length > 0) {
        exportBudgetItemsToCSV(budgetItems, event.title)
        toast({
          title: "Exportación exitosa",
          description: "Los datos del presupuesto se han exportado correctamente",
        })
      } else {
        toast({
          title: "No hay datos para exportar",
          description: "No hay items de presupuesto para exportar",
        })
      }
    } catch (error) {
      console.error("Error al exportar presupuesto:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos del presupuesto",
        variant: "destructive",
      })
    }
  }

  const handleExportTasks = () => {
    try {
      if (tasks.length > 0) {
        exportTasksToCSV(tasks)
        toast({
          title: "Exportación exitosa",
          description: "Las tareas se han exportado correctamente",
        })
      } else {
        toast({
          title: "No hay datos para exportar",
          description: "No hay tareas para exportar",
        })
      }
    } catch (error) {
      console.error("Error al exportar tareas:", error)
      toast({
        title: "Error",
        description: "No se pudieron exportar las tareas",
        variant: "destructive",
      })
    }
  }

  // Función para manejar la importación completada
  const handleImportComplete = () => {
    refreshData()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <ImportExcelDialog eventId={eventId} onImportComplete={handleImportComplete} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportBudget}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Presupuesto
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportTasks}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Tareas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="budget">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
        </TabsList>
        <TabsContent value="budget" className="mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </CardContent>
            </Card>
          ) : budgetItems.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sin datos de presupuesto</CardTitle>
                <CardDescription>
                  No hay items de presupuesto para este evento. Puedes importar datos desde Excel o añadir items
                  manualmente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <ImportExcelDialog eventId={eventId} onImportComplete={handleImportComplete} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <EventBudgetDetails eventId={eventId} />
          )}
        </TabsContent>
        <TabsContent value="tasks" className="mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </CardContent>
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Sin tareas</CardTitle>
                <CardDescription>
                  No hay tareas para este evento. Puedes importar tareas desde Excel o añadir tareas manualmente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <ImportExcelDialog eventId={eventId} onImportComplete={handleImportComplete} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <TasksList eventId={eventId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
