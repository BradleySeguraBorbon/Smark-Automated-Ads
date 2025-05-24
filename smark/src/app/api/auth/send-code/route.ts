import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import sendMail from '@/lib/utils/mailer';
import dbConnect from '@/config/db';
import User from '@/models/User';
import {deepSanitize, validateEmail, validateEnum} from "@/lib/utils/inputSecurity";

const generateHtml = (code: string, purpose: 'login' | 'reset') => {
    const purposeText = purpose === 'reset' ? 'reset the password for' : 'log in to';
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your Verification Code</title>
    </head>
    <body style="background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <tr>
                <td style="padding: 32px; text-align: center;">
                  <h2 style="color: #333333; font-size: 22px; margin-bottom: 16px;">🔐 Your Verification Code</h2>
                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                    We received a request to ${purposeText} your account.
                  </p>
                  <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
                    Please use the code below. It will expire in <strong>10 minutes</strong>.
                  </p>
                  <div style="background-color: #f0f4ff; padding: 16px 32px; border-radius: 6px; display: inline-block;">
                    <span style="color: #1a3faa; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</span>
                  </div>
                  <p style="color: #888888; font-size: 14px; margin-top: 32px;">
                    If you did not request this, please ignore this email.
                  </p>
                  <p style="color: #888888; font-size: 14px;">— The AutoSmark Team</p>
                </td>
              </tr>
            </table>
            <p style="color: #aaaaaa; font-size: 12px; margin-top: 16px;">© 2025 YourAppName. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export async function POST(request: Request) {
    await dbConnect();
    const { email, purpose } = deepSanitize(await request.json());

    if (!validateEmail(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!validateEnum(purpose, ['login', 'reset'])) {
        return NextResponse.json({ error: 'Invalid purpose' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const subject = purpose === 'reset' ? 'Password reset verification code' : 'Your login code';
    const html = generateHtml(code, purpose);

    await sendMail(email, subject, html);

    const tempToken = jwt.sign(
        { code, email, purpose },
        process.env.JWT_SECRET!,
        { expiresIn: '10m' }
    );

    return NextResponse.json({ tempToken });
}