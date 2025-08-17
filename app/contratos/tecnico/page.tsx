"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface TechnicianContractData {
  // Datos del contratante (pre-llenados)
  contractorName: string
  contractorAddress: string
  contractorCuit: string

  // Datos del técnico
  technicianName: string
  technicianDni: string
  technicianAddress: string
  technicianEmail: string
  technicianTaxStatus: string

  // Datos del evento
  eventId?: string
  venueName: string
  eventDate: string
  workDescription: string

  // Datos económicos
  fee: string
  paymentTerm: string

  // Detalles del trabajo
  workHours: string
  materials: string

  // Fecha de firma
  signDay: string
  signMonth: string
}

export default function TechnicianContractPage() {
  const { events, addContract } = useUnifiedEventStore()
  const { toast } = useToast()
  const [step, setStep] = useState<"form" | "preview">("form")
  const [selectedEvent, setSelectedEvent] = useState<string>("")

  const [formData, setFormData] = useState<TechnicianContractData>({
    // Pre-filled contractor data
    contractorName: "FIEBRE DISCO SRL",
    contractorAddress: "DR PEDRO LOPEZ ANAUT 4052",
    contractorCuit: "30-71766278-0",

    // Technician data
    technicianName: "",
    technicianDni: "",
    technicianAddress: "",
    technicianEmail: "",
    technicianTaxStatus: "Monotributista",

    // Event data
    eventId: "",
    venueName: "",
    eventDate: "",
    workDescription: "montaje y desmontaje de equipos de sonido e iluminación",

    // Economic data
    fee: "",
    paymentTerm: "7 días",

    // Work details
    workHours: "8",
    materials: "herramientas y equipos necesarios para el montaje",

    // Signature
    signDay: new Date().getDate().toString(),
    signMonth: new Date().toLocaleDateString("es-AR", { month: "long" }),
  })

  const handleEventSelect = (eventId: string) => {
    const event = events.find((e) => e.id === eventId)
    if (event) {
      setSelectedEvent(eventId)
      setFormData((prev) => ({
        ...prev,
        eventId: event.id,
        venueName: event.venue,
        eventDate: new Date(event.date).toLocaleDateString("es-AR"),
      }))
    }
  }

  const handleInputChange = (field: keyof TechnicianContractData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateContract = () => {
    return `CONTRATO DE LOCACIÓN DE SERVICIOS - PRESTADOR TÉCNICO

Entre ${formData.contractorName}, con domicilio en ${formData.contractorAddress}, CUIT N° ${formData.contractorCuit}, en adelante "EL CONTRATANTE", por una parte, y por la otra ${formData.technicianName}, DNI N° ${formData.technicianDni}, con domicilio en ${formData.technicianAddress}, en adelante "EL PRESTADOR", se celebra el presente contrato de locación de servicios técnicos, el que se regirá por las siguientes cláusulas:

PRELIMINAR
Las Partes Manifiestan:
a) Que EL CONTRATANTE se dedica a la organización integral de eventos culturales, sociales y corporativos, requiriendo servicios técnicos especializados para el montaje, operación y desmontaje de equipos.
b) Que EL PRESTADOR desarrolla su actividad de forma independiente, brindando servicios técnicos especializados en montaje, operación de equipos de sonido, iluminación y servicios afines, contando con plena capacidad técnica y profesional.
c) Que EL CONTRATANTE está interesado en contratar los servicios del PRESTADOR para eventos determinados, sin que ello implique relación de dependencia, subordinación ni exclusividad alguna.

Que en consideración de ello las partes acuerdan:

PRIMERA: OBJETO
EL CONTRATANTE contrata los servicios técnicos del PRESTADOR para realizar trabajos de ${formData.workDescription} en el evento a realizarse en ${formData.venueName} el día ${formData.eventDate}.

SEGUNDA: NATURALEZA DEL VÍNCULO
Las partes declaran expresamente que el presente contrato no implica relación de dependencia de ningún tipo, ni genera vínculo laboral entre ellas. EL PRESTADOR presta servicios con autonomía técnica y organizativa, y asume sus propios riesgos y responsabilidades, conforme a los términos del art. 1251 y siguientes del Código Civil y Comercial de la Nación.

TERCERA: HONORARIOS
EL CONTRATANTE abonará al PRESTADOR la suma de $${formData.fee} por los servicios prestados, contra entrega de la factura correspondiente. El pago se realizará mediante transferencia a la cuenta que indique a tales efectos EL PRESTADOR y dentro del término de ${formData.paymentTerm} de finalizado el trabajo.

CUARTA: DURACIÓN Y MODALIDAD
Los servicios se prestarán durante ${formData.workHours} horas aproximadamente, incluyendo el uso de ${formData.materials}. EL PRESTADOR se compromete a cumplir con los horarios establecidos y las especificaciones técnicas requeridas.

QUINTA: FACTURACIÓN Y RESPONSABILIDAD TRIBUTARIA
EL PRESTADOR declara estar inscripto ante la AFIP bajo la condición de ${formData.technicianTaxStatus} y se obliga a emitir la factura correspondiente. Cualquier carga fiscal, previsional o impositiva estará a su exclusivo cargo.

SEXTA: OBLIGACIONES DEL PRESTADOR
EL PRESTADOR se compromete a:
a) Ejecutar los trabajos con la debida diligencia profesional y cumpliendo con todas las normas de seguridad aplicables.
b) Proveer las herramientas y equipos necesarios para la correcta ejecución de los trabajos.
c) Cumplir puntualmente con los horarios establecidos.
d) Mantener confidencialidad sobre los aspectos técnicos y organizativos del evento.
e) No ceder ni subcontratar total o parcialmente sus obligaciones sin consentimiento del CONTRATANTE.

SÉPTIMA: SEGURIDAD Y PREVENCIÓN
EL PRESTADOR se compromete a ejecutar las tareas objeto del presente contrato cumpliendo con las normas básicas de seguridad laboral, higiene, prevención de riesgos y cuidado de los equipos, actuando con la debida diligencia y responsabilidad profesional.

OCTAVA: RESPONSABILIDAD
EL PRESTADOR será responsable por los daños que pudiera ocasionar a terceros o a los equipos por negligencia o impericia en el cumplimiento de sus obligaciones.

NOVENA: FUERZA MAYOR
En caso de fuerza mayor que impida la realización del evento, las partes quedarán liberadas de sus obligaciones sin derecho a compensación alguna.

DÉCIMA: RESCISIÓN
Cualquiera de las partes podrá dejar sin efecto el presente contrato con cuarenta y ocho (48) horas de anticipación, mediante comunicación fehaciente, sin que ello dé lugar a acción judicial alguna.

DÉCIMA PRIMERA: JURISDICCIÓN
Las partes acuerdan para cualquier divergencia que pudiere surgir con motivo del presente contrato su sometimiento a la Jurisdicción de los Tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.

En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto, en la Ciudad Autónoma de Buenos Aires, a los ${formData.signDay} días del mes de ${formData.signMonth} de 2025.


_____________________                    _____________________
${formData.contractorName}                ${formData.technicianName}
CONTRATANTE                              PRESTADOR TÉCNICO`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateContract())
    toast({
      title: "Contrato copiado",
      description: "El contrato ha sido copiado al portapapeles",
    })
  }

  const downloadContract = async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      const contractText = generateContract()

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)

      const lines = doc.splitTextToSize(contractText, 180)
      let yPosition = 20
      const pageHeight = doc.internal.pageSize.height
      const lineHeight = 4

      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(lines[i], 15, yPosition)
        yPosition += lineHeight
      }

      const fileName = `contrato-tecnico-${formData.technicianName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)

      toast({
        title: "PDF generado",
        description: "El contrato ha sido descargado como PDF",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const saveContract = () => {
    const contract = {
      type: "technician" as const,
      contractorName: formData.contractorName,
      providerName: formData.technicianName,
      eventId: formData.eventId || undefined,
      amount: formData.fee,
      date: new Date().toISOString(),
      status: "draft" as const,
      content: generateContract(),
    }

    addContract(contract)

    toast({
      title: "Contrato guardado",
      description: "El contrato técnico ha sido guardado en el sistema",
    })
  }

  if (step === "preview") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setStep("form")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al formulario
          </Button>
          <h1 className="text-2xl font-bold">Vista previa del contrato</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Contrato de Locación de Servicios - Prestador Técnico</CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button onClick={downloadContract} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button onClick={saveContract}>Guardar en Sistema</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
              {generateContract()}
            </pre>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/contratos">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Contrato de Prestador Técnico</h1>
      </div>

      <div className="space-y-6">
        {/* Selección de evento */}
        <Card>
          <CardHeader>
            <CardTitle>Vincular con Evento (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvent} onValueChange={handleEventSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar evento existente" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.venue} - {new Date(event.date).toLocaleDateString("es-AR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Datos del Prestador Técnico */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Prestador Técnico</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="technicianName">Nombre Completo</Label>
              <Input
                id="technicianName"
                value={formData.technicianName}
                onChange={(e) => handleInputChange("technicianName", e.target.value)}
                placeholder="Nombre completo del técnico"
              />
            </div>
            <div>
              <Label htmlFor="technicianDni">DNI</Label>
              <Input
                id="technicianDni"
                value={formData.technicianDni}
                onChange={(e) => handleInputChange("technicianDni", e.target.value)}
                placeholder="12.345.678"
              />
            </div>
            <div>
              <Label htmlFor="technicianAddress">Domicilio</Label>
              <Input
                id="technicianAddress"
                value={formData.technicianAddress}
                onChange={(e) => handleInputChange("technicianAddress", e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <Label htmlFor="technicianEmail">Email</Label>
              <Input
                id="technicianEmail"
                type="email"
                value={formData.technicianEmail}
                onChange={(e) => handleInputChange("technicianEmail", e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="technicianTaxStatus">Condición Tributaria</Label>
              <Select
                value={formData.technicianTaxStatus}
                onValueChange={(value) => handleInputChange("technicianTaxStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monotributista">Monotributista</SelectItem>
                  <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                  <SelectItem value="Exento">Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Datos del Evento */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Evento</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venueName">Nombre del Venue</Label>
              <Input
                id="venueName"
                value={formData.venueName}
                onChange={(e) => handleInputChange("venueName", e.target.value)}
                placeholder="Nombre del lugar"
              />
            </div>
            <div>
              <Label htmlFor="eventDate">Fecha del Evento</Label>
              <Input
                id="eventDate"
                value={formData.eventDate}
                onChange={(e) => handleInputChange("eventDate", e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="workDescription">Descripción del Trabajo</Label>
              <Textarea
                id="workDescription"
                value={formData.workDescription}
                onChange={(e) => handleInputChange("workDescription", e.target.value)}
                placeholder="Descripción detallada de los servicios técnicos a prestar"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Datos Económicos */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Económicos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fee">Honorarios ($)</Label>
              <Input
                id="fee"
                value={formData.fee}
                onChange={(e) => handleInputChange("fee", e.target.value)}
                placeholder="80000"
              />
            </div>
            <div>
              <Label htmlFor="paymentTerm">Plazo de Pago</Label>
              <Select value={formData.paymentTerm} onValueChange={(value) => handleInputChange("paymentTerm", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inmediato">Inmediato</SelectItem>
                  <SelectItem value="7 días">7 días</SelectItem>
                  <SelectItem value="15 días">15 días</SelectItem>
                  <SelectItem value="30 días">30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del Trabajo */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Trabajo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workHours">Horas de Trabajo</Label>
              <Input
                id="workHours"
                value={formData.workHours}
                onChange={(e) => handleInputChange("workHours", e.target.value)}
                placeholder="8"
              />
            </div>
            <div>
              <Label htmlFor="materials">Materiales y Equipos</Label>
              <Input
                id="materials"
                value={formData.materials}
                onChange={(e) => handleInputChange("materials", e.target.value)}
                placeholder="herramientas y equipos necesarios"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => setStep("preview")}
            disabled={!formData.technicianName || !formData.fee || !formData.venueName}
          >
            Vista Previa del Contrato
          </Button>
        </div>
      </div>
    </div>
  )
}
