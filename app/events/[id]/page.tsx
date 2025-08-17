"use client"

import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CountdownDisplay } from "@/components/countdown-display"
import { EventGeneralTab } from "@/components/events/event-general-tab"
import { EventProvidersTab } from "@/components/events/event-providers-tab"
import { EventTasksTab } from "@/components/events/event-tasks-tab"
import { EventManualsTab } from "@/components/events/event-manuals-tab"
import { EventInsuranceTab } from "@/components/events/event-insurance-tab"
import { EventContractsTab } from "@/components/events/event-contracts-tab"
import { ArrowLeft, Calendar, MapPin, Clock, Edit, Download } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface EventDetailPageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "general"

  const { events, venues, tasks, budgetItems, chatMessages } = useUnifiedEventStore()
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    const foundEvent = events.find((e) => e.id === params.id)
    if (foundEvent) {
      setEvent(foundEvent)
    } else {
      router.push("/events")
    }
  }, [events, params.id, router])

  if (!event) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  const venueName = event.venue || (event.venueId ? venues.find((v) => v.id === event.venueId)?.nombre : "")
  const eventTasks = tasks.filter((t) => t.eventId === event.id)
  const eventBudget = budgetItems.filter((b) => b.eventId === event.id)
  const eventMessages = chatMessages.filter((m) => m.eventId === event.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "propio":
        return "bg-blue-100 text-blue-800"
      case "privado":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "propio":
        return "Propio"
      case "privado":
        return "Privado"
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Eventos
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{event.emoji || "🎵"}</span>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
              <Badge className={getTypeColor(event.type)} variant="outline">
                {getTypeText(event.type)}
              </Badge>
              <CountdownDisplay eventDate={event.date} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString("es-AR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {venueName && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {venueName}
                </div>
              )}
              {event.openingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.openingTime} - {event.closingTime}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/events/${event.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="manuals">Manuales</TabsTrigger>
          <TabsTrigger value="insurance">Seguros</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <EventGeneralTab event={event} />
        </TabsContent>

        <TabsContent value="providers">
          <EventProvidersTab eventId={event.id} />
        </TabsContent>

        <TabsContent value="tasks">
          <EventTasksTab eventId={event.id} />
        </TabsContent>

        <TabsContent value="manuals">
          <EventManualsTab eventId={event.id} />
        </TabsContent>

        <TabsContent value="insurance">
          <EventInsuranceTab eventId={event.id} />
        </TabsContent>

        <TabsContent value="contracts">
          <EventContractsTab eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
