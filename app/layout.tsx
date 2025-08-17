import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { MainNav } from "@/components/layout/main-nav"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DER Event Management - Sistema Integral de Gestión de Eventos",
  description: "Plataforma completa para la gestión de eventos, proveedores, contratos y más",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <MainNav />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  )
}
