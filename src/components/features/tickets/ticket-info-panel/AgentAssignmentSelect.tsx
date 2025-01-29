import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useSWR from 'swr'
import { Agent } from "../types"

interface AgentAssignmentSelectProps {
  value: string | null
  onChange: (value: string | null) => void
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function AgentAssignmentSelect({ value, onChange }: AgentAssignmentSelectProps) {
  const { data: agentsData } = useSWR<{ agents: Agent[] }>(
    '/api/agents',
    fetcher
  )

  // Convert null to "unassigned" for the select value
  const selectValue = value || "unassigned"

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">Assigned To</p>
      <Select 
        value={selectValue}
        onValueChange={(value) => onChange(value === "unassigned" ? null : value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select agent" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {agentsData?.agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 