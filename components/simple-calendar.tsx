"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEventStore } from "@/lib/event-service"
import { parse, isSameDay } from "date-fns"

export function SimpleCalendar() {
  const router = useRouter()
  const events = useEventStore((state) => state.events)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 23)) // Abril 2025, día 23 seleccionado

  const monthNames = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ]

  const dayNames = ["L", "M", "M", "J", "V", "S", "D"]

  const getDaysInMonth = useCallback((year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }, [])

  const getFirstDayOfMonth = useCallback((year, month) => {
    return new Date(year, month, 1).getDay()
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }, [currentDate])

  const nextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }, [currentDate])

  // Check if a day has an event - memoized to prevent recalculation on every render
  const hasEvent = useCallback(
    (year: number, month: number, day: number) => {
      const checkDate = new Date(year, month, day)

      return events.some((event) => {
        try {
          const eventDate = parse(event.date, "yyyy-MM-dd", new Date())

          // Check if this is the event date
          if (isSameDay(eventDate, checkDate)) return true

          // Check if event has an end date and this day is within the range
          if (event.endDate) {
            const eventEndDate = parse(event.endDate, "yyyy-MM-dd", new Date())
            if (checkDate >= eventDate && checkDate <= eventEndDate) return true
          }

          return false
        } catch (e) {
          console.error("Error parsing date:", e)
          return false
        }
      })
    },
    [events],
  )

  // Get event ID for a specific day - memoized to prevent recalculation on every render
  const getEventIdForDay = useCallback(
    (year: number, month: number, day: number) => {
      const checkDate = new Date(year, month, day)

      const foundEvent = events.find((event) => {
        try {
          const eventDate = parse(event.date, "yyyy-MM-dd", new Date())

          // Check if this is the event date
          if (isSameDay(eventDate, checkDate)) return true

          // Check if event has an end date and this day is within the range
          if (event.endDate) {
            const eventEndDate = parse(event.endDate, "yyyy-MM-dd", new Date())
            if (checkDate >= eventDate && checkDate <= eventEndDate) return true
          }

          return false
        } catch (e) {
          console.error("Error parsing date:", e)
          return false
        }
      })

      return foundEvent?.id
    },
    [events],
  )

  // Handle day click
  const handleDayClick = useCallback(
    (year: number, month: number, day: number) => {
      // Update the selected date
      setCurrentDate(new Date(year, month, day))

      // Check if this day has an event
      const eventId = getEventIdForDay(year, month, day)

      if (eventId) {
        // Navigate to the event page
        router.push(`/events/${eventId}`)
      }
    },
    [getEventIdForDay, router],
  )

  // Memoize the calendar rendering to prevent unnecessary recalculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const selectedDay = currentDate.getDate()

    // Ajustar el primer día para que lunes sea 0
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

    const days = []
    // Días vacíos al inicio
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 flex items-center justify-center text-gray-400"></div>)
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = (i + adjustedFirstDay) % 7
      const isSaturday = dayOfWeek === 5
      const isSunday = dayOfWeek === 6
      const isWeekend = isSaturday || isSunday
      const isEventDay = hasEvent(year, month, i)
      const isSelected = i === selectedDay

      days.push(
        <div
          key={i}
          className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer
            ${isEventDay ? "bg-black text-yellow-400" : isSelected ? "bg-red-500 text-white" : ""}
            ${isWeekend && !isEventDay && !isSelected ? "text-gray-400" : ""}
          `}
          onClick={() => handleDayClick(year, month, i)}
        >
          {i}
        </div>,
      )
    }

    return days
  }, [currentDate, getDaysInMonth, getFirstDayOfMonth, hasEvent, handleDayClick])

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-white rounded-lg shadow p-4">
        {/* Header con mes y controles de navegación */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-red-500">{monthNames[currentDate.getMonth()]}</h2>
          <button onClick={nextMonth} className="p-1">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className={`h-8 w-8 flex items-center justify-center font-medium 
                ${index >= 5 ? "text-gray-400" : "text-gray-800"}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
      </div>
    </div>
  )
}
