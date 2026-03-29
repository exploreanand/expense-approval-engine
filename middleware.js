import { NextResponse } from 'next/server';

/**
 * Enterprise Middleware for ExpenseFlow
 * Handles route protection for Admin and Approval sections.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Simulation of User Authentication
  // In a production app, you would retrieve this from a cookie or JWT token
  const user = {
    role: "MANAGER", // Options: "MANAGER", "EMPLOYEE"
    isAuthenticated: true,
  };

  // 2. Define Protected Paths
  const isAdminPath = pathname.startsWith('/admin');
  const isApprovalsPath = pathname.startsWith('/approvals');

  // 3. Authorization Logic
  if (isAdminPath || isApprovalsPath) {
    // If not logged in, send to login (or employee dashboard for now)
    if (!user.isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in but NOT a Manager, block access to Admin/Approvals
    if (user.role !== 'MANAGER') {
      // Redirecting to a custom unauthorized page we discussed earlier
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // 4. Continue to the requested page if all checks pass
  return NextResponse.next();
}

/**
 * The Matcher tells Next.js exactly which routes to run this code on.
 * This prevents the middleware from slowing down your static assets/images.
 */
export const config = {
  matcher: [
    '/admin/:path*', 
    '/approvals/:path*',
  ],
};