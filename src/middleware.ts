import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  const cookies = request.cookies.get('authToken');
  const isLoggedIn = cookies?.value

  // Redirect if the user is logged in and tries to access the homepage
  if (isLoggedIn && currentPath === '/signin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect if the user is not logged in and tries to access protected routes
  const protectedPaths = ['/', '/tags', '/syllabus', '/quiz'];
  if (!isLoggedIn && protectedPaths.includes(currentPath)) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}
