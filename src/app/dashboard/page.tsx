import { Dashboard } from "@/components/layouts/dashboard/dashboard"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId, orgId, orgRole } = await auth();
  
  // If not logged in, redirect to sign in
  if (!userId) {
    redirect("/auth/sign-in");
  }

  // If not part of an organization, redirect to organization creation
  if (!orgId) {
    redirect("/select-org");
  }

  // If not an admin or agent, they shouldn't access dashboard
  if (!['org:admin', 'org:agent'].includes(orgRole || '')) {
    redirect("/customer");
  }

  return <Dashboard />
}

