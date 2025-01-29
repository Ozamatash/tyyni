"use client"

import { useState } from "react"
import { Send, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { InsertMacroModal } from "@/components/modals/insert-macro-modal"

interface ReplyBoxProps {
  onSend: (content: string, isInternal: boolean) => Promise<void>
  onNotify: () => Promise<void>
  isSaving: boolean
}

export function ReplyBox({ onSend, onNotify, isSaving }: ReplyBoxProps) {
  const [reply, setReply] = useState("")
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

  const handleSend = async () => {
    if (!reply.trim() || isSaving) return
    await onSend(reply, isInternalNote)
    setReply("")
  }

  const handleInsertMacro = (content: string) => {
    setReply((prev) => prev + (prev ? "\n\n" : "") + content)
    setIsMacroModalOpen(false)
  }

  return (
    <div className="border-t p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          variant={isInternalNote ? "default" : "outline"}
          onClick={() => setIsInternalNote(true)}
          size="sm"
        >
          Internal Note
        </Button>
        <Button
          variant={!isInternalNote ? "default" : "outline"}
          onClick={() => setIsInternalNote(false)}
          size="sm"
        >
          Reply to Customer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMacroModalOpen(true)}
        >
          Insert Macro
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNotify}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex space-x-2">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={isInternalNote ? "Add an internal note..." : "Type your reply..."}
          className="flex-1"
          rows={3}
        />
        <Button
          onClick={handleSend}
          disabled={!reply.trim() || isSaving}
          size="icon"
          className="h-24"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <InsertMacroModal 
        open={isMacroModalOpen}
        onOpenChange={setIsMacroModalOpen}
        onSelect={handleInsertMacro}
      />
    </div>
  )
} 