"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { Database } from "@/types/supabase"
import { useRouter, useParams } from "next/navigation"
import useSWR from 'swr'

type TicketStatus = Database['public']['Enums']['ticket_status']
type TicketPriority = Database['public']['Enums']['ticket_priority']

type TicketWithRelations = Database['public']['Tables']['tickets']['Row'] & {
  customer: {
    name: string
    email: string
  }
  assigned_to: {
    name: string
  } | null
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function TicketListView() {
  const router = useRouter()
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [view, setView] = useState("All Open Tickets")
  const [status, setStatus] = useState<TicketStatus | "All">("All")
  const [priority, setPriority] = useState<TicketPriority | "All">("All")
  const [assignedTo, setAssignedTo] = useState("All")

  // Build query params
  const queryParams = new URLSearchParams()
  queryParams.append("org", orgSlug)
  if (status !== "All") queryParams.append("status", status)
  if (priority !== "All") queryParams.append("priority", priority)
  if (assignedTo !== "All") queryParams.append("assignedTo", assignedTo)

  // Use SWR for data fetching
  const { data, error, mutate } = useSWR<{ tickets: TicketWithRelations[] }>(
    `/api/tickets?${queryParams.toString()}`,
    fetcher
  )

  const handleCreateTicket = async (data: {
    customerName: string
    customerEmail: string
    subject: string
    status: TicketStatus
    priority: TicketPriority
    assignedTo?: string | null
  }) => {
    try {
      const response = await fetch(`/api/tickets?org=${orgSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create ticket')
      
      mutate() // Refresh the list
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Error creating ticket:', error)
      // TODO: Show error toast
    }
  }

  const handleSelectTicket = (id: string) => {
    router.push(`/${orgSlug}/tickets/${id}`)
  }

  // Fetch agents for the organization
  const { data: agentsData } = useSWR<{ agents: Array<{ id: string, name: string }> }>(
    `/api/agents?org=${orgSlug}`,
    fetcher
  )

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
            {agentsData?.agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
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
          {error ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-red-500">Error loading tickets</TableCell>
            </TableRow>
          ) : !data ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Loading tickets...</TableCell>
            </TableRow>
          ) : data.tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No tickets found</TableCell>
            </TableRow>
          ) : (
            data.tickets.map((ticket) => (
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
                <TableCell>{ticket.assigned_to?.name || 'Unassigned'}</TableCell>
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

