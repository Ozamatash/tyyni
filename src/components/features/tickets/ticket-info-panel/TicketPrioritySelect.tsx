import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TicketPriority } from "../types"

interface TicketPrioritySelectProps {
  value: TicketPriority
  onChange: (value: TicketPriority) => void
}

export function TicketPrioritySelect({ value, onChange }: TicketPrioritySelectProps) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 