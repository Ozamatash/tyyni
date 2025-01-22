"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Settings, BarChart3, Ticket } from "lucide-react"
import { useOrganization } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { membership } = useOrganization()
  const isAdmin = membership?.role === "org:admin"

  return (
    <Sidebar>
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
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        )}
      </nav>
    </Sidebar>
  )
}

