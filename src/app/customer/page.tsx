import { CustomerPortal } from "@/components/customer/customer-portal"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CustomerPage() {
  const { userId, orgId } = await auth();
  
  // If not logged in, redirect to customer sign in
  if (!userId) {
    redirect("/customer-auth/sign-in");
  }

  // If user is part of an organization (agent/admin), they shouldn't access customer pages
  if (orgId) {
    redirect("/dashboard");
  }

  return <CustomerPortal />
} 