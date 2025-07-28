"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, Calendar, DollarSign, CheckSquare, BarChart2, MessageSquare, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useChatStore, useCurrentUser } from "@/lib/chat-service"
import { Badge } from "@/components/ui/badge"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Obtener el número de mensajes no leídos
  const currentUser = useCurrentUser()
  const getUnreadMessagesCount = useChatStore((state) => state.getUnreadMessagesCount)
  const unreadCount = getUnreadMessagesCount(currentUser.id)

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      active: pathname === "/",
    },
    {
      href: "/events",
      label: "Eventos",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      active: pathname === "/events" || pathname.startsWith("/events/"),
    },
    {
      href: "/budget",
      label: "Presupuesto",
      icon: <DollarSign className="mr-2 h-4 w-4" />,
      active: pathname === "/budget",
    },
    {
      href: "/tasks",
      label: "Tareas",
      icon: <CheckSquare className="mr-2 h-4 w-4" />,
      active: pathname === "/tasks",
    },
    {
      href: "/analytics",
      label: "Analítica",
      icon: <BarChart2 className="mr-2 h-4 w-4" />,
      active: pathname === "/analytics",
    },
    {
      href: "/vendors",
      label: "Proveedores",
      icon: <Users className="mr-2 h-4 w-4" />,
      active: pathname === "/vendors",
    },
    {
      href: "/chat",
      label: "Chat",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      active: pathname === "/chat",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Club de la Serpiente</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar menú</span>
          </Button>
        </div>
        <nav className="mt-8 flex flex-col gap-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              className="justify-start"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={route.href} className="relative">
                {route.icon}
                {route.label}
                {route.badge && (
                  <Badge
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    variant="destructive"
                  >
                    {route.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
