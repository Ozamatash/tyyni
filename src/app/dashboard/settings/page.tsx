import { AgentSettingsView } from "@/components/features/agents/agent-settings-view"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId) {
    redirect("/auth/sign-in")
  }

  if (!orgId) {
    redirect("/select-org")
  }

  if (!['org:admin', 'org:agent'].includes(orgRole || '')) {
    redirect("/customer")
  }

  return <AgentSettingsView />
} 