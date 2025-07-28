"use client"

import { BarChart, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialSummary } from "@/components/financial-summary"
import { ExpensesByArea } from "@/components/expenses-by-area"
import { EventComparison } from "@/components/event-comparison"
import { YearlyAnalysis } from "@/components/yearly-analysis"
import { useEventStore } from "@/lib/event-service"
import { NavBar } from "@/components/nav-bar"
import { ExportButton } from "@/components/export-button"

export default function AnalyticsPage() {
  const events = useEventStore((state) => state.events)
  const totalBudget = useEventStore((state) => state.getTotalBudgetAllEvents())
  const totalActual = useEventStore((state) => state.getTotalActualAllEvents())
  const totalDeviation = useEventStore((state) => state.getTotalDeviationAllEvents())

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Analítica Financiera</h2>
            <ExportButton type="events" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Presupuesto Total Anual</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total para {events.length} eventos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Gasto Real Anual</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalActual.toLocaleString()}</div>
                <div className="flex items-center text-xs">
                  {(() => {
                    const diff = totalBudget - totalActual
                    const diffPercent = totalBudget > 0 ? (diff / totalBudget) * 100 : 0

                    if (diff > 0) {
                      return (
                        <div className="text-green-600 flex items-center">
                          <TrendingDown className="mr-1 h-4 w-4" />
                          {diffPercent.toFixed(1)}% bajo presupuesto
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-red-600 flex items-center">
                          <TrendingUp className="mr-1 h-4 w-4" />
                          {Math.abs(diffPercent).toFixed(1)}% sobre presupuesto
                        </div>
                      )
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Gasto Promedio por Evento</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${events.length > 0 ? Math.round(totalActual / events.length).toLocaleString() : "0"}
                </div>
                <div className="text-xs text-muted-foreground">{events.length} eventos en total</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Desviación Presupuestaria</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={totalDeviation >= 0 ? "text-green-600" : "text-red-600"}>
                    {totalDeviation.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalDeviation >= 0 ? "Bajo presupuesto" : "Sobre presupuesto"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Resumen Financiero</TabsTrigger>
              <TabsTrigger value="by-area">Gastos por Área</TabsTrigger>
              <TabsTrigger value="comparison">Comparación de Eventos</TabsTrigger>
              <TabsTrigger value="yearly">Análisis Anual</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="space-y-4">
              <FinancialSummary />
            </TabsContent>
            <TabsContent value="by-area" className="space-y-4">
              <ExpensesByArea />
            </TabsContent>
            <TabsContent value="comparison" className="space-y-4">
              <EventComparison />
            </TabsContent>
            <TabsContent value="yearly" className="space-y-4">
              <YearlyAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
