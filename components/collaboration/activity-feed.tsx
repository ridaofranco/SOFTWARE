import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, FileText, Users, Edit, CheckCircle } from "lucide-react"

interface Activity {
  id: string
  type: "comment" | "edit" | "join" | "resolve" | "create"
  user: {
    id: string
    name: string
    color: string
  }
  timestamp: Date
  description: string
  documentTitle?: string
}

interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const recentActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxItems)

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="w-4 h-4 text-blue-600" />
      case "edit":
        return <Edit className="w-4 h-4 text-green-600" />
      case "join":
        return <Users className="w-4 h-4 text-purple-600" />
      case "resolve":
        return <CheckCircle className="w-4 h-4 text-orange-600" />
      case "create":
        return <FileText className="w-4 h-4 text-indigo-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "comment":
        return "text-blue-600"
      case "edit":
        return "text-green-600"
      case "join":
        return "text-purple-600"
      case "resolve":
        return "text-orange-600"
      case "create":
        return "text-indigo-600"
      default:
        return "text-gray-600"
    }
  }

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay actividad reciente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Actividad Reciente
          <Badge variant="outline" className="text-xs">
            {recentActivities.length} eventos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs" style={{ backgroundColor: activity.user.color, color: "white" }}>
                  {activity.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="text-sm font-medium">{activity.user.name}</span>
                  <span className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{activity.description}</p>

                {activity.documentTitle && <p className="text-xs text-gray-500 mt-1">en {activity.documentTitle}</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
