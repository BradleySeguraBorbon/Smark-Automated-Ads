import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Clients } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';

export async function GET(request: Request) {
    try {
        await connectDB();

        const user = getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const clients = await Clients.find({}, '_id firstName');

        const decrypted = clients.map(c => ({
            _id: c._id,
            firstName: typeof c.firstName === 'string' && c.firstName.startsWith('enc::')
                ? decrypt(c.firstName)
                : c.firstName,
        }));

        return NextResponse.json(decrypted);
    } catch (error) {
        console.error('Error fetching ids and names:', error);
        return NextResponse.json({ error: 'Failed to retrieve client names' }, { status: 500 });
    }
}
