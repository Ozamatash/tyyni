import { Badge } from "@/components/ui/badge"
import { Message } from "../types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  isAgent: boolean
  showSender: boolean
  senderName: string | undefined
}

export function MessageBubble({ 
  message, 
  isAgent, 
  showSender, 
  senderName 
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col py-2",
        isAgent ? "items-end" : "items-start"
      )}
    >
      {showSender && (
        <p className="text-sm text-muted-foreground mb-1 px-1">
          {senderName}
        </p>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.08)] transition-shadow duration-200",
          isAgent 
            ? "bg-gray-100 dark:bg-gray-800 rounded-tr-none" 
            : "bg-gray-50 dark:bg-gray-900 rounded-tl-none",
          message.is_internal && "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900",
          "hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]"
        )}
      >
        {message.is_internal && (
          <Badge variant="outline" className="mb-2 bg-yellow-100/50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800">
            Internal Note
          </Badge>
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p className="text-xs text-muted-foreground mt-2 select-none">
          {format(new Date(message.created_at!), 'HH:mm')}
        </p>
      </div>
    </div>
  )
} 