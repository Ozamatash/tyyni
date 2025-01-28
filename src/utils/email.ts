import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendTicketNotificationParams {
  to: string
  orgSlug: string
  ticketId: string
  subject: string
  customerName: string
  portalUrl: string
}

export async function sendTicketNotification({
  to,
  orgSlug,
  ticketId,
  subject,
  customerName,
  portalUrl
}: SendTicketNotificationParams) {
  try {
    await resend.emails.send({
      from: `${orgSlug}@tyynisupport.com`,
      to,
      subject: `Support Ticket #${ticketId}: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Support Ticket Created</h2>
          <p>Hello ${customerName},</p>
          <p>Your support ticket has been created successfully.</p>
          <p>Access your ticket at: <a href="https://tyyni-production.up.railway.app/customer-portal">${process.env.NEXT_PUBLIC_APP_URL}/customer-portal</a></p>
          <p>Your access token is: <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${portalUrl.split('token=')[1]}</code></p>
          <p style="color: #666; font-size: 14px;">
            This token will expire in 7 days. If you need a new token, please contact support.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            Sent via Tyyni Support
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send ticket notification:', error)
    throw new Error('Failed to send ticket notification')
  }
}

interface SendTicketUpdateParams {
  to: string
  orgSlug: string
  ticketId: string
  subject: string
  customerName: string
  message: string
  portalUrl: string
}

export async function sendTicketUpdateNotification({
  to,
  orgSlug,
  ticketId,
  subject,
  customerName,
  message,
  portalUrl
}: SendTicketUpdateParams) {
  try {
    const messageHtml = message.split('\n').map(line => `<p>${line}</p>`).join('')
    
    await resend.emails.send({
      from: `${orgSlug}@tyynisupport.com`,
      to,
      subject: `Re: Support Ticket #${ticketId}: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Ticket Update</h2>
          <p>Hello ${customerName},</p>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0;">
            ${messageHtml}
          </div>

          <p style="margin: 20px 0;">
            <a 
              href="${portalUrl}" 
              style="background: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;"
            >
              View Full Conversation
            </a>
          </p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            Sent via Tyyni Support
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send ticket update notification:', error)
    throw new Error('Failed to send ticket update notification')
  }
} 