"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ArrowLeft, Send } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: 'agent' | 'customer'
  timestamp: string
  senderName: string
  senderEmail?: string
}

// Mock data
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hi, how can I help you today?',
    sender: 'agent',
    timestamp: '2 hours ago',
    senderName: 'Sofia Davis',
    senderEmail: 'm@example.com'
  },
  {
    id: '2',
    content: "Hey, I'm having trouble with my account.",
    sender: 'customer',
    timestamp: '2 hours ago',
    senderName: 'You'
  },
  {
    id: '3',
    content: 'What seems to be the problem?',
    sender: 'agent',
    timestamp: '1 hour ago',
    senderName: 'Sofia Davis',
    senderEmail: 'm@example.com'
  },
  {
    id: '4',
    content: "I can't log in.",
    sender: 'customer',
    timestamp: '1 hour ago',
    senderName: 'You'
  }
]

interface CustomerTicketDetailProps {
  ticketId: string
  onBack: () => void
}

export function CustomerTicketDetail({ ticketId, onBack }: CustomerTicketDetailProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  const handleSend = () => {
    if (!message.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'customer',
      timestamp: 'Just now',
      senderName: 'You'
    }

    setMessages([...messages, newMessage])
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Ticket #{ticketId}</h2>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isFirstMessageOfGroup = index === 0 || messages[index - 1].sender !== msg.sender
            const showHeader = isFirstMessageOfGroup && msg.sender === 'agent'

            return (
              <div key={msg.id} className="space-y-1">
                {showHeader && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.senderName}</span>
                    <span className="text-muted-foreground text-sm">{msg.senderEmail}</span>
                  </div>
                )}
                <div className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    <div className={`
                      px-4 py-2 text-sm inline-block
                      ${msg.sender === 'customer'
                        ? 'bg-blue-600 text-white rounded-[20px] rounded-br-[4px]'
                        : 'bg-gray-100 text-gray-900 rounded-[20px] rounded-bl-[4px]'
                      }
                    `}>
                      {msg.content}
                    </div>
                    <div className={`
                      text-xs text-gray-500 mt-1
                      ${msg.sender === 'customer' ? 'text-right' : 'text-left'}
                    `}>
                      {msg.timestamp}
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