
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Don't process API routes, static files, or Next.js internals
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Handle legacy routes with language prefixes - redirect to root
  if (pathname.startsWith('/es') || pathname.startsWith('/en')) {
    const url = request.nextUrl.clone();
    // Remove the language prefix and redirect to root
    const newPath = pathname.replace(/^\/(es|en)/, '') || '/';
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  // Detect locale from cookie or browser preference
  const locale = request.cookies.get('beauty-go-language')?.value || 
                 (request.headers.get('accept-language')?.includes('es') ? 'es' : 'en');

  // Store locale in headers for server components
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
