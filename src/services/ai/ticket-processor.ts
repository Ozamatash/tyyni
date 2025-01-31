import { openai } from '@/utils/openai/client'
import type { TicketAnalysis, TicketContext } from '@/utils/openai/types'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']

export async function analyzeNewTicket(
  subject: string,
  description: string,
  customerId: string,
  organizationId: string
): Promise<TicketAnalysis> {
  try {
    // 1. Fetch available agents
    const { data: agents, error: agentsError } = await supabase
      .from('agent_profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'online')

    if (agentsError || !agents?.length) {
      console.warn('No agents available, using fallback assignment')
      return {
        priority: 3,
        agent_id: '',
        reason: 'No agents available for assignment'
      }
    }

    // 2. Fetch customer info
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    // 3. Generate AI analysis
    const prompt = `
    Analyze this support ticket and determine its priority and best agent match.
    Consider the following factors:
    - Ticket content and urgency
    - Customer context
    - Agent expertise and current workload
    
    Ticket Subject: ${subject}
    Ticket Description: ${description}
    Customer: ${customer?.name || 'Unknown'} (${customer?.email || 'No email'})
    
    Available Agents (Use agent_id for selection):
    ${agents.map(a => `- ID: ${a.id} | Name: ${a.name} | Expertise: ${(a.expertise_tags || []).join(', ')} | Open tickets: ${a.current_open_tickets}`).join('\n')}
    
    Respond with JSON. IMPORTANT: Use the agent's ID (not name) for agent_id:
    {
      "priority": number (1-5, where 1 is highest),
      "agent_id": "UUID of selected agent from the list above",
      "reason": "brief explanation of decision"
    }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    })

    if (!response.choices[0].message.content) {
      throw new Error('Empty response from OpenAI')
    }

    const analysis = JSON.parse(response.choices[0].message.content) as TicketAnalysis
    
    // Validate response
    if (!analysis.priority || !analysis.agent_id || !analysis.reason) {
      throw new Error('Invalid AI response format')
    }

    // Ensure priority is within bounds
    analysis.priority = Math.min(Math.max(analysis.priority, 1), 5)

    // Validate agent ID
    const validAgentId = agents.some(agent => agent.id === analysis.agent_id)
      ? analysis.agent_id
      : agents[0]?.id ?? ''

    return {
      priority: analysis.priority,
      agent_id: validAgentId,
      reason: analysis.reason
    }
  } catch (error) {
    console.error('Error analyzing ticket:', error)
    return {
      priority: 3,
      agent_id: '',
      reason: 'Fallback assignment due to analysis error'
    }
  }
}

// Keep this function for manual reanalysis of existing tickets
export async function analyzeTicket(
  ticketContext: TicketContext,
  agents: AgentProfile[]
): Promise<TicketAnalysis> {
  console.log('Preparing OpenAI analysis with context:', {
    subject: ticketContext.ticket.subject,
    messageCount: ticketContext.messages.length,
    agentCount: agents.length
  })

  const prompt = `
  Analyze this support ticket and determine its priority and best agent match.
  Consider the following factors:
  - Ticket content and urgency
  - Customer context
  - Agent expertise and current workload
  
  Ticket Subject: ${ticketContext.ticket.subject}
  Customer: ${ticketContext.customer.name} (${ticketContext.customer.email})
  Message History:
  ${ticketContext.messages.map(m => `${m.sender_type}: ${m.content}`).join('\n')}
  
  Available Agents (Use agent_id for selection):
  ${agents.map(a => `- ID: ${a.id} | Name: ${a.name} | Expertise: ${(a.expertise_tags || []).join(', ')} | Open tickets: ${a.current_open_tickets}`).join('\n')}
  
  Respond with JSON. IMPORTANT: Use the agent's ID (not name) for agent_id:
  {
    "priority": number (1-5, where 1 is highest),
    "agent_id": "UUID of selected agent from the list above",
    "reason": "brief explanation of decision"
  }
  `

  try {
    console.log('Sending request to OpenAI...')
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    })

    if (!response.choices[0].message.content) {
      throw new Error('Empty response from OpenAI')
    }

    console.log('Raw OpenAI response:', response.choices[0].message.content)

    const analysis = JSON.parse(response.choices[0].message.content) as TicketAnalysis
    
    // Validate response
    if (!analysis.priority || !analysis.agent_id || !analysis.reason) {
      throw new Error('Invalid AI response format')
    }

    // Ensure priority is within bounds
    analysis.priority = Math.min(Math.max(analysis.priority, 1), 5)

    // Try to find agent by ID first, then by name if ID is not valid
    let validAgentId = agents.some(agent => agent.id === analysis.agent_id)
      ? analysis.agent_id
      : agents.find(agent => 
          agent.name.toLowerCase() === analysis.agent_id.toLowerCase() ||
          agent.name.toLowerCase().includes(analysis.agent_id.toLowerCase())
        )?.id

    // If still no valid agent, fall back to first available
    if (!validAgentId) {
      console.warn('Could not find agent by ID or name, falling back to first available agent')
      validAgentId = agents[0]?.id ?? ''
    }

    const result = {
      priority: analysis.priority,
      agent_id: validAgentId,
      reason: analysis.reason
    }

    console.log('Final analysis result:', result)
    return result
  } catch (error) {
    console.error('Error analyzing ticket:', error)
    // Fallback to default values
    return {
      priority: 3,
      agent_id: agents[0]?.id ?? '', // Assign to first available agent
      reason: 'Fallback assignment due to analysis error'
    }
  }
}

export async function applyTicketAnalysis(
  ticketId: string,
  analysis: TicketAnalysis
): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({
      auto_priority: analysis.priority,
      auto_assigned_agent_id: analysis.agent_id,
      metadata: {
        ai_analysis: {
          reason: analysis.reason,
          timestamp: new Date().toISOString()
        }
      }
    })
    .eq('id', ticketId)

  if (error) {
    console.error('Error applying ticket analysis:', error)
    throw error
  }
} 