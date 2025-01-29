import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TicketStatus } from "../types"

interface TicketStatusSelectProps {
  value: TicketStatus
  onChange: (value: TicketStatus) => void
}

export function TicketStatusSelect({ value, onChange }: TicketStatusSelectProps) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="solved">Solved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 