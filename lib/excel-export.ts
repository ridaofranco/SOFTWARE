import type { BudgetItem, Event, Task } from "@/lib/event-service"

// Función para convertir datos a formato CSV
export function convertToCSV(data: any[], headers: string[], fields: string[]): string {
  // Crear la fila de encabezados
  let csv = headers.join(",") + "\n"

  // Agregar filas de datos
  data.forEach((item) => {
    const row = fields.map((field) => {
      // Obtener el valor del campo
      const value = field.split(".").reduce((obj, key) => obj?.[key], item)

      // Formatear el valor para CSV
      if (value === null || value === undefined) return ""
      if (typeof value === "number") return value.toString()
      if (typeof value === "boolean") return value ? "Sí" : "No"

      // Escapar comillas y encerrar en comillas si contiene comas o saltos de línea
      const stringValue = String(value)
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })

    csv += row.join(",") + "\n"
  })

  return csv
}

// Función para descargar un archivo CSV
export function downloadCSV(csv: string, filename: string): void {
  // Crear un objeto Blob con el contenido CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

  // Crear un enlace para descargar el archivo
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Exportar eventos a CSV
export function exportEventsToCSV(events: Event[]): void {
  const headers = [
    "Título",
    "Ubicación",
    "Fecha",
    "Fecha Fin",
    "Venue",
    "Temática",
    "Estado",
    "Progreso",
    "Tareas Pendientes",
    "Presupuesto",
    "Gasto Real",
  ]
  const fields = [
    "title",
    "location",
    "date",
    "endDate",
    "venue",
    "theme",
    "status",
    "progress",
    "pendingTasks",
    "budget",
    "actual",
  ]

  const csv = convertToCSV(events, headers, fields)
  downloadCSV(csv, "eventos.csv")
}

// Exportar items de presupuesto a CSV
export function exportBudgetItemsToCSV(items: BudgetItem[], eventTitle?: string): void {
  const headers = [
    "Nombre",
    "Área",
    "Presupuesto",
    "Cerrado",
    "Resultado Negociación",
    "Desviación",
    "Método de Pago",
    "Estado",
    "Responsable",
    "Contacto",
    "Comentarios",
  ]
  const fields = [
    "name",
    "area",
    "budget",
    "closed",
    "negotiationResult",
    "deviation",
    "paymentMethod",
    "productionStatus",
    "responsible",
    "contact",
    "comments",
  ]

  const csv = convertToCSV(items, headers, fields)
  const filename = eventTitle ? `presupuesto_${eventTitle.replace(/\s+/g, "_").toLowerCase()}.csv` : "presupuesto.csv"
  downloadCSV(csv, filename)
}

// Exportar tareas a CSV
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = ["Título", "Descripción", "Fecha Límite", "Prioridad", "Estado", "Asignado a"]
  const fields = ["title", "description", "dueDate", "priority", "status", "assignedTo"]

  const csv = convertToCSV(tasks, headers, fields)
  downloadCSV(csv, "tareas.csv")
}
