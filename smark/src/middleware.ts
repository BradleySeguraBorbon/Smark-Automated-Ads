import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_FILE = /\.(.*)$/;

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

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

    return response;

  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
