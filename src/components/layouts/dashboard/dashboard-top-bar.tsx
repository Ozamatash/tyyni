import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardTopBar() {
  return (
    <header className="flex h-16 items-center border-b px-6">
      <SidebarTrigger />
    </header>
  )
}

