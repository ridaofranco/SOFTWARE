"use client"
import { NavBar } from "@/components/nav-bar"
import { ExportButton } from "@/components/export-button"
import { TasksList } from "@/components/tasks-list"
import { useEventStore } from "@/lib/event-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TasksPage() {
  const tasks = useEventStore((state) => state.tasks)

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Tareas Importantes</h2>
            <ExportButton type="tasks" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Todas las Tareas</CardTitle>
              <CardDescription>
                Gestiona tareas importantes que requieren atención, incluso cuando los eventos no están activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TasksList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
