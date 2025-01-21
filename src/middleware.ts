import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Role-Based Access Control (RBAC) Structure:
 * 
 * Roles:
 * - org:admin  : Full access to all routes including /admin and /api/admin
 * - org:agent  : Access to /dashboard and /api/agent routes
 * - customer   : Access to /customer and /api/customer routes
 * - public     : Access to public routes and /api/public
 * 
 * Route Access Patterns:
 * - /admin/*        : Requires org:admin role
 * - /api/admin/*    : Requires org:admin role
 * - /dashboard/*    : Requires org:admin or org:agent role
 * - /api/agent/*    : Requires org:admin or org:agent role
 * - /customer/*     : Public access (may be restricted later)
 * - /api/customer/* : Public access (may be restricted later)
 * - /api/public/*   : Public access
 * - /api/*          : Requires authentication
 */

// Define protected route patterns
const adminRoutes = createRouteMatcher(['/admin/(.*)', '/api/admin/(.*)'])
const agentRoutes = createRouteMatcher(['/dashboard/(.*)', '/api/agent/(.*)'])
const customerRoutes = createRouteMatcher(['/customer/(.*)', '/api/customer/(.*)'])

// Define auth route patterns (always public)
const productAuthRoutes = createRouteMatcher(['/auth/sign-in(.*)', '/auth/sign-up(.*)'])
const selectOrgRoute = createRouteMatcher(['/select-org'])

// Define API route patterns
const protectedApiRoutes = createRouteMatcher(['/api/(.*)'])     // All API routes require auth by default
const publicApiRoutes = createRouteMatcher(['/api/public/(.*)']) // Except public API routes

export default clerkMiddleware(async (auth, req) => {
  // Log the request path to understand which routes are triggering the middleware
  console.log('Middleware executing for path:', req.nextUrl.pathname)
  
  const { userId, orgId, orgRole } = await auth()
  
  // For debugging - log auth details with path context
  console.log('Auth details for path:', req.nextUrl.pathname, { userId, orgId, orgRole })

  /**
   * Authentication & Authorization Flow:
   * 1. Allow access to auth-related routes (sign-in, sign-up)
   * 2. Allow access to public API routes
   * 3. Require authentication for protected routes
   * 4. Check organization membership for org-specific routes
   * 5. Verify role-based permissions
   */

  // Step 1: Handle auth routes - always public
  if (productAuthRoutes(req)) {
    return NextResponse.next()
  }

  // Step 2: Handle public API routes - no auth required
  if (publicApiRoutes(req)) {
    return NextResponse.next()
  }

  // Step 3: Authentication check for protected routes
  if (!userId && (adminRoutes(req) || agentRoutes(req) || protectedApiRoutes(req))) {
    // Return 401 for API routes, redirect to sign-in for pages
    if (protectedApiRoutes(req)) {
      return new Response('Unauthorized', { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/sign-in', req.url))
  }

  // Step 4 & 5: Organization membership and role checks
  if (adminRoutes(req) || agentRoutes(req)) {
    // Require organization selection
    if (userId && !orgId && !selectOrgRoute(req)) {
      if (protectedApiRoutes(req)) {
        return new Response('No organization selected', { status: 403 })
      }
      return NextResponse.redirect(new URL('/select-org', req.url))
    }

    // Verify organization access
    if (!orgId || !orgRole) {
      return new Response('Unauthorized - No organization access', { status: 403 })
    }

    // Role-based access checks
    if (adminRoutes(req) && orgRole !== 'org:admin') {
      return new Response('Unauthorized - Not an admin', { status: 403 })
    }

    if (agentRoutes(req) && !['org:admin', 'org:agent'].includes(orgRole)) {
      return new Response('Unauthorized - Not an agent or admin', { status: 403 })
    }

    return NextResponse.next()
  }

  // Additional authentication check for remaining API routes
  if (protectedApiRoutes(req) && !userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Allow access to remaining routes (customer routes and public pages)
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * And files with extensions:
     * - .svg
     * - .png
     * - .jpg
     * - .jpeg
     * - .gif
     * - .ico
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|ico)).*)',
  ],
}