import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from "@/components/layouts/dashboard/dashboard-sidebar"
import { DashboardTopBar } from "@/components/layouts/dashboard/dashboard-top-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const { userId, orgId, orgRole } = await auth()
  
  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', params.orgSlug)
    .single()

  if (!org || org.clerk_id !== orgId) {
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
          <main className="flex-1 overflow-y-auto p-6 w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 