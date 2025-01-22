import { DashboardSidebar } from "@/components/layouts/dashboard/dashboard-sidebar"
import { DashboardTopBar } from "@/components/layouts/dashboard/dashboard-top-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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