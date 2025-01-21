import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected route patterns
const adminRoutes = createRouteMatcher(['/admin/(.*)'])
const agentRoutes = createRouteMatcher(['/dashboard/(.*)'])
const customerRoutes = createRouteMatcher(['/customer/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()
  
  // If not signed in and trying to access any protected route
  if (!userId && (adminRoutes(req) || agentRoutes(req) || customerRoutes(req))) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // Get user's role from session claims
  const role = sessionClaims?.role as string

  // Admin can access everything
  if (role === 'admin') {
    return NextResponse.next()
  }

  // Agents can access dashboard but not admin routes
  if (role === 'agent') {
    if (adminRoutes(req)) {
      return new Response('Unauthorized', { status: 403 })
    }
    return NextResponse.next()
  }

  // Customers can only access customer routes
  if (role === 'customer') {
    if (adminRoutes(req) || agentRoutes(req)) {
      return new Response('Unauthorized', { status: 403 })
    }
    return NextResponse.next()
  }

  // Public routes are accessible to all
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}