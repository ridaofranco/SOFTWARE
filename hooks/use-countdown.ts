"use client"

import { useState, useEffect } from "react"
import { getEventCountdown } from "@/store/unified-event-store"

interface CountdownData {
  days: number
  hours: number
  minutes: number
  isExpired: boolean
}

export function useCountdown(eventDate: string): CountdownData {
  const [countdown, setCountdown] = useState<CountdownData>(() => getEventCountdown(eventDate))

  useEffect(() => {
    // Update countdown immediately
    setCountdown(getEventCountdown(eventDate))

    // Set up interval to update every minute (60 seconds)
    const interval = setInterval(() => {
      setCountdown(getEventCountdown(eventDate))
    }, 60000)

    return () => clearInterval(interval)
  }, [eventDate])

  return countdown
}
