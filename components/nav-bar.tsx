import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsMenu } from "@/components/notifications"
import { MessageSquare, Users } from "lucide-react"
import { useChatStore, useCurrentUser } from "@/lib/chat-service"
import { Badge } from "@/components/ui/badge"
import { MobileNav } from "@/components/mobile-nav"

interface NavBarProps {
  showSettings?: boolean
}

export function NavBar({ showSettings = true }: NavBarProps) {
  // Obtener el número de mensajes no leídos
  const currentUser = useCurrentUser()
  const getUnreadMessagesCount = useChatStore((state) => state.getUnreadMessagesCount)
  const unreadCount = getUnreadMessagesCount(currentUser.id)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <MobileNav />
      <h1 className="text-xl font-semibold truncate">Club de la Serpiente</h1>
      <nav className="ml-auto hidden md:flex gap-2">
        <Button variant="ghost" asChild>
          <Link href="/">Dashboard</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/events">Eventos</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/budget">Presupuesto</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/tasks">Tareas</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/analytics">Analítica</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/vendors">
            <Users className="mr-2 h-4 w-4" />
            Proveedores
          </Link>
        </Button>
        <Button variant="ghost" asChild className="relative">
          <Link href="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
            {unreadCount > 0 && (
              <Badge
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            )}
          </Link>
        </Button>
      </nav>
      <div className="flex items-center gap-2">
        <NotificationsMenu />
        <ThemeToggle />
        {showSettings && (
          <Button variant="outline" size="sm" className="hidden md:flex">
            Configuración
          </Button>
        )}
      </div>
    </header>
  )
}
