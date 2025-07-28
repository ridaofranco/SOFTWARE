"use client"

import Link from "next/link"

import { useState } from "react"
import { ArrowDown, Filter, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEventStore } from "@/lib/event-service"
import { NavBar } from "@/components/nav-bar"
import { ExportButton } from "@/components/export-button"

export default function BudgetPage() {
  const events = useEventStore((state) => state.events)
  const getTotalBudgetAllEvents = useEventStore((state) => state.getTotalBudgetAllEvents)
  const getTotalActualAllEvents = useEventStore((state) => state.getTotalActualAllEvents)
  const getTotalDeviationAllEvents = useEventStore((state) => state.getTotalDeviationAllEvents)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")

  // Calculate totals
  const totalBudget = getTotalBudgetAllEvents()
  const totalActual = getTotalActualAllEvents()
  const totalDeviation = getTotalDeviationAllEvents()
  const totalDeviationAmount = totalBudget - totalActual
  const isUnderBudget = totalDeviationAmount > 0

  // Get budget items for the selected event or all events
  const getBudgetItems = () => {
    if (selectedEvent === "all") {
      // Get all budget items from all events
      return events.flatMap((event) =>
        event.items.map((item) => ({
          ...item,
          eventTitle: event.title,
        })),
      )
    } else {
      // Get budget items for the selected event
      const event = events.find((e) => e.id === selectedEvent)
      return event
        ? event.items.map((item) => ({
            ...item,
            eventTitle: event.title,
          }))
        : []
    }
  }

  // Filter budget items
  const filteredItems = getBudgetItems().filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsible.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesArea = selectedArea === "all" || item.area === selectedArea

    return matchesSearch && matchesArea
  })

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Presupuesto</h2>
            <div className="flex items-center gap-2">
              <ExportButton type="budget" />
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Presupuesto
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Para todos los eventos activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Comprometido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalActual.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalBudget > 0
                    ? `${Math.round((totalActual / totalBudget) * 100)}% del presupuesto total`
                    : "Sin presupuesto establecido"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Restante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.max(0, totalDeviationAmount).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {totalBudget > 0
                    ? `${Math.round((Math.max(0, totalDeviationAmount) / totalBudget) * 100)}% del presupuesto total`
                    : "Sin presupuesto establecido"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Desviación Presupuestaria</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center text-2xl font-bold ${isUnderBudget ? "text-green-500" : "text-red-500"}`}
                >
                  <ArrowDown
                    className={`mr-1 h-4 w-4 ${isUnderBudget ? "text-green-500" : "text-red-500 transform rotate-180"}`}
                  />
                  {Math.abs(totalDeviation).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {isUnderBudget
                    ? `Bajo presupuesto por $${Math.abs(totalDeviationAmount).toLocaleString()}`
                    : `Sobre presupuesto por $${Math.abs(totalDeviationAmount).toLocaleString()}`}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList>
              <TabsTrigger value="current">Evento Actual</TabsTrigger>
              <TabsTrigger value="all">Todos los Eventos</TabsTrigger>
              <TabsTrigger value="categories">Por Categoría</TabsTrigger>
              <TabsTrigger value="reports">Informes</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nombre o categoría..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccionar evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Eventos</SelectLabel>
                        <SelectItem value="all">Todos los eventos</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Áreas</SelectLabel>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        <SelectItem value="Arte">Arte</SelectItem>
                        <SelectItem value="Booking">Booking</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <ExportButton type="budget" className="hidden md:flex" />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Item</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Presupuesto</TableHead>
                      <TableHead>Cerrado</TableHead>
                      <TableHead>Desviación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Método de Pago</TableHead>
                      {selectedEvent === "all" && <TableHead>Evento</TableHead>}
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={selectedEvent === "all" ? 9 : 8} className="h-24 text-center">
                          No se encontraron items para los filtros seleccionados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {filteredItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.area}</TableCell>
                            <TableCell>${item.budget.toLocaleString()}</TableCell>
                            <TableCell>{item.closed ? `$${item.closed.toLocaleString()}` : "-"}</TableCell>
                            <TableCell>
                              {item.deviation !== 0 ? (
                                <span className={item.deviation < 0 ? "text-red-600" : "text-green-600"}>
                                  {item.deviation > 0 ? "+" : ""}
                                  {item.deviation.toFixed(2)}%
                                </span>
                              ) : (
                                "0%"
                              )}
                            </TableCell>
                            <TableCell>{item.productionStatus}</TableCell>
                            <TableCell>{item.paymentMethod}</TableCell>
                            {selectedEvent === "all" && <TableCell>{item.eventTitle}</TableCell>}
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/events/${item.eventId}`}>Editar</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-medium">
                          <TableCell>Total</TableCell>
                          <TableCell></TableCell>
                          <TableCell>
                            ${filteredItems.reduce((sum, item) => sum + item.budget, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ${filteredItems.reduce((sum, item) => sum + item.closed, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const totalBudget = filteredItems.reduce((sum, item) => sum + item.budget, 0)
                              const totalClosed = filteredItems.reduce((sum, item) => sum + item.closed, 0)
                              const deviation = totalBudget > 0 ? ((totalBudget - totalClosed) / totalBudget) * 100 : 0

                              return (
                                <span className={deviation > 0 ? "text-green-600" : "text-red-600"}>
                                  {deviation.toFixed(2)}%
                                </span>
                              )
                            })()}
                          </TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          {selectedEvent === "all" && <TableCell></TableCell>}
                          <TableCell></TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border p-6">
                <h3 className="text-lg font-medium">Presupuesto de Todos los Eventos</h3>
                <p className="text-sm text-muted-foreground">
                  Vista consolidada de presupuestos para todos los eventos activos y planificados
                </p>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evento</TableHead>
                        <TableHead>Presupuesto</TableHead>
                        <TableHead>Cerrado</TableHead>
                        <TableHead>Desviación</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => {
                        const deviation = event.budget > 0 ? ((event.budget - event.actual) / event.budget) * 100 : 0

                        return (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>${event.budget.toLocaleString()}</TableCell>
                            <TableCell>${event.actual.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={deviation > 0 ? "text-green-600" : "text-red-600"}>
                                {deviation.toFixed(2)}%
                              </span>
                            </TableCell>
                            <TableCell>{event.progress}%</TableCell>
                            <TableCell>{event.status === "active" ? "Activo" : "Completado"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/events/${event.id}`}>Ver Detalles</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="categories" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Arte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Calculate Arte budget
                      const arteBudget = events.reduce((sum, event) => {
                        return (
                          sum +
                          event.items
                            .filter((item) => item.area === "Arte")
                            .reduce((areaSum, item) => areaSum + item.budget, 0)
                        )
                      }, 0)

                      const arteClosed = events.reduce((sum, event) => {
                        return (
                          sum +
                          event.items
                            .filter((item) => item.area === "Arte")
                            .reduce((areaSum, item) => areaSum + item.closed, 0)
                        )
                      }, 0)

                      const percentage = totalBudget > 0 ? (arteBudget / totalBudget) * 100 : 0

                      return (
                        <>
                          <div className="text-2xl font-bold">${arteBudget.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}% del presupuesto total
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Presupuestado</span>
                              <span>${arteBudget.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Cerrado</span>
                              <span>${arteClosed.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Desviación</span>
                              <span className={arteBudget > arteClosed ? "text-green-600" : "text-red-600"}>
                                {arteBudget > 0 ? (((arteBudget - arteClosed) / arteBudget) * 100).toFixed(2) : "0"}%
                              </span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Calculate Booking budget
                      const bookingBudget = events.reduce((sum, event) => {
                        return (
                          sum +
                          event.items
                            .filter((item) => item.area === "Booking")
                            .reduce((areaSum, item) => areaSum + item.budget, 0)
                        )
                      }, 0)

                      const bookingClosed = events.reduce((sum, event) => {
                        return (
                          sum +
                          event.items
                            .filter((item) => item.area === "Booking")
                            .reduce((areaSum, item) => areaSum + item.closed, 0)
                        )
                      }, 0)

                      const percentage = totalBudget > 0 ? (bookingBudget / totalBudget) * 100 : 0

                      return (
                        <>
                          <div className="text-2xl font-bold">${bookingBudget.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}% del presupuesto total
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Presupuestado</span>
                              <span>${bookingBudget.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Cerrado</span>
                              <span>${bookingClosed.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Desviación</span>
                              <span className={bookingBudget > bookingClosed ? "text-green-600" : "text-red-600"}>
                                {bookingBudget > 0
                                  ? (((bookingBudget - bookingClosed) / bookingBudget) * 100).toFixed(2)
                                  : "0"}
                                %
                              </span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Calculate Marketing budget
                      const marketingBudget = events.reduce((sum, event) => {
                        return (
                          sum +
                          event.items
                            .filter((item) => item.area === "Marketing")
                            .reduce((areaSum, item) => areaSum + item.budget, 0)
                        )
                      }, 0)

                      const marketingClosed = events.reduce((sum, event) => {
                        return (
                          sum +
                          event.items
                            .filter((item) => item.area === "Marketing")
                            .reduce((areaSum, item) => areaSum + item.closed, 0)
                        )
                      }, 0)

                      const percentage = totalBudget > 0 ? (marketingBudget / totalBudget) * 100 : 0

                      return (
                        <>
                          <div className="text-2xl font-bold">${marketingBudget.toLocaleString()}</div>
                          <p className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}% del presupuesto total
                          </p>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Presupuestado</span>
                              <span>${marketingBudget.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Cerrado</span>
                              <span>${marketingClosed.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Desviación</span>
                              <span className={marketingBudget > marketingClosed ? "text-green-600" : "text-red-600"}>
                                {marketingBudget > 0
                                  ? (((marketingBudget - marketingClosed) / marketingBudget) * 100).toFixed(2)
                                  : "0"}
                                %
                              </span>
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <div className="rounded-md border p-6">
                <h3 className="text-lg font-medium">Informes Financieros</h3>
                <p className="text-sm text-muted-foreground">
                  Reportes detallados de presupuestos, gastos y desviaciones
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
