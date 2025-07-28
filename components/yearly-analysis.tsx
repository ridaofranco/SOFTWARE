"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function YearlyAnalysis() {
  const [selectedYear, setSelectedYear] = useState("2025")

  // Datos de ejemplo para análisis anual
  const yearlyData = {
    "2025": {
      events: [
        { name: "HAEDO - 25/04", budget: 4450000, actual: 4623000 },
        { name: "LA PLATA - 02/05 ; 03/05", budget: 5850000, actual: 5720000 },
        { name: "CABA - 15/03", budget: 4980000, actual: 5120000 },
        { name: "ROSARIO - 22/02", budget: 4350000, actual: 4280000 },
        { name: "CÓRDOBA - 18/01", budget: 4120000, actual: 4250000 },
      ],
      quarters: [
        { quarter: "Q1", budget: 8470000, actual: 8530000 },
        { quarter: "Q2", budget: 10430000, actual: 10743000 },
        { quarter: "Q3", budget: 2850000, actual: 2720000 },
        { quarter: "Q4", budget: 2000000, actual: 2000000 },
      ],
      areas: {
        arte: { budget: 11250000, actual: 11250000 },
        booking: { budget: 8750000, actual: 8750000 },
        marketing: { budget: 3750000, actual: 3993000 },
      },
    },
    "2024": {
      events: [
        { name: "CABA - 20/10", budget: 3950000, actual: 4120000 },
        { name: "ROSARIO - 15/08", budget: 3850000, actual: 3780000 },
        { name: "LA PLATA - 22/06", budget: 4250000, actual: 4350000 },
        { name: "HAEDO - 18/03", budget: 3750000, actual: 3650000 },
      ],
      quarters: [
        { quarter: "Q1", budget: 3750000, actual: 3650000 },
        { quarter: "Q2", budget: 4250000, actual: 4350000 },
        { quarter: "Q3", budget: 3850000, actual: 3780000 },
        { quarter: "Q4", budget: 3950000, actual: 4120000 },
      ],
      areas: {
        arte: { budget: 8500000, actual: 8600000 },
        booking: { budget: 5300000, actual: 5200000 },
        marketing: { budget: 2000000, actual: 2100000 },
      },
    },
  }

  const data = yearlyData[selectedYear]

  // Calcular totales
  const totalBudget = data.events.reduce((sum, event) => sum + event.budget, 0)
  const totalActual = data.events.reduce((sum, event) => sum + event.actual, 0)
  const totalDifference = totalActual - totalBudget
  const totalPercentageDiff = (totalDifference / totalBudget) * 100

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Seleccionar año" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis Anual {selectedYear}</CardTitle>
          <CardDescription>Resumen financiero del año</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-medium">Eventos del Año</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evento</TableHead>
                      <TableHead className="text-right">Presupuesto</TableHead>
                      <TableHead className="text-right">Gasto Real</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.events.map((event) => {
                      const diff = event.actual - event.budget
                      const diffPercent = (diff / event.budget) * 100

                      return (
                        <TableRow key={event.name}>
                          <TableCell className="font-medium">{event.name}</TableCell>
                          <TableCell className="text-right">${event.budget.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${event.actual.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className={diff < 0 ? "text-green-600" : "text-red-600"}>
                              {diff < 0 ? "" : "+"}${diff.toLocaleString()} ({diffPercent.toFixed(1)}%)
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">${totalBudget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${totalActual.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={totalDifference < 0 ? "text-green-600" : "text-red-600"}>
                          {totalDifference < 0 ? "" : "+"}${totalDifference.toLocaleString()} (
                          {totalPercentageDiff.toFixed(1)}%)
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-medium">Análisis por Trimestre</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trimestre</TableHead>
                      <TableHead className="text-right">Presupuesto</TableHead>
                      <TableHead className="text-right">Gasto Real</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.quarters.map((quarter) => {
                      const diff = quarter.actual - quarter.budget
                      const diffPercent = (diff / quarter.budget) * 100

                      return (
                        <TableRow key={quarter.quarter}>
                          <TableCell className="font-medium">{quarter.quarter}</TableCell>
                          <TableCell className="text-right">${quarter.budget.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${quarter.actual.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className={diff < 0 ? "text-green-600" : "text-red-600"}>
                              {diff < 0 ? "" : "+"}${diff.toLocaleString()} ({diffPercent.toFixed(1)}%)
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6">
                <h3 className="mb-4 text-lg font-medium">Distribución por Área</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Área</TableHead>
                        <TableHead className="text-right">Presupuesto</TableHead>
                        <TableHead className="text-right">Gasto Real</TableHead>
                        <TableHead className="text-right">% del Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(data.areas).map(([area, values]) => {
                        const areaName = area.charAt(0).toUpperCase() + area.slice(1)
                        const percentage = (values.actual / totalActual) * 100

                        return (
                          <TableRow key={area}>
                            <TableCell className="font-medium">{areaName}</TableCell>
                            <TableCell className="text-right">${values.budget.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${values.actual.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
