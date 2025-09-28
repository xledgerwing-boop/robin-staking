import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const [AUTH_USER, AUTH_PASS] = (process.env.HTTP_BASIC_AUTH || ':').split(':');

// Step 1. HTTP Basic Auth Middleware for Challenge
export function middleware(req: NextRequest) {
    // Allow Next.js internals and public/static assets (including images) to bypass auth
    const { pathname } = req.nextUrl;
    const isNextInternal = pathname.startsWith('/_next');
    const isPublicAsset =
        /\.(?:png|jpg|jpeg|webp|gif|svg|ico|txt|xml|json|map|js|css|woff2?|ttf|otf)$/i.test(pathname) ||
        pathname === '/favicon.ico' ||
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        pathname === '/manifest.json';
    if (isNextInternal || isPublicAsset) return NextResponse.next();

    if (!AUTH_USER || !AUTH_PASS) return NextResponse.next();
    if (!isAuthenticated(req)) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic' },
        });
    }

    return NextResponse.next();
}

// Step 2. Check HTTP Basic Auth header if present
function isAuthenticated(req: NextRequest) {
    const authheader = req.headers.get('authorization') || req.headers.get('Authorization');

    if (!authheader) {
        return false;
    }

    const token = (authheader.split(' ')[1] as string) || '';
    // Use atob for Edge runtime compatibility
    let decoded = '';
    try {
        decoded = atob(token);
    } catch {
        return false;
    }
    const auth = decoded.split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user == AUTH_USER && pass == AUTH_PASS) {
        return true;
    } else {
        return false;
    }
}

// Step 3. Configure "Matching Paths" below to protect routes with HTTP Basic Auth
export const config = {
    matcher: '/(.*)',
};
