'use client';

import { Paperclip } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IAdMessage } from '@/types/AdMessage';
import { format } from 'date-fns';

interface EmailPreviewProps {
  senderName?: string
  senderEmail?: string
  recipientName?: string
  recipientEmail?: string
}

export function EmailPreview({
  senderName = "MarketReach",
  senderEmail = "marketing@marketreach.com",
  recipientName = "John Doe",
  recipientEmail = "john.doe@example.com"
}: EmailPreviewProps) {
  const { control } = useFormContext<IAdMessage>();
  const subject = useWatch({ control, name: 'content.email.subject' });
  const body = useWatch({ control, name: 'content.email.body' });
  const attachments = useWatch({ control, name: 'attachments' }) || [];

  const normalizedAttachments = attachments.map((att) =>
    typeof att === 'string' ? { name: att, path: '' } : att
  );

  return (
    <div className="mt-2 border rounded-md overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-lg text-muted-foreground">{subject || '(No subject)'}</p>
            <p className="text-sm text-muted-foreground">
              From: {senderName}&lt;{senderEmail}&gt;
            </p>
            <p className="text-sm text-muted-foreground">
              To: {recipientName}&lt;{recipientEmail}&gt;
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{format(new Date(), "MMM d, yyyy h:mm a")}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 bg-white">
        <div
          className="prose max-w-none text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: body || '<p class="text-muted-foreground italic">(No content)</p>' }}
        />

        {/* Signature */}
        <div className="mt-8 pt-4 border-t">
          <p className="font-medium">MarketReach Team</p>
          <p className="text-sm text-muted-foreground">marketing@marketreach.com</p>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
      </div>

      {/* Attachments */}
      {normalizedAttachments.length > 0 && (
        <div className="bg-gray-50 p-4 border-t">
          <p className="text-sm font-medium mb-2">Attachments ({normalizedAttachments.length})</p>
          <div className="flex flex-wrap gap-2">
            {normalizedAttachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white p-2 rounded border text-sm group hover:bg-gray-50"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{attachment.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
