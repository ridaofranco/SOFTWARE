"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from "date-fns"

interface CountdownWidgetProps {
  eventDate: string
  eventTitle?: string
  eventVenue?: string
  compact?: boolean
}

export function CountdownWidget({ eventDate, eventTitle, eventVenue, compact = false }: CountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    isOverdue: boolean
  }>({ days: 0, hours: 0, minutes: 0, isOverdue: false })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const targetDate = parseISO(eventDate)

      const totalDays = differenceInDays(targetDate, now)
      const totalHours = differenceInHours(targetDate, now)
      const totalMinutes = differenceInMinutes(targetDate, now)

      if (totalMinutes < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, isOverdue: true })
        return
      }

      const days = Math.floor(totalMinutes / (24 * 60))
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
      const minutes = totalMinutes % 60

      setTimeLeft({ days, hours, minutes, isOverdue: false })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [eventDate])

  const getUrgencyColor = () => {
    if (timeLeft.isOverdue) return "bg-gray-100 text-gray-600"
    if (timeLeft.days === 0 && timeLeft.hours <= 6) return "bg-red-100 text-red-700"
    if (timeLeft.days === 0) return "bg-orange-100 text-orange-700"
    if (timeLeft.days === 1) return "bg-yellow-100 text-yellow-700"
    if (timeLeft.days <= 7) return "bg-blue-100 text-blue-700"
    return "bg-green-100 text-green-700"
  }

  const formatTimeLeft = () => {
    if (timeLeft.isOverdue) return "Finalizado"
    if (timeLeft.days === 0 && timeLeft.hours === 0) return `${timeLeft.minutes}m`
    if (timeLeft.days === 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`
    if (timeLeft.days === 1) return "Mañana"
    return `${timeLeft.days}d`
  }

  if (compact) {
    return (
      <Badge className={`${getUrgencyColor()} text-xs font-mono`}>
        <Clock className="w-3 h-3 mr-1" />
        {formatTimeLeft()}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {eventTitle && (
        <div className="text-center">
          <h3 className="font-semibold text-lg">{eventTitle}</h3>
          {eventVenue && <p className="text-sm text-gray-600">{eventVenue}</p>}
        </div>
      )}

      <div className={`px-4 py-2 rounded-lg ${getUrgencyColor()}`}>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span className="font-mono font-semibold">
            {timeLeft.isOverdue ? (
              "Evento finalizado"
            ) : (
              <>
                {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
                {(timeLeft.days > 0 || timeLeft.hours > 0) && <span>{timeLeft.hours}h </span>}
                <span>{timeLeft.minutes}m</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
