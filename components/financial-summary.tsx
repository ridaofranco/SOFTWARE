"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEventStore } from "@/lib/event-service"

export function FinancialSummary() {
  const events = useEventStore((state) => state.events)
  const [selectedEvent, setSelectedEvent] = useState<string>("all")

  // Filter events based on selection
  const filteredEvents = selectedEvent === "all" ? events : events.filter((e) => e.id === selectedEvent)

  // Calculate totals
  const totalBudget = filteredEvents.reduce((sum, event) => sum + event.budget, 0)
  const totalActual = filteredEvents.reduce((sum, event) => sum + event.actual, 0)
  const totalDifference = totalBudget - totalActual
  const totalPercentageDiff = totalBudget > 0 ? (totalDifference / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Seleccionar evento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los eventos</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero de Eventos</CardTitle>
          <CardDescription>Comparación entre presupuesto proyectado y gasto real por evento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Temática</TableHead>
                  <TableHead className="text-right">Presupuestado</TableHead>
                  <TableHead className="text-right">Gasto Real</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                  <TableHead className="text-right">% Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No hay datos disponibles para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => {
                    const difference = event.budget - event.actual
                    const percentageDiff = event.budget > 0 ? (difference / event.budget) * 100 : 0

                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell>{event.theme}</TableCell>
                        <TableCell className="text-right">${event.budget.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${event.actual.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={difference < 0 ? "text-red-600" : "text-green-600"}>
                            {difference < 0 ? "-" : "+"}${Math.abs(difference).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={percentageDiff < 0 ? "text-red-600" : "text-green-600"}>
                            {percentageDiff < 0 ? "" : "+"}
                            {percentageDiff.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
                {filteredEvents.length > 0 && (
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={3}>TOTAL</TableCell>
                    <TableCell className="text-right">${totalBudget.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totalActual.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={totalDifference < 0 ? "text-red-600" : "text-green-600"}>
                        {totalDifference < 0 ? "-" : "+"}${Math.abs(totalDifference).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={totalPercentageDiff < 0 ? "text-red-600" : "text-green-600"}>
                        {totalPercentageDiff < 0 ? "" : "+"}
                        {totalPercentageDiff.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
