"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Settings, BarChart3, Ticket, Building, Shield } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useOrganization } from "@clerk/nextjs"
import { useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { orgRole, isLoaded: isAuthLoaded } = useAuth()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()

  const isAdmin = orgRole === 'org:admin'
  const isLoaded = isAuthLoaded && isOrgLoaded

  // Redirect to org selection if no organization is selected
  useEffect(() => {
    if (isLoaded && !organization) {
      router.push('/select-org')
    }
  }, [isLoaded, organization, router])

  // Don't render anything while loading or if no organization
  if (!isLoaded || !organization) {
    return (
      <Sidebar>
        <div className="mb-4 px-2">
          <Skeleton className="h-8 w-full" />
        </div>
        <nav className="grid gap-1">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </nav>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <Building className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {organization.name}
            </span>
            <span className="text-sm font-medium">
              {isAdmin ? 'Administrator' : 'Agent'}
            </span>
          </div>
        </div>
      </div>

      <nav className="grid gap-1">
        <Link href="/dashboard/tickets" passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === "/dashboard/tickets" && "bg-muted"
            )}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Tickets
          </Button>
        </Link>
        <Link href="/dashboard/reports" passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === "/dashboard/reports" && "bg-muted"
            )}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </Link>
        <Link href="/dashboard/settings" passHref>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === "/dashboard/settings" && "bg-muted"
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        {isAdmin && (
          <Link href="/dashboard/admin" passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === "/dashboard/admin" && "bg-muted"
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

