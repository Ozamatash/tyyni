"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, BarChart3, Ticket, Building, Shield } from "lucide-react"
import useSWR from 'swr'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

type Organization = {
  name: string
  slug: string
}

type AgentProfile = {
  role: string
  name: string
  email: string
  id: string
  status: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function DashboardSidebar() {
  const pathname = usePathname()
  const orgSlug = pathname.split('/')[1]

  // Get current agent ID from session/local storage
  const agentId = localStorage.getItem('agentId') // This should be set during login

  // Fetch agent profile data (which includes org data)
  const { data: agentData, error: agentError } = useSWR<{ agent: AgentProfile }>(
    orgSlug && agentId ? `/api/agents?org=${orgSlug}&self=true&agent=${agentId}` : null,
    fetcher
  )

  const isLoading = !agentData && !agentError
  const isAdmin = agentData?.agent.role === "admin"

  return (
    <Sidebar>
      <div className="mb-4 px-2">
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : agentData?.agent && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Building className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{agentData.agent.name}</span>
              <span className="text-xs text-muted-foreground">
                {isAdmin ? 'Administrator' : 'Agent'}
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="grid gap-1">
        <Link href={`/${orgSlug}/tickets`} passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === `/${orgSlug}/tickets` && "bg-muted"
            )}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Tickets
          </Button>
        </Link>
        <Link href={`/${orgSlug}/reports`} passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === `/${orgSlug}/reports` && "bg-muted"
            )}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </Link>
        <Link href={`/${orgSlug}/settings`} passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === `/${orgSlug}/settings` && "bg-muted"
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        {isAdmin && (
          <Link href={`/${orgSlug}/admin`} passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === `/${orgSlug}/admin` && "bg-muted"
              )}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        )}
      </nav>
    </Sidebar>
  )
}

