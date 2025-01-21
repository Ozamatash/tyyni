import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"

// Dummy data for tickets
const tickets = [
  {
    id: "T-1001",
    subject: "Cannot access account",
    requester: "john@example.com",
    status: "Open",
    priority: "High",
    assignedTo: "Alice",
    createdAt: "2023-04-01T10:00:00Z",
  },
  {
    id: "T-1002",
    subject: "Feature request",
    requester: "sarah@example.com",
    status: "Pending",
    priority: "Normal",
    assignedTo: "Bob",
    createdAt: "2023-04-02T14:30:00Z",
  },
  // Add more dummy tickets as needed
]

interface TicketListViewProps {
  onSelectTicket: (ticketId: string) => void
}

export function TicketListView({ onSelectTicket }: TicketListViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [view, setView] = useState("All Open Tickets")
  const [status, setStatus] = useState("All")
  const [priority, setPriority] = useState("All")
  const [assignedTo, setAssignedTo] = useState("All")

  const handleCreateTicket = (data: any) => {
    console.log('Creating ticket:', data)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Ticket</Button>
      </div>
      <div className="flex space-x-4">
        <Select value={view} onValueChange={setView}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Unassigned">All Unassigned</SelectItem>
            <SelectItem value="My Open Tickets">My Open Tickets</SelectItem>
            <SelectItem value="All Open Tickets">All Open Tickets</SelectItem>
            <SelectItem value="Recently Solved">Recently Solved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Solved">Solved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Assigned to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Unassigned">Unassigned</SelectItem>
            <SelectItem value="Alice">Alice</SelectItem>
            <SelectItem value="Bob">Bob</SelectItem>
            {/* Add more agents as needed */}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow 
              key={ticket.id} 
              className="cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
              onClick={() => onSelectTicket(ticket.id)}
            >
              <TableCell>{ticket.id}</TableCell>
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>{ticket.requester}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>{ticket.assignedTo}</TableCell>
              <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateTicketModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  )
}

