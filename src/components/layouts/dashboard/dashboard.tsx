"use client"

import { useState } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardTopBar } from "./dashboard-top-bar"
import { TicketListView } from "@/components/features/tickets/ticket-list-view"
import { TicketDetailView } from "@/components/features/tickets/ticket-detail-view"
import { ReportsView } from "@/components/features/reports/reports-view"
import { AgentSettingsView } from "@/components/features/agents/agent-settings-view"
import { AdminSettingsView } from "@/components/features/admin/admin-settings-view"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function Dashboard() {
  const [currentView, setCurrentView] = useState<string>("tickets")
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const renderMainContent = () => {
    switch (currentView) {
      case "tickets":
        return selectedTicketId ? (
          <TicketDetailView ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />
        ) : (
          <TicketListView onSelectTicket={setSelectedTicketId} />
        )
      case "reports":
        return <ReportsView />
      case "settings":
        return <AgentSettingsView />
      case "admin settings":
        return <AdminSettingsView />
      default:
        return <div>404 - View not found</div>
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSidebar onNavigate={setCurrentView} />
        <SidebarInset className="flex flex-col flex-1 w-full">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto p-6 w-full">{renderMainContent()}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

