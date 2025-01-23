"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Send } from "lucide-react"

interface CustomerTicketDetailProps {
  ticketId: string
  onBack: () => void
}

// Mock data - replace with real data later
const mockTicket = {
  id: "1",
  title: "Login Issue",
  status: "active",
  priority: "high",
  createdAt: "2024-03-18",
  lastUpdated: "2024-03-20",
  description: "Unable to login to the dashboard after password reset",
  history: [
    {
      id: "1",
      type: "message",
      content: "I'm having trouble logging in after resetting my password",
      sender: "customer",
      timestamp: "2024-03-18 09:00",
    },
    {
      id: "2",
      type: "status",
      content: "Ticket assigned to support team",
      timestamp: "2024-03-18 09:05",
    },
    {
      id: "3",
      type: "message",
      content: "Have you cleared your browser cache and cookies?",
      sender: "agent",
      timestamp: "2024-03-18 09:15",
    },
    {
      id: "4",
      type: "message",
      content: "Yes, I tried that but still no luck",
      sender: "customer",
      timestamp: "2024-03-18 09:20",
    },
  ],
}

export function CustomerTicketDetail({ ticketId, onBack }: CustomerTicketDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{mockTicket.title}</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Ticket #{mockTicket.id}</span>
            <span>•</span>
            <Badge variant={mockTicket.priority === "high" ? "destructive" : "default"}>
              {mockTicket.priority}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-sm text-muted-foreground">{mockTicket.description}</p>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Ticket History</h3>
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {mockTicket.history.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col ${
                  item.type === "message" && item.sender === "customer"
                    ? "items-end"
                    : "items-start"
                }`}
              >
                {item.type === "message" ? (
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      item.sender === "customer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{item.content}</p>
                  </div>
                ) : (
                  <div className="w-full text-center">
                    <span className="text-xs text-muted-foreground">
                      {item.content}
                    </span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  {item.timestamp}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2">
          <Textarea
            placeholder="Type your message here..."
            className="min-h-[80px]"
          />
          <Button size="icon" className="h-[80px]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 