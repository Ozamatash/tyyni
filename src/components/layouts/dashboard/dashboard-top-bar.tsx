"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton, useUser, useOrganization, OrganizationSwitcher } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Building } from "lucide-react"

export function DashboardTopBar() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()

  const isLoading = !isUserLoaded || !isOrgLoaded

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center">
        <SidebarTrigger />
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : (
          <>
            <OrganizationSwitcher 
              appearance={{
                elements: {
                  rootBox: "flex",
                  organizationSwitcherTrigger: "flex h-8 w-40 text-sm"
                }
              }}
              hidePersonal
              afterCreateOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/select-org"
              afterSelectOrganizationUrl="/dashboard"
              organizationProfileMode="navigation"
              organizationProfileUrl="/dashboard/admin"
            />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </>
        )}
      </div>
    </header>
  )
}

