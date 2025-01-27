"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InsertMacroModal } from "@/components/modals/insert-macro-modal"
import { Database } from "@/types/supabase"
import { useParams } from "next/navigation"
import useSWR from 'swr'

type TicketStatus = Database['public']['Enums']['ticket_status']
type TicketPriority = Database['public']['Enums']['ticket_priority']
type SenderType = Database['public']['Enums']['sender_type']

type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender: {
    id: string
    name: string
    email: string
  } | null
}

type TicketWithRelations = Database['public']['Tables']['tickets']['Row'] & {
  customer: {
    name: string
    email: string
  }
  assigned_to: Pick<AgentProfile, 'id' | 'name'> | null
  messages: Message[]
}

interface TicketDetailViewProps {
  ticketId: string
  onBack: () => void
  agentId: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function TicketDetailView({ ticketId, onBack, agentId }: TicketDetailViewProps) {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<TicketStatus>('open')
  const [priority, setPriority] = useState<TicketPriority>('normal')
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch agents for the organization
  const { data: agentsData } = useSWR<{ agents: Array<{ id: string, name: string }> }>(
    '/api/agents',
    fetcher
  )

  // Fetch ticket data
  const { data: ticketData, mutate: mutateTicket } = useSWR<{ ticket: TicketWithRelations }>(
    `/api/tickets/${ticketId}`,
    fetcher
  )

  // Fetch messages
  const { data: messagesData, mutate: mutateMessages } = useSWR<{ messages: Message[] }>(
    `/api/tickets/${ticketId}/messages`,
    fetcher
  )

  useEffect(() => {
    if (ticketData?.ticket) {
      setTicket({
        ...ticketData.ticket,
        messages: messagesData?.messages || []
      })
      setStatus(ticketData.ticket.status)
      setPriority(ticketData.ticket.priority)
      setAssignedTo(ticketData.ticket.assigned_to?.id || null)
      setIsLoading(false)
    }
  }, [ticketData, messagesData])

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
      
      mutateTicket()
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
          content: reply,
          is_internal: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to send reply')
      
      setReply("")
      mutateMessages()
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
          content: reply,
          is_internal: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to add internal note')
      
      setReply("")
      mutateMessages()
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
  const sortedMessages = messagesData?.messages.sort((a, b) => {
    return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
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
                  {agentsData?.agents.map((agent) => (
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
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMessages.map((message) => (
              <div 
                key={message.id} 
                className={`p-4 rounded-lg ${
                  message.is_internal 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {message.sender?.name || 'System'}
                      {message.is_internal && ' (Internal Note)'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(message.created_at || '').toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <Textarea
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsMacroModalOpen(true)}>
                Insert Macro
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleAddInternalNote}
                  disabled={isSaving || !reply.trim()}
                >
                  Add Internal Note
                </Button>
                <Button 
                  onClick={handleSendReply}
                  disabled={isSaving || !reply.trim()}
                >
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InsertMacroModal
        open={isMacroModalOpen}
        onOpenChange={setIsMacroModalOpen}
        onSelect={handleInsertMacro}
      />
    </div>
  )
}

