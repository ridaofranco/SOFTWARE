"use client"

import { useState, useEffect } from "react"
import { DateTime } from "luxon"
import { nowAR } from "@/store/unified-event-store"

export interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  totalSeconds: number
}

export function useCountdown(targetDate: string): CountdownData {
  const [countdown, setCountdown] = useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    totalSeconds: 0,
  })

  useEffect(() => {
    const calculateCountdown = () => {
      const now = nowAR()
      const target = DateTime.fromISO(targetDate).setZone("America/Argentina/Buenos_Aires")

      const diff = target.diff(now, ["days", "hours", "minutes", "seconds"])

      if (diff.milliseconds <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalSeconds: 0,
        })
        return
      }

      setCountdown({
        days: Math.floor(diff.days),
        hours: Math.floor(diff.hours),
        minutes: Math.floor(diff.minutes),
        seconds: Math.floor(diff.seconds),
        isExpired: false,
        totalSeconds: Math.floor(diff.as("seconds")),
      })
    }

    // Calculate immediately
    calculateCountdown()

    // Update every minute (60000ms)
    const interval = setInterval(calculateCountdown, 60000)

    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}
