"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InsertMacroModal } from "@/components/modals/insert-macro-modal"
import { Database } from "@/types/supabase"

type TicketStatus = Database['public']['Enums']['ticket_status']
type TicketPriority = Database['public']['Enums']['ticket_priority']
type SenderType = Database['public']['Enums']['sender_type']

type TicketWithRelations = Database['public']['Tables']['tickets']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  assigned_agent: Database['public']['Tables']['agent_profiles']['Row'] | null
  messages: Array<Database['public']['Tables']['ticket_messages']['Row'] & {
    sender: Database['public']['Tables']['agent_profiles']['Row'] | null
  }>
}

interface TicketDetailViewProps {
  ticketId: string
  onBack: () => void
}

export function TicketDetailView({ ticketId, onBack }: TicketDetailViewProps) {
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<TicketStatus>('open')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [agents, setAgents] = useState<Array<Database['public']['Tables']['agent_profiles']['Row']>>([])

  useEffect(() => {
    fetchTicket()
    fetchAgents()
  }, [ticketId])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      if (!response.ok) throw new Error('Failed to fetch agents')
      const data = await response.json()
      setAgents(data)
    } catch (error) {
      console.error('Error fetching agents:', error)
    }
  }

  const fetchTicket = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (!response.ok) throw new Error('Failed to fetch ticket')
      const data = await response.json()
      setTicket(data)
      setStatus(data.status)
      setPriority(data.priority)
      setAssignedTo(data.assigned_to)
    } catch (error) {
      console.error('Error fetching ticket:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTicket = async () => {
    if (!ticket) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          priority,
          assigned_to: assignedTo,
        }),
      })

      if (!response.ok) throw new Error('Failed to update ticket')
      await fetchTicket()
    } catch (error) {
      console.error('Error updating ticket:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendReply = async () => {
    if (!ticket || !reply.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: reply,
          is_internal: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to send reply')
      setReply("")
      await fetchTicket()
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddInternalNote = async () => {
    if (!ticket || !reply.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: reply,
          is_internal: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to add internal note')
      setReply("")
      await fetchTicket()
    } catch (error) {
      console.error('Error adding internal note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInsertMacro = (content: string) => {
    setReply((prev) => prev + (prev ? "\n\n" : "") + content)
  }

  // Sort messages by creation date
  const sortedMessages = ticket?.messages.sort((a, b) => {
    return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
  }) || []

  if (isLoading) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="flex items-center mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Loading ticket...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="flex items-center mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">Ticket {ticket.id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Requester:</p>
              <p>
                {ticket.customer.name} ({ticket.customer.email})
              </p>
            </div>
            <div>
              <p className="font-semibold">Status:</p>
              <Select value={status} onValueChange={(value: TicketStatus) => setStatus(value)}>
                <SelectTrigger className="w-[200px]">
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
            <div>
              <p className="font-semibold">Priority:</p>
              <Select value={priority} onValueChange={(value: TicketPriority) => setPriority(value)}>
                <SelectTrigger className="w-[200px]">
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
            <div>
              <p className="font-semibold">Assigned To:</p>
              <Select 
                value={assignedTo || 'unassigned'} 
                onValueChange={(value) => setAssignedTo(value === 'unassigned' ? null : value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleUpdateTicket} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.is_internal 
                    ? "bg-yellow-100 dark:bg-yellow-900/20" 
                    : "bg-stone-100 dark:bg-stone-800"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {message.sender_type === 'customer' ? ticket.customer.name : 
                     message.sender_type === 'agent' ? message.sender?.name || 'Agent' : 
                     'System'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.created_at!).toLocaleString()}
                  </span>
                </div>
                <p>{message.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply here..."
            className="mb-4"
          />
          <div className="flex justify-between">
            <div>
              <Button onClick={() => setIsMacroModalOpen(true)} className="mr-2">
                Insert Macro
              </Button>
              <Button onClick={handleAddInternalNote} variant="outline" disabled={isSaving}>
                Add Internal Note
              </Button>
            </div>
            <Button onClick={handleSendReply} disabled={isSaving}>
              {isSaving ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <InsertMacroModal
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        onSelect={handleInsertMacro}
      />
    </div>
  )
}

