import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Role-Based Access Control (RBAC) Structure:
 * 
 * Roles:
 * - org:admin  : Full access to all routes including /admin and /api/admin
 * - org:agent  : Access to /dashboard and /api/agent routes
 * - public     : Access to public routes and /api/public
 * 
 * Route Access Patterns:
 * - /admin/*                : Requires org:admin role
 * - /api/admin/*           : Requires org:admin role
 * - /dashboard/*           : Requires org:admin or org:agent role
 * - /api/agent/*           : Requires org:admin or org:agent role
 * - /customer-portal/*      : Public access (token-based auth)
 * - /api/customer-portal/* : Public access (token-based auth)
 * - /api/public/*          : Public access
 * - /api/*                 : Requires authentication
 */

const routes = {
  admin: createRouteMatcher(['/admin/(.*)', '/api/admin/(.*)']) as (req: Request) => boolean,
  agent: createRouteMatcher(['/dashboard/(.*)', '/api/agent/(.*)']) as (req: Request) => boolean,
  customerPortal: createRouteMatcher(['/customer-portal/(.*)', '/api/customer-portal/(.*)']) as (req: Request) => boolean,
  auth: createRouteMatcher(['/auth/sign-in(.*)', '/auth/sign-up(.*)']) as (req: Request) => boolean,
  selectOrg: createRouteMatcher(['/select-org']) as (req: Request) => boolean,
  protectedApi: createRouteMatcher(['/api/(.*)']) as (req: Request) => boolean,
  publicApi: createRouteMatcher(['/api/public/(.*)']) as (req: Request) => boolean,
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth()

  // Allow public routes
  if (routes.auth(req) || routes.publicApi(req) || routes.customerPortal(req)) {
    return NextResponse.next()
  }

  // Require authentication for protected routes
  if (!userId && (routes.admin(req) || routes.agent(req) || routes.protectedApi(req))) {
    if (routes.protectedApi(req)) {
      return new Response('Unauthorized', { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // Handle organization-specific routes
  if (routes.admin(req) || routes.agent(req)) {
    // Require organization selection
    if (userId && !orgId && !routes.selectOrg(req)) {
      if (routes.protectedApi(req)) {
        return new Response('No organization selected', { status: 403 })
      }
      return NextResponse.redirect(new URL('/select-org', req.url))
    }

    // Verify organization access
    if (!orgId || !orgRole) {
      return new Response('Unauthorized - No organization access', { status: 403 })
    }

    // Verify role-based access
    if (routes.admin(req) && orgRole !== 'org:admin') {
      return new Response('Unauthorized - Not an admin', { status: 403 })
    }

    if (routes.agent(req) && !['org:admin', 'org:agent'].includes(orgRole)) {
      return new Response('Unauthorized - Not an agent or admin', { status: 403 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|ico)).*)'],
}