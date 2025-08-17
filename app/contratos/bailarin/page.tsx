"use client"

import { useState } from "react"
import { useUnifiedEventStore } from "@/store/unified-event-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface DancerContractData {
  // Datos del contratante (pre-llenados)
  contractorName: string
  contractorAddress: string
  contractorCuit: string
  contractorNotificationAddress: string
  contractorEmail: string

  // Datos del bailarín
  dancerName: string
  dancerDni: string
  dancerAddress: string
  dancerNotificationAddress: string
  dancerEmail: string
  dancerTaxStatus: string

  // Datos del evento
  eventId?: string
  venueName: string
  venueLocation: string
  venueStreet: string
  venueNumber: string
  venueCity: string
  venueProvince: string
  eventDates: string
  startTime: string
  endTime: string

  // Datos económicos
  fee: string
  paymentTerm: string

  // Datos del espectáculo
  showEntries: string
  showDuration: string

  // Fecha de firma
  signDay: string
  signMonth: string
}

export default function DancerContractPage() {
  const { events, venues, addContract } = useUnifiedEventStore()
  const { toast } = useToast()
  const [step, setStep] = useState<"form" | "preview">("form")
  const [selectedEvent, setSelectedEvent] = useState<string>("")

  const [formData, setFormData] = useState<DancerContractData>({
    // Pre-filled contractor data
    contractorName: "FIEBRE DISCO SRL",
    contractorAddress: "DR PEDRO LOPEZ ANAUT 4052",
    contractorCuit: "30-71766278-0",
    contractorNotificationAddress: "DR PEDRO LOPEZ ANAUT 4052",
    contractorEmail: "FIEBREDISCO@GMAIL.COM",

    // Empty fields for user input
    dancerName: "",
    dancerDni: "",
    dancerAddress: "",
    dancerNotificationAddress: "",
    dancerEmail: "",
    dancerTaxStatus: "Monotributista",
    venueName: "",
    venueLocation: "",
    venueStreet: "",
    venueNumber: "",
    venueCity: "",
    venueProvince: "",
    eventDates: "",
    startTime: "",
    endTime: "",
    fee: "",
    paymentTerm: "7 días",
    showEntries: "3",
    showDuration: "15",
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
        venueLocation: event.venue,
        venueStreet: event.address.split(" ").slice(0, -1).join(" "),
        venueNumber: event.address.split(" ").pop() || "",
        venueCity: "CABA",
        venueProvince: "Buenos Aires",
        eventDates: new Date(event.date).toLocaleDateString("es-AR"),
        startTime: event.openingTime,
        endTime: event.closingTime,
      }))
    }
  }

  const handleInputChange = (field: keyof DancerContractData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateContract = () => {
    return `CONTRATO DE LOCACIÓN DE SERVICIOS

Entre ${formData.contractorName}, con domicilio en ${formData.contractorAddress}, CUIT N° ${formData.contractorCuit}, en adelante "EL CONTRATANTE", por una parte, y por la otra ${formData.dancerName}, DNI N° ${formData.dancerDni}, con domicilio en ${formData.dancerAddress}, en adelante "EL BAILARÍN", se celebra el presente contrato de locación de servicios, el que se regirá por las siguientes cláusulas:

PRELIMINAR
Las Partes Manifiestan
a) Que EL CONTRATANTE se dedica a la organización integral de eventos culturales, sociales y corporativos, incluyendo la producción de espectáculos artísticos que requieren la participación de intérpretes escénicos.
b) Que EL BAILARÍN desarrolla su actividad de forma independiente, brindando servicios artísticos en calidad de intérprete de danza en shows, presentaciones en vivo, ensayos y actividades relacionadas, contando con plena capacidad técnica y profesional.
c) Que el CONTRATANTE está interesado a contratar los servicios del BAILARÍN para eventos determinados, sin que ello implique relación de dependencia, subordinación ni exclusividad alguna.

Que en consideración de ello las partes acuerdan

PRIMERA: OBJETO
EL CONTRATANTE contrata los servicios artísticos del BAILARÍN para actuar en las instalaciones de ${formData.venueName} (${formData.venueLocation}) Calle ${formData.venueStreet} N° ${formData.venueNumber} Localidad ${formData.venueCity} Pcia. ${formData.venueProvince} durante ${formData.eventDates} Comenzando su actuación en horario convenido entre las ${formData.startTime} y las ${formData.endTime} horas aproximadamente

SEGUNDA: NATURALEZA DEL VÍNCULO
Las partes declaran expresamente que el presente contrato no implica relación de dependencia de ningún tipo, ni genera vínculo laboral entre ellas. EL BAILARÍN presta servicios con autonomía técnica, artística y organizativa, y asume sus propios riesgos y responsabilidades, conforme a los términos del art. 1251 y siguientes del Código Civil y Comercial de la Nación.

TERCERA: HONORARIOS
EL CONTRATANTE abonará al BAILARÍN la suma de $${formData.fee} por cada función y/o presentación, contra entrega de la factura correspondiente. El pago se realizará mediante transferencia a la cuenta que indique a tales efectos del BAILARÍN y dentro del término de ${formData.paymentTerm} de realizada cada función.

CUARTA: DURACIÓN
EL BAILARÍN se presentará en su forma habitual y ofrecerá un espectáculo de baile con ${formData.showEntries} entradas con una duración aproximada de ${formData.showDuration} minutos.

QUINTA: FACTURACIÓN Y RESPONSABILIDAD TRIBUTARIA
EL BAILARÍN declara estar inscripto ante la AFIP bajo la condición de ${formData.dancerTaxStatus} y se obliga a emitir la factura correspondiente. Cualquier carga fiscal, previsional o impositiva estará a su exclusivo cargo.

SEXTA: OBLIGACIONES DEL BAILARÍN
EL BAILARÍN se compromete a:
a) Cumplir puntualmente con las presentaciones y ensayos establecidos.
b) Actuar con responsabilidad y profesionalismo.
c) Cuidar el vestuario, utilería y demás elementos utilizados y que le sean provistos.
d) No ceder ni subcontratar total o parcialmente sus obligaciones sin consentimiento del CONTRATANTE.

SÉPTIMA: CAMARÍN/VESTUARIO
El CONTRATANTE habilitará un espacio cerrado a la vista del público para cambiarse, con agua corriente, luz eléctrica, sillas y una mesa. El vestuario de fantasía será provisto por el CONTRATANTE.

OCTAVA: FUERZA MAYOR
En caso de fuerza mayor si EL CONTRATANTE suspenderá el baile, festival, recital, etc. el ARTISTA no percibirá suma alguna.

NOVENA: SEGURIDAD Y PREVENCIÓN
EL BAILARÍN se compromete a ejecutar las tareas objeto del presente contrato cumpliendo con las normas básicas de seguridad personal, higiene, prevención de riesgos y cuidado físico, actuando con la debida diligencia y responsabilidad profesional.

DÉCIMA: CONFIDENCIALIDAD Y DERECHOS DE IMAGEN
EL BAILARÍN autoriza a EL CONTRATANTE a utilizar su imagen y nombre con fines promocionales vinculados al espectáculo, sin derecho a compensación adicional. Asimismo, se compromete a guardar confidencialidad sobre los aspectos internos de la producción.

DÉCIMA PRIMERA: RESCISIÓN
Cualquiera de las partes podrá dejar sin efecto el presente contrato de actuación con diez (10) días de anticipación, mediante comunicación fehaciente no dando lugar la anulación a acción judicial alguna.

DÉCIMA SEGUNDA: JURISDICCIÓN
Las partes acuerdan para cualquier divergencia que pudiere surgir con motivo del presente contrato su sometimiento a la Jurisdicción de los Tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.

En prueba de lo cual, las partes firman tres ejemplares de un mismo tenor y a un sólo efecto, en la Ciudad Autónoma de Buenos Aires, a los ${formData.signDay} días del mes de ${formData.signMonth} de 2025.


_____________________                    _____________________
${formData.contractorName}                ${formData.dancerName}
CONTRATANTE                              BAILARÍN`
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

      const fileName = `contrato-bailarin-${formData.dancerName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`
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
      type: "dancer" as const,
      contractorName: formData.contractorName,
      providerName: formData.dancerName,
      eventId: formData.eventId,
      amount: formData.fee,
      date: new Date().toISOString(),
      status: "draft" as const,
      content: generateContract(),
    }

    addContract(contract)

    toast({
      title: "Contrato guardado",
      description: "El contrato ha sido guardado en el sistema",
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
              <CardTitle>Contrato de Locación de Servicios - Bailarín</CardTitle>
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
        <h1 className="text-2xl font-bold">Contrato de Bailarín</h1>
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

        {/* Datos del Bailarín */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Bailarín</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dancerName">Nombre Completo</Label>
              <Input
                id="dancerName"
                value={formData.dancerName}
                onChange={(e) => handleInputChange("dancerName", e.target.value)}
                placeholder="Nombre completo del bailarín"
              />
            </div>
            <div>
              <Label htmlFor="dancerDni">DNI</Label>
              <Input
                id="dancerDni"
                value={formData.dancerDni}
                onChange={(e) => handleInputChange("dancerDni", e.target.value)}
                placeholder="12.345.678"
              />
            </div>
            <div>
              <Label htmlFor="dancerAddress">Domicilio</Label>
              <Input
                id="dancerAddress"
                value={formData.dancerAddress}
                onChange={(e) => handleInputChange("dancerAddress", e.target.value)}
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <Label htmlFor="dancerEmail">Email</Label>
              <Input
                id="dancerEmail"
                type="email"
                value={formData.dancerEmail}
                onChange={(e) => handleInputChange("dancerEmail", e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="dancerTaxStatus">Condición Tributaria</Label>
              <Select
                value={formData.dancerTaxStatus}
                onValueChange={(value) => handleInputChange("dancerTaxStatus", value)}
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
              <Label htmlFor="eventDates">Fecha del Evento</Label>
              <Input
                id="eventDates"
                value={formData.eventDates}
                onChange={(e) => handleInputChange("eventDates", e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <Label htmlFor="startTime">Hora de Inicio</Label>
              <Input
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                placeholder="00:30"
              />
            </div>
            <div>
              <Label htmlFor="endTime">Hora de Fin</Label>
              <Input
                id="endTime"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                placeholder="04:00"
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
                placeholder="50000"
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

        {/* Datos del Espectáculo */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Espectáculo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="showEntries">Número de Entradas</Label>
              <Input
                id="showEntries"
                value={formData.showEntries}
                onChange={(e) => handleInputChange("showEntries", e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <Label htmlFor="showDuration">Duración (minutos)</Label>
              <Input
                id="showDuration"
                value={formData.showDuration}
                onChange={(e) => handleInputChange("showDuration", e.target.value)}
                placeholder="15"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => setStep("preview")}
            disabled={!formData.dancerName || !formData.fee || !formData.venueName}
          >
            Vista Previa del Contrato
          </Button>
        </div>
      </div>
    </div>
  )
}
