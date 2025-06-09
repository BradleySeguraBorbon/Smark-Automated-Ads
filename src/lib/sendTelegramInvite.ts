import sendEmail from "@/lib/utils/mailer";

export async function sendTelegramInvite(clientEmail: string, tokenKey: string) {
    try {
console.log("Sending invite to:", clientEmail);
        const botUsername = process.env.TELEGRAM_BOT_USERNAME;

        if (!botUsername) {
            console.warn(`[EMAIL] TELEGRAM_BOT_USERNAME is missing. Invite not sent to ${clientEmail}`);
            return;
        }

        const link = `https://t.me/${botUsername}?start=${tokenKey}`;
        const subject = "Activate Telegram Notifications";

        const html = `
      <p>Hello,</p>
      <p>Click the link below to activate Telegram notifications with our bot:</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;
console.log("Before sending email in sendTelegramInvite:", clientEmail);
        await sendEmail(clientEmail, subject, html);
        console.log(`[EMAIL] Telegram invite sent to ${clientEmail}`);
    } catch (error) {
        console.error(`[EMAIL] Failed to send Telegram invite to ${clientEmail}:`, error);
    }
}
