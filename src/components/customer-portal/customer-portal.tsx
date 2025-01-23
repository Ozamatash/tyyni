"use client"

import { useState } from "react"
import { TicketGrid } from "./ticket-grid"
import { CustomerTicketDetail } from "./customer-ticket-detail"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export function CustomerPortal() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  return (
    <div className="bg-white">
      <div className="relative isolate">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="container mx-auto p-6">
          <div className="space-y-2.5 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage your support conversations
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Add action buttons here in the future */}
              </div>
            </div>
            <Separator />
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="bg-gray-100/60">
              <TabsTrigger value="active">Active Tickets</TabsTrigger>
              <TabsTrigger value="closed">Closed Tickets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-6">
              <Card className="bg-gray-100/50">
                <div className="p-6">
                  {selectedTicketId ? (
                    <CustomerTicketDetail 
                      ticketId={selectedTicketId} 
                      onBack={() => setSelectedTicketId(null)} 
                    />
                  ) : (
                    <TicketGrid 
                      status="active"
                      onSelectTicket={setSelectedTicketId} 
                    />
                  )}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="closed" className="mt-6">
              <Card className="bg-gray-100/50">
                <div className="p-6">
                  {selectedTicketId ? (
                    <CustomerTicketDetail 
                      ticketId={selectedTicketId} 
                      onBack={() => setSelectedTicketId(null)} 
                    />
                  ) : (
                    <TicketGrid 
                      status="closed"
                      onSelectTicket={setSelectedTicketId} 
                    />
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  )
} 