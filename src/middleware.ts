import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Role-Based Access Control (RBAC) Structure:
 * 
 * Roles:
 * - org:admin  : Full access to all routes including /admin and organization admin routes
 * - org:agent  : Access to organization routes and agent functionality
 * - public     : Access to public routes and /api/public
 */

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();
  const url = new URL(req.url);

  // Public routes that don't require authentication
  const publicPaths = [
    '/',
    '/auth/(.*)',
    '/customer-portal(.*)',
    '/api/public(.*)'
  ];

  if (publicPaths.some(path => new RegExp(path).test(url.pathname))) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    if (url.pathname.startsWith('/api')) {
      return new Response('Unauthorized', { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // Require organization selection
  if (!orgId && !url.pathname.startsWith('/select-org')) {
    return NextResponse.redirect(new URL('/select-org', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}