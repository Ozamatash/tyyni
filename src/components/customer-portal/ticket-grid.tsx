"use client"

import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid'
import type { CustomerTicket } from '@/types/customer-portal'
import { formatDistanceToNow } from 'date-fns'

interface TicketGridProps {
  tickets: CustomerTicket[]
  onSelectTicket: (id: string) => void
}

export function TicketGrid({ tickets, onSelectTicket }: TicketGridProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
        <p className="mt-2 text-sm text-gray-500">
          You don't have any support tickets
        </p>
      </div>
    )
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown'
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min">
      {tickets.map((ticket) => (
        <li 
          key={ticket.id} 
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5"
          onClick={() => onSelectTicket(ticket.id)}
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {ticket.id.substring(0, 8)}
                </h3>
                <span className={`
                  inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
                  ${ticket.status === 'open' 
                    ? 'bg-green-50 text-green-700 ring-green-600/20' 
                    : ticket.status === 'pending'
                    ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                    : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                  }
                `}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">{ticket.subject}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDate(ticket.last_activity_at || ticket.created_at)}
            </span>
          </div>
          <div>
            <div className="-mt-px flex">
              <div className="flex w-0 flex-1">
                <div
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-b-lg border-t border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  View Conversation
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
