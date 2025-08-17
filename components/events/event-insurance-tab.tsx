"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Plus } from "lucide-react"

interface EventInsuranceTabProps {
  eventId: string
}

export function EventInsuranceTab({ eventId }: EventInsuranceTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Gestión de Seguros
        </CardTitle>
        <CardDescription>Padrón de trabajadores y niveles de cobertura</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Seguros y Coberturas</h3>
          <p className="text-muted-foreground mb-4">La gestión de seguros se implementará en la siguiente fase</p>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Cobertura
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
