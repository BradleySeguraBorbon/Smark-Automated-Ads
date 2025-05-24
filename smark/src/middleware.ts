import {NextResponse, NextRequest} from 'next/server';
import {jwtVerify} from 'jose';

const PUBLIC_FILE = /\.(.*)$/;
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || '*';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api-docs') ||
      pathname.startsWith('/api/clients/register') ||
      pathname.startsWith('/api/chat') ||
      pathname.startsWith('/api/telegram/webhook') ||
      pathname === ('/auth/login') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1] || null;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const requestHeaders = new Headers(request.headers);
    if (payload.username) requestHeaders.set('x-username', payload.id as string);
    if (payload.role) requestHeaders.set('x-user-role', payload.role as string);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    const isAuthPage = [
        '/auth/login',
        '/auth/email-login',
        '/auth/reset-password'
    ].includes(pathname);

    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.split(' ')[1];
    const token = cookieToken || headerToken || null;

    const response = NextResponse.next();

    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: response.headers,
        });
    }

    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api-docs') ||
        pathname.startsWith('/api/clients/register') ||
        pathname.startsWith('/api/chat') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return response;
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const protectedPaths = [
        '/templates',
        '/users',
        '/tags',
        '/adMessages',
        '/marketingCampaigns',
        '/campaignAudiences',
    ];
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (!token && isProtected) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (token) {
        try {
            const {payload} = await jwtVerify(token, secret);

            const requestHeaders = new Headers(request.headers);
            if (payload.username) requestHeaders.set('x-username', payload.id as string);
            if (payload.role) requestHeaders.set('x-user-role', payload.role as string);

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
                headers: response.headers,
            });
        } catch (err) {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({error: 'Invalid token'}, {
                    status: 401,
                    headers: response.headers,
                });
            } else {
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/api/:path*',
        '/templates/:path*',
        '/users/:path*',
        '/auth/login',
        '/auth/email-login',
        '/auth/reset-password',
        '/adMessages/:path*',
        '/campaignAudiences/:path*',
        '/marketingCampaigns/:path*',
        '/tags/:path*',
    ],
};
