import Link from "next/link"
import { Mail, Phone, Plus, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">WASABI Event Management</h1>
        <nav className="ml-auto flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/events">Events</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/budget">Budget</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/team">Team</Link>
          </Button>
        </nav>
        <Button variant="outline" size="sm">
          Settings
        </Button>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
            <div className="flex items-center gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search team members..." className="pl-8" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Areas</SelectLabel>
                  <SelectItem value="all">All areas</SelectItem>
                  <SelectItem value="Arte">Arte</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="areas">By Area</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    name: "Maria López",
                    role: "Art Director",
                    area: "Arte",
                    email: "maria@example.com",
                    phone: "+54 11 1234-5678",
                    avatar: "/machine-learning-concept.png",
                  },
                  {
                    name: "Carlos Rodríguez",
                    role: "Booking Manager",
                    area: "Booking",
                    email: "carlos@example.com",
                    phone: "+54 11 2345-6789",
                    avatar: "/abstract-color-run.png",
                  },
                  {
                    name: "Ana Martínez",
                    role: "Stage Designer",
                    area: "Arte",
                    email: "ana@example.com",
                    phone: "+54 11 3456-7890",
                    avatar: "/abstract-am.png",
                  },
                  {
                    name: "Juan Pérez",
                    role: "Lighting Technician",
                    area: "Arte",
                    email: "juan@example.com",
                    phone: "+54 11 4567-8901",
                    avatar: "/stylized-jp-initials.png",
                  },
                  {
                    name: "Laura Gómez",
                    role: "Marketing Director",
                    area: "Marketing",
                    email: "laura@example.com",
                    phone: "+54 11 5678-9012",
                    avatar: "/abstract-lg.png",
                  },
                  {
                    name: "Diego Fernández",
                    role: "Security Coordinator",
                    area: "Booking",
                    email: "diego@example.com",
                    phone: "+54 11 6789-0123",
                    avatar: "/placeholder.svg?height=40&width=40&query=DF",
                  },
                ].map((member, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/10">
                            {member.area}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">{member.role}</div>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="list" className="space-y-4">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Area</th>
                      <th className="p-3 text-left font-medium">Email</th>
                      <th className="p-3 text-left font-medium">Phone</th>
                      <th className="p-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Maria López",
                        role: "Art Director",
                        area: "Arte",
                        email: "maria@example.com",
                        phone: "+54 11 1234-5678",
                      },
                      {
                        name: "Carlos Rodríguez",
                        role: "Booking Manager",
                        area: "Booking",
                        email: "carlos@example.com",
                        phone: "+54 11 2345-6789",
                      },
                      {
                        name: "Ana Martínez",
                        role: "Stage Designer",
                        area: "Arte",
                        email: "ana@example.com",
                        phone: "+54 11 3456-7890",
                      },
                      {
                        name: "Juan Pérez",
                        role: "Lighting Technician",
                        area: "Arte",
                        email: "juan@example.com",
                        phone: "+54 11 4567-8901",
                      },
                      {
                        name: "Laura Gómez",
                        role: "Marketing Director",
                        area: "Marketing",
                        email: "laura@example.com",
                        phone: "+54 11 5678-9012",
                      },
                      {
                        name: "Diego Fernández",
                        role: "Security Coordinator",
                        area: "Booking",
                        email: "diego@example.com",
                        phone: "+54 11 6789-0123",
                      },
                    ].map((member, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                          </div>
                        </td>
                        <td className="p-3">{member.role}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-primary/10">
                            {member.area}
                          </Badge>
                        </td>
                        <td className="p-3">{member.email}</td>
                        <td className="p-3">{member.phone}</td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="areas" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Arte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Maria López",
                          role: "Art Director",
                          email: "maria@example.com",
                        },
                        {
                          name: "Ana Martínez",
                          role: "Stage Designer",
                          email: "ana@example.com",
                        },
                        {
                          name: "Juan Pérez",
                          role: "Lighting Technician",
                          email: "juan@example.com",
                        },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Carlos Rodríguez",
                          role: "Booking Manager",
                          email: "carlos@example.com",
                        },
                        {
                          name: "Diego Fernández",
                          role: "Security Coordinator",
                          email: "diego@example.com",
                        },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Marketing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          name: "Laura Gómez",
                          role: "Marketing Director",
                          email: "laura@example.com",
                        },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
