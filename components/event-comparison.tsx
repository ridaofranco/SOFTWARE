"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEventStore } from "@/lib/event-service"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

export function EventComparison() {
  const events = useEventStore((state) => state.events)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  // Get filtered events based on selection
  const filteredEvents =
    selectedEvents.length > 0 ? events.filter((event) => selectedEvents.includes(event.id)) : events

  // Calculate totals
  const totalBudget = filteredEvents.reduce((sum, event) => sum + event.budget, 0)
  const totalActual = filteredEvents.reduce((sum, event) => sum + event.actual, 0)

  // Handle checkbox change
  const handleEventSelection = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents((prev) => [...prev, eventId])
    } else {
      setSelectedEvents((prev) => prev.filter((id) => id !== eventId))
    }
  }

  // Prepare data for charts
  const chartData = filteredEvents.map((event) => ({
    name: event.title.split(" - ")[0], // Just use location part
    presupuesto: event.budget,
    gasto: event.actual,
    diferencia: event.budget - event.actual,
  }))

  // Calculate efficiency (budget vs actual) for each event
  const efficiencyData = filteredEvents.map((event) => {
    const efficiency = event.budget > 0 ? ((event.budget - event.actual) / event.budget) * 100 : 0

    return {
      name: event.title.split(" - ")[0],
      eficiencia: efficiency,
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selección de Eventos</CardTitle>
          <CardDescription>Selecciona los eventos que deseas comparar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-2">
                <Checkbox
                  id={event.id}
                  checked={selectedEvents.includes(event.id) || selectedEvents.length === 0}
                  onCheckedChange={(checked) => handleEventSelection(event.id, checked as boolean)}
                />
                <Label htmlFor={event.id}>{event.title}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparación de Eventos</CardTitle>
          <CardDescription>Análisis comparativo de presupuestos y gastos entre eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-right">Presupuesto</TableHead>
                  <TableHead className="text-right">Gasto Real</TableHead>
                  <TableHead className="text-right">% del Presupuesto</TableHead>
                  <TableHead className="text-right">% del Gasto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No hay eventos seleccionados para comparar
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => {
                    const budgetPercentage = totalBudget > 0 ? (event.budget / totalBudget) * 100 : 0
                    const actualPercentage = totalActual > 0 ? (event.actual / totalActual) * 100 : 0

                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell className="text-right">${event.budget.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${event.actual.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{budgetPercentage.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{actualPercentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    )
                  })
                )}
                {filteredEvents.length > 0 && (
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right">${totalBudget.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${totalActual.toLocaleString()}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredEvents.length > 0 && (
            <>
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Presupuesto vs. Gasto Real por Evento</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="presupuesto" fill="#8884d8" name="Presupuesto" />
                      <Bar dataKey="gasto" fill="#82ca9d" name="Gasto Real" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Eficiencia Presupuestaria por Evento</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="eficiencia"
                        stroke="#ff7300"
                        name="Eficiencia (%)"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-4 text-lg font-medium">Distribución de Presupuesto vs. Gasto Real</h3>
                <div className="space-y-4">
                  {filteredEvents.map((event) => {
                    const budgetPercentage = totalBudget > 0 ? (event.budget / totalBudget) * 100 : 0
                    const actualPercentage = totalActual > 0 ? (event.actual / totalActual) * 100 : 0

                    return (
                      <div key={event.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{event.title}</span>
                          <span>
                            ${event.budget.toLocaleString()} / ${event.actual.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${budgetPercentage}%` }}
                            title={`Presupuesto: ${budgetPercentage.toFixed(1)}%`}
                          />
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${actualPercentage}%` }}
                            title={`Gasto Real: ${actualPercentage.toFixed(1)}%`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
