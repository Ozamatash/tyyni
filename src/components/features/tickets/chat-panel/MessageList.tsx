import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "../types"
import { MessageBubble } from "./MessageBubble"

interface MessageListProps {
  messages: Message[]
  customerName: string
}

export function MessageList({ messages, customerName }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isAgent = message.sender_type === 'agent'
          const showSender = index === 0 || 
            messages[index - 1]?.sender_type !== message.sender_type

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isAgent={isAgent}
              showSender={showSender}
              senderName={isAgent ? message.sender?.name : customerName}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
} 