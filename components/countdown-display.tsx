"use client"

import { useCountdown } from "@/hooks/use-countdown"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownDisplayProps {
  targetDate: string
  className?: string
  compact?: boolean
}

export function CountdownDisplay({ targetDate, className, compact = false }: CountdownDisplayProps) {
  const countdown = useCountdown(targetDate)

  if (countdown.isExpired) {
    return (
      <div className={cn("flex items-center gap-1 text-red-600", className)}>
        <Clock className="h-3 w-3" />
        <span className="text-xs font-medium">Expirado</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
        <Clock className="h-3 w-3" />
        <span className="text-xs font-mono">
          {countdown.days}d {countdown.hours.toString().padStart(2, "0")}:
          {countdown.minutes.toString().padStart(2, "0")}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-1 font-mono text-sm">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{countdown.days}d</span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
          {countdown.hours.toString().padStart(2, "0")}h
        </span>
        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
          {countdown.minutes.toString().padStart(2, "0")}m
        </span>
      </div>
    </div>
  )
}
