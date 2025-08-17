import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { User } from "@/hooks/use-collaboration"

interface PresenceIndicatorProps {
  users: Array<{
    user: User
    isActive: boolean
    lastSeen: Date
  }>
  maxVisible?: number
}

export function PresenceIndicator({ users, maxVisible = 3 }: PresenceIndicatorProps) {
  const activeUsers = users.filter((u) => u.isActive)
  const visibleUsers = activeUsers.slice(0, maxVisible)
  const hiddenCount = Math.max(0, activeUsers.length - maxVisible)

  if (activeUsers.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {visibleUsers.map(({ user }) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarFallback className="text-xs font-medium text-white" style={{ backgroundColor: user.color }}>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name} está editando</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="w-8 h-8 border-2 border-white bg-gray-100">
                  <AvatarFallback className="text-xs font-medium text-gray-600">+{hiddenCount}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {hiddenCount} usuario{hiddenCount > 1 ? "s" : ""} más
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Badge variant="outline" className="text-xs">
          {activeUsers.length} colaborando
        </Badge>
      </div>
    </TooltipProvider>
  )
}
