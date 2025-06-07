import nodemailer from 'nodemailer';
import pLimit from 'p-limit';

export async function sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = { from: process.env.EMAIL_USER, to, subject, html };
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
}

export async function sendEmailMessages(
    recipients: string[],
    subject: string,
    html: string
) {
    const limit = pLimit(20);
    const tasks = recipients.map((email) =>
        limit(() => sendEmail(email, subject, html))
    );
    await Promise.all(tasks);
}
