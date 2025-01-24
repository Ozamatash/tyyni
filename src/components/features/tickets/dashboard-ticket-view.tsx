"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InsertMacroModal } from "@/components/modals/insert-macro-modal"
import { Database } from "@/types/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase/client"

type TicketStatus = Database['public']['Enums']['ticket_status']
type TicketPriority = Database['public']['Enums']['ticket_priority']
type Message = Database['public']['Tables']['messages']['Row']

interface TicketWithMessages {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  customer: {
    id: string
    name: string
    email: string
  }
  messages: Message[]
}

interface DashboardTicketViewProps {
  ticketId: string
}

export function DashboardTicketView({ ticketId }: DashboardTicketViewProps) {
  const [ticket, setTicket] = useState<TicketWithMessages | null>(null)
  const [reply, setReply] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string>()
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/dashboard/tickets/${ticketId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch ticket')
        }
        const data = await response.json()
        setTicket(data.ticket)
        setTimeout(scrollToBottom, 100)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    const setupRealtimeSubscription = () => {
      // Clean up existing subscription if any
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }

      const channel = supabase
        .channel(`ticket:${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `ticket_id=eq.${ticketId}`
          },
          async () => {
            // Fetch the complete ticket with relations
            const response = await fetch(`/api/dashboard/tickets/${ticketId}`)
            if (response.ok) {
              const data = await response.json()
              setTicket(data.ticket)
              setTimeout(scrollToBottom, 100)
            }
          }
        )
        .subscribe()

      channelRef.current = channel
    }

    fetchTicket()
    setupRealtimeSubscription()

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
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
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleSendReply = async () => {
    if (!reply.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/dashboard/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply })
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
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSending(false)
    }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{ticket.customer.name}</span>
            <span>·</span>
            <span>{ticket.customer.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={ticket.status}
            onValueChange={(value) => handleUpdateTicket(value as TicketStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
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
                message.sender_type === 'customer'
                  ? 'bg-gray-100'
                  : message.is_internal
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reply</h3>
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
                {isSending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <InsertMacroModal
        open={isMacroModalOpen}
        onOpenChange={setIsMacroModalOpen}
        onSelect={(content) => {
          setReply(prev => prev + content)
          setIsMacroModalOpen(false)
        }}
      />
    </div>
  )
} 