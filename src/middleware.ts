import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected route patterns
const adminRoutes = createRouteMatcher(['/admin/(.*)'])
const agentRoutes = createRouteMatcher(['/dashboard/(.*)'])
const customerRoutes = createRouteMatcher(['/customer/(.*)'])

// Define auth route patterns
const productAuthRoutes = createRouteMatcher(['/auth/sign-in(.*)', '/auth/sign-up(.*)'])
const selectOrgRoute = createRouteMatcher(['/select-org'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth()
  
  // For debugging - log auth details
  console.log('Auth details:', { userId, orgId, orgRole })

  // Handle product auth routes
  if (productAuthRoutes(req)) {
    return NextResponse.next()
  }

  // If not signed in and trying to access protected routes
  if (!userId && (adminRoutes(req) || agentRoutes(req))) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // For admin and agent routes, check organization membership
  if (adminRoutes(req) || agentRoutes(req)) {
    // If signed in but no active organization, redirect to org selection
    if (userId && !orgId && !selectOrgRoute(req)) {
      return NextResponse.redirect(new URL('/select-org', req.url))
    }

    // No organization access means they're unauthorized
    if (!orgId || !orgRole) {
      return new Response('Unauthorized - No organization access', { status: 403 })
    }

    // Check roles for specific route access
    if (adminRoutes(req) && orgRole !== 'org:admin') {
      return new Response('Unauthorized - Not an admin', { status: 403 })
    }

    if (agentRoutes(req) && !['org:admin', 'org:agent'].includes(orgRole)) {
      return new Response('Unauthorized - Not an agent or admin', { status: 403 })
    }

    return NextResponse.next()
  }

  // Customer routes and public routes are accessible to all for now
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}