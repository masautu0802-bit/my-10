import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only run auth check for protected routes (/my, /cms) and auth routes (/auth)
  const isProtectedRoute = pathname.startsWith('/my') || pathname.startsWith('/cms')
  const isAuthRoute = pathname.startsWith('/auth')

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // If there's an auth error (e.g., invalid refresh token), clear the session
    if (error) {
      // Clear invalid session cookies
      await supabase.auth.signOut()

      // Redirect to login if accessing protected route
      if (isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }

      // For auth routes, just continue (they can handle their own auth state)
      return supabaseResponse
    }

    // Redirect to login if accessing protected route without authentication
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // Handle any unexpected errors during auth check
    console.error('Auth check error:', error)

    // If accessing protected route, redirect to login
    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
