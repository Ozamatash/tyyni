"use client"

import { useState, useEffect } from "react"
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
  messages: Array<Database['public']['Tables']['messages']['Row'] & {
    sender: Database['public']['Tables']['agent_profiles']['Row'] | null
  }>
}

interface DashboardTicketViewProps {
  ticketId: string
}

export function DashboardTicketView({ ticketId }: DashboardTicketViewProps) {
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
  const [reply, setReply] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string>()
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/dashboard/tickets/${ticketId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch ticket')
        }
        const data = await response.json()
        setTicket(data.ticket)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  const handleUpdateTicket = async (status: TicketStatus) => {
    try {
      const response = await fetch(`/api/dashboard/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update ticket')
      }

      const data = await response.json()
      setTicket(data.ticket)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update ticket')
    }
  }

  const handleSendReply = async () => {
    if (!reply.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/dashboard/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply, isInternal: false })
      })

      if (!response.ok) {
        throw new Error('Failed to send reply')
      }

      const data = await response.json()
      setTicket(prev => prev ? {
        ...prev,
        messages: [...prev.messages, data.message]
      } : null)
      setReply("")
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send reply')
    } finally {
      setIsSending(false)
    }
  }

  const handleInsertMacro = (content: string) => {
    setReply(prev => prev + content)
    setIsMacroModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
        <p className="text-red-600 mb-4">{error || 'Ticket not found'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ticket #{ticketId.substring(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">
            From: {ticket.customer.name} ({ticket.customer.email})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={ticket.status}
            onValueChange={(value: TicketStatus) => handleUpdateTicket(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.sender_type === 'agent'
                  ? 'bg-primary/10 ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {message.sender_type === 'agent'
                    ? message.sender?.name || 'Support Agent'
                    : ticket.customer.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(message.created_at!).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsMacroModalOpen(true)}
            >
              Insert Macro
            </Button>
          </div>
          <Textarea
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSendReply}
              disabled={!reply.trim() || isSending}
            >
              Send Reply
            </Button>
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