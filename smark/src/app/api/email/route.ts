import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Templates, AdMessages, Users } from '@/models/models';

function replacePlaceholders(templateHtml: string, data: Record<string, string>): string {
    let resultHtml = templateHtml;
    Object.keys(data).forEach((key) => {
        const placeholder = `{{${key}}}`;
        resultHtml = resultHtml.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    return resultHtml;
}

export async function POST(request: Request) {
    //const { adMessageId, templateName } = await request.json();
/** 
    const template = await Templates.findOne({ name: templateName });

    if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    //const adMessage = await AdMessages.findById(adMessageId);
*/
    const recipients = [""];

    const subject  = "Prueba de envio";//adMessage;
    //const placeholdersData = adMessage

    //const htmlContent = replacePlaceholders(template.html, placeholdersData);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipients.join(','), // Unir los correos con coma para enviarlos a múltiples destinatarios
        subject: subject,
        html: "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>¡Gracias por tu compra!</title><style>body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); } .header { background-color: #4CAF50; padding: 10px; color: white; text-align: center; border-radius: 8px 8px 0 0; } h1 { color: #333; }</style></head><body><div class='container'><div class='header'><h1>¡Gracias por tu compra, {{name}}!</h1></div><p>Nos complace informarte que tu producto de cuidado facial ha sido procesado con éxito.</p><p><strong>Producto:</strong> {{productName}}</p><p><strong>Precio:</strong> ${{price}}</p><p>¡Esperamos que disfrutes tu compra!<br><a href='{{ctaLink}}'>Ver más productos</a></p></div></body></html>",
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Emails sent: %s', info.messageId);
        return NextResponse.json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
