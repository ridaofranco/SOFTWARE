"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function ExpensesByArea() {
  const events = useEventStore((state) => state.events)
  const [selectedEvent, setSelectedEvent] = useState("all")

  // Get expenses by area for a specific event or all events
  const getAreaExpenses = () => {
    let arteTotal = 0
    let bookingTotal = 0
    let marketingTotal = 0

    if (selectedEvent === "all") {
      // Calculate for all events
      events.forEach((event) => {
        event.items.forEach((item) => {
          if (item.area === "Arte") arteTotal += item.closed
          else if (item.area === "Booking") bookingTotal += item.closed
          else if (item.area === "Marketing") marketingTotal += item.closed
        })
      })
    } else {
      // Calculate for selected event
      const event = events.find((e) => e.id === selectedEvent)
      if (event) {
        event.items.forEach((item) => {
          if (item.area === "Arte") arteTotal += item.closed
          else if (item.area === "Booking") bookingTotal += item.closed
          else if (item.area === "Marketing") marketingTotal += item.closed
        })
      }
    }

    return { arte: arteTotal, booking: bookingTotal, marketing: marketingTotal }
  }

  const expenses = getAreaExpenses()
  const total = expenses.arte + expenses.booking + expenses.marketing

  const artePercentage = total > 0 ? (expenses.arte / total) * 100 : 0
  const bookingPercentage = total > 0 ? (expenses.booking / total) * 100 : 0
  const marketingPercentage = total > 0 ? (expenses.marketing / total) * 100 : 0

  // Data for charts
  const pieData = [
    { name: "Arte", value: expenses.arte },
    { name: "Booking", value: expenses.booking },
    { name: "Marketing", value: expenses.marketing },
  ]

  const barData = [
    { name: "Arte", gasto: expenses.arte },
    { name: "Booking", gasto: expenses.booking },
    { name: "Marketing", gasto: expenses.marketing },
  ]

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"]

  // Detailed breakdowns for each category
  const createBreakdown = (total, percentages) => {
    return percentages.map(({ name, percentage }) => ({
      name,
      amount: total * (percentage / 100),
    }))
  }

  const arteBreakdown = createBreakdown(expenses.arte, [
    { name: "Escenografía", percentage: 25 },
    { name: "Iluminación", percentage: 20 },
    { name: "VJ", percentage: 15 },
    { name: "Efectos Especiales", percentage: 15 },
    { name: "Actores y Performance", percentage: 10 },
    { name: "Otros", percentage: 15 },
  ])

  const bookingBreakdown = createBreakdown(expenses.booking, [
    { name: "DJs", percentage: 35 },
    { name: "Seguridad", percentage: 25 },
    { name: "Logística", percentage: 15 },
    { name: "Permisos", percentage: 15 },
    { name: "Otros", percentage: 10 },
  ])

  const marketingBreakdown = createBreakdown(expenses.marketing, [
    { name: "Redes Sociales", percentage: 30 },
    { name: "Fotografía", percentage: 25 },
    { name: "Diseño", percentage: 20 },
    { name: "PR", percentage: 15 },
    { name: "Otros", percentage: 10 },
  ])

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

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Arte</CardTitle>
            <CardDescription>{artePercentage.toFixed(1)}% del gasto total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${expenses.arte.toLocaleString()}</div>
            <div className="mt-4 space-y-2">
              {arteBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span>${Math.round(item.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking</CardTitle>
            <CardDescription>{bookingPercentage.toFixed(1)}% del gasto total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${expenses.booking.toLocaleString()}</div>
            <div className="mt-4 space-y-2">
              {bookingBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span>${Math.round(item.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing</CardTitle>
            <CardDescription>{marketingPercentage.toFixed(1)}% del gasto total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${expenses.marketing.toLocaleString()}</div>
            <div className="mt-4 space-y-2">
              {marketingBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span>${Math.round(item.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Gastos por Área</CardTitle>
          <CardDescription>
            {selectedEvent === "all" ? "Todos los eventos" : events.find((e) => e.id === selectedEvent)?.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="gasto" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-8 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${artePercentage}%`, float: "left" }}
                title={`Arte: ${artePercentage.toFixed(1)}%`}
              />
              <div
                className="h-full bg-blue-500"
                style={{ width: `${bookingPercentage}%`, float: "left" }}
                title={`Booking: ${bookingPercentage.toFixed(1)}%`}
              />
              <div
                className="h-full bg-green-500"
                style={{ width: `${marketingPercentage}%`, float: "left" }}
                title={`Marketing: ${marketingPercentage.toFixed(1)}%`}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-primary" />
                <span>Arte ({artePercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-blue-500" />
                <span>Booking ({bookingPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-3 w-3 rounded-full bg-green-500" />
                <span>Marketing ({marketingPercentage.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
