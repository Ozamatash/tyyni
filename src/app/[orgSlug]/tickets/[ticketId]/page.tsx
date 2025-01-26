import { TicketDetailContainer } from '@/components/features/tickets/ticket-detail-container'

interface TicketPageProps {
  params: {
    ticketId: string
    orgSlug: string
  }
}

export default async function TicketPage({ params }: TicketPageProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <TicketDetailContainer 
        ticketId={params.ticketId}
        orgSlug={params.orgSlug}
      />
    </div>
  )
} 