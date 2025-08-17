"use client"

import { useEffect, useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, Plane, Hotel, FileText, MapPin, Calendar, AlertTriangle, CheckCircle } from "lucide-react"
import { calculateDaysUntilEvent, getCountryFromVenue, requiresCustoms } from "@/lib/automated-tasks-service"

interface AutomatedTasksAlertProps {
  eventId?: string
  showAll?: boolean
}

export function AutomatedTasksAlert({ eventId, showAll = false }: AutomatedTasksAlertProps) {
  const { events, tasks, updateTask } = useUnifiedEventStore()
  const [urgentEvents, setUrgentEvents] = useState<any[]>([])

  useEffect(() => {
    // Filtrar eventos que necesitan atención urgente (fuera de CABA y próximos)
    const venuesRequiringAutomation = [
      "Normandina",
      "Stadium",
      "Gap",
      "Club Paraguay",
      "Córdoba",
      "Jaguar Haus",
      "Rosario",
      "Mendoza",
      "Montevideo",
      "Cuenca",
      "Quito",
      "Guayaquil",
      "Asunción",
      "Santa Fe",
      "Bahía Blanca",
      "Carlos Casares",
      "La Plata",
      "Mar del Plata",
    ]

    const urgent = events
      .filter((event) => {
        const daysUntil = calculateDaysUntilEvent(event.date)
        return (
          venuesRequiringAutomation.includes(event.venue) &&
          daysUntil <= 60 &&
          daysUntil > 0 &&
          event.status !== "cancelled" &&
          (!eventId || event.id === eventId)
        )
      })
      .sort((a, b) => calculateDaysUntilEvent(a.date) - calculateDaysUntilEvent(b.date))

    setUrgentEvents(urgent)
  }, [events, eventId])

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case "pasajes":
        return <Plane className="h-4 w-4" />
      case "hoteleria":
        return <Hotel className="h-4 w-4" />
      case "aduana_ida":
      case "aduana_vuelta":
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "destructive"
    if (days <= 14) return "default"
    if (days <= 30) return "secondary"
    return "outline"
  }

  const markTaskCompleted = (taskId: string) => {
    updateTask(taskId, { status: "completed" })
  }

  if (urgentEvents.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>🚨 Eventos Fuera de CABA - Tareas Automáticas</AlertTitle>
        <AlertDescription>
          Hay {urgentEvents.length} evento(s) próximo(s) que requieren preparación logística especial.
        </AlertDescription>
      </Alert>

      {urgentEvents.map((event) => {
        const daysUntil = calculateDaysUntilEvent(event.date)
        const country = getCountryFromVenue(event.venue)
        const needsCustoms = requiresCustoms(event.venue)
        const eventTasks = tasks.filter((task) => task.eventId === event.id)
        const automatedTasks = eventTasks.filter((task: any) => task.isAutomated)

        return (
          <Card key={event.id} className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">{event.venue}</CardTitle>
                  <Badge variant={getUrgencyColor(daysUntil)}>{daysUntil} días</Badge>
                  {needsCustoms && (
                    <Badge variant="outline" className="bg-blue-50">
                      {country} 🛂
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(event.date).toLocaleDateString("es-AR")}
                </div>
              </div>
              <CardDescription>
                Cuenta regresiva: <strong>{daysUntil} días</strong> para el evento
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tareas Básicas */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">📋 Tareas Básicas</h4>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Sacar Pasajes</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Hotel className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Hotelería</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar
                    </Button>
                  </div>
                </div>

                {/* Tareas de Aduana (solo países fuera de Argentina) */}
                {needsCustoms && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">🛂 Trámites Internacionales</h4>

                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Aduana IDA</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Aduana VUELTA</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Marcar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Recordatorio:</span>
                  <span>Las tareas se activan automáticamente 2 meses antes del evento</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
