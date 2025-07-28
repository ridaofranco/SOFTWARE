"use client"

import { useState, useCallback, useMemo } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewEventDialog } from "@/components/new-event-dialog"
import { useEventStore } from "@/lib/event-service"

// Configuración del localizador para el calendario
const locales = {
  es: es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function EventCalendar() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const events = useEventStore((state) => state.events)

  // Memoize calendar events to prevent unnecessary recalculations
  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      location: event.location,
      start: new Date(event.date),
      end: event.endDate ? new Date(event.endDate) : new Date(event.date),
      venue: event.venue,
      theme: event.theme,
      status: event.status,
    }))
  }, [events])

  // Personalizar el estilo de los eventos en el calendario
  const eventStyleGetter = useCallback((event) => {
    let backgroundColor = "#3182ce"
    if (event.status === "completed") {
      backgroundColor = "#718096"
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 5px",
      },
    }
  }, [])

  // Manejar clic en un evento
  const handleSelectEvent = useCallback(
    (event) => {
      router.push(`/events/${event.id}`)
    },
    [router],
  )

  // Manejar selección de fecha/slot
  const handleSelectSlot = useCallback(({ start }) => {
    setSelectedDate(start)
    setShowNewEventDialog(true)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Calendario de Eventos</CardTitle>
        <NewEventDialog initialDate={selectedDate} />
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day"]}
            defaultView="month"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango",
            }}
            culture="es"
          />
        </div>
      </CardContent>
    </Card>
  )
}
