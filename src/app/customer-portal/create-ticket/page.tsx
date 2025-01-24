"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function CreateTicketPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ token?: string, error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email'),
      name: formData.get('name'),
      subject: formData.get('subject'),
      message: formData.get('message')
    }

    try {
      const response = await fetch('/api/customer-portal/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const result = await response.json()
      setResult({ token: result.token })
    } catch (error) {
      console.error('Error creating ticket:', error)
      setResult({ error: 'Failed to create ticket. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create Support Ticket</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Your Name"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="What's your issue about?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              required
              placeholder="Describe your issue..."
              className="h-32"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </form>

        {result?.token && (
          <div className="mt-6 p-4 bg-green-50 text-green-900 rounded-lg">
            <h2 className="font-semibold mb-2">Ticket Created Successfully!</h2>
            <p className="text-sm mb-2">Your access token is:</p>
            <code className="block p-2 bg-white rounded border border-green-200 font-mono text-sm">
              {result.token}
            </code>
            <p className="text-sm mt-2">
              Save this token! You'll need it to access your ticket later.
            </p>
          </div>
        )}

        {result?.error && (
          <div className="mt-6 p-4 bg-red-50 text-red-900 rounded-lg">
            <p className="text-sm">{result.error}</p>
          </div>
        )}
      </Card>
    </div>
  )
} 