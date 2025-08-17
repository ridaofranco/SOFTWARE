import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Mail, Phone, Star } from "lucide-react"

interface ProviderCardProps {
  provider: {
    id: string
    name: string
    lastName: string
    role: string
    category: string
    location: string
    email: string
    phone: string
    rating?: number
    blocked?: boolean
  }
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${provider.blocked ? "opacity-50" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {provider.name} {provider.lastName}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {provider.category}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{provider.role}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{provider.location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{provider.email}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>{provider.phone}</span>
          </div>

          {provider.rating && (
            <div className="flex items-center text-sm text-gray-600">
              <Star className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{provider.rating}/5</span>
            </div>
          )}

          {provider.blocked && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Bloqueado
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
