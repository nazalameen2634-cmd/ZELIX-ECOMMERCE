import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zelix-super-secret-jwt-key-change-in-prod'
);

// Add routes that require authentication
const protectedRoutes = ['/profile', '/admin', '/checkout'];
// Add routes that are only for unauthenticated users
const authRoutes = ['/login', '/verify-otp'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Skip middleware if it's not a relevant route
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('zelix_session')?.value;
  let decodedSession = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      decodedSession = payload;
    } catch (err) {
      // Invalid or expired token
      decodedSession = null;
    }
  }

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !decodedSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users trying to access login/register
  if (isAuthRoute && decodedSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
