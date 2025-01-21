"use client"

import { useState } from "react"
import { CustomerTicketList } from "./customer-ticket-list"
import { CustomerTicketDetail } from "./customer-ticket-detail"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CustomerPortal() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Customer Portal</h1>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Tickets</TabsTrigger>
          <TabsTrigger value="closed">Closed Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <Card className="p-6">
            {selectedTicketId ? (
              <CustomerTicketDetail 
                ticketId={selectedTicketId} 
                onBack={() => setSelectedTicketId(null)} 
              />
            ) : (
              <CustomerTicketList 
                status="active"
                onSelectTicket={setSelectedTicketId} 
              />
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="closed" className="mt-6">
          <Card className="p-6">
            {selectedTicketId ? (
              <CustomerTicketDetail 
                ticketId={selectedTicketId} 
                onBack={() => setSelectedTicketId(null)} 
              />
            ) : (
              <CustomerTicketList 
                status="closed"
                onSelectTicket={setSelectedTicketId} 
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 