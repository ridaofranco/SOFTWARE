"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEventStore } from "@/lib/event-service"
import { exportEventsToCSV, exportBudgetItemsToCSV, exportTasksToCSV } from "@/lib/excel-export"
import { toast } from "@/components/ui/use-toast"

interface ExportButtonProps {
  type: "events" | "budget" | "tasks"
  eventId?: string
  className?: string
}

export function ExportButton({ type, eventId, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const events = useEventStore((state) => state.events)
  const tasks = useEventStore((state) => state.tasks)
  const getEvent = useEventStore((state) => state.getEvent)
  const getBudgetItemsByEvent = useEventStore((state) => state.getBudgetItemsByEvent)
  const getTasksByEvent = useEventStore((state) => state.getTasksByEvent)

  const handleExport = (format: "csv" | "excel") => {
    setIsExporting(true)

    try {
      switch (type) {
        case "events":
          if (eventId) {
            const event = getEvent(eventId)
            if (event) {
              exportEventsToCSV([event])
            }
          } else {
            exportEventsToCSV(events)
          }
          break

        case "budget":
          if (eventId) {
            const event = getEvent(eventId)
            const items = getBudgetItemsByEvent(eventId)
            if (event && items) {
              exportBudgetItemsToCSV(items, event.title)
            }
          } else {
            const allItems = events.flatMap((event) => event.items)
            exportBudgetItemsToCSV(allItems)
          }
          break

        case "tasks":
          if (eventId) {
            const eventTasks = getTasksByEvent(eventId)
            exportTasksToCSV(eventTasks)
          } else {
            exportTasksToCSV(tasks)
          }
          break
      }

      toast({
        title: "Exportación exitosa",
        description: "Los datos han sido exportados correctamente",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Error en la exportación",
        description: "Ha ocurrido un error al exportar los datos",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
