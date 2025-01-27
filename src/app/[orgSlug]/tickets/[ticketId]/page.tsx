import { auth } from '@clerk/nextjs/server'
import { TicketDetailContainer } from '@/components/features/tickets/ticket-detail-container'
import { getSupabaseOrgId } from '@/utils/organizations'
import { notFound } from 'next/navigation'

interface TicketPageProps {
  params: Promise<{
    ticketId: string
    orgSlug: string
  }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  // Await dynamic route parameters
  const { ticketId, orgSlug } = await params
  
  // Validate auth and org access first
  const { orgId: clerkOrgId } = await auth()
  
  if (!clerkOrgId) {
    throw new Error('Organization access required')
  }

  const orgId = await getSupabaseOrgId(clerkOrgId)

  if (!orgId) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <TicketDetailContainer 
        ticketId={ticketId}
        organizationId={orgId}
      />
    </div>
  )
} 