import {NextResponse, NextRequest} from 'next/server';
import {jwtVerify} from 'jose';

const PUBLIC_FILE = /\.(.*)$/;
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const isAuthPage = [
        '/auth/login',
        '/auth/email-login',
        '/auth/reset-password'
    ].includes(pathname);

    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.split(' ')[1];
    const token = cookieToken || headerToken || null;

    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api-docs') ||
        pathname.startsWith('/api/clients/register') ||
        pathname.startsWith('/api/chat') ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const protectedPaths = ['/templates', '/users', '/tags', '/adMessages', '/marketingCampaigns', '/campaignAudiences'];
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
            });
        } catch (err) {
            if (pathname.startsWith('/api')) {
                return NextResponse.json({error: 'Invalid token'}, {status: 401});
            } else {
                return NextResponse.redirect(new URL('/auth/login', request.url));
            }
        }
    }

    return NextResponse.next();
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
