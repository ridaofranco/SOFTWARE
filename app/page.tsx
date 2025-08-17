"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, ChevronRight, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SimpleCalendar } from "@/components/simple-calendar"
import { useEventStore } from "@/lib/event-service"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { NavBar } from "@/components/nav-bar"
import { ExportButton } from "@/components/export-button"

export default function DashboardPage() {
  const getActiveEvents = useEventStore((state) => state.getActiveEvents)
  const tasks = useEventStore((state) => state.tasks)
  const [activeEvents, setActiveEvents] = useState([])

  // Use effect to safely get active events
  useEffect(() => {
    setActiveEvents(getActiveEvents())
  }, [getActiveEvents])

  // Get the next event based on date
  const getNextEvent = () => {
    if (activeEvents.length === 0) return null

    const today = new Date()

    // Sort events by date
    const sortedEvents = [...activeEvents].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

    // Find the first event in the future
    const futureEvents = sortedEvents.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate >= today
    })

    return futureEvents.length > 0 ? futureEvents[0] : sortedEvents[0]
  }

  const nextEvent = getNextEvent()

  // Get days remaining until event
  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return 0

    try {
      const eventDate = new Date(dateStr)
      const today = new Date()
      const diffTime = eventDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    } catch (e) {
      console.error("Error calculating days remaining:", e)
      return 0
    }
  }

  // Count tasks by priority
  const highPriorityTasks = tasks.filter((task) => task.priority === "alta" && task.status === "pendiente").length
  const mediumPriorityTasks = tasks.filter((task) => task.priority === "media" && task.status === "pendiente").length
  const lowPriorityTasks = tasks.filter((task) => task.priority === "baja" && task.status === "pendiente").length
  const totalPendingTasks = highPriorityTasks + mediumPriorityTasks + lowPriorityTasks

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center gap-2">
              <ExportButton type="events" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nextEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle>Próximo Evento</CardTitle>
                  <CardDescription>{nextEvent.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(parseISO(nextEvent.date), "dd MMMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {nextEvent.venue}, {nextEvent.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Comienza en {getDaysRemaining(nextEvent.date)} días</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progreso</span>
                        <span>{nextEvent.progress}%</span>
                      </div>
                      <Progress value={nextEvent.progress} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/events/${nextEvent.id}`}>
                      Ver Detalles
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sin eventos próximos</CardTitle>
                  <CardDescription>Crea un nuevo evento</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No hay eventos programados. Ve a la sección Eventos para crear uno nuevo.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/events">
                      Ir a Eventos
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Tareas Pendientes</CardTitle>
                <CardDescription>{totalPendingTasks} tareas requieren atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tareas de Alta Prioridad</span>
                      <span>{highPriorityTasks}</span>
                    </div>
                    <Progress
                      value={totalPendingTasks > 0 ? (highPriorityTasks / totalPendingTasks) * 100 : 0}
                      className="bg-red-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tareas de Media Prioridad</span>
                      <span>{mediumPriorityTasks}</span>
                    </div>
                    <Progress
                      value={totalPendingTasks > 0 ? (mediumPriorityTasks / totalPendingTasks) * 100 : 0}
                      className="bg-yellow-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tareas de Baja Prioridad</span>
                      <span>{lowPriorityTasks}</span>
                    </div>
                    <Progress
                      value={totalPendingTasks > 0 ? (lowPriorityTasks / totalPendingTasks) * 100 : 0}
                      className="bg-blue-100"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/tasks">
                    Ver Todas las Tareas
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendario de Eventos</CardTitle>
                <CardDescription>Abril 2025</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SimpleCalendar />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
