import { AdminSettingsView } from "@/components/features/admin/admin-settings-view"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId) {
    redirect("/auth/sign-in")
  }

  if (!orgId) {
    redirect("/select-org")
  }

  // Only org admins can access this page
  if (orgRole !== 'org:admin') {
    redirect("/dashboard")
  }

  return <AdminSettingsView />
} 