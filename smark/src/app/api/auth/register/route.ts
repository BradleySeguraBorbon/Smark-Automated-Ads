import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/config/db';
import { IUser } from '@/types/User';
import User from '@/models/User';
import { getUserFromToken } from '@/../lib/auth';

export async function POST(request: Request) {
  await dbConnect();

  const user = await getUserFromToken(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowedRoles = ['admin', 'developer'];

  if (!allowedRoles.includes(user.role as string)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
  }

  const { username, password, role } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Incomplete Data' }, { status: 400 });
  }

  try {
    const exists = await User.findOne({ $or: [{ username }] });
    if (exists) {
      return NextResponse.json({ error: 'User already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser: IUser = await User.create({ username, password: hashed, role });

    return NextResponse.json({
      message: 'User registered successfully',
      userId: newUser._id,
    }, { status: 201 });
  } catch (err) {
    console.error('Error registering user:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
