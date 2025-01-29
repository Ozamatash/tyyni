"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CreateTicketModal } from "@/components/modals/create-ticket-modal"
import { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"
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

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(
        errorData.error || `HTTP error! status: ${res.status}`
      )
    }
    const data = await res.json()
    if (!data) throw new Error('No data received')
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

export function TicketListView() {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [view, setView] = useState("All Open Tickets")
  const [status, setStatus] = useState<TicketStatus | "All">("All")
  const [priority, setPriority] = useState<TicketPriority | "All">("All")
  const [assignedTo, setAssignedTo] = useState("All")

  // Build query params
  const queryParams = new URLSearchParams()
  if (view === "All Unassigned") queryParams.append("unassigned", "true")
  if (view === "My Open Tickets") queryParams.append("myTickets", "true")
  if (view === "Recently Solved") queryParams.append("recentlySolved", "true")
  if (status !== "All") queryParams.append("status", status)
  if (priority !== "All") queryParams.append("priority", priority)
  if (assignedTo !== "All") {
    if (assignedTo === "unassigned") {
      queryParams.append("unassigned", "true")
    } else {
      queryParams.append("assignedTo", assignedTo)
    }
  }

  // Use SWR for data fetching with proper query string
  const { data, error, mutate, isLoading } = useSWR<{ tickets: TicketWithRelations[] }>(
    `/api/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    fetcher,
    { 
      refreshInterval: 30000, // Refresh every 30 seconds
      keepPreviousData: true
    }
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
      const response = await fetch('/api/tickets', {
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
    router.push(`/dashboard/tickets/${id}`)
  }

  // Fetch agents for the organization - remove org param as it's handled by Clerk auth
  const { data: agentsData } = useSWR<{ agents: Array<{ id: string, name: string }> }>(
    '/api/agents',
    fetcher
  )

  return (
    <div className="space-y-4 p-6">
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
              <TableCell colSpan={7} className="text-center text-red-500">
                Error loading tickets: {error.message}
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Loading tickets...</TableCell>
            </TableRow>
          ) : !data?.tickets?.length ? (
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

