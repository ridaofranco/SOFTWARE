import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar } from "lucide-react"

interface VenueCardProps {
  venue: {
    id: string
    nombre: string
    location: string
    capacity: number
    type: "club" | "salon" | "outdoor" | "teatro"
    contact: string
    rating: number
  }
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{venue.nombre}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {venue.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="truncate">{venue.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="mr-2 h-4 w-4" />
            <span>Capacidad: {venue.capacity?.toLocaleString() || "N/A"}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Rating: {venue.rating}/5</span>
          </div>

          <div className="mt-2 text-xs text-gray-500">{venue.contact}</div>
        </div>
      </CardContent>
    </Card>
  )
}
