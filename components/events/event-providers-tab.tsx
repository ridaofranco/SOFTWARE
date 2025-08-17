"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCheck, Plus } from "lucide-react"

interface EventProvidersTabProps {
  eventId: string
}

export function EventProvidersTab({ eventId }: EventProvidersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Gestión de Proveedores
        </CardTitle>
        <CardDescription>Asignar, actualizar y gestionar proveedores para este evento</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Proveedores</h3>
          <p className="text-muted-foreground mb-4">La gestión de proveedores se implementará en la siguiente fase</p>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Asignar Proveedor
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
