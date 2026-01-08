import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Setup response holder
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 2. Create Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // 3. Get User
    const { data: { user } } = await supabase.auth.getUser()

    // 4. DEFINE PROTECTED ROUTES
    // Add any path that requires login here
    const protectedPaths = ['/dashboard', '/admin', '/superuser', '/settings']
    const currentPath = request.nextUrl.pathname

    // 5. CHECK AUTH
    // If user is NOT logged in and tries to access a protected path -> Redirect to Login
    if (protectedPaths.some(path => currentPath.startsWith(path))) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 6. REDIRECT LOGGED IN USERS AWAY FROM LOGIN
    // If user IS logged in and tries to go to /login -> Redirect to Dashboard
    if (currentPath === '/login' && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - auth (for callback routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|auth).*)',
    ],
}