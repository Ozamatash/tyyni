import { DashboardTicketView } from '@/components/features/tickets/dashboard-ticket-view'

interface TicketPageProps {
  params: Promise<{
    ticketId: string
  }>
}

export default async function TicketPage(props: TicketPageProps) {
  const params = await props.params;
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardTicketView ticketId={params.ticketId} />
    </div>
  )
} 