"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

interface CustomerTicketDetailProps {
  ticketId: string
  onBack: () => void
}

export function CustomerTicketDetail({ ticketId, onBack }: CustomerTicketDetailProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown'
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/customer-portal/tickets/${ticketId}/messages`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch messages')
        }

        setMessages(data.messages)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [ticketId])

  const handleSend = async () => {
    if (!message.trim()) return

    try {
      const response = await fetch(`/api/customer-portal/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setMessages(prev => [...prev, data.message])
      setMessage("")
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Ticket #{ticketId.substring(0, 8)}</h2>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isFirstMessageOfGroup = index === 0 || messages[index - 1].sender_type !== msg.sender_type
            const showHeader = isFirstMessageOfGroup && msg.sender_type === 'agent'
            const isCustomer = msg.sender_type === 'customer'

            return (
              <div key={msg.id} className="space-y-1">
                {showHeader && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Support Agent</span>
                  </div>
                )}
                <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    <div className={`
                      px-4 py-2 text-sm inline-block
                      ${isCustomer
                        ? 'bg-blue-600 text-white rounded-[20px] rounded-br-[4px]'
                        : 'bg-gray-100 text-gray-900 rounded-[20px] rounded-bl-[4px]'
                      }
                    `}>
                      {msg.content}
                    </div>
                    <div className={`
                      text-xs text-gray-500 mt-1
                      ${isCustomer ? 'text-right' : 'text-left'}
                    `}>
                      {formatDate(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2 items-center">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 