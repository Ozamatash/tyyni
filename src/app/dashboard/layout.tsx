import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from "@/components/layouts/dashboard/dashboard-sidebar"
import { DashboardTopBar } from "@/components/layouts/dashboard/dashboard-top-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { orgId, orgRole } = await auth()
  
  if (!orgId) {
    redirect('/select-org')
  }

  // If not an admin or agent, they shouldn't access dashboard
  if (!['org:admin', 'org:agent'].includes(orgRole || '')) {
    redirect("/customer-portal")
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 w-full">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 