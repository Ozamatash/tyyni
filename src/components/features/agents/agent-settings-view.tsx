"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Dummy data for the agent
const agent = {
  name: "Alice Johnson",
  email: "alice@example.com",
  macros: [
    { id: 1, name: "Greeting", content: "Hello, thank you for contacting us. How may I assist today?" },
    { id: 2, name: "Closing", content: "Is there anything else I can help you with? Have a great day!" },
  ],
}

export function AgentSettingsView() {
  const [name, setName] = useState(agent.name)
  const [email, setEmail] = useState(agent.email)
  const [macros, setMacros] = useState(agent.macros)
  const [isCreateMacroModalOpen, setIsCreateMacroModalOpen] = useState(false)

  const handleSaveProfile = () => {
    // TODO: Implement save profile logic
    console.log("Saving profile:", { name, email })
  }

  const handleEditMacro = (id: number) => {
    // TODO: Implement edit macro logic
    console.log("Editing macro:", id)
  }

  const handleDeleteMacro = (id: number) => {
    // TODO: Implement delete macro logic
    console.log("Deleting macro:", id)
    setMacros(macros.filter((macro) => macro.id !== id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agent Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Basic Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {macros.map((macro) => (
                <TableRow key={macro.id}>
                  <TableCell>{macro.name}</TableCell>
                  <TableCell>{macro.content}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditMacro(macro.id)} className="mr-2">
                      Edit
                    </Button>
                    <Button onClick={() => handleDeleteMacro(macro.id)} variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={() => setIsCreateMacroModalOpen(true)} className="mt-4">
            Create Macro
          </Button>
        </CardContent>
      </Card>

      {/* TODO: Implement Create Macro Modal */}
      {isCreateMacroModalOpen && (
        <div>
          {/* Placeholder for Create Macro Modal */}
          <p>Create Macro Modal (To be implemented)</p>
          <Button onClick={() => setIsCreateMacroModalOpen(false)}>Close</Button>
        </div>
      )}
    </div>
  )
}

