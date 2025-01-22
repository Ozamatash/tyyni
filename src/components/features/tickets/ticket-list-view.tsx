"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { Database } from "@/types/supabase"
import { useOrganization } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

type TicketStatus = Database['public']['Enums']['ticket_status']
type TicketPriority = Database['public']['Enums']['ticket_priority']

type TicketWithRelations = Database['public']['Tables']['tickets']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  assigned_agent: Database['public']['Tables']['agent_profiles']['Row'] | null
}

export function TicketListView() {
  const router = useRouter()
  const { organization } = useOrganization()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [view, setView] = useState("All Open Tickets")
  const [status, setStatus] = useState<TicketStatus | "All">("All")
  const [priority, setPriority] = useState<TicketPriority | "All">("All")
  const [assignedTo, setAssignedTo] = useState("All")
  const [tickets, setTickets] = useState<TicketWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (organization) {
      fetchTickets()
    }
  }, [status, priority, assignedTo, organization])

  const fetchTickets = async () => {
    if (!organization) return

    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append("orgId", organization.id)
      if (status !== "All") params.append("status", status)
      if (priority !== "All") params.append("priority", priority)
      if (assignedTo !== "All") params.append("assignedTo", assignedTo)

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch tickets')
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTicket = async (data: {
    customerName: string
    customerEmail: string
    subject: string
    status: TicketStatus
    priority: TicketPriority
    assignedTo?: string | null
  }) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create ticket')
      
      await fetchTickets() // Refresh the list
    } catch (error) {
      console.error('Error creating ticket:', error)
      // TODO: Show error toast
    }
  }

  const handleSelectTicket = (id: string) => {
    router.push(`/dashboard/tickets/${id}`)
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

        <Select value={status} onValueChange={(value: TicketStatus | "All") => setStatus(value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={(value: TicketPriority | "All") => setPriority(value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Agents</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="alice">Alice</SelectItem>
            <SelectItem value="bob">Bob</SelectItem>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Loading tickets...</TableCell>
            </TableRow>
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No tickets found</TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow 
                key={ticket.id} 
                className="cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
                onClick={() => handleSelectTicket(ticket.id)}
              >
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.customer.email}</TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>{ticket.priority}</TableCell>
                <TableCell>{ticket.assigned_agent?.name || 'Unassigned'}</TableCell>
                <TableCell>{new Date(ticket.created_at!).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
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

