import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'

/**
 * Role-Based Access Control (RBAC) Structure:
 * 
 * Roles:
 * - org:admin  : Full access to all routes including /admin and organization admin routes
 * - org:agent  : Access to organization routes and agent functionality
 * - public     : Access to public routes and /api/public
 * 
 * Route Access Patterns:
 * - /:orgSlug/admin/*     : Requires org:admin role
 * - /api/admin/*          : Requires org:admin role
 * - /:orgSlug/*          : Requires org:admin or org:agent role
 * - /api/agent/*          : Requires org:admin or org:agent role
 * - /customer-portal/*    : Public access (token-based auth)
 * - /api/public/*         : Public access
 * - /api/*                : Requires authentication
 */

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  const potentialOrgSlug = pathParts[1]

  // Allow public routes
  if (
    url.pathname.startsWith('/api/public') ||
    url.pathname.startsWith('/api/customer-portal') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/customer-portal') ||
    url.pathname === '/' ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/select-org')
  ) {
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!userId) {
    if (url.pathname.startsWith('/api')) {
      return new Response('Unauthorized', { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // Handle organization-specific routes (both API and pages)
  if (url.pathname.startsWith('/api')) {
    // For API routes, get org from query param
    const orgSlug = url.searchParams.get('org')
    if (!orgSlug) {
      return new Response('Organization required', { status: 400 })
    }

    // Verify organization access
    const { data: org } = await supabase
      .from('organizations')
      .select('clerk_id')
      .eq('slug', orgSlug)
      .single()

    if (!org || org.clerk_id !== orgId) {
      return new Response('Organization access denied', { status: 403 })
    }
  } else if (potentialOrgSlug && !potentialOrgSlug.startsWith('_')) {
    // For page routes, get org from URL path
    const { data: org } = await supabase
      .from('organizations')
      .select('clerk_id')
      .eq('slug', potentialOrgSlug)
      .single()

    if (!org || org.clerk_id !== orgId) {
      return NextResponse.redirect(new URL('/select-org', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}