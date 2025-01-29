import { auth } from '@clerk/nextjs/server'
import { TicketDetailContainer } from '@/components/features/tickets/ticket-detail-container'
import { getSupabaseOrgId } from '@/utils/organizations'
import { notFound } from 'next/navigation'

interface TicketPageProps {
  params: Promise<{
    ticketId: string
  }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  // Await dynamic route parameters
  const { ticketId, } = await params
  
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
    <div className="flex-1">
      <TicketDetailContainer 
        ticketId={ticketId}
        organizationId={orgId}
      />
    </div>
  )
} 