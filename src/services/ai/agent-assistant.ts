import { openai } from '@/utils/openai/client'
import type { AgentSuggestion, TicketContext } from '@/utils/openai/types'

export async function generateAgentSuggestions(
  ticketContext: TicketContext
): Promise<AgentSuggestion> {
  const prompt = `
  As an expert customer support assistant, analyze this ticket and provide helpful suggestions.
  Consider:
  - Customer's issue and tone
  - Previous interactions
  - Best practices for customer support
  
  Ticket Subject: ${ticketContext.ticket.subject}
  Customer: ${ticketContext.customer.name}
  
  Recent Messages:
  ${ticketContext.messages.slice(-5).map(m => `${m.sender_type}: ${m.content}`).join('\n')}
  
  Provide 3-5 actionable suggestions in markdown format. Focus on:
  1. Next best action
  2. Tone and approach
  3. Relevant information to gather
  4. Potential solutions
  `

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    })

    const suggestions = response.choices[0].message.content
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(2))

    return {
      suggestions,
      context: `Based on ${ticketContext.messages.length} messages and ticket history`
    }
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return {
      suggestions: [
        'Acknowledge the customer\'s issue',
        'Ask for more details if needed',
        'Provide a clear next step'
      ],
      context: 'Fallback suggestions due to error'
    }
  }
}

export async function generateResponseSuggestion(
  ticketContext: TicketContext,
  prompt: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful customer support assistant. 
          Write a professional, empathetic response based on the ticket context and prompt.
          Keep the tone friendly but professional.`
        },
        {
          role: "user",
          content: `
          Ticket Context:
          Subject: ${ticketContext.ticket.subject}
          Customer: ${ticketContext.customer.name}
          
          Recent Messages:
          ${ticketContext.messages.slice(-3).map(m => `${m.sender_type}: ${m.content}`).join('\n')}
          
          Prompt: ${prompt}
          `
        }
      ],
      temperature: 0.7,
      max_tokens: 350
    })

    return response.choices[0].message.content || ''
  } catch (error) {
    console.error('Error generating response:', error)
    return ''
  }
} 