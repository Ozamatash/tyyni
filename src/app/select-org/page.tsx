'use client'

import { useOrganizationList } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrganizationList } from '@clerk/nextjs'

export default function SelectOrganizationPage() {
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: true
  })
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Select your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose an organization to continue to the dashboard
          </p>
        </div>
        <OrganizationList 
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  )
} 