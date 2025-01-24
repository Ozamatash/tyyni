"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import type { TokenVerificationPayload } from '@/types/customer-portal'

interface PortalAuthProps {
  onVerify: (payload: TokenVerificationPayload) => Promise<void>
  isLoading: boolean
  error?: string
}

export function PortalAuth({ onVerify, isLoading, error }: PortalAuthProps) {
  const [token, setToken] = useState('yCB7XMj7QuVzNnWTRI_Y1BwbU_qAkmHC')
  const [email, setEmail] = useState('jabajuutest@gmail.com')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onVerify({ token, email })
  }

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Customer Support Portal
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Enter your ticket token to access your support conversation
            </p>
            <div className="mt-2 text-sm text-gray-500">
              (Test Mode - Auto-filled with test credentials)
            </div>
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 max-w-sm mx-auto">
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