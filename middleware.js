import { NextResponse } from 'next/server';

export function middleware(request) {
  // Simulating user data - in production, this comes from a session cookie
  const user = {
    role: "MANAGER", // Change to "EMPLOYEE" to test the redirect
    name: "Sarah Chen"
  };

  const { pathname } = request.nextUrl;

  // If a user tries to access /admin or /approvals and isn't a Manager
  if (pathname.startsWith('/admin') || pathname.startsWith('/approvals')) {
    if (user.role !== 'MANAGER') {
      // Redirect them to the dashboard or a 403 page
      return NextResponse.redirect(new URL('/employee', request.url));
    }
  }

  return NextResponse.next();
}

// Only run this middleware on specific routes to keep the app fast
export const config = {
  matcher: ['/admin/:path*', '/approvals/:path*'],
};