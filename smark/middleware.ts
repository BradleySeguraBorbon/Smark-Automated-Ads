import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api-docs') ||
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
    jwt.verify(token, process.env.JWT_SECRET as string);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};