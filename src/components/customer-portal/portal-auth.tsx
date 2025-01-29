"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import type { TokenVerificationPayload } from '@/types/customer-portal'
import { useRouter } from "next/navigation"

interface PortalAuthProps {
  onVerify: (payload: TokenVerificationPayload) => Promise<void>
  isLoading: boolean
  error?: string
}

export function PortalAuth({ onVerify, isLoading, error }: PortalAuthProps) {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onVerify({ token, email })
  }

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-8 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Customer Support Portal
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Enter your ticket token to access your support conversation
            </p>
            
            <div className="mt-8 rounded-lg bg-gray-50 p-6 text-left shadow-sm ring-1 ring-gray-900/5 max-w-sm mx-auto">
              <h2 className="font-medium text-gray-900">Demo Credentials</h2>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <div>
                  <p><span className="font-medium">Customer 1:</span></p>
                  <p className="pl-4">Email: alice@example.com</p>
                  <p className="pl-4">Token: demo-token-alice-123</p>
                </div>
                <div>
                  <p><span className="font-medium">Customer 2:</span></p>
                  <p className="pl-4">Email: bob@example.com</p>
                  <p className="pl-4">Token: demo-token-bob-123</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-sm mx-auto">
              <Input
                type="text"
                placeholder="Enter your ticket token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="text-center"
                disabled={isLoading}
              />
              <Input
                type="email"
                placeholder="Verify your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center"
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Access Portal
              </Button>
            </form>

            <div className="mt-8 max-w-sm mx-auto">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Need to create a new support ticket?
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/customer-portal/create-ticket')}
                  className="w-full"
                >
                  Create New Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  )
} 