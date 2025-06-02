import {NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/config/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import {deepSanitize} from "@/lib/utils/inputSecurity";

export async function POST(request: Request) {
    await dbConnect();
    const { tempToken, code, newPassword } = deepSanitize(await request.json());

    if (
        typeof tempToken !== 'string' || typeof code !== 'string' ||
        (newPassword && typeof newPassword !== 'string')
    ) {
        return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }

    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as any;

        if (decoded.code !== code) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
        }

        const user = await User.findOne({ email: decoded.email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (decoded.purpose === 'login') {
            const loginToken = jwt.sign(
                { uid: user._id, username: user.username, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '24h' }
            );
            return NextResponse.json({ token: loginToken });
        }

        if (decoded.purpose === 'reset') {
            if (!newPassword || newPassword.length < 6) {
                return NextResponse.json({ error: 'Password too weak or missing' }, { status: 400 });
            }
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            return NextResponse.json({ message: 'Password updated successfully' });
        }

        return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 });
    } catch {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
}
