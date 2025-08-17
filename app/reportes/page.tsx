"use client"

import { useMemo } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, DollarSign, Calendar, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportesPage() {
  const { events, budgetItems, providers, contracts } = useUnifiedEventStore()

  // Calcular métricas financieras
  const financialMetrics = useMemo(() => {
    const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.budgeted, 0)
    const totalSpent = budgetItems.reduce((sum, item) => sum + item.actual, 0)
    const totalVariance = totalSpent - totalBudgeted
    const pendingPayments = budgetItems
      .filter((item) => item.status === "approved")
      .reduce((sum, item) => sum + item.actual, 0)

    // Ingresos por contratos
    const contractRevenue = contracts.reduce((sum, contract) => sum + Number.parseFloat(contract.amount || "0"), 0)

    // Eventos por mes
    const eventsByMonth = events.reduce(
      (acc, event) => {
        const month = new Date(event.date).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Gastos por categoría
    const expensesByCategory = budgetItems.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.actual
        return acc
      },
      {} as Record<string, number>,
    )

    // Proveedores más utilizados
    const providerUsage = events.reduce(
      (acc, event) => {
        event.providers.forEach((provider) => {
          acc[provider.name] = (acc[provider.name] || 0) + 1
        })
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalBudgeted,
      totalSpent,
      totalVariance,
      pendingPayments,
      contractRevenue,
      eventsByMonth,
      expensesByCategory,
      providerUsage,
    }
  }, [events, budgetItems, contracts])

  const exportReport = () => {
    const reportData = {
      fecha: new Date().toLocaleDateString("es-AR"),
      metricas: financialMetrics,
      eventos: events.length,
      proveedores: providers.length,
      contratos: contracts.length,
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-financiero-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes Financieros</h1>
          <p className="text-gray-600">Análisis detallado de ingresos, gastos y métricas de negocio</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuestado Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.totalBudgeted.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">Suma de todos los presupuestos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastado Real</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.totalSpent.toLocaleString("es-AR")}</div>
            <p className={`text-xs ${financialMetrics.totalVariance >= 0 ? "text-red-600" : "text-green-600"}`}>
              {financialMetrics.totalVariance >= 0 ? "+" : ""}${financialMetrics.totalVariance.toLocaleString("es-AR")}{" "}
              vs presupuesto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos por Contratos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialMetrics.contractRevenue.toLocaleString("es-AR")}</div>
            <p className="text-xs text-muted-foreground">{contracts.length} contratos generados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Pago</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${financialMetrics.pendingPayments.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground">Pagos pendientes de aprobación</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Eventos por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Mes</CardTitle>
            <CardDescription>Distribución temporal de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(financialMetrics.eventsByMonth).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(financialMetrics.eventsByMonth))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(financialMetrics.eventsByMonth).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay datos de eventos para mostrar</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gastos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución del presupuesto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(financialMetrics.expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(amount / Math.max(...Object.values(financialMetrics.expensesByCategory))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">${amount.toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                ))}
              {Object.keys(financialMetrics.expensesByCategory).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay datos de gastos para mostrar</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proveedores más utilizados */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores Más Utilizados</CardTitle>
          <CardDescription>Ranking de proveedores por frecuencia de uso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(financialMetrics.providerUsage)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([providerName, count]) => (
                <div key={providerName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{providerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count} eventos</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(financialMetrics.providerUsage))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {Object.keys(financialMetrics.providerUsage).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No hay datos de uso de proveedores para mostrar</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen ejecutivo */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
          <CardDescription>Análisis general del negocio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{events.length}</div>
              <p className="text-sm text-gray-600">Eventos Totales</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{providers.length}</div>
              <p className="text-sm text-gray-600">Proveedores Activos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{contracts.length}</div>
              <p className="text-sm text-gray-600">Contratos Generados</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Insights del Negocio</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Margen promedio:{" "}
                {financialMetrics.totalBudgeted > 0
                  ? (
                      ((financialMetrics.contractRevenue - financialMetrics.totalSpent) /
                        financialMetrics.totalBudgeted) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </li>
              <li>
                • Proveedor más utilizado:{" "}
                {Object.entries(financialMetrics.providerUsage).length > 0
                  ? Object.entries(financialMetrics.providerUsage).sort(([, a], [, b]) => b - a)[0][0]
                  : "N/A"}
              </li>
              <li>
                • Mes más activo:{" "}
                {Object.entries(financialMetrics.eventsByMonth).length > 0
                  ? Object.entries(financialMetrics.eventsByMonth).sort(([, a], [, b]) => b - a)[0][0]
                  : "N/A"}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
