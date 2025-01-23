"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardTopBar() {
  const { isLoaded } = useUser()

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center">
        <SidebarTrigger />
      </div>

      <div className="flex items-center">
        {!isLoaded ? (
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

