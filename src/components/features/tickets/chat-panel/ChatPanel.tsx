"use client"

import { Message, TicketData } from "../types"
import { MessageList } from "./MessageList"
import { ReplyBox } from "./ReplyBox"

interface ChatPanelProps {
  ticket: TicketData
  messages: Message[]
  isSaving: boolean
  setIsSaving: (value: boolean) => void
  onMessageSent: () => void
}

export function ChatPanel({
  ticket,
  messages,
  isSaving,
  setIsSaving,
  onMessageSent
}: ChatPanelProps) {
  const handleSendMessage = async (content: string, isInternal: boolean) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          is_internal: isInternal,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')
      
      onMessageSent()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotifyCustomer = async () => {
    try {
      const response = await fetch(`/api/customer-portal/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          type: 'new_message',
        }),
      })

      if (!response.ok) throw new Error('Failed to send notification')
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden pl-2">
      <MessageList 
        messages={messages}
        customerName={ticket.customer.name}
      />
      <ReplyBox
        onSend={handleSendMessage}
        onNotify={handleNotifyCustomer}
        isSaving={isSaving}
      />
    </div>
  )
} 