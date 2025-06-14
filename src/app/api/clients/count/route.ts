import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import { Clients } from '@/models/models';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tagIds = searchParams.getAll('tagIds[]');

    const filter: any = {};
    if (tagIds.length > 0) {
      const validIds = tagIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      filter.tags = { $in: validIds };
    }

    const total = await Clients.countDocuments(filter);
    return NextResponse.json({ total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error counting clients' }, { status: 500 });
  }
}
