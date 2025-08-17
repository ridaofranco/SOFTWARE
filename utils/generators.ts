export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateCronograma(eventData: any, venue: string): string {
  return `CRONOGRAMA OPERATIVO - ${venue}
Fecha: ${formatDate(new Date(eventData.date))}

${eventData.truckArrivalTime} - Llegada de camión
${eventData.setupStartTime} - Inicio de montaje
${eventData.technicalTestsTime} - Pruebas técnicas
${eventData.openingTime} - Apertura al público
${eventData.closingTime} - Cierre del evento
${eventData.teardownTime} - Inicio de desarme

PROVEEDORES:
${eventData.providers.map((p: any) => `- ${p.name}: ${p.item}`).join("\n")}

NOTAS:
${eventData.notes || "Sin notas adicionales"}
`
}

export function generateAllMensajes(eventData: any, venue: string, producer: string): string {
  return `MENSAJES PARA PROVEEDORES - ${venue}

Hola! Te confirmo los detalles del evento:

📅 Fecha: ${formatDate(new Date(eventData.date))}
📍 Venue: ${venue}
📍 Dirección: ${eventData.address}
🚛 Punto de carga: ${eventData.loadingPoint}

⏰ HORARIOS:
- Llegada camión: ${eventData.truckArrivalTime}
- Montaje: ${eventData.setupStartTime}
- Apertura: ${eventData.openingTime}
- Cierre: ${eventData.closingTime}
- Desarme: ${eventData.teardownTime}

Cualquier consulta, contactame!
${producer}
`
}
