"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline"

type Organization = {
  id: string
  name: string
  support_email: string
}

export default function CreateTicketPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ token?: string, error?: string } | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    // Fetch organizations for the dropdown
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch organizations')
        }

        setOrganizations(data.organizations)
      } catch (error) {
        console.error('Error fetching organizations:', error)
        setError(error instanceof Error ? error.message : 'Failed to load organizations')
      }
    }

    fetchOrganizations()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)
    setCopiedToken(false)
    setCopiedUrl(false)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!selectedOrg || !email || !name || !subject || !message) {
      setResult({ error: 'Please fill in all fields' })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/customer-portal/create-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          subject,
          message,
          organizationId: selectedOrg
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ticket')
      }

      setResult({ token: data.token })
    } catch (error) {
      console.error('Error creating ticket:', error)
      setResult({ error: error instanceof Error ? error.message : 'Failed to create ticket. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'token' | 'url') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'token') {
        setCopiedToken(true)
        setTimeout(() => setCopiedToken(false), 2000)
      } else {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const portalUrl = result?.token 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/customer-portal`
    : ''

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create Support Ticket</h1>
        
        {!result?.token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" type="email" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input name="name" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input name="subject" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea name="message" required className="min-h-[100px]" />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>

            {result?.error && (
              <p className="text-red-500 mt-4">{result.error}</p>
            )}
          </form>
        ) : (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckIcon className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Ticket Created Successfully!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your support ticket has been created. Save the access token and URL below to access your ticket later.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                <div className="flex gap-2">
                  <Input 
                    value={result.token} 
                    readOnly 
                    className="font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(result.token!, 'token')}
                  >
                    {copiedToken ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portal URL</label>
                <div className="flex gap-2">
                  <Input 
                    value={portalUrl} 
                    readOnly 
                    className="font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(portalUrl, 'url')}
                  >
                    {copiedUrl ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null)
                  setCopiedToken(false)
                  setCopiedUrl(false)
                }}
              >
                Create Another Ticket
              </Button>
              <Button
                onClick={() => window.location.href = portalUrl}
              >
                Go to Portal
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 