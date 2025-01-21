"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CustomerTicketListProps {
  status: "active" | "closed"
  onSelectTicket: (ticketId: string) => void
}

// Mock data - replace with real data later
const mockTickets = [
  {
    id: "1",
    title: "Login Issue",
    status: "active",
    priority: "high",
    lastUpdated: "2024-03-20",
  },
  {
    id: "2",
    title: "Feature Request",
    status: "active",
    priority: "medium",
    lastUpdated: "2024-03-19",
  },
  {
    id: "3",
    title: "Bug Report",
    status: "closed",
    priority: "low",
    lastUpdated: "2024-03-18",
  },
]

export function CustomerTicketList({ status, onSelectTicket }: CustomerTicketListProps) {
  const filteredTickets = mockTickets.filter((ticket) => ticket.status === status)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {status === "active" ? "Active Tickets" : "Closed Tickets"}
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>
                <Badge variant={
                  ticket.priority === "high" ? "destructive" :
                  ticket.priority === "medium" ? "default" :
                  "secondary"
                }>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>{ticket.lastUpdated}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredTickets.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No {status} tickets found
        </div>
      )}
    </div>
  )
} 