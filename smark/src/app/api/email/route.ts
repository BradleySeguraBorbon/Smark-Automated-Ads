import { NextRequest, NextResponse } from 'next/server';
import { getAudience } from '@/app/api/utils/getAudience';
import { sendEmailMessages } from '@/lib/utils/mailSender';
import { AdMessages } from '@/models/models';

export async function POST(req: NextRequest) {
  const { adMessageId } = await req.json();
  try {
    const { adMessage, contacts } = await getAudience(adMessageId, 'email');

    if (!adMessage.content?.email) {
      return NextResponse.json(
          { error: 'Missing email content in adMessage' },
          { status: 400 }
      );
    }

    const subject = adMessage.content.email.subject || 'Marketing Campaign';
    const html = adMessage.content.email.body;

    await sendEmailMessages(contacts, subject, html);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    if (adMessageId) {
      await AdMessages.findByIdAndUpdate(adMessageId, { status: 'draft' });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
