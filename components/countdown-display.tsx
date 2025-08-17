"use client"

import { useCountdown } from "@/hooks/use-countdown"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface CountdownDisplayProps {
  eventDate: string
  className?: string
  variant?: "default" | "compact"
}

export function CountdownDisplay({ eventDate, className = "", variant = "default" }: CountdownDisplayProps) {
  const countdown = useCountdown(eventDate)

  if (countdown.isExpired) {
    return (
      <Badge variant="secondary" className={className}>
        <Clock className="w-3 h-3 mr-1" />
        Finalizado
      </Badge>
    )
  }

  const formatTime = () => {
    if (variant === "compact") {
      return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
    }

    return `${countdown.days} días, ${countdown.hours}:${countdown.minutes.toString().padStart(2, "0")}`
  }

  return (
    <Badge variant="outline" className={className}>
      <Clock className="w-3 h-3 mr-1" />
      {formatTime()}
    </Badge>
  )
}
