"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Pencil, Trash2, Mail, Settings2 } from "lucide-react"
import { useState } from "react"
import { CreateUserModal } from "@/components/modals/create-user-modal"

export function AdminSettingsView() {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showWorkingHours, setShowWorkingHours] = useState(false)

  const handleUserSubmit = (data: any) => {
    console.log('User data:', data)
    setIsCreateUserModalOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Admin Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage users and configure platform settings
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="config">Platform Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Add and manage user accounts
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsCreateUserModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Alice Johnson</TableCell>
                    <TableCell>alice@example.com</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>
                      <Switch checked={true} />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Auto-Reply Template</Label>
                    <Input
                      placeholder="Thank you for your message. We'll get back to you soon."
                      className="h-20"
                      type="textarea"
                    />
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
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Platform-wide configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input placeholder="Your Company Name" />
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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

              {showWorkingHours && (
                <Card>
                  <CardHeader>
                    <CardTitle>Working Hours</CardTitle>
                    <CardDescription>
                      Configure support working hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="grid grid-cols-3 gap-4 items-center">
                        <Label className="col-span-1">{day}</Label>
                        <div className="col-span-2 flex gap-2">
                          <Select defaultValue="09:00">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => (
                                <SelectItem key={i} value={`${String(i).padStart(2, '0')}:00`}>
                                  {`${String(i).padStart(2, '0')}:00`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="flex items-center">to</span>
                          <Select defaultValue="17:00">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, i) => (
                                <SelectItem key={i} value={`${String(i).padStart(2, '0')}:00`}>
                                  {`${String(i).padStart(2, '0')}:00`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button>
                        Save Working Hours
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateUserModal 
        isOpen={isCreateUserModalOpen}
        onClose={() => {
          setIsCreateUserModalOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleUserSubmit}
        user={selectedUser}
      />
    </div>
  )
}

