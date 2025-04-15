import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dbConnect from '@/config/db';
import User from '@/models/User';
import { IUser } from '@/types/User';

export async function POST(request: Request) {
  await dbConnect();
  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
  }

  try {
    const user: IUser | null = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Incorrect Credentials' }, { status: 401 });
    }
    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      return NextResponse.json({ error: 'Incorrect Credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { uid: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
