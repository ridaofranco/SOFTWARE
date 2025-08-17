import { AutomatedTasksWidget } from "@/components/automated-tasks-widget"

export default function Dashboard() {
  return (
    <div>
      {/* Existing cards here */}
      {/* Widget de Eventos Fuera de CABA */}
      <AutomatedTasksWidget showAll={true} compact={true} />
      {/* Rest of code here */}
    </div>
  )
}
