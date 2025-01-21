"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InsertMacroModal } from "@/components/modals/insert-macro-modal"

interface Message {
  id: number
  sender: string
  timestamp: string
  content: string
  isInternal: boolean
}

interface Ticket {
  id: string
  subject: string
  requesterName: string
  requesterEmail: string
  status: string
  priority: string
  assignedTo: string
  conversation: Message[]
}

type TicketsData = {
  [key: string]: Ticket
}

// Dummy data for the tickets
const tickets: TicketsData = {
  "T-1001": {
    id: "T-1001",
    subject: "Cannot access account",
    requesterName: "John Doe",
    requesterEmail: "john@example.com",
    status: "Open",
    priority: "High",
    assignedTo: "Alice",
    conversation: [
      {
        id: 1,
        sender: "John Doe",
        timestamp: "2023-04-01T10:00:00Z",
        content: "I cannot log into my account. It says password is incorrect, but I'm sure it's right.",
        isInternal: false,
      },
      {
        id: 2,
        sender: "Alice",
        timestamp: "2023-04-01T10:30:00Z",
        content: "I've reset your password. Please check email for the new temporary",
        isInternal: false,
      },
      {
        id: 3,
        sender: "Alice",
        timestamp: "2023-04-01T10:31:00Z",
        content: "Remember to follow up in 24 hours if the customer hasn't logged in.",
        isInternal: true,
      },
    ],
  },
  "T-1002": {
    id: "T-1002",
    subject: "Feature request",
    requesterName: "Sarah Smith",
    requesterEmail: "sarah@example.com",
    status: "Pending",
    priority: "Normal",
    assignedTo: "Bob",
    conversation: [
      {
        id: 1,
        sender: "Sarah Smith",
        timestamp: "2023-04-02T14:30:00Z",
        content: "Would it be possible to add dark mode to the application?",
        isInternal: false,
      },
    ],
  },
}

interface TicketDetailViewProps {
  ticketId: string
  onBack: () => void
}

export function TicketDetailView({ ticketId, onBack }: TicketDetailViewProps) {
  const ticket = tickets[ticketId]
  const [status, setStatus] = useState(ticket?.status || "")
  const [priority, setPriority] = useState(ticket?.priority || "")
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo || "")
  const [reply, setReply] = useState("")
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

  const handleSendReply = () => {
    // TODO: Implement send reply logic
    console.log("Sending reply:", reply)
    setReply("")
  }

  const handleAddInternalNote = () => {
    // TODO: Implement add internal note logic
    console.log("Adding internal note:", reply)
    setReply("")
  }

  const handleInsertMacro = (content: string) => {
    setReply((prev) => prev + (prev ? "\n\n" : "") + content)
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="flex items-center mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">Ticket {ticket.id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Requester:</p>
              <p>
                {ticket.requesterName} ({ticket.requesterEmail})
              </p>
            </div>
            <div>
              <p className="font-semibold">Status:</p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Solved">Solved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="font-semibold">Priority:</p>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="font-semibold">Assigned To:</p>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  <SelectItem value="Alice">Alice</SelectItem>
                  <SelectItem value="Bob">Bob</SelectItem>
                  {/* Add more agents as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ticket.conversation.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.isInternal 
                    ? "bg-yellow-100 dark:bg-yellow-900/20" 
                    : "bg-stone-100 dark:bg-stone-800"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{message.sender}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply here..."
            className="mb-4"
          />
          <div className="flex justify-between">
            <div>
              <Button onClick={() => setIsMacroModalOpen(true)} className="mr-2">
                Insert Macro
              </Button>
              <Button onClick={handleAddInternalNote} variant="outline">
                Add Internal Note
              </Button>
            </div>
            <Button onClick={handleSendReply}>Send Reply</Button>
          </div>
        </CardContent>
      </Card>

      <InsertMacroModal
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        onSelect={handleInsertMacro}
      />
    </div>
  )
}

