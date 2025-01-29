"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Database } from "@/types/supabase"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import useSWR from 'swr'
import { TicketInfoPanel } from "./ticket-info-panel/TicketInfoPanel"
import { ChatPanel } from "./chat-panel/ChatPanel"
import { TicketData, Message } from "./types"

interface TicketDetailViewProps {
  ticketId: string
  onBack: () => void
  agentId: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function TicketDetailView({ ticketId, onBack, agentId }: TicketDetailViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch ticket data
  const { data: ticketData, mutate: mutateTicket } = useSWR<{ ticket: TicketData }>(
    `/api/tickets/${ticketId}`,
    fetcher
  )

  // Fetch messages
  const { data: messagesData, mutate: mutateMessages } = useSWR<{ messages: Message[] }>(
    `/api/tickets/${ticketId}/messages`,
    fetcher,
    { refreshInterval: 0 } // Disable polling as we'll use realtime
  )

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          mutateMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticketId, mutateMessages])

  useEffect(() => {
    if (ticketData?.ticket) {
      setIsLoading(false)
    }
  }, [ticketData])

  if (isLoading || !ticketData?.ticket) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="flex items-center mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <div className="text-center text-muted-foreground">
          {isLoading ? "Loading ticket..." : "Ticket not found"}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between px-2 py-4 border-b">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-xl font-semibold">Ticket #{ticketData.ticket.id.slice(0, 8)}</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <TicketInfoPanel
          ticket={ticketData.ticket}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          onUpdate={mutateTicket}
        />
        
        <ChatPanel
          ticket={ticketData.ticket}
          messages={messagesData?.messages || []}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          onMessageSent={mutateMessages}
        />
      </div>
    </div>
  )
}

