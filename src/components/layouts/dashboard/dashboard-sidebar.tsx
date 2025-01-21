import { Inbox, BarChart2, Settings, LogOut, Shield } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface DashboardSidebarProps {
  onNavigate: (view: string) => void
  isAdmin?: boolean
}

export function DashboardSidebar({ onNavigate, isAdmin = true }: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-semibold">Support Dashboard</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => onNavigate("tickets")}>
                  <a href="#">
                    <Inbox className="mr-2 h-4 w-4" />
                    Tickets
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => onNavigate("reports")}>
                  <a href="#">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Reports
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => onNavigate("settings")}>
                  <a href="#">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild onClick={() => onNavigate("admin settings")}>
                    <a href="#">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Settings
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

