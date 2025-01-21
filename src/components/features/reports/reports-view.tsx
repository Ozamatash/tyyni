"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Dummy data for the reports
const reportData = {
  totalTicketsCreated: 150,
  ticketsResolved: 120,
  avgFirstResponseTime: "2h 15m",
  avgResolutionTime: "1d 4h",
  agentPerformance: [
    { name: "Alice", ticketsHandled: 45, avgResolutionTime: "1d 2h" },
    { name: "Bob", ticketsHandled: 38, avgResolutionTime: "1d 6h" },
    { name: "Charlie", ticketsHandled: 37, avgResolutionTime: "1d 1h" },
  ],
  ticketVolume: [
    { date: "2023-04-01", created: 20, resolved: 15 },
    { date: "2023-04-02", created: 25, resolved: 22 },
    { date: "2023-04-03", created: 18, resolved: 20 },
    { date: "2023-04-04", created: 22, resolved: 19 },
    { date: "2023-04-05", created: 30, resolved: 25 },
    { date: "2023-04-06", created: 20, resolved: 18 },
    { date: "2023-04-07", created: 15, resolved: 21 },
  ],
}

export function ReportsView() {
  const [dateRange, setDateRange] = useState("Last 7 Days")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="Yesterday">Yesterday</SelectItem>
            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
            <SelectItem value="Custom Range">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalTicketsCreated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.ticketsResolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg First Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.avgFirstResponseTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.avgResolutionTime}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Tickets Handled</TableHead>
                <TableHead>Average Resolution Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.agentPerformance.map((agent) => (
                <TableRow key={agent.name}>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.ticketsHandled}</TableCell>
                  <TableCell>{agent.avgResolutionTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              created: {
                label: "Created",
                color: "hsl(var(--chart-1))",
              },
              resolved: {
                label: "Resolved",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.ticketVolume}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="created" fill="var(--color-created)" name="Created" />
                <Bar dataKey="resolved" fill="var(--color-resolved)" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

