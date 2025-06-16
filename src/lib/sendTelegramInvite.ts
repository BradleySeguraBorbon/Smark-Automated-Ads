import { sendEmail } from "@/lib/utils/mailSender";

export async function sendTelegramInvite(clientEmail: string, tokenKey: string) {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const link = `https://t.me/${botUsername}?start=${tokenKey}`;
  const subject = "Activate Telegram Notifications";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto; color: #333;">
    <p style="font-size: 16px; margin-bottom: 16px;">Hello,</p>
    <p style="font-size: 15px; margin-bottom: 16px;">Click the button below to activate Telegram notifications with our bot:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${link}" style="background-color: #0088cc; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 16px; display: inline-block;">
        Activate Notifications
      </a>
    </p>
    <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;

  await sendEmail(clientEmail, subject, html);
}
