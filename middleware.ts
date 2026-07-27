import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication token
  const userCookie = request.cookies.get('user')?.value

  // If no user cookie and accessing protected route, redirect to login
  if (!userCookie && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  if (userCookie && pathname.startsWith('/admin')) {
    try {
      const userData = JSON.parse(userCookie)
      if (!userData.is_staff) {
        // Non-staff users cannot access /admin, redirect to their dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      // Invalid cookie — redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
