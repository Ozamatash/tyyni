'use client'

import { useRouter } from 'next/navigation'
import { TicketDetailView } from '@/components/features/tickets/ticket-detail-view'
import useSWR from 'swr'

interface TicketDetailContainerProps {
  ticketId: string
  organizationId: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function TicketDetailContainer({ ticketId, organizationId }: TicketDetailContainerProps) {
  const router = useRouter()

  const { data: agentData } = useSWR(
    `/api/agents?self=true`,
    fetcher
  )

  const handleBack = () => {
    router.push('/dashboard/tickets')
  }

  if (!agentData?.agent) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <TicketDetailView 
      ticketId={ticketId} 
      onBack={handleBack}
      agentId={agentData.agent.id}
    />
  )
} 