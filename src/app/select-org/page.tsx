'use client'

import { OrganizationList, useAuth, useOrganization } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
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

      // If user has an org selected, check for slug and redirect
      if (isOrgLoaded && organization) {
        const { data: org } = await supabase
          .from('organizations')
          .select('slug')
          .eq('clerk_id', organization.id)
          .single()
          
        if (org) {
          router.push(`/${org.slug}/tickets`)
        }
      }
    }

    checkAndRedirect()
  }, [userId, organization, isAuthLoaded, isOrgLoaded, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <OrganizationList
        hidePersonal
        afterSelectOrganizationUrl="/:slug/tickets"
        afterCreateOrganizationUrl="/:slug/tickets"
      />
    </div>
  )
} 