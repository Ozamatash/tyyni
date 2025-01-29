"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomerInfo } from "./CustomerInfo"
import { TicketStatusSelect } from "./TicketStatusSelect"
import { TicketPrioritySelect } from "./TicketPrioritySelect"
import { AgentAssignmentSelect } from "./AgentAssignmentSelect"
import { TicketData, TicketStatus, TicketPriority } from "../types"

interface TicketInfoPanelProps {
  ticket: TicketData
  isSaving: boolean
  setIsSaving: (value: boolean) => void
  onUpdate: () => void
}

export function TicketInfoPanel({ 
  ticket, 
  isSaving, 
  setIsSaving, 
  onUpdate 
}: TicketInfoPanelProps) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority)
  const [assignedTo, setAssignedTo] = useState<string | null>(ticket.assigned_to?.id || null)

  const handleUpdateTicket = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          priority,
          assigned_to: assignedTo,
        }),
      })

      if (!response.ok) throw new Error('Failed to update ticket')
      
      onUpdate()
    } catch (error) {
      console.error('Error updating ticket:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-[300px] border-r flex flex-col overflow-y-auto pl-2">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Ticket Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CustomerInfo customer={ticket.customer} />
          
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Ticket Details</p>
            <div className="space-y-3">
              <TicketStatusSelect
                value={status}
                onChange={setStatus}
              />
              <TicketPrioritySelect
                value={priority}
                onChange={setPriority}
              />
              <AgentAssignmentSelect
                value={assignedTo}
                onChange={setAssignedTo}
              />
            </div>
          </div>

          <div>
            <Button 
              onClick={handleUpdateTicket} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Updating..." : "Update Ticket"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 