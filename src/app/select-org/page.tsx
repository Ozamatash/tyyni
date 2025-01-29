'use client'

import { OrganizationList, useAuth, useOrganization } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SelectOrganizationPage() {
  const { userId, isLoaded: isAuthLoaded } = useAuth()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const router = useRouter()

  useEffect(() => {
    async function checkAndRedirect() {
      // Wait for auth to load
      if (!isAuthLoaded) return
      
      // Redirect to sign in if not authenticated
      if (!userId) {
        router.push("/auth/sign-in")
        return
      }

      // If user has an org selected, redirect to dashboard
      if (isOrgLoaded && organization) {
        router.push('/dashboard/tickets')
      }
    }

    checkAndRedirect()
  }, [userId, organization, isAuthLoaded, isOrgLoaded, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <OrganizationList
        hidePersonal
        afterSelectOrganizationUrl="/dashboard/tickets"
        afterCreateOrganizationUrl="/dashboard/tickets"
      />
    </div>
  )
} 