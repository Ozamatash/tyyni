"use client"

import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid'

interface TicketGridProps {
  status: 'active' | 'closed'
  onSelectTicket: (id: string) => void
}

const tickets = [
  {
    id: 'TKT-001',
    subject: 'Cannot access my account',
    status: 'Open',
    lastUpdate: '2 hours ago',
  },
  {
    id: 'TKT-002',
    subject: 'Product not working as expected',
    status: 'Pending',
    lastUpdate: '1 day ago',
  },
  {
    id: 'TKT-003',
    subject: 'Need help with integration',
    status: 'Open',
    lastUpdate: '3 days ago',
  }
]

export function TicketGrid({ status, onSelectTicket }: TicketGridProps) {
  // In the real implementation, we would filter tickets based on status
  const filteredTickets = tickets.filter(ticket => 
    status === 'active' ? ['Open', 'Pending'].includes(ticket.status) : ticket.status === 'Closed'
  )

  if (filteredTickets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
        <p className="mt-2 text-sm text-gray-500">
          {status === 'active' 
            ? "You don't have any active support tickets"
            : "You don't have any closed tickets"
          }
        </p>
      </div>
    )
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min">
      {filteredTickets.map((ticket) => (
        <li 
          key={ticket.id} 
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5"
          onClick={() => onSelectTicket(ticket.id)}
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">{ticket.id}</h3>
                <span className={`
                  inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset
                  ${ticket.status === 'Open' 
                    ? 'bg-green-50 text-green-700 ring-green-600/20' 
                    : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                  }
                `}>
                  {ticket.status}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">{ticket.subject}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{ticket.lastUpdate}</span>
          </div>
          <div>
            <div className="-mt-px flex">
              <div className="flex w-0 flex-1">
                <div
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-b-lg border-t border-transparent py-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  Chat with Agent
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
