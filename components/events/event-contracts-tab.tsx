"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCheck, Plus } from "lucide-react"

interface EventContractsTabProps {
  eventId: string
}

export function EventContractsTab({ eventId }: EventContractsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Gestión de Contratos
        </CardTitle>
        <CardDescription>Generar contratos desde padrón de proveedores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Contratos</h3>
          <p className="text-muted-foreground mb-4">La gestión de contratos se implementará en la siguiente fase</p>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Generar Contrato
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
