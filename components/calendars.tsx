import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CalendarsProps {
  calendars: {
    name: string
    items: string[]
  }[]
}

export function Calendars({ calendars }: CalendarsProps) {
  return (
    <div className="space-y-4">
      <div className="font-medium">Calendars</div>
      <div className="space-y-2">
        {calendars.map((calendar) => (
          <Collapsible key={calendar.name} defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full items-center justify-between p-2">
                <span className="text-sm font-medium">{calendar.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1 pl-4">
                {calendar.items.map((item) => (
                  <Button key={item} variant="ghost" className="flex w-full justify-start gap-2 px-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm">{item}</span>
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
