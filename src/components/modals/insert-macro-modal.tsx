"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

// Dummy data for macros
const macros = [
  {
    id: 1,
    title: "Password Reset Instructions",
    content: "Here are the steps to reset your password:\n1. Click on 'Forgot Password'\n2. Enter your email address\n3. Follow the instructions in the email you receive",
  },
  {
    id: 2,
    title: "Thank You for Your Patience",
    content: "Thank you for your patience while we work on resolving your issue. We'll get back to you as soon as possible.",
  },
  {
    id: 3,
    title: "Account Activation",
    content: "Your account has been successfully activated. You can now log in using your email and password.",
  },
  {
    id: 4,
    title: "Feature Request Acknowledgment",
    content: "Thank you for your feature suggestion. We've logged your request and will consider it for future updates.",
  },
]

interface InsertMacroModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (content: string) => void
}

export function InsertMacroModal({ open, onOpenChange, onSelect }: InsertMacroModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredMacros = macros.filter(macro => 
    macro.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    macro.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Insert Macro</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search macros..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {filteredMacros.map((macro) => (
              <div
                key={macro.id}
                className="rounded-lg border p-3 hover:bg-accent cursor-pointer"
                onClick={() => {
                  onSelect(macro.content)
                  onOpenChange(false)
                }}
              >
                <h4 className="font-medium mb-1">{macro.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {macro.content}
                </p>
              </div>
            ))}
            {filteredMacros.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No macros found
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

