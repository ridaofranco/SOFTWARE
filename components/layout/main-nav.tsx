"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  FileText,
  BarChart3,
  Zap,
  Settings,
  CheckSquare,
  MessageSquare,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Eventos", href: "/events", icon: Calendar },
  { name: "Gestión Rápida", href: "/gestion-rapida", icon: Zap },
  { name: "Tareas", href: "/tareas", icon: CheckSquare },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Proveedores", href: "/proveedores", icon: Users },
  { name: "Venues", href: "/venues", icon: MapPin },
  { name: "Contratos", href: "/contratos", icon: FileText },
  { name: "Reportes", href: "/reportes", icon: BarChart3 },
  { name: "Calendario", href: "/calendario", icon: Calendar },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DER</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Event Management</span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-orange-100 text-orange-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Franco</span> - SOMOS DER
            </div>
            <Link href="/configuracion" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
