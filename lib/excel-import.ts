import { read, utils, type WorkBook } from "xlsx"
import { useEventStore, type BudgetItem, type Event, type Task } from "@/lib/event-service"

// Función para leer un archivo Excel y convertirlo en JSON
export async function readExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook: WorkBook = read(data, { type: "binary" })

        // Asumimos que los datos están en la primera hoja
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convertir a JSON
        const jsonData = utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}

// Función para importar eventos desde datos JSON
export async function importEventsFromJson(jsonData: any[]): Promise<string[]> {
  const { addEvent } = useEventStore.getState()
  const importedEventIds: string[] = []

  for (const row of jsonData) {
    try {
      // Mapear los campos del Excel a la estructura de Event
      const eventData: Omit<Event, "id"> & { id?: string } = {
        id: row.id || undefined,
        title: row.title || row.Título || row.Nombre || "",
        location: row.location || row.Ubicación || row.Lugar || "",
        date: row.date || row.Fecha || new Date().toISOString(),
        endDate: row.endDate || row.FechaFin || row["Fecha Fin"] || null,
        venue: row.venue || row.Venue || row.Sede || "",
        theme: row.theme || row.Temática || row.Tema || "",
        status: row.status || row.Estado || "planning",
        progress: row.progress || row.Progreso || 0,
        pendingTasks: row.pendingTasks || row["Tareas Pendientes"] || 0,
        budget: row.budget || row.Presupuesto || 0,
        actual: row.actual || row["Gasto Real"] || 0,
        notes: row.notes || row.Notas || "",
        items: [],
      }

      // Añadir el evento y guardar el ID
      const eventId = addEvent(eventData)
      importedEventIds.push(eventId)
    } catch (error) {
      console.error("Error al importar evento:", error)
    }
  }

  return importedEventIds
}

// Función para importar items de presupuesto desde datos JSON
export async function importBudgetItemsFromJson(jsonData: any[], eventId: string): Promise<string[]> {
  const { addBudgetItem } = useEventStore.getState()
  const importedItemIds: string[] = []

  for (const row of jsonData) {
    try {
      // Mapear los campos del Excel a la estructura de BudgetItem
      const itemData: Omit<BudgetItem, "id"> & { id?: string } = {
        id: row.id || undefined,
        name: row.name || row.Nombre || row.Descripción || "",
        budget: Number(row.budget || row.Presupuesto || 0),
        closed: Number(row.closed || row["Gasto Real"] || row.Cerrado || 0),
        negotiationResult: 0, // Se calculará automáticamente
        deviation: 0, // Se calculará automáticamente
        paymentMethod: row.paymentMethod || row["Método de Pago"] || "",
        productionStatus: row.productionStatus || row.Estado || "No iniciado",
        comments: row.comments || row.Comentarios || "",
        area: row.area || row.Área || row.Categoría || "Arte",
        responsible: row.responsible || row.Responsable || "",
        contact: row.contact || row.Contacto || "",
        document: row.document || row.Documento || "",
        contingencyPlan: row.contingencyPlan || row["Plan de Contingencia"] || "",
        eventId: eventId,
      }

      // Añadir el item y guardar el ID
      const itemId = addBudgetItem(itemData)
      importedItemIds.push(itemId)
    } catch (error) {
      console.error("Error al importar item de presupuesto:", error)
    }
  }

  return importedItemIds
}

// Función para importar tareas desde datos JSON
export async function importTasksFromJson(jsonData: any[], eventId: string): Promise<string[]> {
  const { addTask } = useEventStore.getState()
  const importedTaskIds: string[] = []

  for (const row of jsonData) {
    try {
      // Mapear los campos del Excel a la estructura de Task
      const taskData: Omit<Task, "id"> & { id?: string } = {
        id: row.id || undefined,
        title: row.title || row.Título || row.Nombre || "",
        description: row.description || row.Descripción || "",
        dueDate: row.dueDate || row["Fecha Límite"] || new Date().toISOString(),
        priority: row.priority || row.Prioridad || "media",
        status: row.status || row.Estado || "pendiente",
        eventId: eventId,
        assignedTo: row.assignedTo || row["Asignado a"] || "",
      }

      // Añadir la tarea y guardar el ID
      const taskId = addTask(taskData)
      importedTaskIds.push(taskId)
    } catch (error) {
      console.error("Error al importar tarea:", error)
    }
  }

  return importedTaskIds
}

// Función para detectar el tipo de datos en el Excel
export function detectDataType(jsonData: any[]): "events" | "budgetItems" | "tasks" | "unknown" {
  if (jsonData.length === 0) return "unknown"

  const firstRow = jsonData[0]
  const keys = Object.keys(firstRow).map((k) => k.toLowerCase())

  // Detectar si son eventos
  if (
    keys.some((k) => k.includes("título") || k.includes("title")) &&
    keys.some((k) => k.includes("fecha") || k.includes("date")) &&
    keys.some((k) => k.includes("venue") || k.includes("sede"))
  ) {
    return "events"
  }

  // Detectar si son items de presupuesto
  if (
    keys.some((k) => k.includes("nombre") || k.includes("name")) &&
    keys.some((k) => k.includes("presupuesto") || k.includes("budget")) &&
    keys.some((k) => k.includes("área") || k.includes("area") || k.includes("categoría"))
  ) {
    return "budgetItems"
  }

  // Detectar si son tareas
  if (
    keys.some((k) => k.includes("título") || k.includes("title")) &&
    keys.some((k) => k.includes("descripción") || k.includes("description")) &&
    keys.some((k) => k.includes("prioridad") || k.includes("priority"))
  ) {
    return "tasks"
  }

  return "unknown"
}
