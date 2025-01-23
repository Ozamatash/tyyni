"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"

interface PortalAuthProps {
  onAuthenticated: (email: string) => void
}

export function PortalAuth({ onAuthenticated }: PortalAuthProps) {
  const [step, setStep] = useState<'token' | 'email'>('token')
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // TODO: Validate token
    // For now, just move to email step
    setStep('email')
    setLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // TODO: Verify email
    // For now, just call onAuthenticated
    onAuthenticated(email)
    setLoading(false)
  }

  return (
    <div className="container max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Portal</CardTitle>
          <CardDescription>
            {step === 'token' 
              ? "Enter your ticket token to access the portal"
              : "Verify your email to see all your tickets"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {step === 'token' ? (
            <form onSubmit={handleTokenSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Ticket Token</Label>
                  <Input
                    id="token"
                    placeholder="Enter your ticket token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  View Tickets
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {step === 'token' 
              ? "You can find the token in your support email"
              : "We'll show all tickets associated with this email"
            }
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 