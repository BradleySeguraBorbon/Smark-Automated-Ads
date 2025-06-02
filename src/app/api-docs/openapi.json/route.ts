import { NextResponse } from 'next/server';
import spec from '@/lib/docs/openapi.json';

export async function GET() {
    return( NextResponse.json(spec));
}
