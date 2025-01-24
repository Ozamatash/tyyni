'use client'

import { useState } from 'react'
import type { CustomerPortalState, TokenVerificationPayload, CustomerTicket } from '@/types/customer-portal'
import { TicketGrid } from './ticket-grid'
import { PortalAuth } from './portal-auth'
import { CustomerTicketDetail } from './customer-ticket-detail'

export function PortalContainer() {
  const [state, setState] = useState<CustomerPortalState>({
    isVerified: false,
    isLoading: false,
    tickets: [],
  })

  const handleVerification = async (payload: TokenVerificationPayload) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const response = await fetch('/api/customer-portal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setState(prev => ({
        ...prev,
        isVerified: true,
        tickets: data.tickets || [],
        isLoading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }

  const handleSelectTicket = (ticketId: string) => {
    setState(prev => ({ ...prev, selectedTicketId: ticketId }))
  }

  const handleBack = () => {
    setState(prev => ({ ...prev, selectedTicketId: undefined }))
  }

  if (!state.isVerified) {
    return (
      <PortalAuth 
        onVerify={handleVerification}
        isLoading={state.isLoading}
        error={state.error}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {state.selectedTicketId ? (
        <CustomerTicketDetail 
          ticketId={state.selectedTicketId}
          onBack={handleBack}
        />
      ) : (
        <TicketGrid 
          tickets={state.tickets}
          onSelectTicket={handleSelectTicket}
        />
      )}
    </div>
  )
} 