"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton, useUser, useOrganization } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardTopBar() {
  const { isLoaded: isUserLoaded } = useUser()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()

  const isLoading = !isUserLoaded || !isOrgLoaded

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {organization && (
          <h1 className="text-sm font-medium">{organization.name}</h1>
        )}
      </div>

      <div className="flex items-center">
        {isLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
        )}
      </div>
    </header>
  )
}

