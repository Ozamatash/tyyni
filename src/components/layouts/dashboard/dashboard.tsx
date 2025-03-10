"use client"

import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardTopBar } from "./dashboard-top-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto p-6 w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

