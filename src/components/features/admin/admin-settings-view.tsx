"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Mail, Settings2 } from "lucide-react"
import { useState } from "react"
import { OrganizationProfile, useOrganization } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminSettingsView() {
  const [showWorkingHours, setShowWorkingHours] = useState(false)
  const { isLoaded, organization } = useOrganization()

  if (!isLoaded) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Admin Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage organization and configure platform settings
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="config">Platform Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization profile, members, and domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationProfile 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none p-0",
                    navbar: "hidden"
                  }
                }}
                routing="hash"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="config">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>
                  Configure email integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Support Email Address</Label>
                    <Input placeholder="support@yourcompany.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>SMTP Server</Label>
                    <Input placeholder="smtp.yourcompany.com" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input type="number" placeholder="587" />
                    </div>
                    <div className="space-y-2">
                      <Label>Encryption</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select encryption" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>SMTP Username</Label>
                    <Input />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>SMTP Password</Label>
                    <Input type="password" />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="auto-reply" />
                    <Label htmlFor="auto-reply">Enable Auto-Reply</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline">
                    Test Connection
                  </Button>
                  <Button>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Ticket Settings
                </CardTitle>
                <CardDescription>
                  Configure ticket handling preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Ticket Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ticket Auto-Escalation Time (hours)</Label>
                    <Input type="number" placeholder="24" />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                      id="working-hours" 
                      checked={showWorkingHours}
                      onCheckedChange={setShowWorkingHours}
                    />
                    <Label htmlFor="working-hours">Enable Working Hours</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

