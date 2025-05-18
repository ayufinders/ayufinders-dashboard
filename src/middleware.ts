import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  const cookies = request.cookies.get('authToken');
  const isLoggedIn = !!cookies?.value;

  // Redirect logged-in users away from the signin page
  if (isLoggedIn && currentPath === '/signin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Define protected path prefixes
  const protectedPrefixes = ['/', '/tags', '/syllabus', '/quiz', '/university', '/progress', '/pyqs'];

  const isProtectedPath = protectedPrefixes.some((prefix) =>
    currentPath === prefix || currentPath.startsWith(prefix + '/')
  );

  if (!isLoggedIn && isProtectedPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}
